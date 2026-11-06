// Confere o token do Cloudflare Access antes de qualquer rota /api.
// Com ACESSO_EQUIPE e ACESSO_AUD configurados, só passa quem entrou pelo login da equipe.
// Sem essas variáveis (desenvolvimento local), tudo passa.

type Chave = { kid: string; kty: string; n: string; e: string; alg?: string };
let cache: { em: number; chaves: Chave[] } | null = null;

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));

async function chaves(equipe: string): Promise<Chave[]> {
  if (cache && Date.now() - cache.em < 3600e3) return cache.chaves;
  const r = await fetch(`https://${equipe}.cloudflareaccess.com/cdn-cgi/access/certs`);
  const j = await r.json<{ keys: Chave[] }>();
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
    const corpo = JSON.parse(new TextDecoder().decode(b64url(p))) as { aud: string | string[]; exp: number; iss: string; email?: string };
    if (cab.alg !== 'RS256') return null;
    const auds = Array.isArray(corpo.aud) ? corpo.aud : [corpo.aud];
    if (!auds.includes(aud) || corpo.exp * 1000 < agora || corpo.iss !== `https://${equipe}.cloudflareaccess.com`) return null;
    const k = (await chaves(equipe)).find(x => x.kid === cab.kid);
    if (!k) return null;
    const chave = await crypto.subtle.importKey('jwk', { kty: k.kty, n: k.n, e: k.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chave, b64url(s), new TextEncoder().encode(`${h}.${p}`));
    return ok ? corpo.email ?? 'equipe' : null;
  } catch {
    return null;
  }
}
