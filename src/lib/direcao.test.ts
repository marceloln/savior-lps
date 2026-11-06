import { describe, it, expect } from 'vitest';
import { direcaoDe, olharPara } from './direcao';

describe('direção das pessoas', () => {
  it('os quatro eixos do piso', () => {
    expect(direcaoDe(0, -1)).toBe(0);
    expect(direcaoDe(1, 0)).toBe(2);
    expect(direcaoDe(0, 1)).toBe(4);
    expect(direcaoDe(-1, 0)).toBe(6);
  });
  it('as diagonais', () => {
    expect(direcaoDe(1, -1)).toBe(1);
    expect(direcaoDe(1, 1)).toBe(3);
    expect(direcaoDe(-1, 1)).toBe(5);
    expect(direcaoDe(-1, -1)).toBe(7);
  });
  it('descer reto na tela usa a direção de frente para a câmera', () => {
    // a câmera fica em +x+y: andar para +x+y é vir para perto dela
    expect(direcaoDe(0.7, 0.7)).toBe(3);
  });
  it('olhar de um ponto para outro', () => {
    expect(olharPara({ x: 5, y: 5 }, { x: 5, y: 2 })).toBe(0);
  });
});
