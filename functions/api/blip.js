/**
 * Cloudflare Pages Function — POST /api/blip
 *
 * Envia mensagem WhatsApp via Blip API após formulário ou clique WA.
 * Env var obrigatória: BLIP_KEY (Blip → Configurações → Chaves de acesso)
 *
 * Payloads aceitos:
 *   { type: "deal", nome, whatsapp, page, tipo?, data_evento?, bairro?, empresa? }
 *     → Formulário enviado: mensagem de boas-vindas personalizada
 *
 *   { type: "lead_qualificador", whatsapp }
 *     → Clique WA sem formulário: mensagem qualificadora
 */

const BLIP_URL = 'https://http.msging.net/messages';

export async function onRequestPost(context) {
  const key = context.env.BLIP_KEY;
  if (!key) return json({ ok: false, error: 'blip_not_configured' });

  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'invalid_json' }, 400); }

  const { type, whatsapp } = body;
  if (!whatsapp) return json({ error: 'whatsapp_required' }, 400);

  const to = formatWaNumber(whatsapp);
  if (!to) return json({ error: 'invalid_whatsapp' }, 400);

  const texto = type === 'lead_qualificador'
    ? buildQualificador()
    : buildBoasVindas(body);

  const res = await fetch(BLIP_URL, {
    method: 'POST',
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      to,
      type: 'text/plain',
      content: texto,
    }),
  });

  const status = res.status;
  return json({ ok: status === 202, status });
}

// ── Mensagem Fluxo A — formulário enviado ─────────────────────
function buildBoasVindas(body) {
  const { nome, page, tipo, data_evento, bairro, empresa } = body;
  const isEvento = page?.startsWith('eventos');

  if (isEvento) {
    const partes = [
      nome ? `Olá, ${nome}!` : 'Olá!',
      '👋 Recebemos seu contato sobre ' + (tipo || 'seu evento') + (bairro ? ` em ${bairro}` : '') + (data_evento ? ` no dia ${brDate(data_evento)}` : '') + '.',
      'Nossa equipe vai entrar em contato em breve com o orçamento.',
      'Qualquer dúvida é só responder aqui! 🚑',
    ];
    return partes.join('\n');
  }

  // Corporativo
  const partes = [
    nome ? `Olá, ${nome}!` : 'Olá!',
    '👋 Recebemos o contato' + (empresa ? ` da ${empresa}` : '') + '.',
    'Nossa equipe vai entrar em contato em breve com as opções de cobertura médica corporativa.',
    'Qualquer dúvida é só responder aqui! 🚑',
  ];
  return partes.join('\n');
}

// ── Mensagem Fluxo B — qualificador (clique WA sem formulário) ─
function buildQualificador() {
  return [
    'Olá! 👋 Vi que você entrou em contato com a Savior.',
    'Para te ajudar melhor, me conta: é para um *evento* ou *cobertura corporativa*?',
  ].join('\n');
}

// ── Formata número pra Blip: 5521999999999@wa.gw.msging.net ───
function formatWaNumber(raw) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  // Garante DDI 55 (Brasil)
  const full = digits.startsWith('55') ? digits : '55' + digits;
  if (full.length < 12) return null;
  return full + '@wa.gw.msging.net';
}

// ── DD/MM/AAAA ─────────────────────────────────────────────────
function brDate(d) {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
