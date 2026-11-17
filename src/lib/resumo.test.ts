import { describe, it, expect } from 'vitest';
import { SEMENTE, type EstadoLab } from './dados';
import { EQUIPE } from './equipe';
import { cargaDaEquipe, clientesPorEtapa, decisoesPorProjeto, decisoesRecentes, notasPorPessoa, progressoPorProjeto, projetosEmCiclo, proximasReunioes, semNota, situacaoEquipe, skillsMaisTreinadas, trofeus, ultimosPedidos } from './resumo';

const vazio: EstadoLab = { ...SEMENTE, clientes: [], projetos: [], tarefas: [], reunioes: [], decisoes: [], memorias: [], conversas: 0 };

describe('resumos do diário', () => {
  it('clientes por etapa somam o total e cliente sem projeto fica em conversa', () => {
    const r = clientesPorEtapa(SEMENTE);
    expect(r.map(x => x.etapa)).toEqual(['Em conversa', 'Diagnóstico', 'Co-criação', 'Execução', 'Legado']);
    expect(r.reduce((s, x) => s + x.n, 0)).toBe(SEMENTE.clientes.length);
    const so = { ...vazio, clientes: [{ id: 'c', setor: 'Rede', situacao: 'x', fase: 2 }] };
    expect(clientesPorEtapa(so)[0].n).toBe(1);
  });
  it('cada pessoa cai em um só grupo: fazendo, fila ou livre', () => {
    const ids = EQUIPE.map(e => e.id), s = situacaoEquipe(SEMENTE, ids);
    expect(s.fazendo + s.fila + s.livres.length).toBe(ids.length);
    const e = { ...vazio, tarefas: [{ id: 1, agente: 'lia', titulo: 'a', detalhe: '', estado: 'fazendo' as const, projeto_id: null, pedido_id: null, entrega: '', modelo: '' }, { id: 2, agente: 'lia', titulo: 'b', detalhe: '', estado: 'fila' as const, projeto_id: null, pedido_id: null, entrega: '', modelo: '' }] };
    expect(situacaoEquipe(e, ['lia', 'rui'])).toEqual({ fazendo: 1, fila: 0, livres: ['rui'] });
  });
  it('notas por pessoa em ordem decrescente', () => {
    const r = notasPorPessoa(SEMENTE);
    expect(r.reduce((s, x) => s + x.n, 0)).toBe(SEMENTE.memorias.length);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].n).toBeGreaterThanOrEqual(r[i].n);
  });
  it('próximas reuniões em ordem de dia e hora, sem as feitas', () => {
    const R = (id: number, dia: string, hora: string, status: 'agendada' | 'feita' = 'agendada') => ({ id, titulo: 't', pauta: '', dia, hora, participantes: [], projeto_id: null, status, ata: '' });
    const e = { ...vazio, reunioes: [R(1, '2026-11-20', '09:30'), R(2, '2026-11-18', '14:00'), R(3, '2026-11-18', '09:00'), R(4, '2026-11-10', '09:00', 'feita')] };
    expect(proximasReunioes(e).map(r => r.id)).toEqual([3, 2, 1]);
  });
  it('decisões da mais nova para a mais antiga', () => {
    const D = (id: number, criado_em: string) => ({ id, titulo: 't', contexto: '', projeto_id: null, reuniao_id: null, criado_em });
    const e = { ...vazio, decisoes: [D(1, '2026-11-01 10:00:00'), D(2, '2026-11-09 08:00:00'), D(3, '2026-11-05 12:00:00')] };
    expect(decisoesRecentes(e).map(d => d.id)).toEqual([2, 3, 1]);
  });
  it('troféus começam zerados num lab vazio', () => {
    expect(trofeus(vazio).every(t => t.atual === 0)).toBe(true);
  });
});

describe('blocos da página da esquerda', () => {
  const t = (id: number, agente: string, estado: 'fila' | 'fazendo' | 'feito', projeto_id: string | null = 'p1') => ({ id, agente, titulo: 't' + id, detalhe: '', estado, projeto_id, pedido_id: null, entrega: '', modelo: '' });
  const base: EstadoLab = {
    ...vazio,
    projetos: [{ id: 'p1', cliente_id: 'c', nome: 'Piloto da pista', fase: 2, dia: 1, mesa: null, inicio: '2026-11-01' }, { id: 'p2', cliente_id: 'c', nome: 'Ritmo comercial', fase: 1, dia: 1, mesa: null, inicio: '2026-11-15' }],
    tarefas: [t(1, 'lia', 'feito'), t(2, 'lia', 'fazendo'), t(3, 'rui', 'fila'), t(4, 'rui', 'fila'), t(5, 'otto', 'feito', 'p2'), t(6, 'otto', 'fila', null)],
  };
  it('progresso por projeto conta feitas sobre o total e ignora missão sem projeto', () => {
    expect(progressoPorProjeto(base)).toEqual([
      { id: 'p1', rotulo: 'Piloto da pista', valor: '1 de 4', parte: 0.25 },
      { id: 'p2', rotulo: 'Ritmo comercial', valor: '1 de 1', parte: 1 },
    ]);
  });
  it('carga da equipe: quem tem mais missão aberta primeiro, sem quem está livre', () => {
    const quem = [{ id: 'lia', nome: 'Lia' }, { id: 'rui', nome: 'Rui' }, { id: 'otto', nome: 'Otto' }, { id: 'nina', nome: 'Nina' }];
    expect(cargaDaEquipe(base, quem)).toEqual([
      { id: 'rui', rotulo: 'Rui', valor: '2 abertas', parte: 1 },
      { id: 'lia', rotulo: 'Lia', valor: '1 aberta', parte: 0.5 },
      { id: 'otto', rotulo: 'Otto', valor: '1 aberta', parte: 0.5 },
    ]);
  });
  it('últimos pedidos do mais novo para o mais velho', () => {
    const e = { ...vazio, pedidos: [
      { id: 1, texto: 'Velho', projeto_id: null, estado: 'entregue' as const, sintese: '', criado_em: '2026-11-10 10:00:00' },
      { id: 2, texto: 'Novo', projeto_id: null, estado: 'andando' as const, sintese: '', criado_em: '2026-11-16 09:00:00' },
    ] };
    expect(ultimosPedidos(e)).toEqual([{ id: '2', rotulo: 'Novo', valor: 'Andando' }, { id: '1', rotulo: 'Velho', valor: 'Entregue' }]);
  });
  it('skills mais treinadas contam pessoas, sem as que valem para todos', () => {
    const e = { ...vazio, skills: [{ id: 'a', nome: 'Alfa', para_todos: false }, { id: 'b', nome: 'Beta', para_todos: false }, { id: 'v', nome: 'Método', para_todos: true }] as EstadoLab['skills'], vinculos: { lia: ['a', 'b', 'v'], rui: ['a'] } };
    expect(skillsMaisTreinadas(e)).toEqual([{ id: 'a', rotulo: 'Alfa', valor: '2 pessoas', parte: 1 }, { id: 'b', rotulo: 'Beta', valor: '1 pessoa', parte: 0.5 }]);
  });
  it('decisões por projeto, com as sem projeto no fim', () => {
    const d = (id: number, projeto_id: string | null) => ({ id, titulo: 'd', contexto: '', projeto_id, reuniao_id: null, criado_em: '2026-11-16 10:00:00' });
    expect(decisoesPorProjeto({ ...base, decisoes: [d(1, 'p1'), d(2, 'p1'), d(3, null), d(4, 'p2')] })).toEqual([
      { id: 'p1', rotulo: 'Piloto da pista', valor: '2' }, { id: 'p2', rotulo: 'Ritmo comercial', valor: '1' }, { id: '', rotulo: 'Sem projeto', valor: '1' }]);
  });
  it('quem ainda não tem nota na memória', () => {
    const e = { ...vazio, memorias: [{ id: 1, agente: 'lia', texto: 'x', origem: 'manual' as const, criado_em: '' }] };
    expect(semNota(e, [{ id: 'lia', nome: 'Lia' }, { id: 'rui', nome: 'Rui' }])).toEqual([{ id: 'rui', rotulo: 'Rui', valor: '' }]);
  });
  it('projetos em ciclo mostram o dia de 30', () => {
    expect(projetosEmCiclo(base, '2026-11-16')).toEqual([
      { id: 'p1', rotulo: 'Piloto da pista', valor: 'dia 16 de 30', parte: 16 / 30 },
      { id: 'p2', rotulo: 'Ritmo comercial', valor: 'dia 2 de 30', parte: 2 / 30 },
    ]);
  });
});
