import { describe, it, expect } from 'vitest';
import { quemEntrou } from './acesso';

describe('acesso', () => {
  it('sem token ninguém entra', async () => {
    expect(await quemEntrou(new Request('https://x/api/estado'), 'v30', 'aud')).toBeNull();
  });
  it('token malformado não entra e não derruba', async () => {
    const r = new Request('https://x/api/estado', { headers: { 'cf-access-jwt-assertion': 'abc.def' } });
    expect(await quemEntrou(r, 'v30', 'aud')).toBeNull();
  });
  it('token de outra aplicação ou vencido não entra antes de buscar chave', async () => {
    const b = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    const tok = (c: unknown) => `${b({ alg: 'RS256', kid: 'k' })}.${b(c)}.assinatura`;
    const req = (c: unknown) => new Request('https://x/api/estado', { headers: { 'cf-access-jwt-assertion': tok(c) } });
    const iss = 'https://v30.cloudflareaccess.com';
    expect(await quemEntrou(req({ aud: 'outra', exp: 9e9, iss }), 'v30', 'aud')).toBeNull();
    expect(await quemEntrou(req({ aud: 'aud', exp: 1, iss }), 'v30', 'aud')).toBeNull();
    expect(await quemEntrou(req({ aud: 'aud', exp: 9e9, iss: 'https://outra.cloudflareaccess.com' }), 'v30', 'aud')).toBeNull();
  });
});
