import { describe, it, expect, beforeEach } from 'vitest';
import { rotaGoogle, esqueceToken, googleLigado } from './google';
import { anotacoes, novaReuniaoMeet, registroDeReuniao } from './validacao';
import { leAta, promptAta } from './orquestra';

const env = { GOOGLE_OAUTH_ID: 'cliente', GOOGLE_OAUTH_SEGREDO: 'segredo', GOOGLE_OAUTH_RENOVACAO: 'renova', AGENDA_GOOGLE: 'socio@vetor30.com.br' };
const AGORA = Date.parse('2026-11-16T15:00:00Z');

/** Google de mentira: devolve token, eventos, evento criado e o texto do documento, e guarda o que recebeu. */
function googleFalso(opcoes: { tokenFalha?: boolean; status?: number } = {}) {
  const visto: { url: string; init?: RequestInit }[] = [];
  const buscar = async (url: string, init?: RequestInit) => {
    visto.push({ url, init });
    if (url.startsWith('https://oauth2.googleapis.com/token')) return opcoes.tokenFalha ? Response.json({ error: 'invalid_grant' }, { status: 400 }) : Response.json({ access_token: 'tk', expires_in: 3600 });
    if (opcoes.status) return new Response('', { status: opcoes.status });
    if (url.includes('/drive/v3/files/')) return new Response('﻿Resumo\nDecidimos o piloto.');
    if (init?.method === 'POST') {
      const b = JSON.parse(init.body as string);
      return Response.json({ id: 'novo', summary: b.summary, start: b.start, end: b.end, attendees: b.attendees, hangoutLink: 'https://meet.google.com/abc-defg-hij', extendedProperties: b.extendedProperties });
    }
    return Response.json({ items: [
      { id: 'e1', summary: 'Status do piloto', start: { dateTime: '2026-11-19T17:30:00-03:00' }, end: { dateTime: '2026-11-19T18:00:00-03:00' }, hangoutLink: 'https://meet.google.com/x' },
      { id: 'e2', status: 'cancelled', start: { dateTime: '2026-11-19T10:00:00-03:00' }, end: { dateTime: '2026-11-19T11:00:00-03:00' } },
    ] });
  };
  return { visto, buscar };
}
const pede = (caminho: string, init?: RequestInit) => new Request('https://lab.v30' + caminho, init);

beforeEach(() => esqueceToken());

describe('rotas do Google', () => {
  it('sem autorização, diz que o Google Agenda não está ligado', async () => {
    expect(googleLigado({})).toBe(false);
    const r = (await rotaGoogle(pede('/api/google/reunioes'), {}, '/api/google/reunioes'))!;
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ desligado: true });
  });
  it('não mexe em rota que não é do Google', async () => {
    expect(await rotaGoogle(pede('/api/estado'), env, '/api/estado')).toBeNull();
  });
  it('lista as reuniões da agenda escolhida, sem as canceladas, e reaproveita o token', async () => {
    const g = googleFalso();
    const r = await (await rotaGoogle(pede('/api/google/reunioes'), env, '/api/google/reunioes', g.buscar, AGORA))!.json();
    expect(r.reunioes).toHaveLength(1);
    expect(r.reunioes[0]).toMatchObject({ id: 'e1', dia: '2026-11-19', hora: '17:30', meet: 'https://meet.google.com/x' });
    const lista = g.visto[1].url;
    expect(lista).toContain('/calendars/socio%40vetor30.com.br/events?');
    expect(lista).toContain('singleEvents=true');
    expect(lista).toContain('timeMin=2026-11-09T00%3A00%3A00-03%3A00');
    expect((g.visto[1].init!.headers as Record<string, string>).authorization).toBe('Bearer tk');
    await rotaGoogle(pede('/api/google/reunioes'), env, '/api/google/reunioes', g.buscar, AGORA + 60_000);
    expect(g.visto.filter(v => v.url.includes('oauth2')).length).toBe(1);
  });
  it('marca no Meet com convite e devolve a reunião criada', async () => {
    const g = googleFalso();
    const corpo = { titulo: 'Ritual semanal', pauta: '', dia: '2026-11-24', hora: '10:00', duracao: 45, convidados: ['kim@vetor30.com.br'], projeto_id: null };
    const r = (await rotaGoogle(pede('/api/google/reunioes', { method: 'POST', body: JSON.stringify(corpo) }), env, '/api/google/reunioes', g.buscar, AGORA))!;
    expect(r.status).toBe(201);
    expect(await r.json()).toMatchObject({ id: 'novo', titulo: 'Ritual semanal', meet: 'https://meet.google.com/abc-defg-hij', fim: '10:45' });
    expect(g.visto[1].url).toContain('conferenceDataVersion=1&sendUpdates=all');
  });
  it('recusa reunião inválida antes de chamar o Google', async () => {
    const g = googleFalso();
    const r = (await rotaGoogle(pede('/api/google/reunioes', { method: 'POST', body: '{"titulo":"x","dia":"2026-11-24","hora":"10:00","duracao":5}' }), env, '/api/google/reunioes', g.buscar, AGORA))!;
    expect(r.status).toBe(400);
    expect(g.visto).toHaveLength(0);
  });
  it('lê as anotações do Gemini como texto', async () => {
    const g = googleFalso();
    const r = await (await rotaGoogle(pede('/api/google/anotacoes/1lBTGut-cHQoZTxiOE'), env, '/api/google/anotacoes/1lBTGut-cHQoZTxiOE', g.buscar, AGORA))!.json();
    expect(r).toEqual({ texto: 'Resumo\nDecidimos o piloto.', cortado: false });
    expect(g.visto[1].url).toBe('https://www.googleapis.com/drive/v3/files/1lBTGut-cHQoZTxiOE/export?mimeType=text%2Fplain');
  });
  it('autorização vencida e acesso negado viram mensagem em português', async () => {
    let r = (await rotaGoogle(pede('/api/google/reunioes'), env, '/api/google/reunioes', googleFalso({ tokenFalha: true }).buscar, AGORA))!;
    expect(r.status).toBe(401);
    expect((await r.json()).erro).toContain('Refaça a autorização');
    r = (await rotaGoogle(pede('/api/google/reunioes'), env, '/api/google/reunioes', googleFalso({ status: 403 }).buscar, AGORA))!;
    expect(r.status).toBe(502);
  });
});

describe('validação das reuniões no Meet', () => {
  const ok = { titulo: 'Ritual semanal', pauta: 'Fila da pista', dia: '2026-11-24', hora: '23:30', duracao: 60, convidados: ['Gerente@Cliente.com.br', 'gerente@cliente.com.br', ' kim@vetor30.com.br ', ''], projeto_id: 'p1' };
  it('limpa os e-mails', () => {
    const v = novaReuniaoMeet(ok);
    expect(v.ok && v.v.convidados).toEqual(['gerente@cliente.com.br', 'kim@vetor30.com.br']);
  });
  it('recusa e-mail torto, duração fora da faixa, título vazio e data que não existe', () => {
    expect(novaReuniaoMeet({ ...ok, convidados: ['sem-arroba'] })).toEqual({ ok: false, erro: 'Este e-mail não parece certo: sem-arroba' });
    expect(novaReuniaoMeet({ ...ok, duracao: 5 }).ok).toBe(false);
    expect(novaReuniaoMeet({ ...ok, titulo: ' ' }).ok).toBe(false);
    expect(novaReuniaoMeet({ ...ok, dia: '2026-02-30' }).ok).toBe(false);
  });
  it('anotação curta demais não vira ata', () => {
    expect(anotacoes({ texto: 'oi' }).ok).toBe(false);
    expect(anotacoes({ texto: 'x'.repeat(50), titulo: 'Status' }).ok).toBe(true);
  });
  it('registro guarda quem acompanha, inclusive quem ganhou missão', () => {
    const v = registroDeReuniao({ titulo: 'Status', dia: '2026-11-19', hora: '17:30', ata: 'Combinamos o piloto.', participantes: ['duda'], decisoes: [{ titulo: 'Piloto' }, { titulo: '' }], missoes: [{ agente: 'lia', titulo: 'Roteiro' }, { agente: 'fulano', titulo: 'x' }] }, new Set(['duda', 'lia']));
    expect(v).toEqual({ ok: true, v: { titulo: 'Status', dia: '2026-11-19', hora: '17:30', projeto_id: null, participantes: ['duda', 'lia'], ata: 'Combinamos o piloto.', decisoes: [{ titulo: 'Piloto', contexto: '' }], missoes: [{ agente: 'lia', titulo: 'Roteiro', detalhe: '' }] } });
    expect(registroDeReuniao({ titulo: 'Status', dia: '2026-11-19', hora: '17:30', ata: '' }, new Set()).ok).toBe(false);
  });
});

describe('ata proposta pela orquestração', () => {
  const ids = new Set(['lia', 'otto']);
  it('o pedido leva as anotações e a equipe, e proíbe inventar', () => {
    const p = promptAta('Falamos da fila da pista.', 'Status', [{ id: 'lia', nome: 'Lia', papel: 'Analista de diagnóstico', zona: 'estrategia' }]);
    expect(p.startsWith('ANOTAÇÕES DA REUNIÃO')).toBe(true);
    expect(p).toContain('- lia | Lia | Analista de diagnóstico');
    expect(p).toContain('Não invente');
  });
  it('lê ata, decisões e missões só de quem existe', () => {
    const t = 'Aqui está:\n{"ata":"Revisamos a fila da pista.","decisoes":[{"titulo":"Piloto em duas unidades","contexto":"Mais fluxo"},{"titulo":""}],"missoes":[{"agente":"lia","titulo":"Roteiro com gerentes"},{"agente":"ninguem","titulo":"x"}]}';
    expect(leAta(t, ids)).toEqual({ ok: true, v: { ata: 'Revisamos a fila da pista.', decisoes: [{ titulo: 'Piloto em duas unidades', contexto: 'Mais fluxo' }], missoes: [{ agente: 'lia', titulo: 'Roteiro com gerentes', detalhe: '' }] } });
  });
  it('sem ata legível, avisa', () => {
    expect(leAta('não consegui', ids).ok).toBe(false);
    expect(leAta('{"ata":""}', ids).ok).toBe(false);
  });
});
