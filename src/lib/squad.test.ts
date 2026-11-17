import { describe, it, expect } from 'vitest';
import { fimDoSquad, noSquad, podeReceber } from './squad';
import type { Projeto } from './dados';

const P = (id: string, inicio: string): Projeto => ({ id, cliente_id: 'c', nome: 'Projeto ' + id, fase: 0, dia: 1, mesa: null, inicio });
const projetos = [P('pista', '2026-11-01'), P('balcao', '2026-09-01')];

describe('squad do convidado', () => {
  it('o squad vale até o trigésimo dia do ciclo do projeto', () => {
    expect(fimDoSquad(projetos[0])).toBe('2026-11-30');
    expect(noSquad({ projeto_id: 'pista' }, projetos, '2026-11-30')?.id).toBe('pista');
    expect(noSquad({ projeto_id: 'pista' }, projetos, '2026-12-01')).toBeNull();
  });
  it('sem projeto, com ciclo vencido ou com projeto apagado, o convidado é do lab todo', () => {
    expect(noSquad({ projeto_id: null }, projetos, '2026-11-17')).toBeNull();
    expect(noSquad({}, projetos, '2026-11-17')).toBeNull();
    expect(noSquad({ projeto_id: 'balcao' }, projetos, '2026-11-17')).toBeNull();
    expect(noSquad({ projeto_id: 'sumiu' }, projetos, '2026-11-17')).toBeNull();
  });
  it('quem está no squad só recebe missão de pedido do projeto dele', () => {
    const lia = { projeto_id: 'pista' };
    expect(podeReceber(lia, 'pista', projetos, '2026-11-17')).toBe(true);
    expect(podeReceber(lia, 'balcao', projetos, '2026-11-17')).toBe(false);
    expect(podeReceber(lia, null, projetos, '2026-11-17')).toBe(false);
    expect(podeReceber(lia, null, projetos, '2026-12-05')).toBe(true);
    expect(podeReceber({ projeto_id: null }, 'balcao', projetos, '2026-11-17')).toBe(true);
  });
});
