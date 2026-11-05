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
