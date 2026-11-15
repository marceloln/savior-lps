import { describe, expect, it } from 'vitest';
import { clienteRepetido } from './clientes';

const base = [{ setor: 'Rede de postos', situacao: 'Turnover alto no turno da noite' }, { setor: 'Distribuidora regional', situacao: 'Equipe comercial sem rotina comum' }];

describe('clienteRepetido', () => {
  it('deixa passar setor que ainda não existe', () => {
    expect(clienteRepetido(base, 'Rede de farmácias', 'Fila no balcão')).toBeNull();
  });
  it('barra o mesmo setor com a mesma situação, sem ligar para maiúscula e espaço', () => {
    expect(clienteRepetido(base, '  rede de  POSTOS ', 'turnover alto no turno da noite')).toBe('igual');
  });
  it('só avisa quando o setor repete com outra situação', () => {
    expect(clienteRepetido(base, 'Rede de postos', 'Loja de conveniência não conversa com a pista')).toBe('mesmo-setor');
  });
  it('não acusa nada com setor em branco nem com lista vazia', () => {
    expect(clienteRepetido(base, '   ', 'qualquer')).toBeNull();
    expect(clienteRepetido([], 'Rede de postos', 'Turnover alto')).toBeNull();
  });
});
