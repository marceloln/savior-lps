import { describe, it, expect } from 'vitest';
import { ESTACOES, TEMPOS, compasso, estacaoDe, frequencia, proximaEstacao, quando, segundosDoCompasso, sorteioDe, volumeValido } from './radio';

describe('estações da Rádio V30', () => {
  it('são três, com nome, descrição e andamento plausível', () => {
    expect(ESTACOES.map(e => e.id)).toEqual(['bossa', 'foco', 'tarde']);
    for (const e of ESTACOES) {
      expect(e.nome.length, e.id).toBeGreaterThan(2);
      expect(e.sobre, e.id).not.toMatch(/[—–"“”']/);
      expect(e.bpm, e.id).toBeGreaterThanOrEqual(50);
      expect(e.bpm, e.id).toBeLessThanOrEqual(140);
      expect(e.acordes.length, e.id).toBe(4);
    }
  });
  it('acha a estação pelo identificador e cai na primeira quando não conhece', () => {
    expect(estacaoDe('foco').nome).toBe('Foco');
    expect(estacaoDe('nada').id).toBe('bossa');
  });
  it('a próxima estação dá a volta na lista', () => {
    expect(proximaEstacao('bossa').id).toBe('foco');
    expect(proximaEstacao('tarde').id).toBe('bossa');
  });
});

describe('compasso', () => {
  it('toda nota cabe no compasso, em ordem de tempo, com força entre 0 e 1', () => {
    for (const e of ESTACOES) for (let n = 0; n < 16; n++) {
      const notas = compasso(e, n);
      expect(notas.length, e.id).toBeGreaterThan(4);
      for (let i = 0; i < notas.length; i++) {
        const x = notas[i];
        expect(x.t, `${e.id} ${n}`).toBeGreaterThanOrEqual(0);
        expect(x.t, `${e.id} ${n}`).toBeLessThan(TEMPOS);
        expect(x.dur).toBeGreaterThan(0);
        expect(x.forca).toBeGreaterThan(0);
        expect(x.forca).toBeLessThanOrEqual(1);
        if (i) expect(x.t).toBeGreaterThanOrEqual(notas[i - 1].t);
      }
    }
  });
  it('o mesmo compasso soa igual toda vez e compassos vizinhos diferem', () => {
    const e = estacaoDe('foco');
    expect(compasso(e, 12)).toEqual(compasso(e, 12));
    expect(compasso(e, 12)).not.toEqual(compasso(e, 13));
  });
  it('o acorde e o baixo seguem a sequência da estação, que se repete a cada quatro compassos', () => {
    for (const e of ESTACOES) for (let n = 0; n < 8; n++) {
      const ac = e.acordes[n % 4], notas = compasso(e, n);
      expect(new Set(notas.filter(x => x.voz === 'acorde').map(x => x.midi))).toEqual(new Set(ac.notas));
      expect(notas.find(x => x.voz === 'baixo')!.midi).toBe(ac.baixo);
    }
  });
  it('a melodia só usa notas da escala da estação e não enche o compasso', () => {
    for (const e of ESTACOES) for (let n = 0; n < 32; n++) {
      const mel = compasso(e, n).filter(x => x.voz === 'melodia');
      for (const x of mel) expect(e.escala, e.id).toContain(x.midi);
      expect(mel.length).toBeLessThanOrEqual(6);
    }
  });
  it('a bossa tem aro e chimbal e alterna o desenho de dois compassos; a estação calma não tem bateria', () => {
    const b = estacaoDe('bossa');
    const aro = (n: number) => compasso(b, n).filter(x => x.voz === 'aro').map(x => x.t);
    expect(aro(0)).toEqual([0, 1.5, 3]);
    expect(aro(1)).toEqual([1, 2.5]);
    expect(compasso(b, 0).filter(x => x.voz === 'chimbal')).toHaveLength(8);
    const calma = compasso(estacaoDe('tarde'), 3).map(x => x.voz);
    for (const v of ['bumbo', 'aro', 'chimbal']) expect(calma).not.toContain(v);
  });
  it('o foco tem bumbo no um e caixa no dois e no quatro', () => {
    const notas = compasso(estacaoDe('foco'), 0);
    expect(notas.filter(x => x.voz === 'bumbo')[0].t).toBe(0);
    expect(notas.filter(x => x.voz === 'aro').map(x => x.t)).toEqual([1, 3]);
  });
});

describe('tempo, afinação e volume', () => {
  it('o compasso dura quatro tempos no andamento da estação', () => {
    expect(segundosDoCompasso(estacaoDe('tarde'))).toBeCloseTo(4, 6);
    expect(segundosDoCompasso(estacaoDe('bossa'))).toBeCloseTo(240 / 132, 6);
  });
  it('o balanço atrasa só a colcheia fora do tempo', () => {
    const f = estacaoDe('foco'), s = 60 / f.bpm;
    expect(quando(f, 1)).toBeCloseTo(s, 6);
    expect(quando(f, 1.5)).toBeCloseTo((1.5 + 0.09) * s, 6);
    expect(quando(estacaoDe('bossa'), 1.5)).toBeCloseTo(1.5 * 60 / 132, 6);
    expect(quando(f, 3.5)).toBeLessThan(segundosDoCompasso(f));
  });
  it('o lá central vale 440 Hz e a oitava dobra', () => {
    expect(frequencia(69)).toBeCloseTo(440, 6);
    expect(frequencia(81)).toBeCloseTo(880, 6);
    expect(frequencia(60)).toBeCloseTo(261.63, 1);
  });
  it('o sorteio repete a sequência para a mesma semente e fica entre 0 e 1', () => {
    const a = sorteioDe(42), b = sorteioDe(42), c = sorteioDe(43);
    const va = [a(), a(), a()], vb = [b(), b(), b()];
    expect(va).toEqual(vb);
    expect(va).not.toEqual([c(), c(), c()]);
    for (const v of va) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });
  it('o volume fica entre 0 e 1 e valor inválido cai no padrão', () => {
    expect(volumeValido(0.3)).toBe(0.3);
    expect(volumeValido(4)).toBe(1);
    expect(volumeValido(-1)).toBe(0);
    expect(volumeValido('alto')).toBe(0.6);
    expect(volumeValido(NaN, 0.5)).toBe(0.5);
  });
});
