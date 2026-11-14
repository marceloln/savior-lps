// Respostas de exemplo quando não há modelo de IA por trás: a prévia sem servidor e os testes de ponta a ponta.
// Nada aqui finge ser análise de verdade. Toda entrega simulada diz que é simulada.
import type { MissaoProposta } from './dados';
import type { Membro } from './equipe';

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const palavras = (t: string) => norm(t).split(/[^a-z0-9]+/).filter(p => p.length >= 4);

/** Escolhe até três pessoas cujo papel conversa com o pedido. Sem coincidência, vão as duas primeiras da lista. */
export function planoSimulado(texto: string, equipe: Membro[]): MissaoProposta[] {
  const pedido = new Set(palavras(texto));
  const pontos = equipe.map(m => ({ m, n: palavras(m.papel).filter(p => [...pedido].some(q => q.startsWith(p.slice(0, 5)) || p.startsWith(q.slice(0, 5)))).length }));
  let escolhidos = pontos.filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.m);
  if (!escolhidos.length) escolhidos = equipe.slice(0, 2);
  const curto = texto.trim().replace(/\s+/g, ' ').slice(0, 70);
  return escolhidos.map(m => ({ agente: m.id, titulo: `${m.papel}: ${curto}`.slice(0, 120), detalhe: `Entregar a parte de ${norm(m.papel)} do pedido, em uma página, com próximo passo e dono.` }));
}

export function entregaSimulada(nome: string, papel: string, titulo: string): string {
  return [
    `## ${titulo}`,
    '',
    `**Entrega simulada.** Aqui ${nome}, ${papel.toLowerCase()}, escreveria o resultado desta missão usando o modelo de IA escolhido para ela.`,
    '',
    '### O que viria nesta entrega',
    '- A resposta ao que a missão pede, no formato combinado no detalhe.',
    '- O que falta saber, em vez de número ou nome inventado.',
    '- Próximo passo com dono e data.',
    '',
    'Com a chave de um provedor de IA ligada no Worker, este texto dá lugar à entrega de verdade.',
  ].join('\n');
}

export function sinteseSimulada(texto: string, partes: { nome: string; titulo: string }[]): string {
  return [
    '## Síntese do pedido',
    '',
    `**Síntese simulada.** Pedido: ${texto.trim().slice(0, 200)}`,
    '',
    '### Quem entregou o quê',
    ...partes.map(p => `- **${p.nome}**: ${p.titulo}`),
    '',
    'Com um provedor de IA ligado, a orquestração junta as entregas em uma resposta só, com o que fazer agora.',
  ].join('\n');
}
