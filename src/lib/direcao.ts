// As pessoas têm 8 direções renderizadas. d{k} olha para o ângulo k*45°, que no piso do lab é o vetor (sen, -cos).
// k = 0 olha para -y (de costas, para cima e à esquerda na tela); k = 2 olha para +x; k = 4 para +y; k = 6 para -x.

/** Direção (0 a 7) mais próxima do movimento (dx, dy) em metros. */
export function direcaoDe(dx: number, dy: number): number {
  const ang = Math.atan2(dx, -dy); // 0 em -y, cresce no sentido de +x
  return ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
}

/** Direção para olhar de um ponto para outro. */
export const olharPara = (de: { x: number; y: number }, para: { x: number; y: number }) => direcaoDe(para.x - de.x, para.y - de.y);

/** Um passo de giro (45 graus) de `dir` rumo a `alvo` pelo lado mais curto. Meia-volta exata gira no sentido horário. */
export function giraUmPasso(dir: number, alvo: number): number {
  const falta = (((alvo - dir) % 8) + 8) % 8; // quantos passos no sentido horário
  if (!falta) return dir;
  return (dir + (falta <= 4 ? 1 : 7)) % 8;
}
