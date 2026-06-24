/**
 * savior-blip-sync — Cloudflare Worker
 *
 * Puxa contatos + conversa inteira do Blip (saviorprincipal + saviorrj)
 * e cria Person + Deal + Nota com conversa formatada no Pipedrive.
 *
 * Cron: every 15 minutes
 * Manual: POST /sync
 * Status: GET /status
 *
 * Secrets:
 *   BLIP_PRINCIPAL_KEY — HTTP key saviorprincipal
 *   BLIP_RJ_KEY        — HTTP key saviorrj
 *   PIPEDRIVE_TOKEN    — API token Pipedrive
 *
 * KV (SYNC_KV):
 *   last_sync_{bot}              — ISO timestamp do ultimo sync
 *   done_{bot}_{identity}        — JSON {deal_id, synced_at} TTL 30d
 */

const BLIP_ENDPOINT = 'https://http.msging.net/commands';
const PIPEDRIVE_API = 'https://api.pipedrive.com/v1';

// Workers free tier: max 50 subrequests. Cada contato = ~6 fetches.
// 2 bots × 6 contatos × 6 fetches = 72 (+ margem pra contacts query).
// Safe limit: 6 por bot por execucao. Cron a cada 15 min processa o restante.
const MAX_PER_BOT = 4;

const BOTS = [
  { name: 'saviorprincipal', envKey: 'BLIP_PRINCIPAL_KEY', label: 'RJ Principal' },
  { name: 'saviorrj',        envKey: 'BLIP_RJ_KEY',        label: 'RJ' },
];

const PIPELINE_STAGE = {
  8: 46, 9: 51, 10: 56, 11: 61, 12: 41, 6: 35, 2: 6,
};

// Custom field hashes Pipedrive (mesmos do lead-capture)
const CF = {
  TIPO_CLIENTE:     '22247c3025a677f2dd4d7ab63548fecb08f05e2f',
  BASE:             '8cc112e07d103997aa14b34442fa7a51cb0d2d91',
  DATA_EVENTO:      '79d2372ceaddba4b964ec8430db391885066e5f9',
  HORARIO:          'f3f5ba8126a7db3b7dfb4c7cb6e6d29bfbce3ee9',
  LOCAL:            'b6079a8778fa397928f1a0be04ccdf8435dad258',
  PUBLICO:          'f175f9f18f186ec492358d38ff0b8dccc49c1f40',
  FUNCIONARIOS:     '8aab2b8f637ca74139c12f21689a6537e3d25679',
  UTM_SOURCE:       '5b28245c502bdaf5444fbf9cb3a51343f94cdcfa',
  UTM_CAMPAIGN:     '2400cc71ad7a60be9480f1ce3a05b08f70caefc4',
  PESSOA_CIDADE:    '8a3a101cd9f82710af86e56532c3646814279269',
  PESSOA_TIPO:      'f2844b6efad9390dc0f20fae467113a4fded5abf',
  PESSOA_ORIGEM:    'd42a03b828e552feb7208161fe78987c4c0705bb',
};

const TIPO_EVENTO_ID = 31;
const BASE_RJ = 37;
const BASE_SP = 38;

// ============================================================
// Entry points
// ============================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return corsOk();

    if (url.pathname === '/sync' && request.method === 'POST') {
      const result = await syncAll(env);
      return json(result);
    }

    if (url.pathname === '/status') {
      const principal = await env.SYNC_KV.get('last_sync_saviorprincipal');
      const rj = await env.SYNC_KV.get('last_sync_saviorrj');
      return json({ saviorprincipal: principal, saviorrj: rj });
    }

    return new Response('Savior Blip Sync — POST /sync ou GET /status', { status: 200 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(syncAll(env));
  },
};

// ============================================================
// Sync principal
// ============================================================
async function syncAll(env) {
  const results = {};
  for (const bot of BOTS) {
    const key = env[bot.envKey];
    if (!key) { results[bot.name] = { error: 'key_nao_configurada' }; continue; }
    try {
      results[bot.name] = await syncBot(bot, key, env);
    } catch (err) {
      console.error(`Erro sync ${bot.name}:`, err);
      results[bot.name] = { error: err.message };
    }
  }
  return results;
}

async function syncBot(bot, httpKey, env) {
  const lastSyncKey = `last_sync_${bot.name}`;
  const lastSync = await env.SYNC_KV.get(lastSyncKey);
  // Default: ultimas 24 horas (primeira execucao pega janela maior)
  const sinceTs = lastSync
    ? new Date(lastSync).getTime()
    : Date.now() - 24 * 60 * 60 * 1000;

  const contacts = await fetchRecentContacts(httpKey, sinceTs);
  let processed = 0, skipped = 0, errors = 0;

  for (const contact of contacts) {
    const identity = contact.identity;
    if (!identity) continue;

    // Skip contatos de teste ou internos do Blip
    const extras = contact.extras || {};
    if (contact.group === 'Teste' || contact.group === 'Testers') continue;
    if (contact.name && contact.name.startsWith('Tester')) continue;
    if (extras.isTestersGroup) continue; // contatos internos Blip

    // Precisa ter telefone ou nome real
    const phone = contact.phoneNumber || extractPhone(identity);
    const name = contact.name || '';
    if (!phone && !name) { skipped++; continue; }

    // Ja processou esse contato recentemente?
    const doneKey = `done_${bot.name}_${identity}`;
    const already = await env.SYNC_KV.get(doneKey);
    if (already) { skipped++; continue; }

    try {
      // Precisa ter dados minimamente uteis (primeira_msg ou tipo)
      if (!extras.primeira_msg && !extras.tipo && !extras['serviço']) { skipped++; continue; }

      // Buscar ticket vinculado (Desk)
      const ticket = await fetchTicketForContact(httpKey, identity);

      // Inferir pipeline dos extras
      const pipelineId = inferPipeline(extras, []);
      const stageId = PIPELINE_STAGE[pipelineId] || 41;

      // Criar/encontrar Person no Pipedrive (com dedup)
      const personId = await findOrCreatePerson(phone, name, contact, env);
      if (!personId) { errors++; continue; }

      // Dedup deal: verificar se ja existe deal aberto pra essa pessoa (7 dias)
      const existingDeal = await findRecentDeal(personId, pipelineId, env);
      let dealId;

      if (existingDeal) {
        dealId = existingDeal.id;
        // Atualizar nota com dados atualizados
        await addContactNote(dealId, contact, ticket, bot.label, env);
      } else {
        // Criar deal novo
        dealId = await createDeal(personId, contact, extras, pipelineId, stageId, bot.label, env);
        if (!dealId) { errors++; continue; }
        // Adicionar nota estruturada
        await addContactNote(dealId, contact, ticket, bot.label, env);
      }

      // Marcar como processado (TTL 30 dias)
      await env.SYNC_KV.put(doneKey, JSON.stringify({
        deal_id: dealId,
        synced_at: new Date().toISOString(),
      }), { expirationTtl: 2592000 });

      processed++;
      if (processed >= MAX_PER_BOT) break; // proximo batch no proximo cron
    } catch (err) {
      console.error(`Erro contato ${identity}: ${err.message || err}`);
      errors++;
    }
  }

  await env.SYNC_KV.put(lastSyncKey, new Date().toISOString());
  return { contatos_encontrados: contacts.length, processados: processed, pulados: skipped, erros: errors };
}

// ============================================================
// Blip API — Contatos recentes
// ============================================================
async function fetchRecentContacts(httpKey, sinceTs) {
  const contacts = [];
  let skip = 0;
  const take = 100;

  while (true) {
    const res = await fetch(BLIP_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': httpKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `contacts-${Date.now()}-${skip}`,
        to: 'postmaster@crm.msging.net',
        method: 'get',
        uri: `/contacts?$orderby=lastMessageDate+desc&$skip=${skip}&$take=${take}`,
      }),
    });

    if (!res.ok) break;
    const data = await res.json();
    if (data.status === 'failure') break;

    const items = data.resource?.items || [];
    if (items.length === 0) break;

    for (const c of items) {
      const lastMsg = c.lastMessageDate ? new Date(c.lastMessageDate).getTime() : 0;
      if (lastMsg < sinceTs) return contacts; // passou da janela
      contacts.push(c);
    }

    if (items.length < take) break;
    skip += take;
    if (skip > 500) break; // safety limit
  }

  return contacts;
}

// ============================================================
// Blip API — Buscar ticket do Desk vinculado ao contato
// ============================================================
async function fetchTicketForContact(httpKey, contactIdentity) {
  try {
    // O identity ja vem com @, encodar apenas o @ pra URL
    const safeId = contactIdentity.replace('@', '%40');
    const res = await fetch(BLIP_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': httpKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `ticket-${Date.now()}`,
        to: 'postmaster@desk.msging.net',
        method: 'get',
        uri: `/tickets?$filter=customerIdentity%20eq%20'${safeId}'&$take=1`,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'failure') return null;
    const items = data.resource?.items || [];
    return items[0] || null;
  } catch (err) {
    console.error('Ticket fetch error:', err);
    return null;
  }
}

// ============================================================
// Formatar nota estruturada pro Pipedrive
// Carlos vai ler isso — limpo, profissional, dados relevantes
// ============================================================
function formatContactNote(contact, ticket, botLabel) {
  const extras = contact.extras || {};
  const phone = contact.phoneNumber || extras.telefone_principal || extractPhone(contact.identity) || '';
  const name = contact.name || 'Lead';
  const cleanName = name.length > 50 ? name.substring(0, 50) + '...' : name;

  const row = (label, val) => val ? `<tr><td style="padding:4px 16px 4px 0;color:#888;white-space:nowrap;vertical-align:top;font-size:13px">${label}</td><td style="padding:4px 0;font-size:13px">${esc(val)}</td></tr>` : '';

  let html = `<div style="font-family:Arial,sans-serif;max-width:600px">`;

  // Header
  html += `<div style="background:#0B2540;padding:14px 20px;border-radius:6px 6px 0 0">`;
  html += `<span style="color:#00B87C;font-weight:700;font-size:15px">LEAD WHATSAPP</span>`;
  html += `<span style="color:rgba(255,255,255,.5);font-size:12px;margin-left:12px">${esc(botLabel)}</span>`;
  html += `</div>`;

  // Dados do contato
  html += `<div style="border:1px solid #e5e7eb;border-top:none;padding:16px 20px;border-radius:0 0 6px 6px">`;
  html += `<table style="border-collapse:collapse;width:100%">`;
  html += row('Nome', cleanName);
  html += row('Telefone', phone);
  html += row('Paciente', extras.nome_paciente);
  html += row('Bairro', extras.bairro);
  html += row('Servico', extras['serviço'] || extras.servico);
  html += row('Tipo', extras.tipo);
  html += row('Fila', extras['desk.teamName']);
  html += row('Score', extras.lead_score ? `${extras.lead_score}/10 (${extras.lead_intent || ''})` : null);
  html += row('Horario', extras['Horário'] || extras.horario);
  html += row('Entrada', extras.entrada_timestamp);
  html += row('Canal', extras.canal_entrada || extras.Canal);
  html += row('Cadastro', extras.possuiCadastro);
  html += `</table>`;

  // Primeira mensagem (o que o lead escreveu)
  const primeiraMsg = extras.primeira_msg;
  if (primeiraMsg) {
    html += `<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0">`;
    html += `<p style="font-size:12px;color:#888;margin:0 0 6px;font-weight:600">PRIMEIRA MENSAGEM</p>`;
    html += `<div style="background:#f0faf5;padding:12px 16px;border-radius:6px;border-left:3px solid #00B87C;font-size:13px;line-height:1.5;white-space:pre-wrap">${esc(primeiraMsg)}</div>`;
  }

  // Dados do ticket (se existir)
  if (ticket) {
    html += `<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0">`;
    html += `<p style="font-size:12px;color:#888;margin:0 0 6px;font-weight:600">TICKET</p>`;
    html += `<table style="border-collapse:collapse;width:100%">`;
    html += row('Status', ticket.status);
    html += row('Fila', ticket.team);
    html += row('Atendente', ticket.agentIdentity ? ticket.agentIdentity.split('@')[0] : null);
    html += row('Aberto', ticket.openDate ? new Date(ticket.openDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null);
    if (ticket.closeDate) html += row('Fechado', new Date(ticket.closeDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
    const tags = (ticket.tags || []).join(', ');
    if (tags) html += row('Tags', tags);
    html += `</table>`;
  }

  html += `</div></div>`;
  return html;
}

// ============================================================
// Pipedrive — Find or Create Person (com dedup por telefone)
// ============================================================
async function findOrCreatePerson(phone, name, contact, env) {
  const token = env.PIPEDRIVE_TOKEN;
  const cleanPhone = (phone || '').replace(/\D/g, '');

  // Buscar existente por telefone
  if (cleanPhone) {
    try {
      const res = await fetch(
        `${PIPEDRIVE_API}/persons/search?term=${encodeURIComponent(cleanPhone)}&fields=phone&limit=5&api_token=${token}`
      );
      const data = await res.json();
      const matches = (data?.data?.items || [])
        .map(i => i.item || i)
        .filter(p => {
          const phones = (p.phone || []).map(ph => (ph.value || '').replace(/\D/g, ''));
          return phones.some(ph => ph.includes(cleanPhone) || cleanPhone.includes(ph));
        });
      if (matches.length > 0) return matches[0].id;
    } catch (err) {
      console.error('Person search failed:', err);
    }
  }

  // Criar novo
  const payload = {
    name: name || `Lead Blip ${phone}`,
    visible_to: 3,
  };
  if (phone) payload.phone = [{ value: phone, label: 'whatsapp', primary: true }];

  const extras = contact.extras || {};
  if (extras.cidade || extras.city) payload[CF.PESSOA_CIDADE] = extras.cidade || extras.city;
  if (extras.tipo_evento || extras.tipo) payload[CF.PESSOA_TIPO] = extras.tipo_evento || extras.tipo;

  const res = await fetch(`${PIPEDRIVE_API}/persons?api_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data?.data?.id || null;
}

// ============================================================
// Pipedrive — Buscar deal aberto recente (dedup 7 dias)
// ============================================================
async function findRecentDeal(personId, pipelineId, env) {
  const token = env.PIPEDRIVE_TOKEN;
  try {
    const res = await fetch(
      `${PIPEDRIVE_API}/persons/${personId}/deals?status=open&limit=50&api_token=${token}`
    );
    const data = await res.json();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = (data?.data || []).filter(d =>
      d.pipeline_id === pipelineId && new Date(d.add_time) > cutoff
    );
    return recent.length > 0 ? recent[0] : null;
  } catch (err) {
    console.error('Deal search failed:', err);
    return null;
  }
}

// ============================================================
// Pipedrive — Criar Deal com custom fields
// ============================================================
async function createDeal(personId, contact, extras, pipelineId, stageId, botLabel, env) {
  const token = env.PIPEDRIVE_TOKEN;
  const name = contact.name || contact.phoneNumber || 'Lead Blip';
  const now = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '');

  const payload = {
    title: `Blip ${botLabel} | ${name} | ${now}`,
    pipeline_id: pipelineId,
    stage_id: stageId,
    status: 'open',
    visible_to: 3,
    person_id: personId,
  };

  // Custom fields
  const cidLower = (extras.cidade || extras.city || '').toLowerCase();
  if (cidLower.includes('paulo') || cidLower.includes('sp')) {
    payload[CF.BASE] = BASE_SP;
  } else {
    payload[CF.BASE] = BASE_RJ;
  }

  const isEvento = (extras.tipo_evento || '').toLowerCase().includes('evento')
    || pipelineId === 8 || pipelineId === 9;
  if (isEvento) payload[CF.TIPO_CLIENTE] = TIPO_EVENTO_ID;

  if (extras.data_evento || extras.data) payload[CF.DATA_EVENTO] = extras.data_evento || extras.data;
  if (extras.horario) payload[CF.HORARIO] = extras.horario;
  if (extras.bairro || extras.local) payload[CF.LOCAL] = extras.bairro || extras.local;
  if (extras.publico_estimado || extras.publico) {
    payload[CF.PUBLICO] = Number(extras.publico_estimado || extras.publico) || extras.publico_estimado || extras.publico;
  }

  const res = await fetch(`${PIPEDRIVE_API}/deals?api_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data?.data?.id || null;
}

// ============================================================
// Pipedrive — Adicionar nota estruturada com dados do contato
// ============================================================
async function addContactNote(dealId, contact, ticket, botLabel, env) {
  const token = env.PIPEDRIVE_TOKEN;
  const html = formatContactNote(contact, ticket, botLabel);

  try {
    // Sanitizar HTML: remover control chars que quebram JSON
    const safeHtml = html.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
    const payload = { deal_id: dealId, content: safeHtml };
    const body = JSON.stringify(payload);

    const res = await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await res.json();
    if (!data?.success) {
      console.error(`Nota falhou deal=${dealId}: ${JSON.stringify(data?.error || data).substring(0, 200)}`);
      // Fallback: nota simples sem HTML
      const extras = contact.extras || {};
      const fallback = `Lead: ${contact.name || 'N/A'}\nTelefone: ${contact.phoneNumber || 'N/A'}\nTipo: ${extras.tipo || 'N/A'}\nFila: ${extras['desk.teamName'] || 'N/A'}\nMsg: ${(extras.primeira_msg || '').substring(0, 200)}`;
      await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId, content: fallback }),
      });
      console.log(`Nota fallback criada deal=${dealId}`);
    } else {
      console.log(`Nota criada deal=${dealId} note=${data.data?.id}`);
    }
  } catch (err) {
    console.error(`Nota erro deal=${dealId}: ${err.message}`);
  }
}

// ============================================================
// Inferir pipeline baseado nos extras do contato e mensagens
// ============================================================
function inferPipeline(extras, messages) {
  // Extras diretos
  const tipo = (extras.tipo_evento || extras.tipo || extras.sector || '').toLowerCase();
  const cidade = (extras.cidade || extras.city || '').toLowerCase();

  const isSP = cidade.includes('paulo') || cidade.includes('sp');

  if (tipo.includes('evento') || extras.data_evento) {
    return isSP ? 9 : 8; // Eventos SP ou RJ
  }
  if (tipo.includes('corporativo') || tipo.includes('area_protegida') || extras.empresa) {
    return isSP ? 11 : 10; // Corporativo SP ou RJ
  }

  // Buscar nas mensagens por keywords
  const allText = messages
    .filter(m => m.direction === 'received' && m.type === 'text/plain')
    .map(m => (typeof m.content === 'string' ? m.content : '').toLowerCase())
    .join(' ');

  if (allText.includes('evento') || allText.includes('show') || allText.includes('festa')) {
    return isSP ? 9 : 8;
  }
  if (allText.includes('corporativo') || allText.includes('empresa') || allText.includes('plano')) {
    return isSP ? 11 : 10;
  }

  // Default: BOT WhatsApp
  return 12;
}

// ============================================================
// Helpers
// ============================================================
function extractPhone(identity) {
  if (!identity) return '';
  const part = identity.split('@')[0];
  if (/^\d{10,15}$/.test(part)) return part;
  return '';
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '') // remover control chars
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function corsOk() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
