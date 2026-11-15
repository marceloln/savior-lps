// Pontos de partida para não começar de um campo em branco: missões por sala e modelos de skill. Sem tela.

const MISSOES: Record<string, string[]> = {
  estrategia: ['Montar o roteiro de entrevistas de campo', 'Resumir o que as entrevistas mostraram', 'Priorizar as dores por gravidade, urgência e tendência'],
  planejamento: ['Montar a pauta do ritual desta semana', 'Atualizar o plano das quatro semanas', 'Listar o que está travado e quem destrava'],
  comercial: ['Escrever a proposta do ciclo de 30 dias', 'Preparar o retorno ao contato do cliente', 'Mapear quem decide e o que cada um espera'],
  marca: ['Escrever o post da semana no tom da V30', 'Transformar um aprendizado de campo em artigo', 'Revisar o material no tom de voz'],
  trafego: ['Dividir este pedido entre a equipe', 'Conferir o que está parado na fila', 'Juntar as entregas da semana num resumo'],
  cx: ['Desenhar a jornada do cliente na loja', 'Escrever o roteiro de abordagem em passos curtos', 'Montar o checklist de abertura de turno'],
  produto: ['Prototipar o checklist no celular', 'Desenhar o agente que apoia o gerente', 'Testar o protótipo com uma unidade'],
  dados: ['Definir o que medir no piloto', 'Montar o painel semanal do gerente', 'Estimar o custo de levar para mais unidades'],
  arquivo: ['Registrar os aprendizados do ciclo', 'Organizar o que já foi entregue ao cliente', 'Escrever o resumo de passagem do projeto'],
  atendimento: ['Fazer o briefing do cliente novo', 'Confirmar o que ficou em aberto no briefing', 'Preparar a primeira conversa com o decisor'],
};
const GERAL = ['Resumir o andamento em uma página', 'Listar o que falta saber e quem responde', 'Propor o próximo passo com dono e data'];

/** Três missões prováveis para quem trabalha naquela sala. Sala sem lista própria recebe as gerais. */
export const sugestoesDeMissao = (zona: string): string[] => MISSOES[zona] ?? GERAL;

/** Esqueletos de skill para o sócio completar com o jeito V30 de fazer. */
export const MODELOS_DE_SKILL: { nome: string; descricao: string; conteudo: string }[] = [
  { nome: 'Proposta de ciclo de 30 dias', descricao: 'Como escrever a proposta de um ciclo, da dor ao que entregamos por semana.',
    conteudo: 'Quando usar\nSempre que um briefing fechar com dor, decisor e prazo.\n\nPassos\n1. Abrir pela dor, nas palavras do cliente.\n2. Dizer o que estará diferente ao fim dos 30 dias.\n3. Listar o que entregamos em cada semana.\n4. Dizer o que o cliente precisa pôr na mesa.\n\nNunca\nCitar número que ninguém mediu. Prometer resultado fora do ciclo.' },
  { nome: 'Ata do ritual semanal', descricao: 'Como registrar a reunião da semana para ela terminar em decisão.',
    conteudo: 'Quando usar\nDepois de todo ritual semanal de projeto.\n\nFormato\n1. O que foi feito desde o último ritual.\n2. O que travou e por quê.\n3. Decisões, cada uma com o motivo.\n4. Próximos passos, cada um com dono e data.\n\nNunca\nAta sem decisão. Próximo passo sem dono.' },
  { nome: 'Roteiro de diagnóstico de campo', descricao: 'Como preparar a visita às unidades antes de propor qualquer coisa.',
    conteudo: 'Quando usar\nNo começo de todo diagnóstico.\n\nPassos\n1. Definir quem ouvir em cada unidade.\n2. Escrever perguntas abertas, uma dor por pergunta.\n3. Listar o que observar na operação sem perguntar.\n4. Separar fato de hipótese no registro.\n\nNunca\nPergunta que já traz a resposta. Conclusão antes da segunda unidade.' },
  { nome: 'Devolutiva para a diretoria', descricao: 'Como apresentar o que foi visto no campo para quem decide.',
    conteudo: 'Quando usar\nNo fechamento do diagnóstico e no fim do ciclo.\n\nFormato\n1. A dor principal em uma frase.\n2. Três evidências do campo.\n3. O que propomos e o que custa não fazer.\n4. A decisão que pedimos hoje.\n\nNunca\nMais de uma página. Jargão que o gerente de loja não usaria.' },
];
