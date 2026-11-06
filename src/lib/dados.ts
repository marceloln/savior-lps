// Tipos e dados de exemplo compartilhados entre o Worker e a interface.
// Cliente aparece só por setor e situação. Nada aqui é dado real.
export type Estado = 'fila' | 'fazendo' | 'feito';
export type Cliente = { id: string; setor: string; situacao: string; fase: number };
export type Projeto = { id: string; cliente_id: string; nome: string; fase: number; dia: number; mesa: string | null; inicio: string };
export type Tarefa = { id: number; agente: string; titulo: string; detalhe: string; estado: Estado; projeto_id: string | null };
export type Reuniao = { id: number; titulo: string; pauta: string; dia: string; hora: string; participantes: string[]; projeto_id: string | null; status: 'agendada' | 'feita'; ata: string };
export type Decisao = { id: number; titulo: string; contexto: string; projeto_id: string | null; reuniao_id: number | null; criado_em: string };
export type Memoria = { id: number; agente: string; texto: string; origem: 'manual' | 'conversa'; criado_em: string };
export type EstadoLab = {
  clientes: Cliente[]; projetos: Projeto[]; tarefas: Tarefa[]; reunioes: Reuniao[]; decisoes: Decisao[];
  instrucoes: Record<string, string>; memorias: Memoria[]; conversas: number;
};

export const FASES = ['Diagnóstico', 'Co-criação', 'Execução', 'Legado'] as const;

/** Primeiras missões de todo projeto novo: o diagnóstico já sai andando. */
export const missoesIniciais = (projeto: string): { agente: string; titulo: string }[] => [
  { agente: 'rui', titulo: `Kickoff e calendário do diagnóstico de ${projeto}` },
  { agente: 'lia', titulo: `Roteiro de entrevistas de campo para ${projeto}` },
  { agente: 'davi', titulo: `Referências do setor para ${projeto}` },
];

/** Soma dias a uma data AAAA-MM-DD. */
export function somaDias(data: string, n: number): string {
  const d = new Date(data + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}

/** Dia do ciclo de 30 dias: o dia de início é o dia 1. Fica entre 1 e 30. */
export function diaDoCiclo(inicio: string, hoje: string): number {
  const ms = Date.parse(hoje + 'T12:00:00Z') - Date.parse(inicio + 'T12:00:00Z');
  return Math.min(30, Math.max(1, Math.round(ms / 864e5) + 1));
}

export const hojeLocal = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

type Semente = Omit<EstadoLab, 'reunioes'> & { reunioes: (Reuniao & { decisao?: { titulo: string; contexto: string } })[] };

/**
 * História de exemplo do lab, contada a partir de hoje para nunca envelhecer.
 * Três projetos em fases diferentes e uma marca ainda em conversa com a Clara.
 * Cliente só por setor e situação, nenhum número de resultado.
 */
export function semente(hoje: string): Semente {
  // reunião e começo de projeto caem em dia útil: no passado recua para sexta, no futuro avança para segunda
  const d = (n: number) => {
    const x = somaDias(hoje, n), w = new Date(x + 'T12:00:00Z').getUTCDay();
    if (n === 0 || (w !== 0 && w !== 6)) return x;
    return n > 0 ? somaDias(x, w === 6 ? 2 : 1) : somaDias(x, w === 6 ? -1 : -2);
  };
  const ini = { postos: d(-17), distribuidora: d(-8), conveniencia: d(-2) };
  const P = (id: string, cliente_id: string, nome: string, fase: number, inicio: string, mesa: string): Projeto =>
    ({ id, cliente_id, nome, fase, inicio, dia: diaDoCiclo(inicio, hoje), mesa });
  let n = 0;
  const M = (agente: string, titulo: string, estado: Estado, projeto_id: string | null): Tarefa => ({ id: ++n, agente, titulo, detalhe: '', estado, projeto_id });
  let r = 0;
  const R = (titulo: string, pauta: string, dia: string, hora: string, participantes: string[], projeto_id: string | null, ata = '', decisao?: { titulo: string; contexto: string }) =>
    ({ id: ++r, titulo, pauta, dia, hora, participantes, projeto_id, status: ata ? 'feita' as const : 'agendada' as const, ata, decisao });
  const reunioes = [
    R('Kickoff do piloto', 'Escopo, unidade piloto e quem entrevistar', ini.postos, '14:00', ['rui', 'lia', 'rosa', 'beto'], 'postos-piloto',
      'Escopo fechado na pista e na loja da mesma unidade. Lia começa as entrevistas amanhã.',
      { titulo: 'Piloto começa por uma unidade com pista e loja movimentadas', contexto: 'Assim o roteiro é testado com fluxo de verdade dos dois lados.' }),
    R('Ritual semanal do piloto', 'O que mudou na pista e na loja, o que travou, próxima semana', d(-10), '09:30', ['rui', 'rosa', 'beto', 'max'], 'postos-piloto',
      'Jornada da pista ao caixa fechada. O checklist em papel some na troca de turno.',
      { titulo: 'Checklist de turno vai para o celular, não para o papel', contexto: 'Papel some na troca de turno e o celular fica com o gerente.' }),
    R('Ritual semanal do piloto', 'Teste do roteiro no turno da manhã e o que medir', d(-3), '09:30', ['rui', 'beto', 'max', 'lara'], 'postos-piloto',
      'Roteiro testado no turno da manhã. Frentista pediu algo mais curto. Lara começa a definir o que medir.',
      { titulo: 'Roteiro do frentista cabe em três frases', contexto: 'Na pista não dá tempo para mais. O teste da manhã mostrou isso.' }),
    R('Ritual semanal do piloto', 'Roteiro ajustado, checklist no celular e o que medir antes de escalar', d(4), '09:30', ['rui', 'rosa', 'beto', 'max', 'lara'], 'postos-piloto'),
    R('Kickoff da co-criação', 'Quais praças entram primeiro e como vai ser a semana de cada uma', ini.distribuidora, '10:00', ['rui', 'lia', 'caio', 'davi'], 'distribuidora-ritmo',
      'Diagnóstico das praças apresentado. Rotina muda muito de uma praça para outra.',
      { titulo: 'Co-criação começa pelas praças com rotina mais diferente', contexto: 'É ali que aparece o que precisa ser comum e o que pode variar.' }),
    R('Ritual semanal da co-criação', 'Como cada praça conduz a segunda-feira', d(-1), '10:00', ['rui', 'caio', 'nina', 'otto'], 'distribuidora-ritmo',
      'Cada gerente conduz a reunião de segunda do seu jeito. Ninguém compara uma semana com a outra.',
      { titulo: 'Reunião comercial de segunda passa a ter pauta fixa', contexto: 'Sem pauta comum não dá para comparar semana com semana nem praça com praça.' }),
    R('Ritual semanal da co-criação', 'Rotina de visita desenhada e primeiro rascunho do painel', d(6), '10:00', ['rui', 'caio', 'nina', 'otto', 'ana'], 'distribuidora-ritmo'),
    R('Kickoff do diagnóstico', 'Escopo, quem entrevistar, calendário', ini.conveniencia, '14:00', ['rui', 'lia', 'nina'], 'conveniencia-padrao',
      'Escopo fechado nas lojas de maior turnover. Entrevistas começam ainda esta semana.',
      { titulo: 'Diagnóstico começa pelas lojas de maior turnover', contexto: 'É onde o padrão quebra primeiro e o aprendizado chega mais rápido.' }),
    R('Primeira leitura do diagnóstico', 'O que as entrevistas mostraram até aqui', d(5), '15:00', ['rui', 'lia', 'nina', 'rosa'], 'conveniencia-padrao'),
    R('Briefing com a marca em conversa', 'Entender a operação das lojas e o que esperam da V30', d(1), '16:00', ['clara', 'caio', 'bela'], null),
  ];
  const decisoes: Decisao[] = reunioes.filter(x => x.decisao).map((x, i) => ({
    id: i + 1, titulo: x.decisao!.titulo, contexto: x.decisao!.contexto, projeto_id: x.projeto_id, reuniao_id: x.id, criado_em: x.dia + ' 18:00:00',
  })).reverse();
  let k = 0;
  const N = (agente: string, texto: string, quando: number): Memoria => ({ id: ++k, agente, texto, origem: 'manual', criado_em: d(quando) + ' 17:00:00' });
  return {
    clientes: [
      { id: 'postos', setor: 'Rede regional de postos', situacao: 'Atendimento muda de turno para turno e a loja de conveniência não conversa com a pista', fase: 2 },
      { id: 'distribuidora', setor: 'Distribuidora regional de combustíveis', situacao: 'Equipe comercial sem rotina comum e pouca visibilidade do que funciona em cada praça', fase: 1 },
      { id: 'conveniencia', setor: 'Rede de lojas de conveniência', situacao: 'Turnover alto no balcão e padrão de loja que não se sustenta sem supervisão', fase: 0 },
      { id: 'marca', setor: 'Marca de produto próprio com lojas físicas', situacao: 'A venda online cresce e a loja física não entrega a mesma experiência', fase: 0 },
    ],
    projetos: [
      P('postos-piloto', 'postos', 'Piloto de atendimento na pista e na loja', 2, ini.postos, 'mesa_postos.webp'),
      P('distribuidora-ritmo', 'distribuidora', 'Ritmo comercial semanal', 1, ini.distribuidora, 'mesa_distribuidora.webp'),
      P('conveniencia-padrao', 'conveniencia', 'Padrão de balcão que se sustenta', 0, ini.conveniencia, 'mesa_conveniencia.webp'),
    ],
    tarefas: [
      M('lia', 'Entrevistas com frentistas e atendentes da unidade piloto', 'feito', 'postos-piloto'),
      M('rosa', 'Jornada do cliente da pista até o caixa da loja', 'feito', 'postos-piloto'),
      M('davi', 'Referências de abordagem na pista em outras redes', 'feito', 'postos-piloto'),
      M('rui', 'Agenda das quatro semanas do piloto', 'feito', 'postos-piloto'),
      M('beto', 'Ajustar o roteiro de abordagem depois do teste da manhã', 'fazendo', 'postos-piloto'),
      M('max', 'Protótipo do checklist de turno no celular', 'fazendo', 'postos-piloto'),
      M('lara', 'Definir o que medir na unidade piloto antes de escalar', 'fazendo', 'postos-piloto'),
      M('theo', 'Material de treino para o turno da noite', 'fila', 'postos-piloto'),
      M('otto', 'Custo de levar o piloto para mais unidades', 'fila', 'postos-piloto'),
      M('nico', 'Registrar os aprendizados das duas primeiras semanas', 'fila', 'postos-piloto'),
      M('lia', 'Diagnóstico de como cada praça vende hoje', 'feito', 'distribuidora-ritmo'),
      M('rui', 'Agenda das quatro semanas de co-criação', 'feito', 'distribuidora-ritmo'),
      M('davi', 'Como outras distribuidoras organizam a semana comercial', 'feito', 'distribuidora-ritmo'),
      M('caio', 'Mapear como cada praça conduz a semana comercial', 'fazendo', 'distribuidora-ritmo'),
      M('nina', 'Desenhar a rotina de visita do vendedor', 'fazendo', 'distribuidora-ritmo'),
      M('otto', 'Rascunho do painel semanal do gerente comercial', 'fila', 'distribuidora-ritmo'),
      M('ana', 'Agente que monta a pauta da reunião de segunda', 'fila', 'distribuidora-ritmo'),
      M('rui', 'Kickoff e calendário do diagnóstico', 'feito', 'conveniencia-padrao'),
      M('lia', 'Roteiro de entrevistas com gerentes de loja e atendentes', 'fazendo', 'conveniencia-padrao'),
      M('nina', 'Levantar onde o padrão de balcão quebra no dia a dia', 'fila', 'conveniencia-padrao'),
      M('davi', 'Referências de padrão de balcão em redes de conveniência', 'fila', 'conveniencia-padrao'),
      M('rosa', 'Mapa dos momentos do cliente no balcão', 'fila', 'conveniencia-padrao'),
      M('clara', 'Briefing com a marca de produto próprio', 'fazendo', null),
      M('caio', 'Retorno ao contato da marca depois do briefing', 'fila', null),
      M('bela', 'Rascunho de proposta para a marca em conversa', 'fila', null),
      M('ana', 'Agente de briefing da Clara com perguntas por setor', 'fazendo', null),
      M('theo', 'Post da semana sobre rotina de troca de turno', 'fazendo', null),
      M('iara', 'Ajustar o tom de voz dos posts da semana', 'fila', null),
      M('duda', 'Organizar a fila de pedidos da semana', 'fazendo', null),
    ],
    reunioes,
    decisoes,
    instrucoes: {
      clara: 'Faça uma pergunta por vez. Feche setor, situação, dor principal e prazo antes de sugerir qualquer coisa.',
      rui: 'Responda com o próximo passo e quem é o dono. Nada de cronograma longo.',
      lia: 'Traga primeiro o que ouviu no campo e depois a sua leitura. Separe fato de hipótese.',
    },
    memorias: [
      N('lia', 'Na conveniência, falar com o atendente antes do gerente. O gerente tende a contar a versão do manual.', -2),
      N('lia', 'Entrevista na pista rende mais no meio do turno do que na troca.', -15),
      N('rosa', 'O cliente da pista decide se entra na loja antes de descer do carro.', -12),
      N('beto', 'Frentista aceita roteiro curto quando ajuda a escrever.', -3),
      N('max', 'Gerente de posto usa o celular o turno inteiro. Planilha fica para o fim do mês.', -10),
      N('rui', 'Ritual semanal fica de pé quando termina com uma decisão e um dono para cada próximo passo.', -10),
      N('caio', 'Cada praça chama a reunião de segunda de um jeito. Vale usar o nome que eles usam.', -1),
      N('nina', 'O padrão de balcão quebra primeiro no turno com menos supervisão.', -2),
      N('clara', 'A marca em conversa vende bem online e quer que a loja física entregue a mesma experiência.', -1),
    ].reverse(),
    conversas: 0,
  };
}

/** Exemplos usados pela prévia sem servidor. */
export const SEMENTE: EstadoLab = semente(hojeLocal());
