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

    // Labels legíveis para valores de enum
    const tipoFinal = tipo_evento || tipo;
    const tipoLabel = {
      'area_protegida':   'Área Protegida',
      'uti_movel':        'UTI Móvel',
      'suporte_basico':   'Suporte Básico',
      'suporte_avancado': 'Suporte Avançado',
      'basica':           'Suporte Básico',
      'avancada':         'UTI Móvel',
    }[tipoFinal] || tipoFinal;

    const funcionariosLabel = {
      'ate_50':       'até 50',
      '50_200':       '50 a 200',
      '200_500':      '200 a 500',
      '500_1000':     '500 a 1.000',
      '1000_5000':    '1.000 a 5.000',
      'acima_5000':   'acima de 5.000',
    }[funcionarios] || funcionarios;

    const pageLabel = {
      'corporativo':    'CORPORATIVO',
      'eventos-rj':     'EVENTOS RJ',
      'eventos-sp':     'EVENTOS SP',
      'ambulancia-rj':  'AMBULÂNCIA RJ',
      'ambulancia-sp':  'AMBULÂNCIA SP',
    }[page] || page.toUpperCase();

    // Título do deal
    const isForm = type === 'deal';
    const dealTitle = isForm
      ? [empresa, nome?.trim() || 'sem nome', cidade].filter(Boolean).join(' | ')
      : `WA | ${page} | ${utm_campaign} | ${dateTag}`;

    // Nota estruturada no deal
    const noteParts = [`🌐 LEAD DO SITE — ${pageLabel}\n`];

    // Bloco contato
    const contatoLine = [
      empresa   ? `🏢 Empresa: ${empresa}` : null,
      nome      ? `👤 Contato: ${nome.trim()}` : null,
      whatsapp  ? `📱 WhatsApp: ${whatsapp}` : null,
      email     ? `✉️ E-mail: ${email}` : null,
    ].filter(Boolean).join('   ');
    if (contatoLine) noteParts.push(contatoLine);

    // Bloco evento (eventos)
    const eventoLine = [
      bairro          ? `📍 Local: ${bairro}` : null,
      cidade          ? `🏙️ Cidade: ${cidade}` : null,
      tipoFinal       ? `🎭 Tipo: ${tipoLabel}` : null,
      data_evento     ? `📅 Data: ${data_evento}` : null,
      (horario_inicio && horario_fim) ? `⏰ Horário: ${horario_inicio} às ${horario_fim}` : null,
      publico_estimado ? `👥 Público: ${publico_estimado}` : null,
    ].filter(Boolean).join('   ');
    if (eventoLine) noteParts.push(eventoLine);

    // Bloco corporativo
    const corpLine = [
      tipoFinal       ? `🚑 Cobertura: ${tipoLabel}` : null,
      funcionarios    ? `👥 Funcionários: ${funcionariosLabel}` : null,
    ].filter(Boolean).join('   ');
    // evita duplicar se já foi para eventos
    if (corpLine && !eventoLine.includes('Tipo')) noteParts.push(corpLine);

    // Bloco UTM
    const utmLine = [
      `🔗 UTM Source: ${utm_source}`,
      utm_medium !== 'none' ? `📡 Medium: ${utm_medium}` : null,
      `🎯 Campaign: ${utm_campaign}`,
      gclid ? `📌 GCLID: ${gclid}` : null,
    ].filter(Boolean).join('   ');
    noteParts.push(utmLine);

    if (lead_source) noteParts.push(`🖱️ Botão: ${lead_source}`);

    const utmNote = noteParts.join('\n');

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

    // Mapeamento de campos customizados Pipedrive
    // Tipo de cliente: 22247c... (enum)
    const TIPO_CLIENTE_IDS = {
      'area_protegida':   32,
      'uti_movel':        36, // Hospital (mais próximo)
      'suporte_basico':   35, // Particular
      'suporte_avancado': 36,
      'basica':           35,
      'avancada':         36,
    };
    const TIPO_EVENTO_ID = 31; // Eventos

    // BASE: 8cc112... (enum)
    const BASE_IDS = {
      'Rio de Janeiro': 37,
      'São Paulo':      38,
      'Sao Paulo':      38,
    };
    const baseId = BASE_IDS[cidade] ?? (cidade?.toLowerCase().includes('paulo') ? 38 : 37) ?? null;

    // Funcionários: 8aab2b... (enum)
    const FUNC_IDS = {
      'ate_50':     44,
      '50_200':     45,
      '200_500':    46,
      '500_1000':   47,
      '1000_5000':  48,
      'acima_5000': 49,
    };

    // 2b. Lead com dados → Deal na pipeline
    const dealPayload = {
      title: dealTitle,
      pipeline_id: pipelineId,
      stage_id: stageId,
      status: 'open',
      person_id: personId,
    };
    if (orgId) dealPayload.org_id = orgId;

    // Campos customizados: Tipo de cliente
    const isEvento = ['eventos-rj','eventos-sp','eventos'].includes(page);
    const tipoClienteId = isEvento
      ? TIPO_EVENTO_ID
      : (TIPO_CLIENTE_IDS[tipoFinal] ?? null);
    if (tipoClienteId) dealPayload['22247c3025a677f2dd4d7ab63548fecb08f05e2f'] = tipoClienteId;

    // BASE (cidade)
    if (baseId) dealPayload['8cc112e07d103997aa14b34442fa7a51cb0d2d91'] = baseId;

    // Número de Funcionários (corporativo)
    if (funcionarios && FUNC_IDS[funcionarios]) dealPayload['8aab2b8f637ca74139c12f21689a6537e3d25679'] = FUNC_IDS[funcionarios];

    // Data do Evento (eventos)
    if (data_evento) dealPayload['79d2372ceaddba4b964ec8430db391885066e5f9'] = data_evento;

    // Horário do Evento (eventos)
    if (horario_inicio && horario_fim) dealPayload['f3f5ba8126a7db3b7dfb4c7cb6e6d29bfbce3ee9'] = `${horario_inicio} às ${horario_fim}`;

    // Público Estimado (eventos)
    if (publico_estimado) dealPayload['f175f9f18f186ec492358d38ff0b8dccc49c1f40'] = Number(publico_estimado) || publico_estimado;

    // Local / Bairro (eventos)
    if (bairro) dealPayload['b6079a8778fa397928f1a0be04ccdf8435dad258'] = bairro;

    // UTM Source e Campaign
    if (utm_source && utm_source !== 'direct') dealPayload['5b28245c502bdaf5444fbf9cb3a51343f94cdcfa'] = utm_source;
    if (utm_campaign && utm_campaign !== 'none') dealPayload['2400cc71ad7a60be9480f1ce3a05b08f70caefc4'] = utm_campaign;

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
            cc: ['bzorman@savior.com.br', 'rmello@savior.com.br'],
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
