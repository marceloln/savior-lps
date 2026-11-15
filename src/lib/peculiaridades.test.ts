import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { APARENCIAS, EQUIPE } from './equipe';
import { cartoesDoMural, peculiaridadeDe, quadrosDaMesa } from './peculiaridades';

const pasta = new URL('../../public/assets/mesa/', import.meta.url);
const mesas = JSON.parse(readFileSync(new URL('mesas.json', pasta), 'utf8')) as Record<string, number>;

describe('peculiaridades da equipe', () => {
  it('cada especialista da equipe de partida tem frase, manias, objetos e mural', () => {
    for (const m of EQUIPE) {
      const p = peculiaridadeDe(m.id);
      expect(p, m.id).not.toBeNull();
      expect(p!.frase.length, m.id).toBeGreaterThan(10);
      expect(p!.manias.length, m.id).toBeGreaterThanOrEqual(2);
      expect(p!.mesa, m.id).toContain('Foto da família');
      expect(p!.mesa.length, m.id).toBeGreaterThanOrEqual(3);
      expect(cartoesDoMural(p!).length, m.id).toBeGreaterThanOrEqual(3);
    }
  });
  it('o texto segue a regra da casa: sem travessão e sem aspas', () => {
    for (const m of EQUIPE) {
      const p = peculiaridadeDe(m.id)!, tudo = [p.frase, ...p.manias, ...p.mesa, p.mural.titulo, ...cartoesDoMural(p), ...p.mural.cartoes.flatMap(c => c.i ?? [])].join(' ');
      expect(tudo, m.id).not.toMatch(/[—–"“”']/);
    }
  });
  it('quem não é da equipe de partida não tem peculiaridade inventada', () => {
    expect(peculiaridadeDe('visita')).toBeNull();
    expect(peculiaridadeDe('alguem-novo')).toBeNull();
  });
  it('todo boneco tem a cena da mesa, e quem senta tem dois quadros', () => {
    for (const a of APARENCIAS) {
      const q = quadrosDaMesa(a, mesas);
      expect(q.length, a).toBeGreaterThanOrEqual(1);
      for (const arq of q) expect(existsSync(new URL(arq.replace('assets/mesa/', ''), pasta)), arq).toBe(true);
    }
    for (const m of EQUIPE.filter(e => e.id !== 'clara')) expect(mesas[m.id], m.id).toBe(2);
    expect(quadrosDaMesa('ninguem', mesas)).toEqual([]);
  });
});
