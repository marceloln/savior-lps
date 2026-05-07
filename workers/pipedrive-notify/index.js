/**
 * Cloudflare Worker — Pipedrive → E-mail via Resend
 *
 * Recebe webhooks do Pipedrive quando um deal é criado nos pipelines SITE.
 * Envia e-mail de notificação para comercial@savior.com.br via Resend API.
 *
 * Variáveis de ambiente (Cloudflare secrets):
 *   RESEND_API_KEY  — chave da API Resend (re_...)
 *   PIPEDRIVE_TOKEN — token Pipedrive para validar origin (opcional)
 */

const SITE_PIPELINES = {
  8:  'Eventos RJ',
  9:  'Eventos SP',
  10: 'Corporativo RJ',
  11: 'Corporativo SP',
};

const NOTIFY_EMAIL = 'comercial@savior.com.br';
const FROM_EMAIL   = 'leads@savior.com.br';

export default {
  async fetch(request, env) {
    // Só aceita POST em /webhook/pipedrive
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    // Pipedrive v2.0: event = "deal.created" | v1: "added.deal"
    const event = body.event || '';
    if (!event.includes('deal') || !event.includes('creat') && !event.includes('add')) {
      return new Response('OK', { status: 200 });
    }

    // v2.0: body.data.current | v1: body.current | fallback: body.data
    const deal     = body.data?.current || body.current || body.data || {};
    const pipeId   = deal.pipeline_id;
    const pipeline = SITE_PIPELINES[pipeId];

    // Ignora pipelines que não são SITE
    if (!pipeline) {
      return new Response('OK', { status: 200 });
    }

    // Monta os dados do lead
    const nome    = deal.person_name || deal.title || 'Não informado';
    const titulo  = deal.title || 'Sem título';
    const valor   = deal.value ? `R$ ${deal.value}` : '—';
    const criado  = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const pipeUrl = `https://savior.pipedrive.com/deal/${deal.id}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#0B2540;padding:20px 24px;border-radius:6px 6px 0 0;">
          <h2 style="color:#1FD29A;margin:0;font-size:16px;letter-spacing:.05em;text-transform:uppercase;">
            Novo lead — ${pipeline}
          </h2>
        </div>
        <div style="background:#f9f9f9;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 6px 6px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#666;width:120px;">Nome</td><td style="padding:6px 0;font-weight:600;">${nome}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Pipeline</td><td style="padding:6px 0;">${pipeline}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Título</td><td style="padding:6px 0;">${titulo}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Valor</td><td style="padding:6px 0;">${valor}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Recebido</td><td style="padding:6px 0;">${criado}</td></tr>
          </table>
          <div style="margin-top:20px;">
            <a href="${pipeUrl}" style="background:#0B2540;color:#1FD29A;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;font-size:13px;">
              Abrir no Pipedrive →
            </a>
          </div>
        </div>
        <p style="font-size:11px;color:#999;margin-top:12px;text-align:center;">
          Savior Medical Service · Notificação automática
        </p>
      </div>
    `;

    // Envia via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    `Savior Leads <${FROM_EMAIL}>`,
        to:      [NOTIFY_EMAIL],
        subject: `[${pipeline}] Novo lead: ${nome}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return new Response('Email error', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  },
};
