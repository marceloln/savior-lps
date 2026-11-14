import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { criaSimulacao, MAX_FORA, MIN_FORA } from './simulacao';
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
