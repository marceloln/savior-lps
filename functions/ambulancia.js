/**
 * Cloudflare Pages Function — GET /ambulancia
 *
 * Geo-redirect: detecta o estado do usuário via CF e redireciona
 * para a landing page correta (RJ ou SP).
 *
 * Uso principal: URL final de anúncios não segmentados por cidade.
 * Ex: google.com/ads → savior.com.br/ambulancia → /ambulancia-rj ou /ambulancia-sp
 *
 * CF geoIP: disponível automaticamente em todas as requests, sem custo adicional.
 * context.request.cf.region → nome do estado (ex: "São Paulo", "Rio de Janeiro")
 */

// Estados que servimos com LP própria em SP
const REGIOES_SP = new Set([
  'São Paulo',
  'Sao Paulo', // fallback sem acento
]);

export async function onRequestGet(context) {
  const cf     = context.request.cf || {};
  const region = String(cf.region || '').trim();
  const url    = new URL(context.request.url);

  // Preservar UTMs e outros query params na URL de destino
  const destino = REGIOES_SP.has(region)
    ? '/ambulancia-sp'
    : '/ambulancia-rj';

  const target = new URL(destino, url.origin);
  url.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  // 302 (temporário) — não cachear, cada usuário é avaliado individualmente
  return Response.redirect(target.toString(), 302);
}
