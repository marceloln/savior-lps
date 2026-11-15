// Briefing guiado pela Clara: os modelos por tipo de tarefa, a conversa que sai deles e o que o briefing vira no fim. Sem tela.

export type Passo = {
  id: string;
  /** Nome curto no roteiro e no resumo. */
  rotulo: string;
  pergunta: string;
  /** Direcionamento: o que uma boa resposta traz. */
  guia: string;
  /** Respostas prontas para tocar em vez de digitar. */
  opcoes?: string[];
  opcional?: boolean;
};
export type ModeloBriefing = { id: string; nome: string; para: string; abre: string; pedido: string; passos: Passo[] };

const SETOR: Passo = { id: 'setor', rotulo: 'Setor', pergunta: 'Em que setor é a operação?', guia: 'Setor e porte bastam. Aqui o cliente entra por setor e situação, nunca pelo nome.',
  opcoes: ['Rede de postos', 'Distribuidora regional de combustíveis', 'Rede de lojas de conveniência', 'Varejo com várias unidades', 'Marca própria com loja física'] };
const SITUACAO: Passo = { id: 'situacao', rotulo: 'Situação', pergunta: 'O que está acontecendo lá hoje?', guia: 'Conte como quem esteve na operação: o que se repete, onde trava e em que turno ou unidade aparece mais.' };
const DOR: Passo = { id: 'dor', rotulo: 'Dor principal', pergunta: 'Qual é a dor que mais pesa?', guia: 'Uma só. Se houver várias, escolha a que o cliente citaria primeiro.',
  opcoes: ['Falta de padrão entre unidades', 'Atendimento desorganizado', 'Turnover alto no time', 'Ruído entre matriz e loja', 'Pouca visibilidade do que funciona'] };
const PRAZO: Passo = { id: 'prazo', rotulo: 'Prazo', pergunta: 'Tem data que não pode passar?', guia: 'Vale reunião de diretoria, virada de mês ou evento. Se não houver, pode pular.', opcoes: ['Sem data fixa', 'Nos próximos 7 dias', 'Em até 30 dias'], opcional: true };

export const MODELOS_DE_BRIEFING: ModeloBriefing[] = [
  { id: 'diagnostico', nome: 'Diagnóstico', para: 'Entender a operação antes de propor qualquer coisa.', abre: 'Vamos montar o diagnóstico. Eu pergunto uma coisa por vez e a equipe sai com o roteiro de campo.',
    pedido: 'Montar o roteiro de diagnóstico de campo a partir deste briefing, com as perguntas, quem ouvir em cada unidade e o que observar na operação.',
    passos: [SETOR, SITUACAO, DOR,
      { id: 'unidades', rotulo: 'Unidades e pessoas', pergunta: 'Quantas unidades entram e quem a gente precisa ouvir?', guia: 'Número de unidades e os papéis: gerente, líder de turno, quem atende, quem decide na matriz.' },
      { id: 'decisor', rotulo: 'Quem decide', pergunta: 'Quem decide do lado de lá e o que essa pessoa espera ver?', guia: 'O cargo e a expectativa. Isso muda o formato da devolutiva.' },
      PRAZO] },
  { id: 'proposta', nome: 'Proposta', para: 'Transformar uma conversa em proposta de ciclo.', abre: 'Proposta boa cabe na realidade do cliente. Me ajuda a fechar os pontos e a Bela escreve.',
    pedido: 'Escrever a proposta de um ciclo de 30 dias a partir deste briefing, com a dor, o que entregamos em cada semana e o que o cliente precisa pôr na mesa.',
    passos: [SETOR, SITUACAO, DOR,
      { id: 'resultado', rotulo: 'Resultado esperado', pergunta: 'O que precisa estar diferente ao fim dos 30 dias?', guia: 'Diga o que o cliente vai ver funcionando. Sem número, se ninguém mediu ainda.' },
      { id: 'formato', rotulo: 'Formato', pergunta: 'Qual formato faz sentido?', guia: 'O ciclo de 30 dias, o acompanhamento depois dele, ou os dois em sequência.', opcoes: ['Ciclo de 30 dias', 'Acompanhamento contínuo', 'Ciclo e depois acompanhamento'] },
      { id: 'decisor', rotulo: 'Quem aprova', pergunta: 'Quem aprova a proposta e o que pesa para essa pessoa?', guia: 'Cargo e critério: custo, prazo, risco para a operação ou resultado rápido.' },
      PRAZO] },
  { id: 'ciclo', nome: 'Plano de 30 dias', para: 'Desenhar as quatro semanas de um projeto que já começou ou vai começar.', abre: 'Plano de 30 dias pede dono e ritmo semanal. Vamos por partes.',
    pedido: 'Desenhar o plano de 30 dias a partir deste briefing, semana a semana, com dono de cada entrega e como vamos saber que funcionou.',
    passos: [
      { id: 'projeto', rotulo: 'Projeto', pergunta: 'Qual projeto ou operação é?', guia: 'O nome do projeto no lab, ou setor e situação se ainda não existe.' },
      DOR,
      { id: 'piloto', rotulo: 'Onde testar', pergunta: 'Onde a gente testa primeiro?', guia: 'Uma unidade, um turno ou uma equipe. Piloto pequeno anda mais rápido.' },
      { id: 'time', rotulo: 'Time do cliente', pergunta: 'Quem do cliente entra na co-criação?', guia: 'Os papéis e quanto tempo por semana eles têm de verdade.' },
      { id: 'sinal', rotulo: 'Sinal de que funcionou', pergunta: 'Como vamos saber que funcionou?', guia: 'O que dá para observar ou contar na loja, mesmo sem sistema.' },
      PRAZO] },
  { id: 'treinamento', nome: 'Treinamento de equipe', para: 'Levar um padrão para quem atende, sem depender de supervisão.', abre: 'Treino que fica é o que o gerente consegue aplicar sozinho. Me conta para quem é.',
    pedido: 'Criar o material de treino a partir deste briefing, em passos curtos, com um roteiro que o gerente aplica sozinho e como conferir depois.',
    passos: [
      { id: 'publico', rotulo: 'Para quem', pergunta: 'Para quem é o treino?', guia: 'Função, turno e há quanto tempo estão na casa.', opcoes: ['Frentistas', 'Atendentes de loja', 'Líderes de turno', 'Gerentes de unidade', 'Vendedores externos'] },
      { id: 'padrao', rotulo: 'O que ensinar', pergunta: 'Qual é o padrão que precisa pegar?', guia: 'O comportamento, em uma frase. Por exemplo, abordagem na pista ou fechamento de caixa.' },
      { id: 'erro', rotulo: 'Onde escorrega', pergunta: 'Onde o time mais escorrega hoje?', guia: 'O erro que se repete. O material começa por ele.' },
      { id: 'aplica', rotulo: 'Quem aplica', pergunta: 'Quem aplica o treino e quanto tempo tem?', guia: 'Gerente, líder ou alguém da matriz, e se cabe em 15 minutos de troca de turno ou pede mais.' },
      PRAZO] },
  { id: 'conteudo', nome: 'Conteúdo', para: 'Post, artigo ou material com a voz da V30.', abre: 'Conteúdo nosso sai de coisa vivida. Me conta o que você quer dizer.',
    pedido: 'Escrever o conteúdo descrito neste briefing no tom de voz da V30, sem citar cliente pelo nome e sem número inventado.',
    passos: [
      { id: 'canal', rotulo: 'Canal', pergunta: 'Onde isso vai ser publicado?', guia: 'O canal define tamanho e ritmo.', opcoes: ['Post de LinkedIn', 'Artigo', 'E-mail para clientes', 'Apresentação'] },
      { id: 'tema', rotulo: 'Tema', pergunta: 'Qual é a ideia central?', guia: 'Uma frase que você diria numa conversa. Se precisar de três, ainda são três posts.' },
      { id: 'campo', rotulo: 'O que veio do campo', pergunta: 'Que situação real sustenta isso?', guia: 'O que você viu acontecer. Setor e situação, sem nome de cliente.' },
      { id: 'leitor', rotulo: 'Quem lê', pergunta: 'Quem precisa ler e o que essa pessoa faz depois?', guia: 'Diretor, gerente de operação ou dono de rede, e a ação que você espera.' },
      PRAZO] },
  { id: 'livre', nome: 'Outro pedido', para: 'Qualquer coisa que não cabe nos modelos acima.', abre: 'Sem modelo, então. Eu só preciso de quatro coisas para a equipe não chutar.',
    pedido: 'Atender o pedido descrito neste briefing.',
    passos: [
      { id: 'pedido', rotulo: 'O que precisa', pergunta: 'O que você precisa que a equipe entregue?', guia: 'O resultado na mão, não a tarefa. Por exemplo, uma pauta pronta em vez de pensar na reunião.' },
      { id: 'contexto', rotulo: 'Contexto', pergunta: 'O que a equipe precisa saber para não começar do zero?', guia: 'Projeto, cliente por setor e situação, e o que já foi tentado.' },
      { id: 'formato', rotulo: 'Formato', pergunta: 'Em que formato você quer receber?', guia: 'Escolha o que você consegue usar sem retrabalho.', opcoes: ['Texto de uma página', 'Lista de passos', 'Roteiro de reunião', 'Mensagem pronta para enviar'] },
      PRAZO] },
];

export const modeloDe = (id: string | null) => MODELOS_DE_BRIEFING.find(m => m.id === id) ?? null;

export type Respostas = Record<string, string>;
/** Valor que marca uma pergunta opcional deixada de lado. */
export const PULADO = '';

/** Índice do primeiro passo ainda sem resposta. Igual ao número de passos quando o briefing fechou. */
export function proximoPasso(m: ModeloBriefing, r: Respostas): number {
  const i = m.passos.findIndex(p => !(p.id in r));
  return i < 0 ? m.passos.length : i;
}

/** Resposta curta demais numa pergunta aberta: a Clara pede um exemplo antes de seguir. */
export function pedeExemplo(p: Passo, resposta: string): boolean {
  const t = resposta.trim();
  return !p.opcoes && !p.opcional && t.split(/\s+/).length < 4;
}

const REACOES = ['Anotado.', 'Fechado.', 'Boa, isso ajuda.', 'Entendi.', 'Certo.'];
export type FalaBriefing = { de: 'clara' | 'eu'; texto: string; passo?: string };

/** A conversa inteira, reconstruída do modelo e das respostas: abertura, cada pergunta com a resposta e a pergunta seguinte. */
export function falasDoBriefing(m: ModeloBriefing, r: Respostas): FalaBriefing[] {
  const falas: FalaBriefing[] = [{ de: 'clara', texto: m.abre }], ate = proximoPasso(m, r);
  m.passos.slice(0, ate + 1).forEach((p, i) => {
    const antes = i > 0 ? REACOES[(i - 1) % REACOES.length] + ' ' : '';
    falas.push({ de: 'clara', texto: antes + p.pergunta, passo: p.id });
    if (p.id in r) falas.push({ de: 'eu', texto: r[p.id] === PULADO ? 'Prefiro pular essa.' : r[p.id], passo: p.id });
  });
  if (ate === m.passos.length) falas.push({ de: 'clara', texto: 'Fechamos o briefing. Confere o resumo e me diz o que fazer com ele.' });
  return falas;
}

/** O briefing em markdown, com o que ficou em aberto dito às claras. */
export function resumoDoBriefing(m: ModeloBriefing, r: Respostas): string {
  const linhas = m.passos.map(p => `- **${p.rotulo}:** ${r[p.id]?.trim() ? r[p.id].trim() : 'não informado'}`);
  return [`## Briefing de ${m.nome.toLowerCase()}`, '', ...linhas].join('\n') + '\n';
}

/** O texto que vai para a orquestração: o que fazer e o briefing por baixo. Cabe no limite de um pedido. */
export function pedidoDoBriefing(m: ModeloBriefing, r: Respostas): string {
  const itens = m.passos.filter(p => r[p.id]?.trim()).map(p => `${p.rotulo}: ${r[p.id].trim()}`);
  return [m.pedido, '', 'Briefing', ...itens].join('\n').slice(0, 4000);
}

/** Setor e situação para abrir o cadastro do cliente, quando o modelo pergunta os dois. */
export function clienteDoBriefing(r: Respostas): { setor: string; situacao: string } | null {
  return r.setor?.trim() && r.situacao?.trim() ? { setor: r.setor.trim(), situacao: r.situacao.trim() } : null;
}
