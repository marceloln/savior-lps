import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { criaProjecao, velocidadeDoArrasto, zoomDaRoda } from './projecao';
import type { DadosLab } from './lab';

const lab = JSON.parse(readFileSync(new URL('../../public/assets/lab.json', import.meta.url), 'utf8')) as DadosLab;

describe('projeção do lab', () => {
  it('ir ao pixel e voltar ao chão dá o mesmo ponto', () => {
    const proj = criaProjecao(lab), [px, py] = proj.px(12.3, 7.8);
    const c = proj.chao(px, py);
    expect(c.x).toBeCloseTo(12.3); expect(c.y).toBeCloseTo(7.8);
  });
});

describe('zoom da roda', () => {
  it('rolar para cima aproxima, para baixo afasta, e ida e volta dão no mesmo zoom', () => {
    expect(zoomDaRoda(1, -100)).toBeCloseTo(Math.exp(0.15));
    expect(zoomDaRoda(1, 100)).toBeLessThan(1);
    expect(zoomDaRoda(zoomDaRoda(2, -100), 100)).toBeCloseTo(2);
  });
  it('um giro enorme vale no máximo 120', () => {
    expect(zoomDaRoda(1, -5000)).toBeCloseTo(zoomDaRoda(1, -120));
    expect(zoomDaRoda(1, 5000)).toBeCloseTo(zoomDaRoda(1, 120));
  });
  it('trackpad com delta pequeno anda pouco', () => {
    expect(zoomDaRoda(1, -2)).toBeCloseTo(1.003, 3);
  });
});

describe('inércia do arrasto', () => {
  const reta = (v: number, ate: number) => Array.from({ length: 11 }, (_, i) => ({ t: ate - 160 + i * 16, x: (i * 16) / 1000 * v, y: 0 }));
  it('mede a velocidade dos últimos 80 ms', () => {
    const r = velocidadeDoArrasto(reta(800, 1000), 1000)!;
    expect(r.vx).toBeCloseTo(800); expect(r.vy).toBeCloseTo(0);
  });
  it('ignora o que veio antes da janela', () => {
    // começou rápido e terminou devagar: vale o fim
    const am = [{ t: 0, x: 0, y: 0 }, { t: 50, x: 500, y: 0 }, { t: 130, x: 510, y: 0 }, { t: 160, x: 513, y: 0 }, { t: 190, x: 516, y: 0 }];
    expect(velocidadeDoArrasto(am, 200)!.vx).toBeCloseTo(100);
  });
  it('devagar ou parado antes de soltar não desliza', () => {
    expect(velocidadeDoArrasto(reta(50, 1000), 1000)).toBeNull();
    expect(velocidadeDoArrasto(reta(800, 1000), 1200)).toBeNull();
    expect(velocidadeDoArrasto([{ t: 990, x: 0, y: 0 }], 1000)).toBeNull();
  });
  it('tem teto de 3000 px/s e mantém a direção', () => {
    const am = [{ t: 960, x: 0, y: 0 }, { t: 1000, x: 240, y: 320 }]; // 10000 px/s
    const r = velocidadeDoArrasto(am, 1000)!;
    expect(Math.hypot(r.vx, r.vy)).toBeCloseTo(3000);
    expect(r.vy / r.vx).toBeCloseTo(320 / 240);
  });
});
