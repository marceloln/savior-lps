import { describe, it, expect } from 'vitest';
import { ATE, BOLA, CAMPO, PAUSA_DO_SAQUE, RAQUETE, novoPong, passoDoPong, type Pong } from './pong';

const fixo = (v: number) => () => v;
/** Jogo com a bola já solta, sem a pausa do saque. */
const solto = (bola: Pong['bola'], extra: Partial<Pong> = {}): Pong => ({ ...novoPong(fixo(0.5)), saque: 0, bola, ...extra });
const anda = (p: Pong, s: number, e = {}) => { for (let i = 0; i < s * 60; i++) passoDoPong(p, e, 1 / 60, fixo(0.5)); return p; };

describe('pong', () => {
  it('começa no meio, zero a zero, e espera o saque antes de soltar a bola', () => {
    const p = novoPong(fixo(0.5));
    expect(p.pontos).toEqual([0, 0]); expect(p.fim).toBe(0);
    expect([p.bola.x, p.bola.y]).toEqual([CAMPO.w / 2, CAMPO.h / 2]);
    anda(p, PAUSA_DO_SAQUE / 2);
    expect(p.bola.x).toBe(CAMPO.w / 2);
    anda(p, PAUSA_DO_SAQUE);
    expect(p.bola.x).not.toBe(CAMPO.w / 2);
  });
  it('a bola quica em cima e embaixo sem sair do campo', () => {
    const p = solto({ x: 80, y: 50, vx: 0.001, vy: -120 });
    for (let i = 0; i < 240; i++) { passoDoPong(p, {}, 1 / 60); expect(p.bola.y).toBeGreaterThanOrEqual(0); expect(p.bola.y).toBeLessThanOrEqual(CAMPO.h); }
    expect(p.pontos).toEqual([0, 0]);
  });
  it('a raquete devolve a bola mais rápida, sem passar do teto de velocidade', () => {
    const p = solto({ x: 30, y: 50, vx: -BOLA.v0, vy: 0 }, { esq: 50 });
    anda(p, 0.5);
    expect(p.bola.vx).toBeGreaterThan(0);
    expect(Math.hypot(p.bola.vx, p.bola.vy)).toBeCloseTo(BOLA.v0 * BOLA.ganho, 3);
    const q = solto({ x: 30, y: 50, vx: -BOLA.vmax, vy: 0 }, { esq: 50 });
    anda(q, 0.3);
    expect(Math.hypot(q.bola.vx, q.bola.vy)).toBeLessThanOrEqual(BOLA.vmax + 1e-6);
  });
  it('pegar na ponta da raquete manda a bola em diagonal', () => {
    const p = solto({ x: 30, y: 50 + RAQUETE.h / 2 - 1, vx: -BOLA.v0, vy: 0 }, { esq: 50 });
    anda(p, 0.5);
    expect(p.bola.vx).toBeGreaterThan(0); expect(p.bola.vy).toBeGreaterThan(20);
  });
  it('bola que passa pela raquete vale ponto para o outro lado e o jogo volta ao saque', () => {
    const p = solto({ x: 20, y: 90, vx: -BOLA.v0, vy: 0 }, { esq: 10 });
    anda(p, 0.5, { dir: 0 });
    expect(p.pontos).toEqual([0, 1]);
    expect([p.bola.x, p.bola.y]).toEqual([CAMPO.w / 2, CAMPO.h / 2]);
    expect(p.saque).toBeGreaterThan(0);
    expect(p.bola.vx).toBeLessThan(0);   // sai para o lado de quem levou o ponto
  });
  it('um quadro lento não deixa a bola atravessar a raquete', () => {
    const p = solto({ x: 40, y: 50, vx: -BOLA.vmax, vy: 0 }, { esq: 50 });
    passoDoPong(p, {}, 0.25);
    expect(p.pontos).toEqual([0, 0]); expect(p.bola.vx).toBeGreaterThan(0);
  });
  it('a raquete segue o ponteiro, obedece às teclas e não sai do campo', () => {
    const p = novoPong(fixo(0.5));
    passoDoPong(p, { alvo: 0 }, 0.1); expect(p.esq).toBeLessThan(CAMPO.h / 2); expect(p.esq).toBeGreaterThan(CAMPO.h / 2 - RAQUETE.vel * 0.1 - 0.01);
    anda(p, 3, { dir: -1 }); expect(p.esq).toBe(RAQUETE.h / 2);
    anda(p, 3, { dir: 1 }); expect(p.esq).toBe(CAMPO.h - RAQUETE.h / 2);
  });
  it('a máquina devolve bola fácil e perde bola rápida na diagonal', () => {
    const facil = solto({ x: 80, y: 50, vx: BOLA.v0, vy: 10 });
    anda(facil, 1.2); expect(facil.pontos).toEqual([0, 0]); expect(facil.bola.vx).toBeLessThan(0);
    const dificil = solto({ x: 80, y: 8, vx: 120, vy: 150 }, { dir: 12 });
    anda(dificil, 0.9); expect(dificil.pontos[0]).toBe(1);
  });
  it('acaba em sete pontos e para de andar', () => {
    const p = solto({ x: 150, y: 5, vx: BOLA.v0, vy: 0 }, { dir: 90, pontos: [ATE - 1, 3] });
    anda(p, 0.6);
    expect(p.fim).toBe(1); expect(p.pontos).toEqual([ATE, 3]);
    const antes = JSON.stringify(p); anda(p, 1, { dir: 1 }); expect(JSON.stringify(p)).toBe(antes);
  });
});
