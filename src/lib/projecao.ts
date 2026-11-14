// Câmera ortográfica do Blender (30° de elevação, 45° de azimute) levada para pixels do render.
import type { DadosLab } from './lab';

export type Projecao = {
  /** metros do lab (x, y, altura) para pixel do render */
  px: (x: number, y: number, z?: number) => [number, number];
  /** pixel do render para o ponto no plano de altura z */
  chao: (px: number, py: number, z?: number) => { x: number; y: number };
  /** distância até a câmera, a mesma unidade do passe de profundidade */
  profundidade: (x: number, y: number, z?: number) => number;
};

export function criaProjecao(lab: DadosLab): Projecao {
  const { R, U, D, centro: C, k, larg, alt, dist } = lab;
  const cR = C[0] * R[0] + C[1] * R[1] + C[2] * R[2];
  const cU = C[0] * U[0] + C[1] * U[1] + C[2] * U[2];
  const px = (x: number, y: number, z = 0): [number, number] => [
    (x * R[0] + y * R[1] + z * R[2] - cR) * k + larg / 2,
    alt / 2 - (x * U[0] + y * U[1] + z * U[2] - cU) * k,
  ];
  const [ox, oy] = px(0, 0, 0), [ax, ay] = px(1, 0, 0), [bx, by] = px(0, 1, 0), [zx, zy] = px(0, 0, 1);
  const eX = [ax - ox, ay - oy], eY = [bx - ox, by - oy], eZ = [zx - ox, zy - oy];
  const det = eX[0] * eY[1] - eY[0] * eX[1];
  const chao = (qx: number, qy: number, z = 0) => {
    const u = qx - ox - eZ[0] * z, v = qy - oy - eZ[1] * z;
    return { x: (u * eY[1] - eY[0] * v) / det, y: (eX[0] * v - u * eX[1]) / det };
  };
  const profundidade = (x: number, y: number, z = 0) => dist - (x * D[0] + y * D[1] + z * D[2]);
  return { px, chao, profundidade };
}

// Gestos da câmera: só as contas, para poder testar sem tela.

/** Zoom depois de um giro da roda. O deltaY é limitado para um mouse de roda livre não disparar o zoom de uma vez. */
export const zoomDaRoda = (z: number, deltaY: number) => z * Math.exp(-Math.max(-120, Math.min(120, deltaY)) * 0.0015);

export type Amostra = { t: number; x: number; y: number };

/** Velocidade do arrasto (px/s) nos últimos `janela` ms antes de soltar. Devolve null quando o dedo já tinha parado
 *  ou vinha devagar (até 60 px/s): aí o mapa fica onde foi largado. O teto de 3000 px/s segura um safanão. */
export function velocidadeDoArrasto(amostras: Amostra[], agora: number, janela = 80): { vx: number; vy: number } | null {
  const rec = amostras.filter(a => a.t >= agora - janela);
  if (rec.length < 2) return null;
  const a = rec[0], b = rec[rec.length - 1], dt = (b.t - a.t) / 1000;
  if (dt <= 0) return null;
  const vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt, v = Math.hypot(vx, vy);
  if (v <= 60) return null;
  const f = Math.min(1, 3000 / v);
  return { vx: vx * f, vy: vy * f };
}
