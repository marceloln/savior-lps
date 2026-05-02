/**
 * Cloudflare Pages Function — POST /api/pipedrive
 *
 * Proxy server-side para a API do Pipedrive.
 * Env var obrigatória: PIPEDRIVE_TOKEN (Cloudflare Pages → Settings → Environment variables)
 *
 * Payloads aceitos:
 *   { type: "lead", page, campaign, utm_source, utm_campaign }
 *     → Clique no WhatsApp: cria Lead no Pipedrive
 *
 *   { type: "deal", page, nome, whatsapp, empresa?, cidade, bairro?,
 *     tipo?, data_evento?, horario_inicio?, horario_fim?,
 *     publico_estimado?, funcionarios?, utm_source, utm_campaign }
 *     → Formulário: cria Person + Deal + Nota + Activity (notificação por e-mail)
 */

const BASE = 'https://api.pipedrive.com/v1';

// ── Responsáveis ──────────────────────────────────────────────
// Carlos Xavier (RJ): 22287454 | Comercial SP: 22647110

// ── Pipelines do site (criados via API em 02/05/2026) ─────────
// SITE Eventos RJ     → pipeline 8,  stage 46 "Novo Lead"
// SITE Eventos SP     → pipeline 9,  stage 51 "Novo Lead"
// SITE Corporativo RJ → pipeline 10, stage 56 "Novo Lead"
// SITE Corporativo SP → pipeline 11, stage 61 "Novo Lead"

const PIPELINE_MAP = {
  'eventos':        { pipeline_id: 8,  stage_id: 46, owner_id: 22287454 },
  'eventos-sp':     { pipeline_id: 9,  stage_id: 51, owner_id: 22647110 },
  'corporativo':    { pipeline_id: 10, stage_id: 56, owner_id: 22287454 },
  'corporativo-sp': { pipeline_id: 11, stage_id: 61, owner_id: 22647110 },
};

// ─────────────────────────────────────────────────────────────
export async function onRequestPost(context) {
  const token = context.env.PIPEDRIVE_TOKEN;
  if (!token) return json({ error: 'not_configured' }, 500);

  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'invalid_json' }, 400); }

  const hdrs = { 'Content-Type': 'application/json', 'x-api-token': token };

  try {
    if (body.type === 'lead') return await createLead(body, hdrs);
    if (body.type === 'deal') return await createDeal(body, hdrs, context);
    return json({ error: 'unknown_type' }, 400);
  } catch {
    return json({ error: 'internal_error' }, 500);
  }
}

// ──────────────────────────────────────────────────────────────
// Lead — clique no WhatsApp (sem dados pessoais ainda)
// ──────────────────────────────────────────────────────────────
async function createLead(body, hdrs) {
  const { page, campaign, utm_source, utm_campaign } = body;

  // Pipedrive exige person_id → Person genérica com timestamp
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const personRes  = await fetch(`${BASE}/persons`, {
    method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: `WA — ${page || 'site'} — ${ts}` }),
  });
  const personId = (await personRes.json())?.data?.id;

  const title      = `WA Click | ${page || 'site'} | ${campaign || 'organic'}`;
  const leadRes    = await fetch(`${BASE}/leads`, {
    method: 'POST', headers: hdrs,
    body: JSON.stringify({ title, ...(personId ? { person_id: personId } : {}) }),
  });
  const leadId = (await leadRes.json())?.data?.id;

  if (leadId) {
    const note = [
      '📱 Origem: clique no WhatsApp',
      `📄 Página: ${page || '—'}`,
      `📣 Campanha: ${campaign || '—'}`,
      utm_source   ? `🔗 UTM Source: ${utm_source}`   : null,
      utm_campaign ? `🎯 UTM Campaign: ${utm_campaign}` : null,
    ].filter(Boolean).join('\n');

    await fetch(`${BASE}/notes`, {
      method: 'POST', headers: hdrs,
      body: JSON.stringify({ content: note, lead_id: leadId }),
    });
  }

  return json({ ok: true, lead_id: leadId ?? null });
}

// ──────────────────────────────────────────────────────────────
// Deal — envio de formulário (lead qualificado com dados)
// ──────────────────────────────────────────────────────────────
async function createDeal(body, hdrs, context) {
  const {
    page, nome, email, empresa, whatsapp,
    cidade, bairro, tipo,
    data_evento, horario_inicio, horario_fim,
    publico_estimado, funcionarios,
    utm_source, utm_campaign,
  } = body;

  const isEvento = page?.startsWith('eventos');

  // 1. Para corporativo: criar Organization (empresa + cidade) primeiro
  let orgId = null;
  if (!isEvento && empresa) {
    orgId = (await fetch(`${BASE}/organizations`, {
      method: 'POST', headers: hdrs,
      body: JSON.stringify({ name: empresa, address: cidade || undefined }),
    }).then(r => r.json()))?.data?.id;

    // Nota na Organization marcando origem
    if (orgId) {
      const orgNote = [
        '<p><b>🌐 Organização criada via site Savior</b></p>',
        p('📍 Cidade', cidade),
        p('🔗 Origem', utm_source),
        p('🎯 Campanha', utm_campaign),
      ].filter(Boolean).join('\n');
      await fetch(`${BASE}/notes`, {
        method: 'POST', headers: hdrs,
        body: JSON.stringify({ content: orgNote, org_id: orgId }),
      });
    }
  }

  // 2. Criar Person com e-mail, telefone e org vinculada
  const personPayload = { name: nome || empresa || 'Contato Savior' };
  if (email)    personPayload.email = [{ value: email, label: 'work', primary: true }];
  if (whatsapp) personPayload.phone = [{ value: whatsapp, label: 'whatsapp', primary: true }];
  if (orgId)    personPayload.org_id = orgId;

  const personId = (await fetch(`${BASE}/persons`, {
    method: 'POST', headers: hdrs, body: JSON.stringify(personPayload),
  }).then(r => r.json()))?.data?.id;

  // 3. Título limpo do Deal
  // Converte AAAA-MM-DD → DD/MM/AAAA
  function brDate(d) {
    if (!d) return null;
    const [y, m, dd] = d.split('-');
    return `${dd}/${m}/${y}`;
  }

  let dealTitle;
  if (isEvento) {
    // "João Silva | Show | Barra da Tijuca | 15/06"
    const dataFmt = data_evento ? data_evento.slice(5).replace('-', '/') : null;
    dealTitle = [nome, tipo, bairro, dataFmt].filter(Boolean).join(' | ');
  } else {
    // "Petrobras S.A. | João Silva | São Paulo"
    dealTitle = [empresa, nome, cidade].filter(Boolean).join(' | ');
  }

  // 3. Criar Deal no pipeline correto
  const route   = PIPELINE_MAP[page] || {};
  const ownerId = route.owner_id;
  const { owner_id: _, ...pipelineRoute } = route;

  const dealId = (await fetch(`${BASE}/deals`, {
    method: 'POST', headers: hdrs,
    body: JSON.stringify({
      title: dealTitle,
      ...pipelineRoute,
      ...(personId ? { person_id: personId } : {}),
      ...(ownerId  ? { user_id: ownerId }    : {}),
    }),
  }).then(r => r.json()))?.data?.id;

  if (!dealId) return json({ ok: false, error: 'deal_not_created' }, 500);

  // 4. Nota formatada — cada campo em <p> próprio para quebrar linha no Pipedrive
  function p(label, value) {
    return value ? `<p><b>${label}:</b> ${value}</p>` : '';
  }

  const note = isEvento
    ? `<p><b>🌐 LEAD DO SITE — EVENTOS</b></p>
<hr>
${p('👤 Nome',             nome)}
${p('📧 E-mail',           email)}
${p('📱 WhatsApp',         whatsapp)}
${p('📍 Cidade',           cidade)}
${p('🏘️ Local / Bairro',   bairro)}
<hr>
${p('🎪 Tipo de evento',   tipo)}
${p('📅 Data',             brDate(data_evento))}
${horario_inicio && horario_fim ? `<p><b>⏰ Horário:</b> ${horario_inicio} às ${horario_fim}</p>` : ''}
${p('👥 Público estimado', publico_estimado)}
<hr>
${p('🔗 Origem',  utm_source)}
${p('🎯 Campanha', utm_campaign)}`
    : `<p><b>🌐 LEAD DO SITE — CORPORATIVO</b></p>
<hr>
${p('🏢 Empresa',  empresa)}
${p('👤 Contato',  nome)}
${p('📧 E-mail',   email)}
${p('📱 WhatsApp', whatsapp)}
${p('📍 Cidade',   cidade)}
<hr>
${p('🚑 Tipo de cobertura', tipo)}
${p('👥 Funcionários',      funcionarios)}
<hr>
${p('🔗 Origem',  utm_source)}
${p('🎯 Campanha', utm_campaign)}`;

  await fetch(`${BASE}/notes`, {
    method: 'POST', headers: hdrs,
    body: JSON.stringify({ content: note, deal_id: dealId }),
  });

  // 5. Activity — notifica o responsável por e-mail
  const today = new Date().toISOString().slice(0, 10);
  await fetch(`${BASE}/activities`, {
    method: 'POST', headers: hdrs,
    body: JSON.stringify({
      subject: `🌐 Lead do site — ${dealTitle}`,
      type: 'task',
      deal_id: dealId,
      due_date: today,
      note,
      ...(ownerId ? { assigned_to_user_id: ownerId } : {}),
    }),
  });

  // 6. Notificar via WhatsApp (Blip) — fire and forget
  if (whatsapp) {
    const origin = new URL(context.request.url).origin;
    fetch(`${origin}/api/blip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'deal',
        nome, whatsapp, page, tipo,
        data_evento, bairro, empresa,
      }),
    }).catch(() => {});
  }

  return json({ ok: true, deal_id: dealId, person_id: personId ?? null });
}

// ─────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
