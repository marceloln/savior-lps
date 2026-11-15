import { describe, it, expect } from 'vitest';
import { direcaoDe, giraUmPasso, olharPara } from './direcao';

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
  it('gira um passo por vez pelo lado mais curto', () => {
    expect(giraUmPasso(0, 2)).toBe(1);
    expect(giraUmPasso(0, 6)).toBe(7);
    expect(giraUmPasso(7, 1)).toBe(0);
    expect(giraUmPasso(1, 7)).toBe(0);
    expect(giraUmPasso(3, 3)).toBe(3);
  });
  it('meia-volta chega em 4 passos', () => {
    let d = 2, n = 0;
    while (d !== 6) { d = giraUmPasso(d, 6); n++; }
    expect(n).toBe(4);
  });
});
