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
  'eventos-rj':    8,
  'eventos-sp':    9,
  'corporativo':   10,
  'corporativo-sp': 11,
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
      type = 'wa_click',
      page = 'home',
      nome = '',
      email = '',
      whatsapp = '',
      empresa = '',
      cidade = '',
      bairro = '',
      tipo = '',
      tipo_evento = '',
      funcionarios = '',
      data_evento = '',
      horario_inicio = '',
      horario_fim = '',
      publico_estimado = '',
      lead_source = '',
      utm_source = 'direct',
      utm_medium = 'none',
      utm_campaign = 'none',
      gclid = '',
    } = body;

    // Determinar pipeline
    let pipelineId = PAGE_PIPELINE[page] ?? 12;
    // Corporativo SP: utm_campaign ou lead_source contém indicador SP
    if (pipelineId === 10) {
      const lower = (utm_campaign + lead_source).toLowerCase();
      if (lower.includes('corp-sp') || lower.includes('sp-corp') || lower.includes('corporativo-sp')) {
        pipelineId = 11;
      }
    }
    const stageId = PIPELINE_STAGE_NOVO_LEAD[pipelineId] ?? 41;

    // Data/hora em BRT para labels legíveis
    const nowDt = new Date();
    const now = nowDt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const dateTag = nowDt.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: false,
    }).replace(',', '');

    // Nome da pessoa — WA click não tem nome real; usa timestamp como fallback
    const personName = nome?.trim() || `WA — ${page} — ${now}`;

    // Título do deal: form usa nome do lead; WA click usa utm_campaign
    const isForm = type === 'deal';
    const dealTitle = isForm
      ? `Form | ${page} | ${nome?.trim() || 'sem nome'} | ${dateTag}`
      : `WA | ${page} | ${utm_campaign} | ${dateTag}`;

    // Nota UTM — inclui todos os campos disponíveis
    const tipoFinal = tipo_evento || tipo;
    const utmNote = [
      `utm_source: ${utm_source}`,
      `utm_medium: ${utm_medium}`,
      `utm_campaign: ${utm_campaign}`,
      gclid ? `gclid: ${gclid}` : null,
      `page: ${page}`,
      lead_source ? `button: ${lead_source}` : null,
      empresa ? `empresa: ${empresa}` : null,
      cidade ? `cidade: ${cidade}` : null,
      bairro ? `bairro/local: ${bairro}` : null,
      tipoFinal ? `tipo: ${tipoFinal}` : null,
      data_evento ? `data_evento: ${data_evento}` : null,
      (horario_inicio && horario_fim) ? `horario: ${horario_inicio} às ${horario_fim}` : null,
      publico_estimado ? `publico: ${publico_estimado}` : null,
      funcionarios ? `funcionarios: ${funcionarios}` : null,
    ].filter(Boolean).join(' | ');

    const token = env.PIPEDRIVE_TOKEN;

    // 1. Criar Pessoa — apenas se houver dados reais (nome, email ou whatsapp)
    //    Cliques WA anônimos não geram Person para não poluir contatos
    let personId = null;
    let orgId = null;
    const hasContactData = nome?.trim() || email || whatsapp;

    if (hasContactData) {
      // 1a. Criar Organization para leads corporativos com empresa
      if (empresa) {
        const orgRes = await fetch(`${PIPEDRIVE_API}/organizations?api_token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: empresa }),
        });
        const orgData = await orgRes.json();
        orgId = orgData?.data?.id ?? null;
      }

      // 1b. Criar Person
      const personPayload = { name: personName };
      if (email) personPayload.email = [{ value: email, primary: true }];
      if (whatsapp) personPayload.phone = [{ value: whatsapp, label: 'whatsapp', primary: true }];
      if (orgId) personPayload.org_id = orgId;

      const personRes = await fetch(`${PIPEDRIVE_API}/persons?api_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personPayload),
      });
      const personData = await personRes.json();
      personId = personData?.data?.id;

      if (!personId) {
        console.error('Pipedrive person create failed:', JSON.stringify(personData));
        return new Response('Person create error', { status: 500 });
      }
    }

    // 2a. WA anônimo — sem dados de contato, não há como dar follow-up.
    //     Pipedrive exige person_id ou org_id para criar Lead.
    //     Esses cliques já são rastreados via GA4/GTM. Retorna OK silenciosamente.
    if (!hasContactData) {
      console.log(`WA click anônimo ignorado (sem dados): page=${page} campaign=${utm_campaign}`);
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // 2b. Lead com dados → Deal na pipeline
    const dealPayload = {
      title: dealTitle,
      pipeline_id: pipelineId,
      stage_id: stageId,
      status: 'open',
      person_id: personId,
    };
    if (orgId) dealPayload.org_id = orgId;

    const dealRes = await fetch(`${PIPEDRIVE_API}/deals?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealPayload),
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

    // 4. Email de notificação para comercial (apenas para leads de formulário)
    if (isForm) {
      const tipoFinal2 = tipo_evento || tipo;
      const emailBody = [
        `<p><strong>Novo lead via formulário — ${page}</strong></p>`,
        `<table style="border-collapse:collapse;font-size:14px">`,
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Nome</td><td>${nome}</td></tr>`,
        email ? `<tr><td style="padding:4px 12px 4px 0;color:#666">E-mail</td><td>${email}</td></tr>` : '',
        whatsapp ? `<tr><td style="padding:4px 12px 4px 0;color:#666">WhatsApp</td><td>${whatsapp}</td></tr>` : '',
        bairro ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Local/Bairro</td><td>${bairro}</td></tr>` : '',
        cidade ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Cidade</td><td>${cidade}</td></tr>` : '',
        tipoFinal2 ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Tipo de evento</td><td>${tipoFinal2}</td></tr>` : '',
        data_evento ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Data</td><td>${data_evento}</td></tr>` : '',
        (horario_inicio && horario_fim) ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Horário</td><td>${horario_inicio} às ${horario_fim}</td></tr>` : '',
        publico_estimado ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Público estimado</td><td>${publico_estimado}</td></tr>` : '',
        `</table>`,
        `<p style="margin-top:12px;font-size:12px;color:#999">utm_source: ${utm_source} | utm_campaign: ${utm_campaign} | deal #${dealId}</p>`,
      ].filter(Boolean).join('');

      if (env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Site Savior <noreply@savior.com.br>',
            to: ['comercial@savior.com.br'],
            subject: `[Lead ${page}] ${nome} — ${dateTag}`,
            html: emailBody,
          }),
        }).catch((err) => console.error('Email send failed:', err));
      }
    }

    console.log(`Deal criado: person=${personId} deal=${dealId} pipeline=${pipelineId} page=${page}`);
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
