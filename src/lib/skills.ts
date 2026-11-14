// Skills de partida do lab. Texto que entra nas instruções do especialista. Os sócios editam e criam outras pela interface.
import type { Skill } from './dados';

export const SKILLS_BASE: Skill[] = [
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

/** Quem já começa com skill própria, além das que valem para todos. */
export const VINCULOS_BASE: Record<string, string[]> = { lia: ['diagnostico-gut'], rui: ['diagnostico-gut'] };

/** Monta o texto de uma skill a partir de um treino guiado: o que é a tarefa, como fazer e um exemplo de boa entrega. */
export function skillDeTreino(t: { tarefa: string; passos: string; exemplo: string }): { nome: string; descricao: string; conteudo: string } {
  const partes = [`Tarefa: ${t.tarefa.trim()}`, 'Como fazer:\n' + t.passos.trim()];
  if (t.exemplo.trim()) partes.push('Exemplo de boa entrega, para seguir o nível e o formato:\n' + t.exemplo.trim());
  return { nome: t.tarefa.trim().slice(0, 80), descricao: 'Treino dado por um sócio.', conteudo: partes.join('\n\n') };
}
