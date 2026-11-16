import { afterEach, describe, expect, it } from 'vitest';
import { ESPELHOS, esqueceRadios, rotaRadios } from './radios';

const estacao = { stationuuid: 'x', name: 'Rádio Teste', url_resolved: 'https://som.exemplo', lastcheckok: 1, hls: 0, state: 'Bahia', tags: 'forró' };
const responde = (porBase: Record<string, unknown>) => {
  const pedidos: string[] = [];
  const f = (async (u: string) => {
    pedidos.push(u);
    const base = ESPELHOS.find(b => u.startsWith(b))!;
    const r = porBase[base];
    if (r instanceof Error) throw r;
    return r === undefined ? new Response('fora', { status: 502 }) : Response.json(r);
  }) as unknown as typeof fetch;
  return { f, pedidos };
};

afterEach(esqueceRadios);

describe('rota de rádios', () => {
  it('devolve o catálogo normalizado, só com rádio que toca, e com cache de doze horas', async () => {
    const { f } = responde({ [ESPELHOS[0]]: [estacao, { ...estacao, stationuuid: 'y', url_resolved: 'http://inseguro.exemplo' }] });
    const r = await rotaRadios(f, 1000);
    expect(r.status).toBe(200);
    expect(r.headers.get('Cache-Control')).toContain('max-age=43200');
    const j = await r.json() as { radios: { uf: string; generos: string[] }[] };
    expect(j.radios).toHaveLength(1);
    expect(j.radios[0]).toMatchObject({ uf: 'BA', generos: ['Forró e nordeste'] });
  });
  it('passa para o próximo espelho quando um cai', async () => {
    const { f, pedidos } = responde({ [ESPELHOS[0]]: new Error('caiu'), [ESPELHOS[1]]: [estacao] });
    const r = await rotaRadios(f, 1000);
    expect(r.status).toBe(200);
    expect(pedidos).toHaveLength(2);
  });
  it('não busca de novo dentro das doze horas, e usa a última lista se o catálogo cair depois', async () => {
    const um = responde({ [ESPELHOS[0]]: [estacao] });
    await rotaRadios(um.f, 0);
    const dois = responde({});
    expect((await rotaRadios(dois.f, 3600e3)).status).toBe(200);
    expect(dois.pedidos).toHaveLength(0);
    const tres = responde({});
    const r = await rotaRadios(tres.f, 13 * 3600e3);
    expect(tres.pedidos).toHaveLength(ESPELHOS.length);
    expect(r.status).toBe(200);
  });
  it('sem lista nenhuma, explica que o catálogo não respondeu', async () => {
    const r = await rotaRadios(responde({}).f, 0);
    expect(r.status).toBe(503);
    expect(((await r.json()) as { erro: string }).erro).toContain('não respondeu');
  });
});
