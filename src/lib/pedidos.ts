// Contas do pedido ao lab: por onde começar, o que pede atenção agora e o documento que sai no fim. Sem tela.
import type { EstadoLab, Pedido, Tarefa } from './dados';
import { aindaHoje, type ReuniaoGoogle } from './agendaGoogle';

/** Pontos de partida para um pedido, nos tipos de trabalho que a V30 faz. O sócio completa o que está entre colchetes. */
export const MODELOS_DE_PEDIDO: { rotulo: string; texto: string }[] = [
  { rotulo: 'Diagnóstico', texto: 'Montar o roteiro de diagnóstico para [setor e situação do cliente], com as perguntas de campo, quem ouvir em cada unidade e o que observar na operação.' },
  { rotulo: 'Proposta', texto: 'Escrever a proposta de um ciclo de 30 dias para [setor e situação do cliente], com a dor principal, o que entregamos em cada semana e o que o cliente precisa pôr na mesa.' },
  { rotulo: 'Ritual da semana', texto: 'Preparar a pauta do ritual semanal do projeto [nome do projeto], com o que foi feito, o que travou e as decisões que precisam sair da reunião.' },
  { rotulo: 'Plano de 30 dias', texto: 'Desenhar o plano de 30 dias para [dor do cliente], semana a semana, com dono de cada entrega e como vamos saber que funcionou.' },
  { rotulo: 'Treinamento de equipe', texto: 'Criar o material de treino para [equipe e turno], com o padrão de atendimento em passos curtos e um roteiro que o gerente consegue aplicar sozinho.' },
  { rotulo: 'Post de LinkedIn', texto: 'Escrever um post de LinkedIn da V30 sobre [tema ou aprendizado de campo], no nosso tom, sem citar cliente pelo nome e sem número inventado.' },
];

/** Quem entregou alguma missão do pedido, uma vez cada e na ordem das missões. Quem orquestra fica de fora: é para ele que as entregas voltam. */
export const autoresDoPedido = (tarefas: Tarefa[], pedido: number, orquestrador: string): string[] =>
  [...new Set(tarefas.filter(t => t.pedido_id === pedido && t.entrega && t.agente !== orquestrador).map(t => t.agente))];

const quando = (iso: string) => new Date(iso.replace(' ', 'T') + 'Z').getTime();

export type Atencao =
  | { tipo: 'resposta'; pedido: number; texto: string }
  | { tipo: 'parado'; pedido: number; texto: string }
  | { tipo: 'reuniao'; reuniao: number; texto: string }
  | { tipo: 'meet'; id: string; texto: string; url: string | null };

/** O que pede a atenção do sócio agora. Reunião de hoje vem primeiro, porque tem hora. Depois pedido parado e resposta recente.
 * google traz as reuniões do Google Agenda e hora é a hora local em HH:MM, para tirar as que já acabaram. */
export function paraVoce(e: EstadoLab, hoje: string, agora: number, andando: number | null = null, google: ReuniaoGoogle[] = [], hora = '00:00'): Atencao[] {
  const DOIS_DIAS = 48 * 3600e3;
  const parados = e.pedidos.filter(p => p.estado !== 'entregue' && p.id !== andando).map(p => ({ tipo: 'parado' as const, pedido: p.id, texto: p.texto }));
  const respostas = e.pedidos.filter(p => p.estado === 'entregue' && agora - quando(p.criado_em) < DOIS_DIAS).slice(0, 2).map(p => ({ tipo: 'resposta' as const, pedido: p.id, texto: p.texto }));
  const doLab = e.reunioes.filter(r => r.status === 'agendada' && r.dia === hoje).map(r => ({ hora: r.hora, a: { tipo: 'reuniao' as const, reuniao: r.id, texto: `${r.hora} ${r.titulo}` } }));
  const noMeet = aindaHoje(google, hoje, hora).map(r => ({ hora: r.hora, a: { tipo: 'meet' as const, id: r.id, texto: `${r.hora} ${r.titulo}`, url: r.meet } }));
  const reunioes = [...doLab, ...noMeet].sort((x, y) => x.hora.localeCompare(y.hora)).map(x => x.a);
  return [...reunioes, ...parados, ...respostas].slice(0, 4);
}

/** A resposta e as entregas de um pedido num documento só, em markdown, para levar para fora do lab. */
export function documentoDoPedido(ped: Pedido, entregas: { nome: string; papel: string; titulo: string; entrega: string }[]): string {
  const partes = [`# ${ped.texto.trim()}`, ''];
  if (ped.sintese) partes.push(ped.sintese.trim(), '');
  if (entregas.length) partes.push('---', '', '# Entregas da equipe', '');
  for (const x of entregas) partes.push(`## ${x.nome}, ${x.papel.toLowerCase()}`, `Missão: ${x.titulo}`, '', x.entrega.trim(), '');
  return partes.join('\n').trimEnd() + '\n';
}

/** Nome de arquivo curto e seguro a partir do texto do pedido. */
export function nomeDoArquivo(texto: string): string {
  const base = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).replace(/-$/, '');
  return (base || 'pedido') + '.md';
}
