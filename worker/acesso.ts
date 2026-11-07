// Confere o token do Cloudflare Access antes de qualquer rota /api.
// Com ACESSO_EQUIPE e ACESSO_AUD configurados, só passa quem entrou pelo login da equipe.
// Sem essas variáveis, só passa o computador local; publicado, o lab fica fechado até o Access ser ligado.

type Chave = { kid: string; kty: string; n: string; e: string; alg?: string };
let cache: { em: number; chaves: Chave[] } | null = null;

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));

/** Chaves públicas do Access, guardadas por 1 hora. Resposta sem chaves não vai para o cache. */
async function chaves(equipe: string, renova = false): Promise<Chave[]> {
  if (!renova && cache && Date.now() - cache.em < 3600e3) return cache.chaves;
  const r = await fetch(`https://${equipe}.cloudflareaccess.com/cdn-cgi/access/certs`);
  const j = await r.json<{ keys?: Chave[] }>().catch(() => null);
  if (!Array.isArray(j?.keys) || !j.keys.length) return cache?.chaves ?? [];
  cache = { em: Date.now(), chaves: j.keys };
  return j.keys;
}

/** Devolve o e-mail de quem entrou, ou null se o token não vale. */
export async function quemEntrou(req: Request, equipe: string, aud: string, agora = Date.now()): Promise<string | null> {
  const token = req.headers.get('cf-access-jwt-assertion');
  if (!token) return null;
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  try {
    const cab = JSON.parse(new TextDecoder().decode(b64url(h))) as { kid: string; alg: string };
    const corpo = JSON.parse(new TextDecoder().decode(b64url(p))) as { aud: string | string[]; exp: number; nbf?: number; iss: string; email?: string };
    if (cab.alg !== 'RS256') return null;
    const auds = Array.isArray(corpo.aud) ? corpo.aud : [corpo.aud];
    if (!auds.includes(aud) || corpo.exp * 1000 < agora || (corpo.nbf ?? 0) * 1000 > agora + 60e3 || corpo.iss !== `https://${equipe}.cloudflareaccess.com`) return null;
    // chave nova do Access ainda fora do cache: busca de novo antes de recusar
    const k = (await chaves(equipe)).find(x => x.kid === cab.kid) ?? (await chaves(equipe, true)).find(x => x.kid === cab.kid);
    if (!k) return null;
    const chave = await crypto.subtle.importKey('jwk', { kty: k.kty, n: k.n, e: k.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chave, b64url(s), new TextEncoder().encode(`${h}.${p}`));
    return ok ? corpo.email ?? 'equipe' : null;
  } catch {
    return null;
  }
}

const LOCAL = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Decide se a rota /api atende. Devolve null para seguir, ou o motivo e o status para recusar. */
export async function portaria(req: Request, equipe?: string, aud?: string): Promise<{ erro: string; status: number } | null> {
  if (equipe && aud) return (await quemEntrou(req, equipe, aud)) ? null : { erro: 'Entre pelo login da equipe para usar o lab.', status: 401 };
  if (LOCAL.has(new URL(req.url).hostname)) return null;
  return { erro: 'O login da equipe ainda não foi ligado. O lab abre depois disso.', status: 503 };
}
