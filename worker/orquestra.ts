// Textos que a orquestração e os especialistas recebem para planejar um pedido, executar uma missão e fechar a síntese.
// Tudo puro: recebe dados, devolve texto. As palavras em maiúsculas no começo também servem ao provedor simulado.
import type { Cliente, MissaoProposta, Projeto } from '../src/lib/dados';
import { FASES } from '../src/lib/dados';
import type { Membro } from '../src/lib/equipe';

export const MAX_MISSOES = 5;
const corta = (t: string, n: number) => (t.length > n ? t.slice(0, n) + '\n[...]' : t);

const projetoEmTexto = (p?: Projeto | null, c?: Cliente | null) =>
  p ? `PROJETO\n${p.nome}. Fase: ${FASES[p.fase]}, dia ${p.dia} de 30.${c ? ` Cliente: ${c.setor}. Situação: ${c.situacao}.` : ''}` : '';

export function promptPlano(texto: string, equipe: (Membro & { abertas: number })[], projeto?: Projeto | null, cliente?: Cliente | null): string {
  return [
    'PEDIDO DO SÓCIO', texto.trim(), projetoEmTexto(projeto, cliente),
    'EQUIPE DISPONÍVEL', ...equipe.map(m => `- ${m.id} | ${m.nome} | ${m.papel} | missões abertas: ${m.abertas}`),
    '',
    `Divida o pedido em missões, de 1 a ${MAX_MISSOES}. Regras:`,
    '- Use só os identificadores da lista. Não chame quem não agrega. Pedido simples pede uma missão só.',
    '- Título curto e concreto. O detalhe diz o que entregar e em que formato.',
    '- Ponha na ordem em que devem ser feitas: quem vem depois lê a entrega de quem veio antes.',
    '- Prefira quem tem menos missão aberta quando dois servem.',
    'Responda só com JSON, sem texto antes ou depois, neste formato:',
    '{"missoes":[{"agente":"identificador","titulo":"...","detalhe":"..."}]}',
  ].filter(Boolean).join('\n');
}

/** Lê o plano devolvido pelo modelo. Aceita texto em volta do JSON e descarta missão para quem não existe. */
export function lePlano(texto: string, ids: Set<string>): { ok: true; missoes: MissaoProposta[] } | { ok: false; erro: string } {
  const a = texto.indexOf('{'), b = texto.lastIndexOf('}');
  if (a < 0 || b <= a) return { ok: false, erro: 'A orquestração não devolveu um plano legível. Tente de novo.' };
  let bruto: unknown;
  try { bruto = JSON.parse(texto.slice(a, b + 1)); } catch { return { ok: false, erro: 'A orquestração não devolveu um plano legível. Tente de novo.' }; }
  const lista = (bruto as { missoes?: unknown })?.missoes;
  if (!Array.isArray(lista)) return { ok: false, erro: 'A orquestração não devolveu um plano legível. Tente de novo.' };
  const missoes = validaMissoes(lista, ids);
  return missoes.length ? { ok: true, missoes } : { ok: false, erro: 'O plano veio sem nenhuma missão para alguém da equipe. Tente de novo.' };
}

/** Limpa uma lista de missões propostas: só gente que existe, com título, no máximo o limite. */
export function validaMissoes(lista: unknown[], ids: Set<string>): MissaoProposta[] {
  const out: MissaoProposta[] = [];
  for (const x of lista) {
    const o = (x ?? {}) as Record<string, unknown>;
    const titulo = typeof o.titulo === 'string' ? o.titulo.trim().slice(0, 200) : '';
    if (typeof o.agente !== 'string' || !ids.has(o.agente) || !titulo) continue;
    out.push({ agente: o.agente, titulo, detalhe: typeof o.detalhe === 'string' ? o.detalhe.trim().slice(0, 2000) : '' });
    if (out.length === MAX_MISSOES) break;
  }
  return out;
}

export type DadosExecucao = {
  titulo: string; detalhe: string; projeto?: Projeto | null; cliente?: Cliente | null; pedido?: string | null;
  anteriores?: { nome: string; papel: string; titulo: string; entrega: string }[]; versaoAnterior?: string; ajuste?: string;
};

export function promptExecucao(d: DadosExecucao): string {
  return [
    'MISSÃO', d.titulo, d.detalhe ? 'O que entregar: ' + d.detalhe : '',
    projetoEmTexto(d.projeto, d.cliente),
    d.pedido ? 'PEDIDO ORIGINAL DO SÓCIO\n' + d.pedido : '',
    d.anteriores?.length ? 'O QUE OS COLEGAS JÁ ENTREGARAM NESTE PEDIDO\n' + d.anteriores.map(a => `${a.nome}, ${a.papel.toLowerCase()}. ${a.titulo}\n${corta(a.entrega, 1800)}`).join('\n\n') : '',
    d.versaoAnterior && d.ajuste ? 'SUA VERSÃO ANTERIOR\n' + corta(d.versaoAnterior, 4000) + '\n\nAJUSTE PEDIDO PELO SÓCIO\n' + d.ajuste : '',
    '',
    'Escreva a entrega em markdown, pronta para o consultor usar, sem preâmbulo e sem se apresentar.',
    'Comece por um título de nível 2. Seja concreto e curto. Termine com o próximo passo, com dono e data quando fizer sentido.',
    'Se faltar dado para fazer bem, abra uma seção O que falta e liste, em vez de inventar.',
  ].filter(Boolean).join('\n');
}

export function promptSintese(pedido: string, entregas: { nome: string; papel: string; titulo: string; entrega: string }[]): string {
  return [
    'CONSOLIDAR', 'Pedido do sócio: ' + pedido.trim(), '',
    'ENTREGAS DA EQUIPE', ...entregas.map(e => `${e.nome}, ${e.papel.toLowerCase()}. ${e.titulo}\n${corta(e.entrega, 3500)}`),
    '',
    'Junte as entregas em uma resposta só para o sócio, em markdown, começando por um título de nível 2.',
    'Diga a resposta ao pedido em poucas linhas, quem trouxe o quê, o que fazer agora com dono e o que ainda não se sabe.',
    'Aponte contradição entre as entregas se houver. Não repita as entregas inteiras.',
  ].join('\n');
}
