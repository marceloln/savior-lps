import { describe, it, expect } from 'vitest';
import { iniciaisDoSocio, nomeDoSocio } from './socio';

describe('sócio logado', () => {
  it('tira o nome da parte antes da arroba', () => {
    expect(nomeDoSocio('ana.paula@exemplo.com.br')).toBe('Ana Paula');
    expect(nomeDoSocio('RUI_souza-lima@exemplo.com')).toBe('Rui Souza Lima');
    expect(iniciaisDoSocio('ana.paula@exemplo.com.br')).toBe('AP');
    expect(iniciaisDoSocio('rui@exemplo.com')).toBe('R');
  });
  it('sem login, ou com valor que não é e-mail, vira visitante', () => {
    expect(nomeDoSocio(null)).toBe('Visitante');
    expect(nomeDoSocio('equipe')).toBe('Visitante');
    expect(iniciaisDoSocio(null)).toBe('?');
  });
});
