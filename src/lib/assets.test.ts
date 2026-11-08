import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { EQUIPE } from './equipe';

const pasta = new URL('../../public/assets/', import.meta.url);
const gente = JSON.parse(readFileSync(new URL('gente8.json', pasta), 'utf8')) as { q: Record<string, number[]> };
const retratos = JSON.parse(readFileSync(new URL('retratos.json', pasta), 'utf8')) as string[];
const lab = JSON.parse(readFileSync(new URL('lab.json', pasta), 'utf8')) as { pontos: Record<string, unknown[]> };

describe('arte das pessoas', () => {
  it('cada pessoa da equipe anda, para e olha para as oito direções', () => {
    for (const m of EQUIPE) for (let d = 0; d < 8; d++) {
      for (const q of ['parado0', 'parado1', 'andar0', 'andar1', 'andar2', 'andar3']) expect(gente.q[`${m.id}_d${d}_${q}`], `${m.id}_d${d}_${q}`).toBeDefined();
    }
  });
  it('quem tem mesa aparece sentado digitando, com o pé do quadro na cadeira', () => {
    for (const m of EQUIPE.filter(e => e.id !== 'clara')) {
      expect(gente.q[`${m.id}_d0_digitar0`], m.id).toBeDefined();
      expect(gente.q[`${m.id}_d0_digitar1`], m.id).toBeDefined();
      expect(lab.pontos['mesa_' + m.zona]?.length, m.zona).toBeGreaterThan(0);
    }
  });
  it('cada pessoa tem rosto e foto na estação de trabalho', () => {
    for (const m of EQUIPE) {
      expect(retratos).toContain(m.id);
      expect(existsSync(new URL(`estacao/${m.id}.webp`, pasta)), m.id).toBe(true);
    }
  });
});
