// Trânsito da rua em frente ao lab e o voo dos drones de entrega: só as contas, para testar sem tela.

export type Rua = { faixas: number[]; ciclo?: number[]; x0: number; x1: number };
export type Tipo = 'carro' | 'moto' | 'bici';
/** v é a velocidade de cruzeiro em m/s, com sinal: positiva anda para +x. */
export type Veiculo = { sprite: string; tipo: Tipo; y: number; x: number; v: number; comp: number };

const FICHA: Record<Tipo, { v: [number, number]; comp: number }> = {
  carro: { v: [8.5, 12], comp: 5.2 },
  moto: { v: [10, 13.5], comp: 2.4 },
  bici: { v: [3.6, 5.2], comp: 2 },
};
/** Folga mínima entre dois veículos da mesma pista, em metros. */
export const FOLGA = 3;

/** Nome do sprite: tipo, número e para onde a frente aponta. Ex.: carro2_ida, moto0_volta. */
export function leSprite(nome: string): { tipo: Tipo; sentido: 1 | -1 } | null {
  const m = /^(carro|moto|bici)\d+_(ida|volta)$/.exec(nome);
  return m ? { tipo: m[1] as Tipo, sentido: m[2] === 'ida' ? 1 : -1 } : null;
}

/**
 * Monta a frota. Mão brasileira: quem vai para +x usa a pista de menor y, quem volta usa a outra.
 * Cada veículo só entra numa pista do sentido para onde a frente dele aponta, então ninguém anda de ré.
 * Carro e moto dividem as faixas da rua; bicicleta fica na ciclofaixa.
 */
export function criaTransito(rua: Rua, sprites: string[], sorteio: () => number = Math.random): Veiculo[] {
  const frota: Veiculo[] = [], L = rua.x1 - rua.x0;
  const pistas: { y: number; sentido: 1 | -1; tipos: Tipo[]; quantos: number }[] = [
    ...rua.faixas.slice(0, 2).map((y, i) => ({ y, sentido: (i === 0 ? 1 : -1) as 1 | -1, tipos: ['carro', 'carro', 'moto', 'carro'] as Tipo[], quantos: 4 })),
    ...(rua.ciclo ?? []).slice(0, 2).map((y, i) => ({ y, sentido: (i === 0 ? 1 : -1) as 1 | -1, tipos: ['bici'] as Tipo[], quantos: 2 })),
  ];
  pistas.forEach((p, np) => {
    const usados: Record<string, number> = {};
    for (let i = 0; i < p.quantos; i++) {
      const tipo = p.tipos[i % p.tipos.length];
      const opcoes = sprites.filter(s => { const l = leSprite(s); return l?.tipo === tipo && l.sentido === p.sentido; }).sort();
      if (!opcoes.length) continue;
      // roda as opções para a rua não repetir o mesmo carro, e desencontra as duas mãos
      const n = (usados[tipo] = (usados[tipo] ?? np) + 1), sprite = opcoes[n % opcoes.length];
      const [v0, v1] = FICHA[tipo].v;
      frota.push({ sprite, tipo, y: p.y, x: rua.x0 + L * ((i + 0.15 + sorteio() * 0.5) / p.quantos), v: p.sentido * (v0 + (v1 - v0) * sorteio()), comp: FICHA[tipo].comp });
    }
  });
  return frota;
}

/** Distância até o veículo à frente na mesma pista, já contando que a rua dá a volta. */
function aFrente(v: Veiculo, frota: Veiculo[], L: number): { lider: Veiculo; d: number } | null {
  let melhor: { lider: Veiculo; d: number } | null = null;
  for (const o of frota) {
    if (o === v || o.y !== v.y) continue;
    const d = ((((o.x - v.x) * Math.sign(v.v)) % L) + L) % L;
    if (!melhor || d < melhor.d) melhor = { lider: o, d };
  }
  return melhor;
}

/** Anda dt segundos. Quem alcança o da frente segura a velocidade em vez de atravessá-lo. */
export function passoDoTransito(frota: Veiculo[], rua: Rua, dt: number) {
  const L = rua.x1 - rua.x0;
  const vel = frota.map(v => {
    const f = aFrente(v, frota, L); let a = Math.abs(v.v);
    if (f) {
      const livre = f.d - (v.comp + f.lider.comp) / 2 - FOLGA;
      // perto do líder acompanha a velocidade dele; colado, só anda o que a folga deixa
      if (livre < 6) a = Math.min(a, Math.abs(f.lider.v));
      a = Math.min(a, Math.max(0, livre) / Math.max(dt, 1e-6));
    }
    return a;
  });
  frota.forEach((v, i) => {
    v.x += Math.sign(v.v) * vel[i] * dt;
    if (v.x > rua.x1) v.x -= L; else if (v.x < rua.x0) v.x += L;
  });
}

// ---------------- drones de entrega ----------------

export type Voo = { x: number; y: number; z: number; noAr: boolean };
type Ponto3 = [number, number, number];
const suave = (p: number) => p * p * (3 - 2 * p);
const entre = (a: Ponto3, b: Ponto3, p: number): Ponto3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];

export const ALTURA_DE_VOO = 9, ALTURA_DE_POUSO = 0.45;
/** Tempos do ciclo de entrega, em segundos: chega, desce, entrega, sobe, vai embora e some até a próxima. */
export const CICLO = { chega: 11, desce: 3, entrega: 3.5, sobe: 3, sai: 11, fora: 14 };
export const DURA_DO_CICLO = Object.values(CICLO).reduce((a, b) => a + b, 0);

/**
 * Onde o drone de entrega está no instante t. É uma função pura do tempo: vem da rua, pousa no ponto de entrega,
 * deixa o pacote, sobe e vai embora. Fica sempre fora do deck, para não passar por cima das mesas.
 */
export function vooDeEntrega(t: number, pouso: [number, number], lab: { X: number; Y: number }): Voo {
  const volta = Math.floor(t / DURA_DO_CICLO), u = t - volta * DURA_DO_CICLO;
  const acima: Ponto3 = [pouso[0], pouso[1], ALTURA_DE_VOO], chao: Ponto3 = [pouso[0], pouso[1], ALTURA_DE_POUSO];
  // entra por um lado da rua e sai pelo outro, trocando a cada entrega
  const lados: Ponto3[] = [[lab.X * 0.75, lab.Y + 22, ALTURA_DE_VOO + 3], [lab.X + 30, lab.Y + 16, ALTURA_DE_VOO + 3]];
  const de = lados[volta % 2], para = lados[(volta + 1) % 2];
  let p: Ponto3, noAr = true, a = u;
  if (a < CICLO.chega) p = entre(de, acima, suave(a / CICLO.chega));
  else if ((a -= CICLO.chega) < CICLO.desce) p = entre(acima, chao, suave(a / CICLO.desce));
  else if ((a -= CICLO.desce) < CICLO.entrega) p = chao;
  else if ((a -= CICLO.entrega) < CICLO.sobe) p = entre(chao, acima, suave(a / CICLO.sobe));
  else if ((a -= CICLO.sobe) < CICLO.sai) p = entre(acima, para, suave(a / CICLO.sai));
  else { p = para; noAr = false; }
  return { x: p[0], y: p[1], z: p[2], noAr };
}

/** Segundo drone: só cruza a rua lá no alto, de ponta a ponta, e some por um tempo. */
export function vooDePassagem(t: number, rua: Rua): Voo {
  const L = rua.x1 - rua.x0, dura = L / 9, ciclo = dura + 17, u = ((t + 20) % ciclo);
  const y = (rua.faixas[0] + (rua.faixas[1] ?? rua.faixas[0])) / 2 - 5;
  if (u > dura) return { x: rua.x0, y, z: ALTURA_DE_VOO + 2, noAr: false };
  return { x: rua.x1 - L * (u / dura), y, z: ALTURA_DE_VOO + 2, noAr: true };
}
