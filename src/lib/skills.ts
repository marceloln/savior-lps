// Skills de partida do lab. Texto que entra nas instruções do especialista. Os sócios editam e criam outras pela interface.
import { CONVIDADOS, FUNCOES, convidadoDe, idDoConvidado, skillDoConvidado } from './convidados';
import reforcos from './reforcos.json';
import impressoes from './impressoes-v2.json';
import type { Skill } from './dados';

const PARTIDA: Skill[] = [
  {
    id: 'metodo-v30', nome: 'Método V30', para_todos: true,
    descricao: 'O que a Vetor30 é, os quatro pilares e o ciclo de 30 dias. Vale para todo mundo.',
    conteudo: [
      'A Vetor30 não é consultoria tradicional. É um método de 30 dias que transforma complexidade em direção e execução em tração. O projeto termina e a capacidade fica.',
      'Quatro pilares.',
      '- Clareza: diagnosticar o problema certo antes de acelerar. Mapear causa, não sintoma.',
      '- Alinhamento: decisão compartilhada com quem decide, quem executa e quem sente o problema, na mesma mesa.',
      '- Tração: plano rodando com dono, data, ritual semanal e quick wins nas primeiras semanas.',
      '- Legado: método, cultura e autonomia que ficam depois do ciclo. Nada de criar dependência.',
      'O ciclo de 30 dias.',
      '- Discovery, dias 1 e 2: mapear causas e fechar a declaração do problema.',
      '- Vetor Lab, dias 3 a 7: imersão com o time do cliente para co-criar soluções e um plano preliminar.',
      '- Kick-start, dias 8 a 15: ligar o plano à estratégia e conseguir o apoio da liderança.',
      '- Growth Loop, dias 16 a 25: execução assistida, pilotos e ciclos curtos de aprendizado.',
      '- Legado Vetor, dias 26 a 30: consolidar aprendizados, documentar e garantir a autonomia do time.',
      'Como isso aparece no seu trabalho.',
      '- Toda entrega termina em próximo passo com dono e data. Relatório de gaveta não serve.',
      '- Entrega tangível vale mais que análise bonita. Prefira roteiro, checklist, pauta, plano de uma página.',
      '- Se o pedido trata o sintoma, diga qual causa você investigaria primeiro.',
    ].join('\n'),
  },
  {
    id: 'tom-de-voz-v30', nome: 'Tom de voz V30', para_todos: true,
    descricao: 'Como a V30 escreve: direto, pé no chão, linguagem do campo.',
    conteudo: [
      'Escreva direto, com frases curtas e variação de ritmo. Fale como quem já viveu o problema na pista, na loja e no backoffice.',
      'Use a linguagem do campo: turno, pista, caixa, gerente de loja, praça, matriz.',
      'Explique sem jargão. Evite termos vazios como transformação digital, disruptivo, sinergia.',
      'Prefira exemplo prático e provocação bem colocada a lista genérica.',
      'Não use travessão nem aspas. Não invente número, métrica ou nome de cliente. Cliente é setor e situação.',
    ].join('\n'),
  },
  {
    id: 'diagnostico-gut', nome: 'Diagnóstico com matriz GUT', para_todos: false,
    descricao: 'Priorizar dores por Gravidade, Urgência e Tendência e virar matriz de ação.',
    conteudo: [
      'Sequência do diagnóstico V30: primeira conversa, entrevistas, visão consolidada e proposta.',
      'Para cada dor levantada, separe o sintoma da causa provável.',
      'Dê nota de 1 a 5 para Gravidade, Urgência e Tendência e multiplique as três. A nota precisa de uma frase de justificativa tirada do que foi ouvido.',
      'Ordene da maior para a menor e leve as primeiras para uma matriz de Impacto por Esforço.',
      'Feche com as hipóteses a validar, quem precisa ser ouvido e os próximos passos com dono.',
      'Se não houver dado para pontuar, diga o que falta perguntar em vez de chutar a nota.',
    ].join('\n'),
  },
];

/** Reforço da equipe de partida: skills de ofício ligadas a quem faz aquele trabalho. O texto de cada uma mora em conteudos.json,
 *  reescrito por inteiro a partir do repositório aberto agency-agents (MIT). Crédito em docs/convidados.md. */
export type Reforco = { id: string; nome: string; descricao: string; para: string[]; origem: string[] };
export const REFORCOS = reforcos as Reforco[];

/** O texto das skills de base, por identificador. É pesado, então a tela só carrega quando precisa e o Worker carrega sempre. */
export type Conteudos = Record<string, string>;

/** Skills com que o lab começa: as de partida, o reforço da equipe e o método de cada convidado do banco.
 *  Sem o mapa de conteúdo, vêm só com nome e descrição, que é o que a primeira tela precisa. */
export function skillsBase(c: Conteudos = {}): Skill[] {
  return [...PARTIDA, ...REFORCOS.map((r): Skill => ({ id: r.id, nome: r.nome, descricao: r.descricao, conteudo: c[r.id] ?? '', para_todos: false })),
    ...CONVIDADOS.map(g => skillDoConvidado(g, c[idDoConvidado(g)]))];
}

/** Quem já começa com skill própria, além das que valem para todos. */
export const VINCULOS_BASE: Record<string, string[]> = (() => {
  const v: Record<string, string[]> = { lia: ['diagnostico-gut'], rui: ['diagnostico-gut'] };
  for (const r of REFORCOS) for (const quem of r.para) (v[quem] ??= []).push(r.id);
  return v;
})();

/** Sobe a cada leva de skills de base. Banco que já está no ar recebe só a leva que falta, sem mexer no que os sócios editaram ou apagaram.
 *  Leva 1: as três de partida. Leva 2: reforço e convidados de 15 de novembro. Leva 3: conteúdo completo, perfis e convidados novos. */
export const VERSAO_DA_BASE = 3;
const DA_LEVA_2 = impressoes as unknown as Record<string, [tamanho: number, comeco: string]>;
const leva = (id: string) => (PARTIDA.some(k => k.id === id) ? 1 : id in DA_LEVA_2 ? 2 : 3);

/** O que semear num banco que está na versão dada. Zero é banco vazio e recebe tudo; um é o banco de antes das levas. */
export function baseQueFalta(versao: number, c: Conteudos = {}): { skills: Skill[]; vinculos: [agente: string, skill: string][] } {
  const skills = skillsBase(c).filter(k => leva(k.id) > versao), ids = new Set(skills.map(k => k.id));
  return { skills, vinculos: Object.entries(VINCULOS_BASE).flatMap(([a, l]) => l.filter(k => ids.has(k)).map((k): [string, string] => [a, k])) };
}

/** Skills da leva 2 que ganharam conteúdo completo na leva 3. Cada uma leva a impressão do texto antigo, tamanho e começo:
 *  o banco só troca o texto de quem ainda está igual ao que foi semeado, e assim a edição dos sócios fica como está. */
export function conteudoQueMudou(versao: number, c: Conteudos): { skill: Skill; tamanhoAntigo: number; comecoAntigo: string }[] {
  if (versao < 2 || versao >= 3) return [];
  return skillsBase(c).filter(k => leva(k.id) === 2 && k.conteudo).map(skill => ({ skill, tamanhoAntigo: DA_LEVA_2[skill.id][0], comecoAntigo: DA_LEVA_2[skill.id][1] }));
}

/** Monta o texto de uma skill a partir de um treino guiado: o que é a tarefa, como fazer e um exemplo de boa entrega. */
export function skillDeTreino(t: { tarefa: string; passos: string; exemplo: string }): { nome: string; descricao: string; conteudo: string } {
  const partes = [`Tarefa: ${t.tarefa.trim()}`, 'Como fazer:\n' + t.passos.trim()];
  if (t.exemplo.trim()) partes.push('Exemplo de boa entrega, para seguir o nível e o formato:\n' + t.exemplo.trim());
  return { nome: t.tarefa.trim().slice(0, 80), descricao: 'Treino dado por um sócio.', conteudo: partes.join('\n\n') };
}

/** A biblioteca em gavetas: o método da casa, o ofício da equipe e uma gaveta por função do banco de convidados. Gaveta vazia não aparece. */
export function gavetasDeSkills(skills: Skill[]): { id: string; nome: string; skills: Skill[] }[] {
  const funcao = (k: Skill) => convidadoDe(k.id)?.funcao;
  return [
    { id: 'casa', nome: 'Método da casa', skills: skills.filter(k => k.para_todos) },
    { id: 'equipe', nome: 'Ofício da equipe', skills: skills.filter(k => !k.para_todos && !funcao(k)) },
    ...FUNCOES.map(f => ({ ...f, skills: skills.filter(k => !k.para_todos && funcao(k) === f.id) })),
  ].filter(g => g.skills.length > 0);
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
/** Skills cujo nome, descrição ou método contém todas as palavras digitadas, sem ligar para acento e maiúscula. Busca vazia devolve tudo. */
export function buscaSkills(skills: Skill[], texto: string): Skill[] {
  const palavras = semAcento(texto).split(/\s+/).filter(Boolean);
  if (!palavras.length) return skills;
  return skills.filter(k => { const onde = semAcento(`${k.nome} ${k.descricao} ${k.conteudo}`); return palavras.every(p => onde.includes(p)); });
}
