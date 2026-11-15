// Pong clássico da mesa de pingue-pongue: só as regras, para testar sem tela.
// Quem joga fica na raquete da esquerda; a máquina fica na direita. Vence quem fizer 7 pontos.

export const CAMPO = { w: 160, h: 100 };
export const RAQUETE = { h: 18, w: 3, margem: 6, vel: 130 };
export const BOLA = { lado: 3, v0: 82, vmax: 190, ganho: 1.06 };
export const ATE = 7, PAUSA_DO_SAQUE = 0.9;
/** Velocidade máxima da raquete da máquina. Menor que a de uma bola rápida em diagonal: dá para ganhar. */
export const VEL_DA_MAQUINA = 78;

export type Pong = {
  bola: { x: number; y: number; vx: number; vy: number };
  /** Centro de cada raquete no eixo y. */
  esq: number; dir: number;
  pontos: [number, number];
  /** Segundos até a bola sair no saque. */
  saque: number;
  /** 0 enquanto o jogo corre; 1 venceu quem joga, 2 venceu a máquina. */
  fim: 0 | 1 | 2;
};
/** O que quem joga pede: um ponto para onde levar a raquete (mouse ou dedo) ou uma direção (teclas). */
export type Entrada = { alvo?: number | null; dir?: -1 | 0 | 1 };

const prende = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const limiteY = (y: number) => prende(y, RAQUETE.h / 2, CAMPO.h - RAQUETE.h / 2);

function saca(p: Pong, para: 1 | -1, sorteio: () => number) {
  const ang = (sorteio() - 0.5) * 0.7;
  p.bola = { x: CAMPO.w / 2, y: CAMPO.h / 2, vx: Math.cos(ang) * BOLA.v0 * para, vy: Math.sin(ang) * BOLA.v0 };
  p.saque = PAUSA_DO_SAQUE;
}

export function novoPong(sorteio: () => number = Math.random): Pong {
  const p: Pong = { bola: { x: 0, y: 0, vx: 0, vy: 0 }, esq: CAMPO.h / 2, dir: CAMPO.h / 2, pontos: [0, 0], saque: 0, fim: 0 };
  saca(p, sorteio() < 0.5 ? 1 : -1, sorteio);
  return p;
}

/** A bola bateu na raquete: volta para o outro lado, mais rápida, com o ângulo de onde pegou na raquete. */
function rebate(p: Pong, centro: number, para: 1 | -1) {
  const onde = prende((p.bola.y - centro) / (RAQUETE.h / 2), -1, 1), v = Math.min(BOLA.vmax, Math.hypot(p.bola.vx, p.bola.vy) * BOLA.ganho);
  const ang = onde * (Math.PI / 3.2);
  p.bola.vx = Math.cos(ang) * v * para; p.bola.vy = Math.sin(ang) * v;
}

function passinho(p: Pong, e: Entrada, dt: number, sorteio: () => number) {
  // raquete de quem joga: segue o ponteiro com velocidade limitada ou anda com as teclas
  if (e.alvo != null) p.esq += prende(e.alvo - p.esq, -RAQUETE.vel * dt, RAQUETE.vel * dt);
  else if (e.dir) p.esq += e.dir * RAQUETE.vel * dt;
  p.esq = limiteY(p.esq);
  // máquina: persegue a bola quando ela vem; quando vai, volta devagar para o meio
  const mira = p.bola.vx > 0 ? p.bola.y : CAMPO.h / 2, passo = (p.bola.vx > 0 ? VEL_DA_MAQUINA : VEL_DA_MAQUINA * 0.4) * dt;
  p.dir = limiteY(p.dir + prende(mira - p.dir, -passo, passo));
  if (p.saque > 0) { p.saque = Math.max(0, p.saque - dt); return; }

  const b = p.bola, m = BOLA.lado / 2, antes = b.x;
  b.x += b.vx * dt; b.y += b.vy * dt;
  if (b.y < m) { b.y = 2 * m - b.y; b.vy = Math.abs(b.vy); }
  if (b.y > CAMPO.h - m) { b.y = 2 * (CAMPO.h - m) - b.y; b.vy = -Math.abs(b.vy); }
  const faceE = RAQUETE.margem + RAQUETE.w, faceD = CAMPO.w - RAQUETE.margem - RAQUETE.w, alcance = RAQUETE.h / 2 + m;
  // só conta a batida de quem cruzou a face da raquete neste passo, vindo de frente
  if (b.vx < 0 && antes - m >= faceE && b.x - m < faceE && Math.abs(b.y - p.esq) <= alcance) { b.x = faceE + m; rebate(p, p.esq, 1); }
  else if (b.vx > 0 && antes + m <= faceD && b.x + m > faceD && Math.abs(b.y - p.dir) <= alcance) { b.x = faceD - m; rebate(p, p.dir, -1); }
  if (b.x < -m || b.x > CAMPO.w + m) {
    const quem = b.x < 0 ? 1 : 0;   // passou pela esquerda: ponto da máquina
    p.pontos[quem]++;
    if (p.pontos[quem] >= ATE) { p.fim = quem === 0 ? 1 : 2; p.bola = { x: CAMPO.w / 2, y: CAMPO.h / 2, vx: 0, vy: 0 }; return; }
    saca(p, quem === 0 ? 1 : -1, sorteio);   // sai para o lado de quem levou o ponto
  }
}

/** Anda dt segundos, em passos curtos para a bola não atravessar a raquete num quadro lento. */
export function passoDoPong(p: Pong, e: Entrada, dt: number, sorteio: () => number = Math.random): Pong {
  let resta = Math.min(dt, 0.25);
  while (resta > 1e-9 && !p.fim) { const d = Math.min(resta, 1 / 240); passinho(p, e, d, sorteio); resta -= d; }
  return p;
}
