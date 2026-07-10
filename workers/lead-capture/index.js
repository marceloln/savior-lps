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
  'eventos-rj':     8,
  'eventos-sp':     9,
  'corporativo':    10,
  'corporativo-sp': 11,
  'ambulancia-rj':  6,   // Eventos RJ (pipeline principal RJ)
  'ambulancia-sp':  2,   // Eventos SP (pipeline principal SP)
  'ambulancia':     6,   // Fallback ambulância → RJ
};

const PIPELINE_STAGE_NOVO_LEAD = {
  8: 46, 9: 51, 10: 56, 11: 61, 12: 41,
  6: 35,  // Eventos RJ → Qualificado
  2: 6,   // Eventos SP → Cliente Qualificado
};

const PIPEDRIVE_API = 'https://api.pipedrive.com/v1';

// E-mails de RH por estado — candidaturas Trabalhe Conosco
// (fluxo 100% e-mail: sem Pipedrive e sem Blip, pra não inflar atendimentos)
const RH_EMAIL = {
  rj: 'central@savior.com.br',
  sp: 'central.sp@savior.com.br',
};
const RH_CC = ['savior@savior.com.br'];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsOk();
    }

    // Roteamento por pathname
    const url = new URL(request.url);

    // POST /ref — armazena UTM data com código curto no KV
    if (url.pathname === '/ref' && request.method === 'POST') {
      return handleRefStore(request, env);
    }

    // GET /ref/:code — consulta UTM data pelo código curto
    if (url.pathname.startsWith('/ref/') && request.method === 'GET') {
      return handleRefLookup(url, env);
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname === '/blip-webhook') {
      return handleBlipWebhook(request, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    // Candidatura Trabalhe Conosco — só e-mail. Sem Pipedrive, sem Blip.
    if (body.type === 'candidatura') {
      return handleCandidatura(body, env);
    }

    const {
      type = 'wa_click',
      page = 'home',
      nome = '',
      email = '',
      whatsapp = '',
      wa_number = '',
      city = '',
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

      // 1b. Dedup: buscar Person existente por telefone antes de criar
      const searchPhone = (whatsapp || '').replace(/\D/g, '');
      if (searchPhone) {
        try {
          const searchRes = await fetch(
            `${PIPEDRIVE_API}/persons/search?term=${encodeURIComponent(searchPhone)}&fields=phone&limit=5&api_token=${token}`
          );
          const searchData = await searchRes.json();
          const matches = (searchData?.data?.items || [])
            .map(i => i.item || i)
            .filter(p => {
              const phones = (p.phone || []).map(ph => (ph.value || '').replace(/\D/g, ''));
              return phones.some(ph => ph.includes(searchPhone) || searchPhone.includes(ph));
            });
          if (matches.length > 0) {
            personId = matches[0].id;
            console.log(`Person existente encontrado: id=${personId} phone=${searchPhone}`);
          }
        } catch (err) {
          console.error('Person search failed (will create new):', err);
        }
      }

      // Criar Person só se não encontrou existente
      if (!personId) {
        const personPayload = { name: personName };
        if (email) personPayload.email = [{ value: email, primary: true }];
        if (whatsapp) personPayload.phone = [{ value: whatsapp, label: 'whatsapp', primary: true }];
        if (orgId) personPayload.org_id = orgId;

        // Campos customizados da Pessoa
        if (cidade)      personPayload['8a3a101cd9f82710af86e56532c3646814279269'] = cidade;
        if (tipoFinal)   personPayload['f2844b6efad9390dc0f20fae467113a4fded5abf'] = tipoLabel;
        if (funcionarios) personPayload['bd246ad7b6bfe73215ad6b199fb944fde1850d12'] = funcionariosLabel;
        if (utm_source && utm_source !== 'direct') personPayload['2112c85f86194384ba9f77f166cfda28b0ba1511'] = utm_source;
        if (utm_campaign && utm_campaign !== 'none') personPayload['37f70f23df7f40e64055167dc9cf720a18c0605f'] = utm_campaign;
        personPayload['d42a03b828e552feb7208161fe78987c4c0705bb'] = page;

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
        console.log(`Person criado: id=${personId} phone=${searchPhone}`);
      }
    }

    // 2a. WA anônimo — NÃO criar deal no Pipedrive.
    //     Clique WA sem dados reais = apenas GA4 event (whatsapp_click).
    //     Deal só é criado quando: formulário (com dados) ou Blip webhook (com telefone real).
    //     Removido em 2026-06-16: criava 46 deals lixo/dia sem contato.
    if (!hasContactData) {
      console.log(`WA click ignorado (sem dados): page=${page} campaign=${utm_campaign}`);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'no_contact_data' }), {
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

    // 2b. Dedup deal: verificar se ja existe deal aberto pra essa pessoa no mesmo pipeline (7 dias)
    let existingDealId = null;
    if (personId) {
      try {
        const dRes = await fetch(
          `${PIPEDRIVE_API}/persons/${personId}/deals?status=open&limit=50&api_token=${token}`
        );
        const dData = await dRes.json();
        const recentDeals = (dData?.data || []).filter(d => {
          if (d.pipeline_id !== pipelineId) return false;
          const addDate = new Date(d.add_time);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return addDate > sevenDaysAgo;
        });
        if (recentDeals.length > 0) {
          existingDealId = recentDeals[0].id;
          console.log(`Deal existente encontrado: id=${existingDealId} person=${personId} pipeline=${pipelineId}`);
        }
      } catch (err) {
        console.error('Deal dedup search failed (will create new):', err);
      }
    }

    // Se deal existente, apenas adicionar nota e retornar
    if (existingDealId) {
      await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: existingDealId, content: '🔄 Contato repetido (deal existente)\n\n' + utmNote, visible_to: 3 }),
      });
      console.log(`Deal duplicado evitado: person=${personId} deal_existente=${existingDealId}`);
      return new Response(JSON.stringify({ ok: true, person_id: personId, deal_id: existingDealId, deduplicated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Criar deal novo
    const dealPayload = {
      title: dealTitle,
      pipeline_id: pipelineId,
      stage_id: stageId,
      status: 'open',
      visible_to: 3,
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
      body: JSON.stringify({ deal_id: dealId, content: utmNote, visible_to: 3 }),
    });

    // 4. Email de notificação — formulários (3 destinatários)
    if (isForm) {
      const row = (label, val) => val ? `<tr><td style="padding:5px 16px 5px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:5px 0;font-weight:500">${val}</td></tr>` : '';
      const btn = (href, color, text) => `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${color};color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">${text}</a>`;
      const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g,'')}` : null;
      const emailBody = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#0B2540;padding:18px 24px;border-radius:8px 8px 0 0">
          <span style="color:#00B87C;font-weight:700;font-size:18px;letter-spacing:.05em">SAVIOR</span>
          <span style="color:rgba(255,255,255,.5);font-size:12px;margin-left:12px">Novo lead — ${pageLabel}</span>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <table style="border-collapse:collapse;font-size:14px;width:100%">
            ${row('Empresa', empresa)}
            ${row('Nome', nome)}
            ${row('WhatsApp', whatsapp)}
            ${row('E-mail', email)}
            ${row('Cidade', cidade)}
            ${row('Tipo', tipoLabel || tipoFinal)}
            ${row('Funcionários', funcionariosLabel)}
            ${row('Local / Bairro', bairro)}
            ${row('Data do evento', data_evento)}
            ${row('Horário', (horario_inicio && horario_fim) ? `${horario_inicio} às ${horario_fim}` : null)}
            ${row('Público estimado', publico_estimado)}
          </table>
          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
            ${waLink ? btn(waLink, '#25D366', '💬 Responder no WhatsApp') : ''}
            ${email ? btn(`mailto:${email}`, '#0B2540', '✉️ Enviar e-mail') : ''}
            ${btn(`https://savior.pipedrive.com/deal/${dealId}`, '#00B87C', '📋 Ver no Pipedrive')}
          </div>
          <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
          <p style="font-size:12px;color:#9ca3af;margin:0">🔗 ${utm_source} · 🎯 ${utm_campaign}</p>
        </div>
      </div>`;

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
            subject: `[Lead ${pageLabel}] ${empresa || nome} — ${dateTag}`,
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

// ============================================================
// Candidatura Trabalhe Conosco — envia e-mail pro RH do estado
// com cópia pra savior@savior.com.br. NÃO cria deal no Pipedrive
// e NÃO passa pelo Blip (currículo não pode inflar atendimentos).
// ============================================================
async function handleCandidatura(body, env) {
  const {
    estado = '',
    cargo = '',
    cargo_label = '',
    nome = '',
    whatsapp = '',
    email = '',
    registro = '',
    linkedin = '',
    experiencia = '',
    cv_filename = '',
    cv_content = '',
    utm_source = 'direct',
    utm_campaign = 'none',
  } = body;

  const uf = estado === 'sp' ? 'sp' : 'rj';
  const ufLabel = uf === 'sp' ? 'São Paulo' : 'Rio de Janeiro';
  const cargoLabel = (cargo_label || cargo || 'Não informado').toString().slice(0, 60);

  if (!nome.trim() || !email.trim()) {
    return new Response(JSON.stringify({ ok: false, error: 'nome e email obrigatórios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  if (!env.RESEND_API_KEY) {
    console.error('Candidatura sem RESEND_API_KEY configurada');
    return new Response(JSON.stringify({ ok: false, error: 'email não configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (label, val) => val ? `<tr><td style="padding:5px 16px 5px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:5px 0;font-weight:500">${esc(val)}</td></tr>` : '';
  const dateTag = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  // Anexo do currículo: só PDF/DOC/DOCX, base64 até ~7MB (5MB de arquivo)
  const attachments = [];
  if (cv_content && cv_filename) {
    const safeName = String(cv_filename).replace(/[^\w.\- ()áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]/g, '_').slice(0, 120);
    const extOk = /\.(pdf|doc|docx)$/i.test(safeName);
    const sizeOk = String(cv_content).length <= 7.5 * 1024 * 1024;
    if (extOk && sizeOk) {
      attachments.push({ filename: safeName, content: cv_content });
    } else {
      console.log(`Candidatura: anexo recusado (ext=${extOk} size=${sizeOk}) ${safeName}`);
    }
  }

  const emailBody = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0B2540;padding:18px 24px;border-radius:8px 8px 0 0">
      <span style="color:#00B87C;font-weight:700;font-size:18px;letter-spacing:.05em">SAVIOR</span>
      <span style="color:rgba(255,255,255,.5);font-size:12px;margin-left:12px">Nova candidatura — Trabalhe Conosco</span>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <table style="border-collapse:collapse;font-size:14px;width:100%">
        ${row('Função', cargoLabel)}
        ${row('Estado', ufLabel)}
        ${row('Nome', nome)}
        ${row('WhatsApp', whatsapp)}
        ${row('E-mail', email)}
        ${row('Registro', registro)}
        ${linkedin ? `<tr><td style="padding:5px 16px 5px 0;color:#888;white-space:nowrap;vertical-align:top">LinkedIn</td><td style="padding:5px 0;font-weight:500"><a href="${esc(linkedin)}" style="color:#0B2540">${esc(linkedin)}</a></td></tr>` : ''}
        ${row('Experiência', experiencia)}
        ${row('Currículo', attachments.length ? `📎 ${attachments[0].filename} (anexo)` : (cv_filename ? 'enviado mas recusado (formato/tamanho)' : ''))}
      </table>
      <div style="margin-top:20px">
        <a href="mailto:${esc(email)}" style="display:inline-block;padding:10px 20px;background:#0B2540;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">✉️ Responder ao candidato</a>
      </div>
      <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
      <p style="font-size:12px;color:#9ca3af;margin:0">🔗 ${esc(utm_source)} · 🎯 ${esc(utm_campaign)} · Enviado pelo site /trabalhe-conosco</p>
    </div>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Site Savior <noreply@savior.com.br>',
      to: [RH_EMAIL[uf]],
      cc: RH_CC,
      reply_to: email,
      subject: `Trabalhe Conosco - ${cargoLabel} (${uf.toUpperCase()}) — ${dateTag}`,
      html: emailBody,
      ...(attachments.length ? { attachments } : {}),
    }),
  }).catch((err) => {
    console.error('Candidatura email send failed:', err);
    return null;
  });

  const ok = !!(res && res.ok);
  if (!ok && res) console.error('Candidatura Resend error:', res.status, await res.text().catch(() => ''));
  console.log(`Candidatura ${ok ? 'enviada' : 'FALHOU'}: cargo=${cargo} estado=${uf}`);

  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// ============================================================
// Ref Store — armazena UTM data com código curto no KV
// Chamado pelo wa-enhance.ts no site (fire-and-forget)
// TTL: 90 dias (7776000s)
// ============================================================
async function handleRefStore(request, env) {
  let body;
  try { body = await request.json(); } catch { return new Response('Bad Request', { status: 400, headers: corsHeaders() }); }

  const { ref, campaign, gclid, kw, source, medium, ga_client_id, location, page } = body;
  if (!ref) return new Response(JSON.stringify({ ok: false, error: 'missing ref' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });

  const data = { campaign: campaign || '', gclid: gclid || '', kw: kw || '', source: source || '', medium: medium || '', ga_client_id: ga_client_id || '', location: location || '', page: page || '', stored_at: new Date().toISOString() };

  try {
    await env.UTM_STORE.put(ref, JSON.stringify(data), { expirationTtl: 7776000 });
  } catch (err) {
    console.error('KV put error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'kv_error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }

  return new Response(JSON.stringify({ ok: true, ref }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
}

// ============================================================
// Ref Lookup — consulta UTM data pelo código curto
// Usado pelo Blip webhook e para debug
// ============================================================
async function handleRefLookup(url, env) {
  const code = url.pathname.replace('/ref/', '').trim();
  if (!code) return new Response(JSON.stringify({ found: false }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });

  try {
    const raw = await env.UTM_STORE.get(code);
    if (!raw) return new Response(JSON.stringify({ found: false }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    return new Response(JSON.stringify({ found: true, data: JSON.parse(raw) }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  } catch (err) {
    console.error('KV get error:', err);
    return new Response(JSON.stringify({ found: false, error: 'kv_error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
}

// ============================================================
// Blip Webhook — recebe evento de nova conversa do Blip Builder
// 1. Envia evento blip_contact ao GA4 via Measurement Protocol
// 2. Enriquece Deal anônimo no Pipedrive com telefone real do lead
// Retorna 200 OK sempre — Blip não reprocessa em caso de erro.
// ============================================================
async function handleBlipWebhook(request, env) {
  let body;
  try { body = await request.json(); } catch { return new Response('OK', { status: 200, headers: corsHeaders() }); }

  const msg      = body.first_message || '';
  const extras   = body.extras || {};
  const contactPhone = body.contact_phone || extras.phone || '';
  const contactName  = body.contact_name || extras.name || '';

  // --- Resolver Ref code via KV (novo formato limpo) ---
  const refMatch = msg.match(/Ref:\s*([a-z0-9]{5,10})/i);
  let refData = null;
  if (refMatch && env.UTM_STORE) {
    try {
      const stored = await env.UTM_STORE.get(refMatch[1]);
      if (stored) refData = JSON.parse(stored);
    } catch (err) { console.error('KV ref lookup error:', err); }
  }

  // Fallback: formato antigo [campaign-location-v01] [gclid:xxx] (backward compat)
  const tagMatch    = msg.match(/\[([a-z0-9_-]{3,60})\]/i);
  const gclidMatch  = msg.match(/\[gclid:([^\]]+)\]/);
  const gaMatch     = msg.match(/\[ga:([0-9.]+)\]/);
  const kwMatch     = msg.match(/\[kw:([^\]]+)\]/);
  const srcMatch    = msg.match(/\[src:([^\]]+)\]/);

  // Prioridade: refData (KV) > extras (Blip) > regex (mensagem)
  const campaign  = refData?.campaign  || extras.utm_tag      || (tagMatch   ? tagMatch[1]   : 'blip-direct');
  const gclid     = refData?.gclid     || extras.gclid        || (gclidMatch ? gclidMatch[1] : '');
  const clientId  = refData?.ga_client_id || extras.ga_client_id || (gaMatch ? gaMatch[1]    : '');
  const keyword   = refData?.kw        || extras.utm_keyword  || (kwMatch    ? kwMatch[1]    : '');
  const source    = refData?.source    || extras.utm_source   || (srcMatch   ? srcMatch[1]   : '');

  console.log(`Blip webhook: contact=${body.contact_id} phone=${contactPhone} name=${contactName} campaign=${campaign}`);

  // --- 1. GA4 Measurement Protocol ---
  if (env.GA4_MEASUREMENT_ID && env.GA4_MP_SECRET) {
    const mpPayload = {
      client_id: clientId || ('blip-' + Date.now()),
      events: [{
        name: 'blip_contact',
        params: {
          campaign,
          gclid,
          keyword,
          source,
          contact_id: body.contact_id || '',
          engagement_time_msec: 1,
        },
      }],
    };
    const mpRes = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_MP_SECRET}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mpPayload) }
    ).catch(err => { console.error('GA4 MP error:', err); return null; });
    if (mpRes) console.log('GA4 MP status:', mpRes.status);
  } else {
    console.warn('GA4_MEASUREMENT_ID ou GA4_MP_SECRET não configurado — evento não enviado');
  }

  // --- 2. Enriquecer Deal anônimo no Pipedrive ---
  const token = env.PIPEDRIVE_TOKEN;
  if (token && contactPhone) {
    try {
      // Inferir pipeline da campaign tag
      const CAMPAIGN_PIPELINE = {
        'rj-eventos': 8, 'eventos-rj': 8,
        'sp-eventos': 9, 'eventos-sp': 9,
        'rj-corp': 10, 'corp-rj': 10,
        'sp-corp': 11, 'corp-sp': 11,
      };
      let blipPipelineId = 12;
      let blipStageId = 41;
      for (const [key, pid] of Object.entries(CAMPAIGN_PIPELINE)) {
        if (campaign.toLowerCase().includes(key)) {
          blipPipelineId = pid;
          blipStageId = PIPELINE_STAGE_NOVO_LEAD[pid] || 41;
          break;
        }
      }

      // Buscar deals anônimos (48h, não 2h) sem pessoa vinculada
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const searchRes = await fetch(
        `${PIPEDRIVE_API}/deals/search?term=${encodeURIComponent('WA | ')}&fields=title&limit=50&api_token=${token}`
      );
      const searchData = await searchRes.json();
      const deals = searchData?.data?.items || [];

      const candidates = deals
        .map(d => d.item || d)
        .filter(item =>
          !item.person_id
          && item.add_time > cutoff
          && item.title?.startsWith('WA | ')
        )
        .sort((a, b) => (b.add_time || '').localeCompare(a.add_time || ''));

      const matchDeal = candidates.find(item => item.title?.includes(campaign))
        || candidates[0];

      // Dedup: buscar Person existente por telefone antes de criar
      const cleanPhone = contactPhone.replace(/\D/g, '');
      let personId = null;
      if (cleanPhone) {
        try {
          const sRes = await fetch(
            `${PIPEDRIVE_API}/persons/search?term=${encodeURIComponent(cleanPhone)}&fields=phone&limit=5&api_token=${token}`
          );
          const sData = await sRes.json();
          const hits = (sData?.data?.items || [])
            .map(i => i.item || i)
            .filter(p => {
              const phones = (p.phone || []).map(ph => (ph.value || '').replace(/\D/g, ''));
              return phones.some(ph => ph.includes(cleanPhone) || cleanPhone.includes(ph));
            });
          if (hits.length > 0) {
            personId = hits[0].id;
            console.log(`Blip: Person existente encontrado: id=${personId} phone=${cleanPhone}`);
          }
        } catch (err) {
          console.error('Blip person search failed:', err);
        }
      }

      // Criar Person só se não encontrou existente
      if (!personId) {
        const personPayload = {
          name: contactName || `Lead Blip ${contactPhone}`,
          phone: [{ value: contactPhone, label: 'whatsapp', primary: true }],
        };
        const personRes = await fetch(`${PIPEDRIVE_API}/persons?api_token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personPayload),
        });
        const personData = await personRes.json();
        personId = personData?.data?.id;
        console.log(`Blip: Person criado: id=${personId} phone=${cleanPhone}`);
      }

      // Extrair campos estruturados da mensagem Blip (extras do flow)
      const blipExtras = body.extras || {};
      const blipFields = {
        tipo_evento:       blipExtras.tipo_evento || blipExtras.tipo || '',
        data_evento:       blipExtras.data_evento || blipExtras.data || '',
        horario:           blipExtras.horario || '',
        bairro:            blipExtras.bairro || blipExtras.local || '',
        cidade:            blipExtras.cidade || blipExtras.city || '',
        publico_estimado:  blipExtras.publico_estimado || blipExtras.publico || '',
        empresa:           blipExtras.empresa || '',
      };

      // Montar custom fields pra deal (mesmos hashes do formulario)
      function buildCustomFields(fields, campaignVal, sourceVal) {
        const cf = {};
        // Tipo de cliente (enum)
        const isEvt = campaignVal?.includes('evento') || fields.tipo_evento;
        if (isEvt) cf['22247c3025a677f2dd4d7ab63548fecb08f05e2f'] = 31; // Eventos
        // BASE (cidade)
        const cidLower = (fields.cidade || '').toLowerCase();
        if (cidLower.includes('paulo') || cidLower.includes('sp')) {
          cf['8cc112e07d103997aa14b34442fa7a51cb0d2d91'] = 38; // SP
        } else if (cidLower || campaignVal) {
          cf['8cc112e07d103997aa14b34442fa7a51cb0d2d91'] = 37; // RJ default
        }
        // Data do Evento
        if (fields.data_evento) cf['79d2372ceaddba4b964ec8430db391885066e5f9'] = fields.data_evento;
        // Horario
        if (fields.horario) cf['f3f5ba8126a7db3b7dfb4c7cb6e6d29bfbce3ee9'] = fields.horario;
        // Local / Bairro
        if (fields.bairro) cf['b6079a8778fa397928f1a0be04ccdf8435dad258'] = fields.bairro;
        // Publico Estimado
        if (fields.publico_estimado) cf['f175f9f18f186ec492358d38ff0b8dccc49c1f40'] = Number(fields.publico_estimado) || fields.publico_estimado;
        // UTM Source
        if (sourceVal && sourceVal !== 'direct') cf['5b28245c502bdaf5444fbf9cb3a51343f94cdcfa'] = sourceVal;
        // UTM Campaign
        if (campaignVal && campaignVal !== 'blip-direct') cf['2400cc71ad7a60be9480f1ce3a05b08f70caefc4'] = campaignVal;
        return cf;
      }

      const customFields = buildCustomFields(blipFields, campaign, source);

      if (personId && matchDeal) {
        // Enriquecer deal existente: vincular person + popular custom fields
        const dealId = matchDeal.id;
        const updatePayload = { person_id: personId, ...customFields };
        await fetch(`${PIPEDRIVE_API}/deals/${dealId}?api_token=${token}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deal_id: dealId,
            content: `✅ Enriquecido via Blip\n📱 Telefone: ${contactPhone}\n👤 Nome: ${contactName || 'não informado'}\n🎯 Campaign: ${campaign}\n💬 Primeira msg: ${msg.substring(0, 200)}`,
            visible_to: 3,
          }),
        });
        console.log(`Deal ${dealId} enriquecido: person=${personId} phone=${contactPhone} fields=${Object.keys(customFields).length}`);
      } else if (personId) {
        // Dedup: verificar se ja existe deal aberto pra essa pessoa no pipeline (7 dias)
        let blipExistingDeal = null;
        try {
          const edRes = await fetch(
            `${PIPEDRIVE_API}/persons/${personId}/deals?status=open&limit=50&api_token=${token}`
          );
          const edData = await edRes.json();
          const recent = (edData?.data || []).filter(d => {
            if (d.pipeline_id !== blipPipelineId) return false;
            return new Date(d.add_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          });
          if (recent.length > 0) blipExistingDeal = recent[0];
        } catch (err) {
          console.error('Blip deal dedup failed:', err);
        }

        if (blipExistingDeal) {
          // Deal ja existe: apenas adicionar nota
          await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deal_id: blipExistingDeal.id,
              content: `🔄 Contato repetido via Blip\n📱 ${contactPhone}\n🎯 ${campaign}\n💬 ${msg.substring(0, 200)}`,
              visible_to: 3,
            }),
          });
          console.log(`Blip deal duplicado evitado: person=${personId} deal=${blipExistingDeal.id}`);
        } else {
          // Criar deal novo com custom fields
          const nowBrt = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
          }).replace(',', '');
          const newDealPayload = {
            title: `Blip | ${contactName || contactPhone} | ${campaign} | ${nowBrt}`,
            pipeline_id: blipPipelineId,
            stage_id: blipStageId,
            status: 'open',
            visible_to: 3,
            person_id: personId,
            ...customFields,
          };

          const newDealRes = await fetch(`${PIPEDRIVE_API}/deals?api_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDealPayload),
          });
          const newDealData = await newDealRes.json();
          const newDealId = newDealData?.data?.id;

          if (newDealId) {
            await fetch(`${PIPEDRIVE_API}/notes?api_token=${token}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deal_id: newDealId,
                content: `🌐 LEAD VIA BLIP\n📱 Telefone: ${contactPhone}\n👤 Nome: ${contactName || 'não informado'}\n🎯 Campaign: ${campaign}\n💬 Primeira msg: ${msg.substring(0, 200)}`,
                visible_to: 3,
              }),
            });
            console.log(`Novo deal Blip: deal=${newDealId} person=${personId} pipeline=${blipPipelineId} fields=${Object.keys(customFields).length}`);
          }
        }
      }
    } catch (err) {
      console.error('Blip→Pipedrive enrichment error:', err);
    }
  }

  return new Response('OK', { status: 200, headers: corsHeaders() });
}

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
