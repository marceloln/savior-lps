import { describe, it, expect } from 'vitest';
import { MODELOS_DE_SKILL, sugestoesDeMissao } from './sugestoes';
import { EQUIPE } from './equipe';

describe('sugestões', () => {
  it('toda sala onde alguém trabalha oferece três missões, e sala desconhecida recebe as gerais', () => {
    for (const z of new Set(EQUIPE.map(e => e.zona))) expect(sugestoesDeMissao(z)).toHaveLength(3);
    expect(sugestoesDeMissao('sala-nova')[0]).toBe('Resumir o andamento em uma página');
  });
  it('todo modelo de skill já passa no mínimo do formulário e cabe no limite', () => {
    for (const m of MODELOS_DE_SKILL) { expect(m.nome.length).toBeGreaterThanOrEqual(3); expect(m.conteudo.length).toBeGreaterThan(20); expect(m.conteudo.length).toBeLessThan(6000); }
  });
});
