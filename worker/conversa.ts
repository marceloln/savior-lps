// Montagem do pedido à API do Claude para um especialista do lab. Sem dependência do Worker, para testar fácil.
import { EQUIPE } from '../src/lib/equipe';

export type Mensagem = { role: 'user' | 'assistant'; content: string };
export const MODELO = 'claude-sonnet-5-5';
const LIMITE_HISTORICO = 20;
const LIMITE_TEXTO = 4000;

const BRIEFING = [
  'Você conduz o briefing de entrada. Faça uma pergunta por vez, curta, e espere a resposta.',
  'Feche nesta ordem: setor, situação atual, a dor principal, o que já foi tentado, prazo e quem decide (só o cargo, nunca o nome).',
  'Quando tiver tudo, devolva um resumo em tópicos curtos e pergunte se está certo antes de encerrar.',
].join(' ');

export function sistemaDe(agenteId: string): string | null {
  const m = EQUIPE.find(e => e.id === agenteId);
  if (!m) return null;
  return [
    `Você é ${m.nome}, ${m.papel.toLowerCase()} no Lab V30, a consultoria Vetor30.`,
    'A V30 trabalha em ciclos de 30 dias: Diagnóstico, Co-criação, Execução e Legado, com foco em CX, loja e backoffice.',
    'Fale em português, direto, como quem já viveu o problema no campo. Frases curtas, sem travessão e sem aspas.',
    'Nunca invente número, métrica ou nome de cliente. Cliente é sempre setor e situação. Se faltar dado, diga o que falta.',
    ...(agenteId === 'clara' ? [BRIEFING] : []),
  ].join(' ');
}

/** Valida o corpo recebido e devolve o pedido pronto, ou uma mensagem de erro. */
export function montaPedido(corpo: unknown): { ok: true; pedido: { model: string; max_tokens: number; system: string; messages: Mensagem[] }; agente: string } | { ok: false; erro: string } {
  if (!corpo || typeof corpo !== 'object') return { ok: false, erro: 'Corpo vazio.' };
  const { agente, mensagens } = corpo as { agente?: unknown; mensagens?: unknown };
  if (typeof agente !== 'string') return { ok: false, erro: 'Falta o especialista.' };
  const system = sistemaDe(agente);
  if (!system) return { ok: false, erro: 'Especialista desconhecido.' };
  if (!Array.isArray(mensagens) || !mensagens.length) return { ok: false, erro: 'Falta a mensagem.' };
  const limpas: Mensagem[] = [];
  for (const m of mensagens.slice(-LIMITE_HISTORICO)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) return { ok: false, erro: 'Mensagem em formato inválido.' };
    limpas.push({ role: m.role, content: m.content.slice(0, LIMITE_TEXTO) });
  }
  if (limpas[0].role !== 'user') limpas.shift();
  if (!limpas.length || limpas.at(-1)!.role !== 'user') return { ok: false, erro: 'A última mensagem precisa ser de quem pergunta.' };
  return { ok: true, agente, pedido: { model: MODELO, max_tokens: 1024, system, messages: limpas } };
}
