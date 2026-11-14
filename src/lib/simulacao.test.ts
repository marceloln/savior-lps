import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { avanca, criaSimulacao, MAX_FORA, MIN_FORA, PASSADA, quadroDoPasso, velocidadeNaRampa } from './simulacao';
import { agentesBase } from './equipe';
import type { DadosLab } from './lab';

const lab = JSON.parse(readFileSync(new URL('../../public/assets/lab.json', import.meta.url), 'utf8')) as DadosLab;

describe('ritmo do lab', () => {
  it('a maioria trabalha na mesa e poucos circulam ao mesmo tempo', () => {
    const sim = criaSimulacao(lab, agentesBase());
    let pior = 0, naMesa = 0, amostras = 0;
    for (let t = 0; t < 600; t += 0.1) {
      sim.passo(0.1);
      pior = Math.max(pior, sim.fora());
      naMesa += sim.agentes.filter(a => a.estado === 'mesa').length / sim.agentes.length; amostras++;
    }
    expect(pior).toBeLessThanOrEqual(MAX_FORA);
    expect(naMesa / amostras).toBeGreaterThan(0.8);
  });

  it('o lab nunca fica parado: quase sempre tem 2 ou 3 circulando', () => {
    const sim = criaSimulacao(lab, agentesBase());
    for (let t = 0; t < 30; t += 0.1) sim.passo(0.1);
    let ok = 0, n = 0;
    for (let t = 0; t < 600; t += 0.1) { sim.passo(0.1); if (sim.fora() >= MIN_FORA) ok++; n++; }
    expect(ok / n).toBeGreaterThan(0.9);
  });

  it('ordem do jogador não entra no limite de quem circula', () => {
    const sim = criaSimulacao(lab, agentesBase());
    const a = sim.agentes[3];
    sim.mover(a.id, { x: a.casa.x, y: a.casa.y + 2 });
    expect(sim.fora()).toBe(0);
  });
});

describe('passo no ritmo do chão', () => {
  it('o quadro sai da distância andada: uma passada inteira roda os 4 quadros', () => {
    expect(quadroDoPasso(0)).toBe(0);
    expect(quadroDoPasso(PASSADA * 0.26)).toBe(1);
    expect(quadroDoPasso(PASSADA * 0.51)).toBe(2);
    expect(quadroDoPasso(PASSADA * 0.76)).toBe(3);
    expect(quadroDoPasso(PASSADA * 1.01)).toBe(0);
  });

  it('parado no lugar a perna não mexe, por mais que o tempo passe', () => {
    const sim = criaSimulacao(lab, agentesBase());
    const a = sim.agentes.find(x => x.id === 'clara')!;
    for (let t = 0; t < 5; t += 0.05) sim.passo(0.05);
    expect(a.andado).toBe(0);
  });

  it('andado soma o deslocamento real e zera a cada saída', () => {
    const sim = criaSimulacao(lab, agentesBase());
    const a = sim.agentes[3], alvo = { x: a.casa.x, y: a.casa.y + 2 };
    sim.mover(a.id, alvo);
    let antes = { ...a.pos }, soma = 0;
    while (a.estado === 'andando') { sim.passo(1 / 60); soma += Math.hypot(a.pos.x - antes.x, a.pos.y - antes.y); antes = { ...a.pos }; }
    expect(a.andado).toBeCloseTo(soma, 6);
    expect(soma).toBeGreaterThan(1.9);
    sim.mover(a.id, { x: a.casa.x, y: a.casa.y });
    expect(a.andado).toBe(0);
  });
});

describe('rampa de velocidade', () => {
  it('sai e chega devagar, no meio anda a 1,35 m/s', () => {
    expect(velocidadeNaRampa(0, 5)).toBeCloseTo(1.35 * 0.35);
    expect(velocidadeNaRampa(5, 0)).toBeCloseTo(1.35 * 0.35);
    expect(velocidadeNaRampa(0.13, 5)).toBeCloseTo(1.35 * 0.675);
    expect(velocidadeNaRampa(2, 2)).toBeCloseTo(1.35);
  });
  it('nunca passa da velocidade de cruzeiro nem para antes de chegar', () => {
    for (let p = 0; p < 3; p += 0.07) for (let f = 0; f < 3; f += 0.07) {
      const v = velocidadeNaRampa(p, f);
      expect(v).toBeLessThanOrEqual(1.35); expect(v).toBeGreaterThan(0.4);
    }
  });
});

describe('sobra do deslocamento nas curvas', () => {
  it('a sobra de um trecho entra no trecho seguinte no mesmo passo', () => {
    const pos = { x: 0, y: 0 }, caminho = [{ x: 0.1, y: 0 }, { x: 0.1, y: 1 }];
    const r = avanca(pos, caminho, 0.3);
    expect(r.andou).toBeCloseTo(0.3);
    expect(pos.x).toBeCloseTo(0.1); expect(pos.y).toBeCloseTo(0.2);
    expect(caminho).toHaveLength(1);
    expect(r.dir).toBe(4); // já olha para o trecho novo, em +y
  });
  it('no fim do caminho para no ponto e devolve só o que andou', () => {
    const pos = { x: 0, y: 0 }, fim = { x: 0.5, y: 0 }, caminho = [fim];
    const r = avanca(pos, caminho, 2);
    expect(r.andou).toBeCloseTo(0.5);
    expect(pos).toEqual({ x: 0.5, y: 0 });
    expect(pos).not.toBe(fim); // não vira a mesma referência do ponto da rota
    expect(caminho).toHaveLength(0);
  });
  it('atravessa vários pontos curtos sem perder distância', () => {
    const pos = { x: 0, y: 0 }, caminho = [{ x: 0.05, y: 0 }, { x: 0.05, y: 0.05 }, { x: 0.1, y: 0.05 }, { x: 2, y: 0.05 }];
    expect(avanca(pos, caminho, 0.2).andou).toBeCloseTo(0.2);
    expect(pos.x).toBeCloseTo(0.15);
  });
});

describe('sentar, levantar e curvas', () => {
  it('levanta e fica de pé 0,22 s virado para a mesa antes de andar', () => {
    const sim = criaSimulacao(lab, agentesBase());
    const a = sim.agentes[3];
    expect(sim.pose(a)).toBe('digitar');
    sim.mover(a.id, { x: a.casa.x, y: a.casa.y + 2 });
    let t = 0;
    while (sim.pose(a) === 'parado' && t < 1) { expect(a.dir).toBe(a.dirCasa); expect(a.pos).toEqual(a.casa); sim.passo(0.01); t += 0.01; }
    expect(sim.pose(a)).toBe('andar');
    expect(t).toBeGreaterThanOrEqual(0.22); expect(t).toBeLessThan(0.26);
  });

  it('de volta à cadeira, vira para a mesa e fica de pé 0,22 s antes de sentar', () => {
    const sim = criaSimulacao(lab, agentesBase());
    const a = sim.agentes[3];
    sim.mover(a.id, { x: a.casa.x + 1.5, y: a.casa.y + 1.5 });
    const andando = () => a.estado === 'andando'; // em função, para o TypeScript não fixar o estado depois do laço
    while (andando()) sim.passo(0.01);
    a.espera = 0; // manda voltar já
    let dePe = 0, sentouVirado = true;
    for (let t = 0; t < 30 && a.estado !== 'mesa'; t += 0.01) {
      sim.passo(0.01);
      if (a.pos.x === a.casa.x && a.pos.y === a.casa.y && andando()) { expect(sim.pose(a)).toBe('parado'); if (a.dir === a.dirCasa) dePe += 0.01; }
    }
    if (a.dir !== a.dirCasa) sentouVirado = false;
    expect(a.estado).toBe('mesa');
    expect(sentouVirado).toBe(true);
    expect(dePe).toBeGreaterThanOrEqual(0.21); expect(dePe).toBeLessThan(0.26);
    expect(sim.pose(a)).toBe('digitar');
  });

  it('o corpo gira no máximo 45 graus a cada 0,06 s', () => {
    const sim = criaSimulacao(lab, agentesBase());
    const a = sim.agentes[3];
    sim.mover(a.id, { x: a.casa.x + 3, y: a.casa.y + 2 });
    let antes = a.dir, ultimo = -1;
    for (let t = 0; t < 12; t += 0.005) {
      sim.passo(0.005);
      if (a.dir !== antes) {
        const passos = Math.min((a.dir - antes + 8) % 8, (antes - a.dir + 8) % 8);
        expect(passos).toBe(1);
        if (ultimo >= 0) expect(t - ultimo).toBeGreaterThanOrEqual(0.055);
        ultimo = t; antes = a.dir;
      }
    }
    expect(ultimo).toBeGreaterThan(0); // girou pelo menos uma vez
  });
});
