import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { criaProjecao } from './projecao';
import { criaGrade, rota, vistaLivre } from './rotas';
import { zonaEm, type DadosLab } from './lab';

const lab = JSON.parse(readFileSync(new URL('../../public/assets/lab.json', import.meta.url), 'utf8')) as DadosLab;

describe('projeção', () => {
  const p = criaProjecao(lab);
  it('ida e volta no chão devolve o mesmo ponto', () => {
    for (const [x, y] of [[5, 5], [22, 13], [40, 22]]) {
      const [qx, qy] = p.px(x, y);
      const c = p.chao(qx, qy);
      expect(c.x).toBeCloseTo(x, 6); expect(c.y).toBeCloseTo(y, 6);
    }
  });
  it('subir no eixo z sobe na tela', () => {
    expect(p.px(10, 10, 1)[1]).toBeLessThan(p.px(10, 10, 0)[1]);
  });
  it('quanto mais x e y, mais perto da câmera', () => {
    expect(p.profundidade(40, 22)).toBeLessThan(p.profundidade(5, 5));
  });
});

describe('rotas', () => {
  const g = criaGrade({ X: 10, Y: 10, obst: [[4, 0, 5, 8]] });
  it('caminho livre vai direto', () => {
    expect(rota(g, { x: 1, y: 1 }, { x: 3, y: 3 })).toEqual([{ x: 3, y: 3 }]);
  });
  it('desvia de um móvel no meio', () => {
    const c = rota(g, { x: 2, y: 2 }, { x: 7, y: 2 });
    expect(c.at(-1)).toEqual({ x: 7, y: 2 });
    let ant = { x: 2, y: 2 };
    for (const p of c.slice(0, -1)) { expect(vistaLivre(g, ant, p)).toBe(true); ant = p; }
    expect(c.some(p => p.y > 8)).toBe(true);
  });
  it('destino dentro de móvel termina no destino pedido', () => {
    expect(rota(g, { x: 1, y: 1 }, { x: 4.5, y: 4 }).at(-1)).toEqual({ x: 4.5, y: 4 });
  });
});

describe('zonas', () => {
  it('acha a área pelo ponto', () => {
    const [x, y, w, h] = lab.zonas.trafego;
    expect(zonaEm(lab, x + w / 2, y + h / 2)?.id).toBe('trafego');
    expect(zonaEm(lab, 0.1, 0.1)).toBeNull();
  });
});
