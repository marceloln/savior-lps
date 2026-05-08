/**
 * Cloudflare Worker — Savior Lead Capture
 *
 * Recebe o payload de WA click do site e cria Person + Deal no Pipedrive.
 * Substitui o n8n (onrender.com) com solução sempre ativa e sem cold start.
 *
 * Payload esperado (mesmo formato já enviado pelo site):
 *   { type, page, nome, email, whatsapp, lead_source, campaign,
 *     utm_source, utm_medium, utm_campaign, gclid }
 *
 * Mapeamento page → pipeline Pipedrive:
 *   eventos-rj   → 8  (Eventos RJ)
 *   eventos-sp   → 9  (Eventos SP)
 *   corporativo  → 10 (Corporativo RJ) | 11 (Corporativo SP) se utm contiver "sp"
 *   outros       → 12 (Ambulância — pipeline principal)
 *
 * Variáveis de ambiente (Cloudflare secret):
 *   PIPEDRIVE_TOKEN — token da API Pipedrive
 */

const PAGE_PIPELINE = {
  'eventos-rj':  8,
  'eventos-sp':  9,
  'corporativo': 10,  // default RJ; muda pra 11 se utm_campaign/lead_source contiver "sp"
};

const PIPELINE_STAGE_NOVO_LEAD = {
  8: 46, 9: 51, 10: 56, 11: 61, 12: 41,
};

const PIPEDRIVE_API = 'https://api.pipedrive.com/v1';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsOk();
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    const {
      page = 'home',
      nome = '',
      email = '',
      whatsapp = '',
      lead_source = '',
      utm_source = 'direct',
      utm_medium = 'none',
      utm_campaign = 'none',
      gclid = '',
    } = body;

    // Determinar pipeline
    let pipelineId = PAGE_PIPELINE[page] ?? 12;
    // Corporativo SP: utm_campaign ou lead_source contém "sp"
    if (pipelineId === 10) {
      const lower = (utm_campaign + lead_source).toLowerCase();
      if (lower.includes('sp-corp') || lower.includes('corporativo-sp')) {
        pipelineId = 11;
      }
    }
    const stageId = PIPELINE_STAGE_NOVO_LEAD[pipelineId] ?? 41;

    // Nome da pessoa — WA click não tem nome real; usa timestamp como fallback
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const personName = nome?.trim() || `WA — ${page} — ${now}`;

    // Título do deal com UTM
    const dealTitle = lead_source || `WA Click | ${page} | ${utm_campaign}`;

    // Nota UTM
    const utmNote = [
      `utm_source: ${utm_source}`,
      `utm_medium: ${utm_medium}`,
      `utm_campaign: ${utm_campaign}`,
      gclid ? `gclid: ${gclid}` : null,
      `page: ${page}`,
    ].filter(Boolean).join(' | ');

    const token = env.PIPEDRIVE_TOKEN;

    // 1. Criar Pessoa
    const personPayload = { name: personName };
    if (email) personPayload.email = [{ value: email, primary: true }];
    if (whatsapp) personPayload.phone = [{ value: whatsapp, label: 'whatsapp', primary: true }];

    const personRes = await fetch(`${PIPEDRIVE_API}/persons?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personPayload),
    });
    const personData = await personRes.json();
    const personId = personData?.data?.id;

    if (!personId) {
      console.error('Pipedrive person create failed:', JSON.stringify(personData));
      return new Response('Person create error', { status: 500 });
    }

    // 2. Criar Deal
    const dealRes = await fetch(`${PIPEDRIVE_API}/deals?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: dealTitle,
        person_id: personId,
        pipeline_id: pipelineId,
        stage_id: stageId,
        status: 'open',
      }),
    });
    const dealData = await dealRes.json();
    const dealId = dealData?.data?.id;

    if (!dealId) {
      console.error('Pipedrive deal create failed:', JSON.stringify(dealData));
      return new Response('Deal create error', { status: 500 });
    }

    // 3. Nota UTM no deal
    await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: dealId, content: utmNote }),
    });

    console.log(`Lead criado: person=${personId} deal=${dealId} pipeline=${pipelineId} page=${page}`);

    return new Response(JSON.stringify({ ok: true, person_id: personId, deal_id: dealId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function corsOk() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
