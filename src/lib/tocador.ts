// Transforma as notas da Rádio V30 em som com a Web Audio. Cada voz é um sintetizador pequeno, feito de oscilador, ruído e filtro.
// Funciona em qualquer contexto de áudio, inclusive o que renderiza fora do tempo real, usado no teste do navegador.
import { compasso, frequencia, quando, segundosDoCompasso, type Estacao, type Nota } from './radio';

export type Mesa = { entrada: GainNode; eco: GainNode; volume: GainNode };

/** Monta a saída: tudo passa por um compressor leve e por um volume geral; a melodia ainda manda um pouco para um eco. */
export function criaMesa(ctx: BaseAudioContext, volume: number): Mesa {
  const geral = ctx.createGain(); geral.gain.value = volume;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  const entrada = ctx.createGain();
  entrada.connect(comp); comp.connect(geral); geral.connect(ctx.destination);
  const eco = ctx.createGain(); eco.gain.value = 0.22;
  const atraso = ctx.createDelay(1); atraso.delayTime.value = 0.34;
  const volta = ctx.createGain(); volta.gain.value = 0.32;
  const abafa = ctx.createBiquadFilter(); abafa.type = 'lowpass'; abafa.frequency.value = 1800;
  eco.connect(atraso); atraso.connect(abafa); abafa.connect(volta); volta.connect(atraso); abafa.connect(entrada);
  return { entrada, eco, volume: geral };
}

const ruidos = new WeakMap<BaseAudioContext, AudioBuffer>();
function ruido(ctx: BaseAudioContext): AudioBuffer {
  let b = ruidos.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = b.getChannelData(0);
    // ruído sempre igual, para o teste que renderiza o som dar o mesmo resultado
    let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = s / 2147483648 - 1; }
    ruidos.set(ctx, b);
  }
  return b;
}

/** Sobe rápido e desce devagar: o desenho de volume de uma nota tocada. */
function envelope(g: GainParam, t: number, pico: number, ataque: number, sustenta: number, dur: number, solta: number) {
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(pico, t + ataque);
  g.exponentialRampToValueAtTime(Math.max(0.0001, pico * sustenta), t + Math.max(ataque + 0.01, dur));
  g.exponentialRampToValueAtTime(0.0001, t + dur + solta);
}
type GainParam = AudioParam;

function tom(ctx: BaseAudioContext, destino: AudioNode, tipo: OscillatorType, hz: number, t: number, fim: number, desafina = 0) {
  const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = hz; o.detune.value = desafina;
  o.connect(destino); o.start(t); o.stop(fim);
}

function batida(ctx: BaseAudioContext, destino: AudioNode, t: number, dur: number, filtro: BiquadFilterType, hz: number, q: number, pico: number) {
  const fonte = ctx.createBufferSource(); fonte.buffer = ruido(ctx);
  const f = ctx.createBiquadFilter(); f.type = filtro; f.frequency.value = hz; f.Q.value = q;
  const g = ctx.createGain(); envelope(g.gain, t, pico, 0.002, 0.05, dur, 0.02);
  fonte.connect(f); f.connect(g); g.connect(destino); fonte.start(t); fonte.stop(t + dur + 0.05);
}

/** Toca uma nota no instante t, em segundos do relógio do contexto. */
export function tocaNota(ctx: BaseAudioContext, mesa: Mesa, n: Nota, t: number, segTempo: number) {
  const dur = n.dur * segTempo, hz = frequencia(n.midi);
  if (n.voz === 'acorde') {
    // piano elétrico: duas ondas quase na mesma afinação, abafadas
    const g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1700;
    envelope(g.gain, t, 0.075 * n.forca, 0.012, 0.35, dur, 0.35);
    f.connect(g); g.connect(mesa.entrada);
    tom(ctx, f, 'sine', hz, t, t + dur + 0.4); tom(ctx, f, 'triangle', hz, t, t + dur + 0.4, 5);
  } else if (n.voz === 'baixo') {
    const g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    envelope(g.gain, t, 0.26 * n.forca, 0.008, 0.5, dur, 0.12);
    f.connect(g); g.connect(mesa.entrada);
    tom(ctx, f, 'sine', hz, t, t + dur + 0.15); tom(ctx, f, 'triangle', hz, t, t + dur + 0.15);
  } else if (n.voz === 'melodia') {
    const g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
    envelope(g.gain, t, 0.06 * n.forca, 0.006, 0.12, dur, 0.5);
    f.connect(g); g.connect(mesa.entrada); g.connect(mesa.eco);
    tom(ctx, f, 'triangle', hz, t, t + dur + 0.55);
  } else if (n.voz === 'bumbo') {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
    envelope(g.gain, t, 0.5 * n.forca, 0.003, 0.05, 0.16, 0.05);
    o.connect(g); g.connect(mesa.entrada); o.start(t); o.stop(t + 0.3);
  } else if (n.voz === 'aro') batida(ctx, mesa.entrada, t, 0.05, 'bandpass', 1900, 2.5, 0.2 * n.forca);
  else batida(ctx, mesa.entrada, t, 0.035, 'highpass', 7000, 0.7, 0.05 * n.forca);
}

/** Agenda o compasso n para começar em t0 e devolve quanto ele dura, em segundos. */
export function agendaCompasso(ctx: BaseAudioContext, mesa: Mesa, e: Estacao, n: number, t0: number): number {
  const seg = 60 / e.bpm;
  for (const nota of compasso(e, n)) tocaNota(ctx, mesa, nota, t0 + quando(e, nota.t), seg);
  return segundosDoCompasso(e);
}
