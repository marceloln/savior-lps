// O console é de trabalho: toda ação abre algo útil sobre a pessoa escolhida. Nada de mover boneco pelo piso.
import { describe, it, expect } from 'vitest';
import { ACOES } from './Diario';

describe('ações do console', () => {
  it('são as cinco de trabalho, nesta ordem', () => {
    expect(ACOES.map(a => a.id)).toEqual(['conversar', 'missao', 'perfil', 'memoria', 'reuniao']);
  });
  it('não tem mais o Mover', () => {
    expect(ACOES.some(a => a.nome === 'Mover')).toBe(false);
  });
});
