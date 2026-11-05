// Tipos e dados de exemplo compartilhados entre o Worker e a interface.
// Cliente aparece só por setor e situação. Nada aqui é dado real.
export type Estado = 'fila' | 'fazendo' | 'feito';
export type Cliente = { id: string; setor: string; situacao: string; fase: number };
export type Projeto = { id: string; cliente_id: string; nome: string; fase: number; dia: number; mesa: string | null };
export type Tarefa = { id: number; agente: string; titulo: string; detalhe: string; estado: Estado; projeto_id: string | null };
export type Reuniao = { id: number; titulo: string; pauta: string; dia: string; hora: string; participantes: string[]; projeto_id: string | null; status: 'agendada' | 'feita'; ata: string };
export type Decisao = { id: number; titulo: string; contexto: string; projeto_id: string | null; reuniao_id: number | null; criado_em: string };
export type Memoria = { id: number; agente: string; texto: string; origem: 'manual' | 'conversa'; criado_em: string };
export type EstadoLab = {
  clientes: Cliente[]; projetos: Projeto[]; tarefas: Tarefa[]; reunioes: Reuniao[]; decisoes: Decisao[];
  instrucoes: Record<string, string>; memorias: Memoria[]; conversas: number;
};

export const FASES = ['Diagnóstico', 'Co-criação', 'Execução', 'Legado'] as const;

export const SEMENTE: EstadoLab = {
  clientes: [
    { id: 'postos', setor: 'Rede regional de postos', situacao: 'Atendimento muda de turno para turno e a loja de conveniência não conversa com a pista', fase: 2 },
    { id: 'distribuidora', setor: 'Distribuidora regional de combustíveis', situacao: 'Equipe comercial sem rotina comum e pouca visibilidade do que funciona em cada praça', fase: 1 },
    { id: 'conveniencia', setor: 'Rede de lojas de conveniência', situacao: 'Turnover alto no balcão e padrão de loja que não se sustenta sem supervisão', fase: 0 },
  ],
  projetos: [
    { id: 'postos-piloto', cliente_id: 'postos', nome: 'Piloto de atendimento na pista e na loja', fase: 2, dia: 18, mesa: 'mesa_postos.webp' },
    { id: 'distribuidora-ritmo', cliente_id: 'distribuidora', nome: 'Ritmo comercial semanal', fase: 1, dia: 9, mesa: 'mesa_distribuidora.webp' },
    { id: 'conveniencia-padrao', cliente_id: 'conveniencia', nome: 'Padrão de balcão que se sustenta', fase: 0, dia: 3, mesa: 'mesa_conveniencia.webp' },
  ],
  tarefas: [
    { id: 1, agente: 'rosa', titulo: 'Desenhar a jornada do cliente da pista até o caixa da loja', detalhe: '', estado: 'feito', projeto_id: 'postos-piloto' },
    { id: 2, agente: 'beto', titulo: 'Roteiro de abordagem para o frentista oferecer a loja', detalhe: '', estado: 'fazendo', projeto_id: 'postos-piloto' },
    { id: 3, agente: 'max', titulo: 'Protótipo do checklist de turno no celular', detalhe: '', estado: 'fazendo', projeto_id: 'postos-piloto' },
    { id: 4, agente: 'lara', titulo: 'Definir o que medir na unidade piloto antes de escalar', detalhe: '', estado: 'fila', projeto_id: 'postos-piloto' },
    { id: 5, agente: 'rui', titulo: 'Agenda das quatro semanas de co-criação', detalhe: '', estado: 'feito', projeto_id: 'distribuidora-ritmo' },
    { id: 6, agente: 'caio', titulo: 'Mapear como cada praça conduz a semana comercial hoje', detalhe: '', estado: 'fazendo', projeto_id: 'distribuidora-ritmo' },
    { id: 7, agente: 'otto', titulo: 'Rascunho do painel semanal do gerente comercial', detalhe: '', estado: 'fila', projeto_id: 'distribuidora-ritmo' },
    { id: 8, agente: 'lia', titulo: 'Roteiro de entrevistas com gerentes de loja e atendentes', detalhe: '', estado: 'fazendo', projeto_id: 'conveniencia-padrao' },
    { id: 9, agente: 'nina', titulo: 'Levantar onde o padrão de balcão quebra no dia a dia', detalhe: '', estado: 'fila', projeto_id: 'conveniencia-padrao' },
    { id: 10, agente: 'iara', titulo: 'Ajustar o tom de voz dos posts da semana', detalhe: '', estado: 'fila', projeto_id: null },
  ],
  reunioes: [
    { id: 1, titulo: 'Ritual semanal do piloto', pauta: 'O que mudou na pista e na loja, o que travou, próxima semana', dia: '2026-11-09', hora: '09:30', participantes: ['rosa', 'beto', 'max', 'lara'], projeto_id: 'postos-piloto', status: 'agendada', ata: '' },
    { id: 2, titulo: 'Kickoff do diagnóstico', pauta: 'Escopo, quem entrevistar, calendário', dia: '2026-11-03', hora: '14:00', participantes: ['lia', 'nina', 'rui'], projeto_id: 'conveniencia-padrao', status: 'feita', ata: 'Escopo fechado nas lojas de maior turnover. Entrevistas começam na quinta.' },
  ],
  decisoes: [
    { id: 1, titulo: 'Diagnóstico começa pelas lojas de maior turnover', contexto: 'É onde o padrão quebra primeiro e o aprendizado chega mais rápido.', projeto_id: 'conveniencia-padrao', reuniao_id: 2, criado_em: '2026-11-03 15:10:00' },
  ],
  instrucoes: {},
  memorias: [
    { id: 1, agente: 'lia', texto: 'Na rede de conveniência, falar com o atendente antes do gerente. O gerente tende a contar a versão do manual.', origem: 'manual', criado_em: '2026-11-03 16:00:00' },
  ],
  conversas: 0,
};
