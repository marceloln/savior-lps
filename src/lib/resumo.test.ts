import { describe, it, expect } from 'vitest';
import { SEMENTE, type EstadoLab } from './dados';
import { EQUIPE } from './equipe';
import { clientesPorEtapa, decisoesRecentes, notasPorPessoa, proximasReunioes, situacaoEquipe, trofeus } from './resumo';

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
