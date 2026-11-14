// Montagem das instruções de um especialista e validação do que chega na conversa. Sem dependência do Worker, para testar fácil.
import type { Membro } from '../src/lib/equipe';
import type { Skill } from '../src/lib/dados';

export type Mensagem = { role: 'user' | 'assistant'; content: string };
const LIMITE_HISTORICO = 20;
const LIMITE_TEXTO = 4000;
const LIMITE_SKILL = 6000;

const BRIEFING = [
  'Você conduz o briefing de entrada. Faça uma pergunta por vez, curta, e espere a resposta.',
  'Feche nesta ordem: setor, situação atual, a dor principal, o que já foi tentado, prazo e quem decide (só o cargo, nunca o nome).',
  'Quando tiver tudo, devolva um resumo em tópicos curtos e pergunte se está certo antes de encerrar.',
].join(' ');

/** Instruções de base de um especialista, mais as skills em que ele foi treinado. */
export function sistemaDe(m: Membro, skills: Skill[] = []): string {
  const base = [
    `Você é ${m.nome}, ${m.papel.toLowerCase()} no Lab V30, a consultoria Vetor30.`,
    'A V30 trabalha em ciclos de 30 dias com foco em CX, loja e backoffice.',
    'Fale em português, direto, como quem já viveu o problema no campo. Frases curtas, sem travessão e sem aspas.',
    'Nunca invente número, métrica ou nome de cliente. Cliente é sempre setor e situação. Se faltar dado, diga o que falta.',
    ...(m.id === 'clara' ? [BRIEFING] : []),
  ].join(' ');
  if (!skills.length) return base;
  return base + '\n\nSkills em que você foi treinado. Siga o que elas dizem quando o assunto for o delas.\n\n'
    + skills.map(s => `### ${s.nome}\n${s.conteudo.slice(0, LIMITE_SKILL)}`).join('\n\n');
}

/** Valida o corpo da conversa e devolve as mensagens limpas, ou uma mensagem de erro. */
export function montaPedido(corpo: unknown, ids: Set<string>): { ok: true; agente: string; messages: Mensagem[] } | { ok: false; erro: string } {
  if (!corpo || typeof corpo !== 'object') return { ok: false, erro: 'Corpo vazio.' };
  const { agente, mensagens } = corpo as { agente?: unknown; mensagens?: unknown };
  if (typeof agente !== 'string') return { ok: false, erro: 'Falta o especialista.' };
  if (!ids.has(agente)) return { ok: false, erro: 'Especialista desconhecido.' };
  if (!Array.isArray(mensagens) || !mensagens.length) return { ok: false, erro: 'Falta a mensagem.' };
  const limpas: Mensagem[] = [];
  for (const m of mensagens.slice(-LIMITE_HISTORICO)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) return { ok: false, erro: 'Mensagem em formato inválido.' };
    limpas.push({ role: m.role, content: m.content.slice(0, LIMITE_TEXTO) });
  }
  if (limpas[0].role !== 'user') limpas.shift();
  if (!limpas.length || limpas.at(-1)!.role !== 'user') return { ok: false, erro: 'A última mensagem precisa ser de quem pergunta.' };
  return { ok: true, agente, messages: limpas };
}
