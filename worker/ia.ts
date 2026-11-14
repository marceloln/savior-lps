// Uma porta só para todos os provedores de IA. Quem chama passa provedor:modelo, instruções e mensagens; recebe texto ou um erro em português.
import { leModelo, PROVEDORES, type Provedor } from '../src/lib/modelos';
import { entregaSimulada, planoSimulado, sinteseSimulada } from '../src/lib/simulado';
import type { Mensagem } from './conversa';

export type Chaves = { ANTHROPIC_API_KEY?: string; OPENAI_API_KEY?: string; GOOGLE_API_KEY?: string; IA_SIMULADA?: string };
export type Chamada = { modelo: string; system: string; messages: Mensagem[]; max: number };
export type Resposta = { ok: true; texto: string } | { ok: false; status: number; erro: string };
type Buscar = (url: string, init: RequestInit) => Promise<Response>;

export const chaveDe = (env: Chaves, p: Provedor) => (p === 'anthropic' ? env.ANTHROPIC_API_KEY : p === 'openai' ? env.OPENAI_API_KEY : env.GOOGLE_API_KEY);
export const provedoresLigados = (env: Chaves) => ({ anthropic: !!env.ANTHROPIC_API_KEY, openai: !!env.OPENAI_API_KEY, google: !!env.GOOGLE_API_KEY });

const MONTA: Record<Provedor, (id: string, chave: string, c: Chamada) => { url: string; init: RequestInit; le: (d: unknown) => string }> = {
  anthropic: (id, chave, c) => ({
    url: 'https://api.anthropic.com/v1/messages',
    init: { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': chave, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: id, max_tokens: c.max, system: c.system, messages: c.messages }) },
    le: d => ((d as { content?: { type: string; text?: string }[] }).content ?? []).filter(x => x.type === 'text').map(x => x.text ?? '').join('\n'),
  }),
  openai: (id, chave, c) => ({
    url: 'https://api.openai.com/v1/chat/completions',
    init: { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + chave },
      body: JSON.stringify({ model: id, max_completion_tokens: c.max, messages: [{ role: 'system', content: c.system }, ...c.messages] }) },
    le: d => (d as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content ?? '',
  }),
  google: (id, chave, c) => ({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(id)}:generateContent`,
    init: { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: c.system }] }, generationConfig: { maxOutputTokens: c.max },
        contents: c.messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }) },
    le: d => ((d as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates?.[0]?.content?.parts ?? []).map(p => p.text ?? '').join(''),
  }),
};

/** Resposta de mentira para testar o fluxo inteiro sem gastar. Só existe com IA_SIMULADA=1, que nunca vai para produção. */
function simula(c: Chamada): string {
  const t = c.messages.at(-1)!.content, quem = /^Você é ([^,]+), ([^.]+?) no Lab V30/.exec(c.system);
  if (t.startsWith('PEDIDO DO SÓCIO')) {
    const equipe = [...t.matchAll(/^- (\S+) \| ([^|]+) \| ([^|]+) \|/gm)].map(m => ({ id: m[1], nome: m[2].trim(), papel: m[3].trim(), zona: '' }));
    return JSON.stringify({ missoes: planoSimulado(t.split('\n')[1] ?? '', equipe) });
  }
  if (t.startsWith('MISSÃO')) return entregaSimulada(quem?.[1] ?? 'o especialista', quem?.[2] ?? 'especialista', t.split('\n')[1] ?? 'Missão');
  if (t.startsWith('CONSOLIDAR')) {
    const partes = [...t.matchAll(/^([^\n,]+), [^.\n]+\. ([^\n]+)$/gm)].map(m => ({ nome: m[1], titulo: m[2] }));
    return sinteseSimulada((t.split('\n')[1] ?? '').replace('Pedido do sócio: ', ''), partes);
  }
  return `Resposta simulada de ${quem?.[1] ?? 'um especialista'}. Com um provedor de IA ligado, aqui vem a resposta de verdade.`;
}

export async function chamaIA(env: Chaves, c: Chamada, buscar: Buscar = fetch): Promise<Resposta> {
  const m = leModelo(c.modelo);
  if (!m) return { ok: false, status: 400, erro: 'Modelo de IA em formato inválido. Use provedor:modelo.' };
  if (m.provedor === 'simulado') return env.IA_SIMULADA === '1' ? { ok: true, texto: simula(c) } : { ok: false, status: 400, erro: 'O modelo simulado só existe no ambiente de teste.' };
  const chave = chaveDe(env, m.provedor), nome = PROVEDORES[m.provedor].nome;
  if (!chave) return { ok: false, status: 503, erro: `Falta ligar a chave da ${nome} no Worker (${PROVEDORES[m.provedor].segredo}) para usar o modelo ${m.id}.` };
  const p = MONTA[m.provedor](m.id, chave, c);
  let r: Response;
  try { r = await buscar(p.url, p.init); } catch { return { ok: false, status: 502, erro: `Não deu para falar com a ${nome} agora. Tente de novo em instantes.` }; }
  if (!r.ok) {
    if (r.status === 404 || r.status === 400) return { ok: false, status: 502, erro: `A ${nome} recusou o modelo ${m.id}. Confira o nome do modelo na ficha do especialista.` };
    if (r.status === 401 || r.status === 403) return { ok: false, status: 502, erro: `A ${nome} recusou a chave. Confira o segredo ${PROVEDORES[m.provedor].segredo} no Worker.` };
    return { ok: false, status: 502, erro: `A ${nome} não respondeu agora. Tente de novo em instantes.` };
  }
  const texto = p.le(await r.json().catch(() => ({}))).trim();
  return texto ? { ok: true, texto } : { ok: false, status: 502, erro: `A ${nome} respondeu vazio. Tente de novo.` };
}
