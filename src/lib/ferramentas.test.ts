import { describe, it, expect } from 'vitest';
import { chaveDaColuna, linhaDoTempo, mesDoCalendario, quadro, resumoDasTelas } from './ferramentas';
import { SEMENTE, type EstadoLab } from './dados';

const e: EstadoLab = { ...SEMENTE,
  projetos: [{ id: 'a', cliente_id: 'c', nome: 'Piloto', fase: 2, dia: 18, mesa: null, inicio: '2026-11-01' }, { id: 'b', cliente_id: 'c', nome: 'Ritmo', fase: 1, dia: 9, mesa: null, inicio: '2026-11-10' }],
  tarefas: [
    { id: 1, agente: 'lia', titulo: 'x', detalhe: '', estado: 'feito', projeto_id: 'a', pedido_id: null, entrega: '', modelo: '' },
    { id: 2, agente: 'rui', titulo: 'y', detalhe: '', estado: 'fazendo', projeto_id: 'a', pedido_id: null, entrega: '', modelo: '' },
    { id: 3, agente: 'rui', titulo: 'z', detalhe: '', estado: 'fila', projeto_id: null, pedido_id: null, entrega: '', modelo: '' }],
  reunioes: [{ id: 5, titulo: 'Ritual', pauta: '', dia: '2026-11-16', hora: '10:00', participantes: [], projeto_id: 'a', status: 'agendada', ata: '' }] };

describe('ferramentas', () => {
  it('quadro separa por estado e filtra por projeto ou pelo que é do lab', () => {
    expect(quadro(e).fazendo).toHaveLength(1);
    expect(quadro(e, 'a').fila).toHaveLength(0);
    expect(quadro(e, 'lab').fila.map(t => t.id)).toEqual([3]);
  });
  it('linha do tempo cobre do primeiro início ao último fim e põe hoje e as reuniões no lugar', () => {
    const l = linhaDoTempo(e, '2026-11-18');
    expect(l).toMatchObject({ de: '2026-11-01', dias: 39, hoje: 17 });
    expect(l.projetos[0]).toMatchObject({ desloca: 0, dia: 18, fim: '2026-11-30', feitas: 1, total: 2, fase: 'Execução' });
    expect(l.projetos[1]).toMatchObject({ desloca: 9, dia: 9 });
    expect(l.projetos[0].reunioes).toEqual([{ id: 5, titulo: 'Ritual', desloca: 15, feita: false }]);
    expect(l.semanas).toHaveLength(6);
  });
  it('linha do tempo marca ciclo que ainda não começou e ciclo que já acabou', () => {
    expect(linhaDoTempo(e, '2026-10-20').projetos[0].dia).toBe(0);
    expect(linhaDoTempo(e, '2026-12-20').projetos[0].dia).toBe(31);
    expect(linhaDoTempo({ ...e, projetos: [] }, '2026-11-18').projetos).toEqual([]);
  });
  it('calendário de novembro de 2026 tem cinco semanas, começa no domingo dia 1 e marca reunião, hoje e marcos', () => {
    const m = mesDoCalendario(e, 2026, 10, '2026-11-18');
    expect(m).toHaveLength(5);
    expect(m[0][0]).toMatchObject({ data: '2026-11-01', noMes: true, marcos: ['Começa Piloto'] });
    expect(m[2][1].reunioes.map(r => r.id)).toEqual([5]);
    expect(m[2][3].hoje).toBe(true);
    expect(m[4][1].marcos).toEqual(['Fecha Piloto']);
    expect(m[4][6]).toMatchObject({ data: '2026-12-05', noMes: false });
  });
  it('resumo das telas traz contagem do quadro, frações da linha e o mês com hoje e reunião marcados', () => {
    const r = resumoDasTelas(e, '2026-11-18');
    expect(r.quadro).toEqual({ fila: 1, fazendo: 1, feito: 1 });
    expect(r.linha.projetos[0]).toMatchObject({ de: 0, andou: 0.6 });
    expect(r.linha.hoje).toBeCloseTo(17.5 / 39);
    expect(r.calendario[2]).toEqual([0, 1, 0, 2, 0, 0, 0]);
    expect(r.calendario[4][6]).toBe(-1);
  });
});

describe('chaveDaColuna', () => {
  it('muda quando a missão troca de coluna e fica igual quando não troca', () => {
    expect(chaveDaColuna({ id: 7, estado: 'fila' })).not.toBe(chaveDaColuna({ id: 7, estado: 'fazendo' }));
    expect(chaveDaColuna({ id: 7, estado: 'feito' })).toBe(chaveDaColuna({ id: 7, estado: 'feito' }));
  });
  it('nunca repete entre missões diferentes, inclusive as de exemplo, que têm id negativo', () => {
    const chaves = new Set<number>();
    for (let id = -20; id <= 20; id++) for (const estado of ['fila', 'fazendo', 'feito'] as const) chaves.add(chaveDaColuna({ id, estado }));
    expect(chaves.size).toBe(41 * 3);
  });
});
