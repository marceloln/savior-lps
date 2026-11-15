import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ALTURA_DE_POUSO, CICLO, DURA_DO_CICLO, FOLGA, criaTransito, leSprite, passoDoTransito, vooDeEntrega, vooDePassagem, type Rua } from './rua';

const rua: Rua = { faixas: [37.4, 40.6], ciclo: [34.95, 35.6], x0: -29, x1: 85 };
const SPRITES = ['carro0', 'carro1', 'carro2', 'carro3', 'moto0', 'moto1', 'bici0', 'bici1'].flatMap(b => [b + '_ida', b + '_volta']);
/** Sorteio repetível, para o teste dar sempre o mesmo trânsito. */
const sorteio = (semente = 7) => () => (semente = (semente * 16807) % 2147483647) / 2147483647;

describe('trânsito da rua', () => {
  it('ninguém anda de ré: a frente do sprite aponta para onde o veículo vai', () => {
    const frota = criaTransito(rua, SPRITES, sorteio());
    expect(frota.length).toBeGreaterThan(8);
    for (const v of frota) expect(Math.sign(v.v), v.sprite).toBe(leSprite(v.sprite)!.sentido);
  });
  it('mão brasileira: quem vai para +x usa a pista de menor y', () => {
    for (const v of criaTransito(rua, SPRITES, sorteio())) {
      const par = v.tipo === 'bici' ? rua.ciclo! : rua.faixas;
      expect(v.y, v.sprite).toBe(v.v > 0 ? par[0] : par[1]);
    }
  });
  it('tem carro, moto e bicicleta, e bicicleta só anda na ciclofaixa', () => {
    const frota = criaTransito(rua, SPRITES, sorteio());
    for (const t of ['carro', 'moto', 'bici']) expect(frota.some(v => v.tipo === t), t).toBe(true);
    for (const v of frota) expect(rua.ciclo!.includes(v.y), v.sprite).toBe(v.tipo === 'bici');
  });
  it('sem ciclofaixa não há bicicleta, e sem sprite não há veículo', () => {
    expect(criaTransito({ ...rua, ciclo: undefined }, SPRITES, sorteio()).some(v => v.tipo === 'bici')).toBe(false);
    expect(criaTransito(rua, [], sorteio())).toEqual([]);
    expect(criaTransito(rua, ['arvore0', 'drone0'], sorteio())).toEqual([]);
  });
  it('depois de dois minutos ninguém atravessou o da frente nem saiu da rua', () => {
    const frota = criaTransito(rua, SPRITES, sorteio(11)), L = rua.x1 - rua.x0;
    for (let i = 0; i < 120 * 30; i++) passoDoTransito(frota, rua, 1 / 30);
    for (const a of frota) {
      expect(a.x).toBeGreaterThanOrEqual(rua.x0); expect(a.x).toBeLessThanOrEqual(rua.x1);
      for (const b of frota) if (a !== b && a.y === b.y) {
        const d = Math.abs(a.x - b.x), volta = Math.min(d, L - d);
        expect(volta, `${a.sprite} e ${b.sprite}`).toBeGreaterThanOrEqual((a.comp + b.comp) / 2 + FOLGA - 0.01);
      }
    }
  });
  it('o trânsito anda: todo mundo sai do lugar no sentido certo', () => {
    const frota = criaTransito(rua, SPRITES, sorteio(3)), antes = frota.map(v => v.x);
    passoDoTransito(frota, rua, 0.1);
    frota.forEach((v, i) => expect(Math.sign(v.x - antes[i]) || Math.sign(v.v), v.sprite).toBe(Math.sign(v.v)));
  });
  it('os sprites que o Blender exporta cobrem as duas mãos de cada veículo', () => {
    const ancoras = Object.keys(JSON.parse(readFileSync(new URL('../../public/assets/vivos/ancoras.json', import.meta.url), 'utf8')));
    const veiculos = ancoras.filter(leSprite);
    expect(veiculos.length).toBeGreaterThan(0);
    for (const s of veiculos) expect(ancoras, s).toContain(s.endsWith('_ida') ? s.replace('_ida', '_volta') : s.replace('_volta', '_ida'));
    for (const t of ['carro', 'moto', 'bici']) expect(veiculos.some(s => s.startsWith(t)), t).toBe(true);
    expect(ancoras).toContain('drone0');
  });
});

describe('drones de entrega', () => {
  const pouso: [number, number] = [46.4, 21.8], lab = { X: 44, Y: 26 };
  it('pousa no ponto de entrega e fica lá enquanto entrega', () => {
    const t = CICLO.chega + CICLO.desce + CICLO.entrega / 2, v = vooDeEntrega(t, pouso, lab);
    expect([v.x, v.y, v.z]).toEqual([pouso[0], pouso[1], ALTURA_DE_POUSO]);
    expect(v.noAr).toBe(true);
  });
  it('nunca entra no chão nem passa por cima do deck', () => {
    for (let t = 0; t < DURA_DO_CICLO * 2; t += 0.1) {
      const v = vooDeEntrega(t, pouso, lab);
      expect(v.z).toBeGreaterThanOrEqual(ALTURA_DE_POUSO - 1e-9);
      expect(v.x > 0 && v.x < lab.X && v.y > 0 && v.y < lab.Y, `t=${t.toFixed(1)}`).toBe(false);
    }
  });
  it('voa sem dar salto enquanto está à vista', () => {
    let antes = vooDeEntrega(0, pouso, lab);
    for (let t = 0.05; t < DURA_DO_CICLO - CICLO.fora; t += 0.05) {
      const v = vooDeEntrega(t, pouso, lab);
      expect(Math.hypot(v.x - antes.x, v.y - antes.y, v.z - antes.z), `t=${t.toFixed(2)}`).toBeLessThan(0.6);
      antes = v;
    }
  });
  it('some entre uma entrega e outra e troca o lado de chegada', () => {
    expect(vooDeEntrega(DURA_DO_CICLO - 1, pouso, lab).noAr).toBe(false);
    const a = vooDeEntrega(0, pouso, lab), b = vooDeEntrega(DURA_DO_CICLO, pouso, lab);
    expect([a.x, a.y]).not.toEqual([b.x, b.y]);
  });
  it('o drone de passagem cruza a rua inteira, sempre no alto', () => {
    const xs: number[] = [];
    for (let t = 0; t < 60; t += 0.25) { const v = vooDePassagem(t, rua); if (v.noAr) { xs.push(v.x); expect(v.z).toBeGreaterThan(8); } }
    expect(Math.min(...xs)).toBeLessThan(rua.x0 + 5); expect(Math.max(...xs)).toBeGreaterThan(rua.x1 - 5);
  });
});
