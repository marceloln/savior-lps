// Validação pura do que chega pela API. Devolve o dado limpo ou uma mensagem de erro em português.
import { APARENCIAS } from '../src/lib/equipe';
import { leModelo } from '../src/lib/modelos';
import { ZONAS } from '../src/lib/lab';

/** Identificadores de quem está na equipe agora. Vem do banco a cada pedido. */
export type Ids = Set<string>;

export type Ok<T> = { ok: true; v: T };
export type Falha = { ok: false; erro: string };
const falha = (erro: string): Falha => ({ ok: false, erro });
const ehAgente = (x: unknown, ids: Ids): x is string => typeof x === 'string' && ids.has(x);
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

export function novaTarefa(c: unknown, ids: Ids): Ok<{ agente: string; titulo: string; detalhe: string; projeto_id: string | null }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  if (!ehAgente(o.agente, ids)) return falha('Escolha quem faz a missão.');
  const titulo = texto(o.titulo, 200);
  if (!titulo) return falha('A missão precisa de um título.');
  return { ok: true, v: { agente: o.agente, titulo, detalhe: texto(o.detalhe, 2000), projeto_id: typeof o.projeto_id === 'string' && o.projeto_id ? o.projeto_id : null } };
}

export function mudancaTarefa(c: unknown, ids: Ids): Ok<{ estado?: (typeof ESTADOS)[number]; titulo?: string; agente?: string; detalhe?: string; entrega?: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>, v: { estado?: (typeof ESTADOS)[number]; titulo?: string; agente?: string; detalhe?: string; entrega?: string } = {};
  if (o.estado !== undefined) { if (!ESTADOS.includes(o.estado as never)) return falha('Estado inválido.'); v.estado = o.estado as (typeof ESTADOS)[number]; }
  if (o.titulo !== undefined) { const t = texto(o.titulo, 200); if (!t) return falha('O título não pode ficar vazio.'); v.titulo = t; }
  if (o.agente !== undefined) { if (!ehAgente(o.agente, ids)) return falha('Especialista desconhecido.'); v.agente = o.agente; }
  if (o.detalhe !== undefined) v.detalhe = texto(o.detalhe, 2000);
  if (o.entrega !== undefined) v.entrega = texto(o.entrega, 20000);
  if (!Object.keys(v).length) return falha('Nada para mudar.');
  return { ok: true, v };
}

export function novaReuniao(c: unknown, ids: Ids): Ok<{ titulo: string; pauta: string; dia: string; hora: string; participantes: string[]; projeto_id: string | null }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const titulo = texto(o.titulo, 160);
  if (!titulo) return falha('A reunião precisa de um título.');
  if (!dataReal(o.dia)) return falha('Data inválida.');
  if (typeof o.hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(o.hora)) return falha('Hora inválida.');
  const participantes = Array.isArray(o.participantes) ? [...new Set(o.participantes.filter((x): x is string => ehAgente(x, ids)))] : [];
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

export function instrucao(agente: string, c: unknown, ids: Ids): Ok<{ agente: string; texto: string }> | Falha {
  if (!ehAgente(agente, ids)) return falha('Especialista desconhecido.');
  return { ok: true, v: { agente, texto: texto((c as Record<string, unknown> | null)?.texto, 3000) } };
}

export function novaMemoria(c: unknown, ids: Ids): Ok<{ agente: string; texto: string; origem: 'manual' | 'conversa' }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  if (!ehAgente(o.agente, ids)) return falha('Especialista desconhecido.');
  const t = texto(o.texto, 1500);
  if (!t) return falha('A nota está vazia.');
  return { ok: true, v: { agente: o.agente, texto: t, origem: o.origem === 'conversa' ? 'conversa' : 'manual' } };
}

export function mudancaProjeto(c: unknown): Ok<{ fase: number }> | Falha {
  const f = (c as Record<string, unknown> | null)?.fase;
  return Number.isInteger(f) && (f as number) >= 0 && (f as number) <= 3 ? { ok: true, v: { fase: f as number } } : falha('Fase inválida.');
}

/** Identificador legível a partir de um texto: minúsculas, sem acento, com hífen. */
export function slug(t: string): string {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';
}

export function novoCliente(c: unknown): Ok<{ setor: string; situacao: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const setor = texto(o.setor, 120), situacao = texto(o.situacao, 300);
  if (setor.length < 3) return falha('Diga o setor do cliente.');
  if (situacao.length < 3) return falha('Conte a situação do cliente em uma frase.');
  return { ok: true, v: { setor, situacao } };
}

export function novoProjeto(c: unknown): Ok<{ cliente_id: string; nome: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const nome = texto(o.nome, 120);
  if (typeof o.cliente_id !== 'string' || !o.cliente_id) return falha('Escolha o cliente do projeto.');
  if (nome.length < 3) return falha('Dê um nome ao projeto.');
  return { ok: true, v: { cliente_id: o.cliente_id, nome } };
}

export function mudancaReuniao(c: unknown): Ok<{ dia?: string; hora?: string; titulo?: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>, v: { dia?: string; hora?: string; titulo?: string } = {};
  if (o.dia !== undefined) { if (!dataReal(o.dia)) return falha('Data inválida.'); v.dia = o.dia; }
  if (o.hora !== undefined) { if (typeof o.hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(o.hora)) return falha('Hora inválida.'); v.hora = o.hora; }
  if (o.titulo !== undefined) { const t = texto(o.titulo, 160); if (t.length < 3) return falha('O assunto precisa de pelo menos 3 letras.'); v.titulo = t; }
  return Object.keys(v).length ? { ok: true, v } : falha('Nada para mudar.');
}

export function mudancaDecisao(c: unknown): Ok<{ titulo?: string; contexto?: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>, v: { titulo?: string; contexto?: string } = {};
  if (o.titulo !== undefined) { const t = texto(o.titulo, 200); if (!t) return falha('Escreva o que foi decidido.'); v.titulo = t; }
  if (o.contexto !== undefined) v.contexto = texto(o.contexto, 2000);
  return Object.keys(v).length ? { ok: true, v } : falha('Nada para mudar.');
}

// ---------- núcleo multiagente ----------
const ehZona = (x: unknown): x is string => typeof x === 'string' && ZONAS.some(z => z.id === x);
/** Modelo vazio quer dizer usar o padrão do lab. Preenchido, precisa ser provedor:modelo de um provedor de verdade. */
const modeloOk = (x: unknown): x is string => typeof x === 'string' && (x === '' || (!!leModelo(x) && leModelo(x)!.provedor !== 'simulado'));

export function novoAgente(c: unknown): Ok<{ nome: string; papel: string; zona: string; aparencia: string; modelo: string }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const nome = texto(o.nome, 40), papel = texto(o.papel, 80);
  if (nome.length < 2) return falha('Dê um nome ao especialista.');
  if (papel.length < 3) return falha('Diga o papel dele no lab.');
  if (!ehZona(o.zona)) return falha('Escolha a sala onde ele trabalha.');
  if (typeof o.aparencia !== 'string' || !APARENCIAS.includes(o.aparencia)) return falha('Escolha a aparência.');
  if (o.modelo !== undefined && !modeloOk(o.modelo)) return falha('Modelo de IA inválido. Use provedor:modelo.');
  return { ok: true, v: { nome, papel, zona: o.zona, aparencia: o.aparencia, modelo: (o.modelo as string | undefined) ?? '' } };
}

export function mudancaAgente(c: unknown): Ok<{ nome?: string; papel?: string; zona?: string; modelo?: string; ativo?: number }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>, v: { nome?: string; papel?: string; zona?: string; modelo?: string; ativo?: number } = {};
  if (o.nome !== undefined) { const t = texto(o.nome, 40); if (t.length < 2) return falha('O nome não pode ficar vazio.'); v.nome = t; }
  if (o.papel !== undefined) { const t = texto(o.papel, 80); if (t.length < 3) return falha('O papel não pode ficar vazio.'); v.papel = t; }
  if (o.zona !== undefined) { if (!ehZona(o.zona)) return falha('Sala desconhecida.'); v.zona = o.zona; }
  if (o.modelo !== undefined) { if (!modeloOk(o.modelo)) return falha('Modelo de IA inválido. Use provedor:modelo.'); v.modelo = o.modelo; }
  if (o.ativo !== undefined) { if (typeof o.ativo !== 'boolean') return falha('Valor inválido.'); v.ativo = o.ativo ? 1 : 0; }
  return Object.keys(v).length ? { ok: true, v } : falha('Nada para mudar.');
}

export function novaSkill(c: unknown): Ok<{ nome: string; descricao: string; conteudo: string; para_todos: number }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const nome = texto(o.nome, 80), conteudo = texto(o.conteudo, 6000);
  if (nome.length < 3) return falha('Dê um nome à skill.');
  if (conteudo.length < 20) return falha('Escreva o que o especialista precisa saber para fazer isso bem.');
  return { ok: true, v: { nome, descricao: texto(o.descricao, 200), conteudo, para_todos: o.para_todos === true ? 1 : 0 } };
}

export function mudancaSkill(c: unknown): Ok<{ nome?: string; descricao?: string; conteudo?: string; para_todos?: number }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>, v: { nome?: string; descricao?: string; conteudo?: string; para_todos?: number } = {};
  if (o.nome !== undefined) { const t = texto(o.nome, 80); if (t.length < 3) return falha('Dê um nome à skill.'); v.nome = t; }
  if (o.descricao !== undefined) v.descricao = texto(o.descricao, 200);
  if (o.conteudo !== undefined) { const t = texto(o.conteudo, 6000); if (t.length < 20) return falha('O texto da skill ficou curto demais.'); v.conteudo = t; }
  if (o.para_todos !== undefined) { if (typeof o.para_todos !== 'boolean') return falha('Valor inválido.'); v.para_todos = o.para_todos ? 1 : 0; }
  return Object.keys(v).length ? { ok: true, v } : falha('Nada para mudar.');
}

export function listaDeSkills(c: unknown): Ok<string[]> | Falha {
  const l = (c as Record<string, unknown> | null)?.skills;
  if (!Array.isArray(l) || l.some(x => typeof x !== 'string')) return falha('Lista de skills inválida.');
  return { ok: true, v: [...new Set(l as string[])].slice(0, 30) };
}

export function textoDoPedido(c: unknown): Ok<{ texto: string; projeto_id: string | null }> | Falha {
  const o = (c ?? {}) as Record<string, unknown>;
  const t = texto(o.texto, 4000);
  if (t.length < 8) return falha('Conte o que você precisa em uma frase ou mais.');
  return { ok: true, v: { texto: t, projeto_id: typeof o.projeto_id === 'string' && o.projeto_id ? o.projeto_id : null } };
}

export function modeloPadrao(c: unknown): Ok<string> | Falha {
  const m = (c as Record<string, unknown> | null)?.modelo;
  return typeof m === 'string' && m && modeloOk(m) ? { ok: true, v: m } : falha('Modelo de IA inválido. Use provedor:modelo.');
}

export const ajuste = (c: unknown) => texto((c as Record<string, unknown> | null)?.ajuste, 2000);
