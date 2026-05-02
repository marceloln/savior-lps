/**
 * Cloudflare Pages Function — POST /api/pipedrive
 *
 * Proxy server-side para a API do Pipedrive. Mantém o token fora do JS público.
 *
 * Env var obrigatória (configurar no Cloudflare Pages → Settings → Environment variables):
 *   PIPEDRIVE_TOKEN = <seu token de API do Pipedrive>
 *
 * Tipos de payload:
 *   { type: "lead", page, campaign, utm_source, utm_campaign }
 *     → Cria Lead no Pipedrive (clique no WhatsApp)
 *
 *   { type: "deal", page, nome, whatsapp, empresa?, tipo?, data_evento?,
 *                   publico_estimado?, funcionarios?, utm_source, utm_campaign }
 *     → Cria Person + Deal no Pipedrive (envio de formulário)
 */

const BASE = 'https://api.pipedrive.com/v1';

export async function onRequestPost(context) {
  const token = context.env.PIPEDRIVE_TOKEN;
  if (!token) {
    return json({ error: 'not_configured' }, 500);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const hdrs = {
    'Content-Type': 'application/json',
    'x-api-token': token,
  };

  try {
    if (body.type === 'lead') {
      return await createLead(body, hdrs);
    }
    if (body.type === 'deal') {
      return await createDeal(body, hdrs);
    }
    return json({ error: 'unknown_type' }, 400);
  } catch {
    return json({ error: 'internal_error' }, 500);
  }
}

// ──────────────────────────────────────────────────────────────
// Lead (clique no WhatsApp — topo de funil, sem dados pessoais)
// ──────────────────────────────────────────────────────────────
async function createLead(body, hdrs) {
  const { page, campaign, utm_source, utm_campaign } = body;

  // Pipedrive exige person_id — criamos uma Pessoa genérica para o clique
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const personRes = await fetch(`${BASE}/persons`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({ name: `WA — ${page || 'site'} — ${ts}` }),
  });
  const personData = await personRes.json();
  const personId   = personData?.data?.id;

  const title = `WA Click — ${page || 'site'} — ${campaign || 'organic'}`;
  const leadPayload = { title };
  if (personId) leadPayload.person_id = personId;

  const res = await fetch(`${BASE}/leads`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify(leadPayload),
  });

  const data = await res.json();
  const leadId = data?.data?.id;

  if (leadId) {
    const noteLines = [
      `Origem: clique no WhatsApp`,
      `Página: ${page || 'desconhecida'}`,
      `Campanha: ${campaign || 'none'}`,
      utm_source    ? `UTM Source: ${utm_source}`       : null,
      utm_campaign  ? `UTM Campaign: ${utm_campaign}`   : null,
    ].filter(Boolean).join('\n');

    await fetch(`${BASE}/notes`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ content: noteLines, lead_id: leadId }),
    });
  }

  return json({ ok: true, lead_id: leadId ?? null });
}

// ──────────────────────────────────────────────────────────────
// Deal (envio de formulário — lead qualificado com dados)
// ──────────────────────────────────────────────────────────────
async function createDeal(body, hdrs) {
  const {
    page, nome, empresa, whatsapp,
    cidade, bairro, tipo, data_evento, horario_inicio, horario_fim,
    publico_estimado, funcionarios,
    utm_source, utm_campaign,
  } = body;

  // 1. Criar Person com nome + telefone
  const personPayload = { name: nome || empresa || 'Contato Savior' };
  if (whatsapp) {
    personPayload.phone = [{ value: whatsapp, label: 'whatsapp', primary: true }];
  }

  const personRes = await fetch(`${BASE}/persons`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify(personPayload),
  });
  const personData = await personRes.json();
  const personId   = personData?.data?.id;

  // 2. Criar Deal vinculado à Person, no pipeline correto
  const dealTitle   = empresa
    ? `${empresa} — ${page || 'corporativo'}`
    : `${nome || 'Lead'} — ${page || 'site'}`;

  // Rotas: página → pipeline_id + stage_id (primeiro estágio de cada pipeline)
  const PIPELINE_MAP = {
    'eventos':     { pipeline_id: 6, stage_id: 35 }, // Eventos - RJ › Qualificado
    'eventos-sp':     { pipeline_id: 2, stage_id: 6  }, // Eventos - SP › Cliente Qualificado
    'corporativo':    { pipeline_id: 1, stage_id: 1  }, // Area Protegida - RJ › Cliente Qualificado
    'corporativo-sp': { pipeline_id: 5, stage_id: 23 }, // Area Protegida - SP › Cliente Qualificado
  };
  const route = PIPELINE_MAP[page] || {};

  const dealPayload = { title: dealTitle, ...route };
  if (personId) dealPayload.person_id = personId;

  const dealRes  = await fetch(`${BASE}/deals`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify(dealPayload),
  });
  const dealData = await dealRes.json();
  const dealId   = dealData?.data?.id;

  // 3. Nota com todos os campos do formulário
  if (dealId) {
    const noteLines = [
      nome              ? `Nome: ${nome}`                                       : null,
      empresa           ? `Empresa: ${empresa}`                                 : null,
      whatsapp          ? `WhatsApp: ${whatsapp}`                               : null,
      cidade            ? `Cidade: ${cidade}`                                   : null,
      bairro            ? `Bairro: ${bairro}`                                   : null,
      tipo              ? `Tipo: ${tipo}`                                       : null,
      data_evento       ? `Data do evento: ${data_evento}`                      : null,
      (horario_inicio && horario_fim) ? `Horário: ${horario_inicio} às ${horario_fim}` : null,
      publico_estimado  ? `Público estimado: ${publico_estimado}`               : null,
      funcionarios      ? `Funcionários: ${funcionarios}`         : null,
      `Página: ${page || 'desconhecida'}`,
      utm_source        ? `UTM Source: ${utm_source}`             : null,
      utm_campaign      ? `UTM Campaign: ${utm_campaign}`         : null,
    ].filter(Boolean).join('\n');

    await fetch(`${BASE}/notes`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ content: noteLines, deal_id: dealId }),
    });
  }

  return json({ ok: true, deal_id: dealId ?? null, person_id: personId ?? null });
}

// ──────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
