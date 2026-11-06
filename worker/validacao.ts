// Validação pura do que chega pela API. Devolve o dado limpo ou uma mensagem de erro em português.
import { EQUIPE } from '../src/lib/equipe';

export type Ok<T> = { ok: true; v: T };
export type Falha = { ok: false; erro: string };
const falha = (erro: string): Falha => ({ ok: false, erro });
const ehAgente = (x: unknown): x is string => typeof x === 'string' && EQUIPE.some(e => e.id === x);
const texto = (x: unknown, max: number) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
const ESTADOS = ['fila', 'fazendo', 'feito'] as const;
/** Aceita só datas que existem no calendário, no formato AAAA-MM-DD. */
export function dataReal(x: unknown): x is string {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(x + 'T12:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === x;
}
/** Data de hoje no horário de Brasília, para comparar com o dia das reuniões. */
export const hojeBrasil = (agora = Date.now()) => new Date(agora - 3 * 3600e3).toISOString().slice(0, 10);

export function novaTarefa(c: unknown): Ok<{ agente: string; titulo: string; detalhe: string; projeto_id: string | null }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  if (!ehAgente(o.agente)) return falha('Escolha quem faz a tarefa.');
  const titulo = texto(o.titulo, 200);
  if (!titulo) return falha('A tarefa precisa de um título.');
  return { ok: true, v: { agente: o.agente, titulo, detalhe: texto(o.detalhe, 2000), projeto_id: typeof o.projeto_id === 'string' && o.projeto_id ? o.projeto_id : null } };
}

export function mudancaTarefa(c: unknown): Ok<{ estado?: (typeof ESTADOS)[number]; titulo?: string; agente?: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>, v: { estado?: (typeof ESTADOS)[number]; titulo?: string; agente?: string } = {};
  if (o.estado !== undefined) { if (!ESTADOS.includes(o.estado as never)) return falha('Estado inválido.'); v.estado = o.estado as (typeof ESTADOS)[number]; }
  if (o.titulo !== undefined) { const t = texto(o.titulo, 200); if (!t) return falha('O título não pode ficar vazio.'); v.titulo = t; }
  if (o.agente !== undefined) { if (!ehAgente(o.agente)) return falha('Especialista desconhecido.'); v.agente = o.agente; }
  if (!Object.keys(v).length) return falha('Nada para mudar.');
  return { ok: true, v };
}

export function novaReuniao(c: unknown): Ok<{ titulo: string; pauta: string; dia: string; hora: string; participantes: string[]; projeto_id: string | null }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const titulo = texto(o.titulo, 160);
  if (!titulo) return falha('A reunião precisa de um título.');
  if (!dataReal(o.dia)) return falha('Data inválida.');
  if (typeof o.hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(o.hora)) return falha('Hora inválida.');
  const participantes = Array.isArray(o.participantes) ? [...new Set(o.participantes.filter(ehAgente))] : [];
  if (!participantes.length) return falha('Chame ao menos uma pessoa.');
  return { ok: true, v: { titulo, pauta: texto(o.pauta, 1000), dia: o.dia, hora: o.hora, participantes, projeto_id: typeof o.projeto_id === 'string' && o.projeto_id ? o.projeto_id : null } };
}

export function ata(c: unknown): Ok<{ ata: string }> | Falha {
  const a = texto((c as Record<string, unknown> | null)?.ata, 6000);
  return a ? { ok: true, v: { ata: a } } : falha('A ata está vazia.');
}

export function novaDecisao(c: unknown): Ok<{ titulo: string; contexto: string; projeto_id: string | null; reuniao_id: number | null }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const titulo = texto(o.titulo, 200);
  if (!titulo) return falha('Escreva o que foi decidido.');
  return { ok: true, v: { titulo, contexto: texto(o.contexto, 2000), projeto_id: typeof o.projeto_id === 'string' && o.projeto_id ? o.projeto_id : null, reuniao_id: Number.isInteger(o.reuniao_id) ? (o.reuniao_id as number) : null } };
}

export function instrucao(agente: string, c: unknown): Ok<{ agente: string; texto: string }> | Falha {
  if (!ehAgente(agente)) return falha('Especialista desconhecido.');
  return { ok: true, v: { agente, texto: texto((c as Record<string, unknown> | null)?.texto, 3000) } };
}

export function novaMemoria(c: unknown): Ok<{ agente: string; texto: string; origem: 'manual' | 'conversa' }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  if (!ehAgente(o.agente)) return falha('Especialista desconhecido.');
  const t = texto(o.texto, 1500);
  if (!t) return falha('A nota está vazia.');
  return { ok: true, v: { agente: o.agente, texto: t, origem: o.origem === 'conversa' ? 'conversa' : 'manual' } };
}

export function mudancaProjeto(c: unknown): Ok<{ fase: number }> | Falha {
  const f = (c as Record<string, unknown> | null)?.fase;
  return Number.isInteger(f) && (f as number) >= 0 && (f as number) <= 3 ? { ok: true, v: { fase: f as number } } : falha('Fase inválida.');
}
