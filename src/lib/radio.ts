// Rádio V30: a música é composta aqui, nota por nota, e tocada no navegador. Não há arquivo de áudio nem obra de terceiros.
// Este arquivo só decide o que tocar e quando. Quem transforma nota em som é lib/tocador.ts.

export type Voz = 'acorde' | 'baixo' | 'melodia' | 'bumbo' | 'aro' | 'chimbal';
/** Uma nota dentro do compasso. `t` e `dur` contam em tempos; `forca` vai de 0 a 1. */
export type Nota = { t: number; dur: number; midi: number; voz: Voz; forca: number };
type Acorde = { baixo: number; notas: number[] };
export type Estacao = {
  id: string; nome: string; sobre: string;
  bpm: number;
  /** Quanto a segunda colcheia de cada tempo atrasa, de 0 (reto) a 0,33 (bem balançado). */
  balanco: number;
  /** Um acorde por compasso. A sequência se repete. */
  acordes: Acorde[];
  /** Notas de onde a melodia escolhe, do grave para o agudo. */
  escala: number[];
  /** Chance de a melodia tocar em cada colcheia. */
  melodia: number;
  levada: 'bossa' | 'lofi' | 'calma';
};

export const TEMPOS = 4;

// As três sequências são cadências de uso comum, escritas aqui em números de nota MIDI (60 é o dó central).
export const ESTACOES: Estacao[] = [
  {
    id: 'bossa', nome: 'Bossa da pista', sobre: 'Violão imaginário e aro de caixa. Para o lab acordar.', bpm: 132, balanco: 0, levada: 'bossa', melodia: 0.22,
    acordes: [{ baixo: 36, notas: [52, 55, 59, 62] }, { baixo: 45, notas: [49, 55, 59, 64] }, { baixo: 38, notas: [53, 57, 60, 64] }, { baixo: 43, notas: [53, 59, 64, 69] }],
    escala: [67, 69, 72, 74, 76, 79, 81],
  },
  {
    id: 'foco', nome: 'Foco', sobre: 'Batida lenta e piano elétrico. Para trabalho de cabeça baixa.', bpm: 76, balanco: 0.18, levada: 'lofi', melodia: 0.16,
    acordes: [{ baixo: 38, notas: [53, 57, 60, 64] }, { baixo: 43, notas: [53, 59, 64, 69] }, { baixo: 36, notas: [52, 55, 59, 62] }, { baixo: 45, notas: [52, 55, 60, 64] }],
    escala: [64, 67, 69, 72, 74, 76, 79],
  },
  {
    id: 'tarde', nome: 'Fim de tarde', sobre: 'Acordes longos, sem bateria. Para fechar o dia.', bpm: 60, balanco: 0, levada: 'calma', melodia: 0.12,
    acordes: [{ baixo: 41, notas: [57, 60, 64, 67] }, { baixo: 45, notas: [55, 59, 60, 64] }, { baixo: 38, notas: [53, 57, 60, 64] }, { baixo: 36, notas: [52, 55, 59, 62] }],
    escala: [72, 74, 76, 79, 81, 84],
  },
];

export const estacaoDe = (id: string): Estacao => ESTACOES.find(e => e.id === id) ?? ESTACOES[0];
/** A estação seguinte na lista, voltando para a primeira depois da última. */
export const proximaEstacao = (id: string): Estacao => ESTACOES[(ESTACOES.findIndex(e => e.id === id) + 1) % ESTACOES.length];

/** Sorteio que sempre dá a mesma sequência para a mesma semente: o compasso 12 de uma estação soa igual toda vez. */
export function sorteioDe(semente: number): () => number {
  let a = semente >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const semente = (e: Estacao, n: number) => e.id.split('').reduce((s, c) => s * 31 + c.charCodeAt(0), 7) + n * 977;

/** As notas do compasso de número n, em ordem de tempo. */
export function compasso(e: Estacao, n: number): Nota[] {
  const ac = e.acordes[((n % e.acordes.length) + e.acordes.length) % e.acordes.length], sorte = sorteioDe(semente(e, n));
  const notas: Nota[] = [];
  const poe = (voz: Voz, t: number, dur: number, midi: number, forca: number) => notas.push({ voz, t, dur, midi, forca });
  const bloco = (t: number, dur: number, forca: number) => ac.notas.forEach((m, i) => poe('acorde', t + i * 0.015, dur, m, forca));

  if (e.levada === 'bossa') {
    // o desenho de dois compassos da bossa: o acorde e o aro batem fora do tempo, o baixo segura o um e o três
    const par = n % 2 === 0;
    for (const t of par ? [0, 1.5, 3] : [0.5, 2, 3.5]) bloco(t, 0.45, 0.7);
    poe('baixo', 0, 1.4, ac.baixo, 0.9); poe('baixo', 2, 1.3, ac.baixo + 7, 0.8); poe('baixo', 3.5, 0.45, ac.baixo, 0.6);
    for (const t of par ? [0, 1.5, 3] : [1, 2.5]) poe('aro', t, 0.1, 0, 0.7);
    for (let i = 0; i < 8; i++) poe('chimbal', i / 2, 0.1, 0, i % 2 ? 0.35 : 0.55);
  } else if (e.levada === 'lofi') {
    bloco(0, 3.6, 0.75);
    if (sorte() < 0.5) bloco(2.5, 1.2, 0.4);
    poe('baixo', 0, 1.6, ac.baixo, 0.9); poe('baixo', 2.5, 1.2, ac.baixo, 0.7);
    poe('bumbo', 0, 0.2, 0, 0.9); poe('bumbo', 2.5, 0.2, 0, 0.7);
    poe('aro', 1, 0.1, 0, 0.8); poe('aro', 3, 0.1, 0, 0.8);
    for (let i = 0; i < 8; i++) poe('chimbal', i / 2, 0.1, 0, i % 2 ? 0.3 : 0.5);
  } else {
    bloco(0, 4, 0.6);
    poe('baixo', 0, 3.8, ac.baixo, 0.7);
  }

  // melodia: poucas notas, perto da anterior, para soar como frase e não como sorteio
  let grau = Math.floor(sorte() * e.escala.length);
  for (let i = 0; i < TEMPOS * 2; i++) {
    if (sorte() >= e.melodia) continue;
    grau = Math.max(0, Math.min(e.escala.length - 1, grau + Math.round(sorte() * 4 - 2)));
    poe('melodia', i / 2, e.levada === 'calma' ? 2.5 : 0.9, e.escala[grau], 0.45 + sorte() * 0.3);
  }
  return notas.sort((a, b) => a.t - b.t);
}

/** Duração de um tempo e de um compasso, em segundos. */
export const segundosDoTempo = (e: Estacao) => 60 / e.bpm;
export const segundosDoCompasso = (e: Estacao) => TEMPOS * segundosDoTempo(e);

/** Em que segundo do compasso a nota soa, já com o balanço: a colcheia fora do tempo chega um pouco depois. */
export function quando(e: Estacao, t: number): number {
  const frac = t - Math.floor(t), fora = Math.abs(frac - 0.5) < 0.01;
  return (t + (fora ? e.balanco * 0.5 : 0)) * segundosDoTempo(e);
}

/** Frequência de uma nota MIDI, com o lá de 440 Hz. */
export const frequencia = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** O volume de quem escuta fica entre 0 e 1. Valor inválido cai no padrão. */
export const volumeValido = (v: unknown, padrao = 0.6): number => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : padrao);
