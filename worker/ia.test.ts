import { describe, it, expect } from 'vitest';
import { chamaIA, provedoresLigados, type Chamada } from './ia';
import { promptExecucao, promptPlano, promptSintese, lePlano } from './orquestra';
import { EQUIPE } from '../src/lib/equipe';

const c = (modelo: string): Chamada => ({ modelo, system: 'Você é Lia, analista de diagnóstico no Lab V30, a consultoria Vetor30.', messages: [{ role: 'user', content: 'oi' }, { role: 'assistant', content: 'olá' }, { role: 'user', content: 'e agora?' }], max: 500 });
/** fetch de mentira que guarda o que recebeu e devolve o corpo dado. */
const falso = (corpo: unknown, status = 200) => {
  const visto: { url: string; init: RequestInit }[] = [];
  return { visto, buscar: async (url: string, init: RequestInit) => { visto.push({ url, init }); return Response.json(corpo, { status }); } };
};
const env = { ANTHROPIC_API_KEY: 'ka', OPENAI_API_KEY: 'ko', GOOGLE_API_KEY: 'kg' };

describe('provedores de IA', () => {
  it('Anthropic: manda system separado e lê os blocos de texto', async () => {
    const f = falso({ content: [{ type: 'text', text: 'Comece pelo campo.' }] });
    expect(await chamaIA(env, c('anthropic:claude-sonnet-5-5'), f.buscar)).toEqual({ ok: true, texto: 'Comece pelo campo.' });
    const b = JSON.parse(f.visto[0].init.body as string);
    expect(f.visto[0].url).toBe('https://api.anthropic.com/v1/messages');
    expect((f.visto[0].init.headers as Record<string, string>)['x-api-key']).toBe('ka');
    expect(b).toMatchObject({ model: 'claude-sonnet-5-5', max_tokens: 500 });
    expect(b.messages).toHaveLength(3);
  });
  it('OpenAI: system vira a primeira mensagem e a chave vai no cabeçalho de autorização', async () => {
    const f = falso({ choices: [{ message: { content: 'Resposta.' } }] });
    expect(await chamaIA(env, c('openai:gpt-6-astra'), f.buscar)).toEqual({ ok: true, texto: 'Resposta.' });
    const b = JSON.parse(f.visto[0].init.body as string);
    expect((f.visto[0].init.headers as Record<string, string>).authorization).toBe('Bearer ko');
    expect(b.messages[0]).toEqual({ role: 'system', content: c('x').system });
    expect(b.messages).toHaveLength(4);
  });
  it('Google: papel assistant vira model e o modelo vai na URL', async () => {
    const f = falso({ candidates: [{ content: { parts: [{ text: 'Parte 1. ' }, { text: 'Parte 2.' }] } }] });
    expect(await chamaIA(env, c('google:gemini-4-argon'), f.buscar)).toEqual({ ok: true, texto: 'Parte 1. Parte 2.' });
    const b = JSON.parse(f.visto[0].init.body as string);
    expect(f.visto[0].url).toContain('/models/gemini-4-argon:generateContent');
    expect(b.contents.map((x: { role: string }) => x.role)).toEqual(['user', 'model', 'user']);
    expect(b.systemInstruction.parts[0].text).toContain('Lia');
  });
  it('sem a chave do provedor, diz qual segredo falta e não chama ninguém', async () => {
    const f = falso({});
    const r = await chamaIA({ ANTHROPIC_API_KEY: 'ka' }, c('openai:gpt-6-astra'), f.buscar);
    expect(r).toMatchObject({ ok: false, status: 503 });
    if (!r.ok) expect(r.erro).toContain('OPENAI_API_KEY');
    expect(f.visto).toHaveLength(0);
    expect(provedoresLigados({ ANTHROPIC_API_KEY: 'ka' })).toEqual({ anthropic: true, openai: false, google: false });
  });
  it('erro do provedor vira mensagem em português, sem detalhe cru', async () => {
    const r404 = await chamaIA(env, c('google:nao-existe'), falso({ error: 'x' }, 404).buscar);
    expect(r404).toMatchObject({ ok: false, status: 502 }); if (!r404.ok) expect(r404.erro).toContain('recusou o modelo nao-existe');
    const r401 = await chamaIA(env, c('anthropic:claude-sonnet-5-5'), falso({}, 401).buscar);
    if (!r401.ok) expect(r401.erro).toContain('ANTHROPIC_API_KEY');
    const vazio = await chamaIA(env, c('anthropic:claude-sonnet-5-5'), falso({ content: [] }).buscar);
    expect(vazio.ok).toBe(false);
    const fora = await chamaIA(env, c('anthropic:claude-sonnet-5-5'), async () => { throw new Error('rede'); });
    expect(fora).toMatchObject({ ok: false, status: 502 });
    expect((await chamaIA(env, c('sem-formato'))).ok).toBe(false);
  });
  it('modelo simulado só responde no ambiente de teste', async () => {
    expect((await chamaIA(env, c('simulado:teste'))).ok).toBe(false);
    expect(await chamaIA({ IA_SIMULADA: '1' }, c('simulado:teste'))).toMatchObject({ ok: true });
  });
});

describe('orquestração', () => {
  const time = EQUIPE.filter(e => e.id !== 'duda').map(e => ({ ...e, abertas: 1 }));
  const ids = new Set(time.map(e => e.id));
  it('o plano simulado passa pelo mesmo leitor do plano de verdade', async () => {
    const r = await chamaIA({ IA_SIMULADA: '1' }, { ...c('simulado:teste'), messages: [{ role: 'user', content: promptPlano('Preciso de uma proposta para uma rede de conveniência', time) }] });
    expect(r.ok).toBe(true);
    const p = lePlano(r.ok ? r.texto : '', ids);
    expect(p.ok).toBe(true);
    if (p.ok) expect(p.missoes.map(m => m.agente)).toContain('bela');
  });
  it('lê o plano mesmo com texto em volta, corta em cinco e ignora quem não existe', () => {
    const bruto = 'Claro! ```json\n{"missoes":[' + ['lia', 'fantasma', 'rui', 'nina', 'caio', 'bela', 'iara'].map(a => `{"agente":"${a}","titulo":"T ${a}","detalhe":"D"}`).join(',') + ']}\n```';
    const p = lePlano(bruto, ids);
    expect(p.ok && p.missoes.map(m => m.agente)).toEqual(['lia', 'rui', 'nina', 'caio', 'bela']);
    expect(lePlano('não sei', ids).ok).toBe(false);
    expect(lePlano('{"missoes":[{"agente":"fantasma","titulo":"x"}]}', ids).ok).toBe(false);
    expect(lePlano('{"missoes": "nada"}', ids).ok).toBe(false);
  });
  it('a execução leva projeto, pedido, entregas dos colegas e o ajuste pedido', () => {
    const t = promptExecucao({ titulo: 'Pauta de segunda', detalhe: 'Uma página', pedido: 'Reunião igual em todas as praças',
      projeto: { id: 'p', cliente_id: 'c', nome: 'Ritmo comercial', fase: 1, dia: 9, mesa: null, inicio: '2026-11-01' }, cliente: { id: 'c', setor: 'Distribuidora regional', situacao: 'Sem rotina comum', fase: 1 },
      anteriores: [{ nome: 'Lia', papel: 'Analista de diagnóstico', titulo: 'Diagnóstico das praças', entrega: 'x'.repeat(5000) }], versaoAnterior: 'Versão 1', ajuste: 'Mais curto' });
    expect(t.startsWith('MISSÃO\nPauta de segunda')).toBe(true);
    for (const pedaco of ['Co-criação, dia 9 de 30', 'Distribuidora regional', 'Reunião igual em todas as praças', 'Lia, analista de diagnóstico', 'AJUSTE PEDIDO PELO SÓCIO\nMais curto', 'O que falta']) expect(t).toContain(pedaco);
    expect(t.length).toBeLessThan(4000);
    expect(promptExecucao({ titulo: 'Só o título', detalhe: '' })).not.toContain('PROJETO');
  });
  it('a síntese simulada lista quem entregou', async () => {
    const r = await chamaIA({ IA_SIMULADA: '1' }, { ...c('simulado:teste'), messages: [{ role: 'user', content: promptSintese('Reunião igual', [{ nome: 'Nina', papel: 'Processos lean', titulo: 'Pauta fixa', entrega: '## Pauta' }]) }] });
    expect(r.ok && r.texto).toContain('**Nina**: Pauta fixa');
  });
});
