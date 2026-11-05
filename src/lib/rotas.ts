// A* numa grade de 25 cm com os móveis exportados da cena, depois o caminho é encurtado por linha de visão.
import type { DadosLab } from './lab';

export type P2 = { x: number; y: number };
const GR = 0.25;

export type Grade = { gx: number; gy: number; bloq: Uint8Array };

export function criaGrade(lab: Pick<DadosLab, 'X' | 'Y' | 'obst'>): Grade {
  const gx = Math.ceil(lab.X / GR), gy = Math.ceil(lab.Y / GR), bloq = new Uint8Array(gx * gy);
  for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
    const x = (i + 0.5) * GR, y = (j + 0.5) * GR;
    if (x < 0.4 || y < 0.4 || x > lab.X - 0.3 || y > lab.Y - 0.3) { bloq[j * gx + i] = 1; continue; }
    for (const r of lab.obst) if (x > r[0] && x < r[2] && y > r[1] && y < r[3]) { bloq[j * gx + i] = 1; break; }
  }
  return { gx, gy, bloq };
}

const celula = (g: Grade, p: P2): [number, number] =>
  [Math.max(0, Math.min(g.gx - 1, Math.floor(p.x / GR))), Math.max(0, Math.min(g.gy - 1, Math.floor(p.y / GR)))];

function livreMaisPerto(g: Grade, cx: number, cy: number): [number, number] {
  if (!g.bloq[cy * g.gx + cx]) return [cx, cy];
  for (let r = 1; r < 16; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = cx + dx, y = cy + dy;
    if (x >= 0 && y >= 0 && x < g.gx && y < g.gy && !g.bloq[y * g.gx + x]) return [x, y];
  }
  return [cx, cy];
}

export function vistaLivre(g: Grade, a: P2, b: P2): boolean {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.1);
  for (let i = 1; i < n; i++) {
    const [cx, cy] = celula(g, { x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n });
    if (g.bloq[cy * g.gx + cx]) return false;
  }
  return true;
}

/** Caminho de `de` até `para`, sem o ponto de partida e terminando exatamente em `para`. */
export function rota(g: Grade, de: P2, para: P2): P2[] {
  const [sx, sy] = livreMaisPerto(g, ...celula(g, de)), [tx, ty] = livreMaisPerto(g, ...celula(g, para));
  const N = g.gx * g.gy, custo = new Float32Array(N).fill(Infinity), veio = new Int32Array(N).fill(-1), fechado = new Uint8Array(N);
  const heap: [number, number][] = [];
  const push = (i: number, f: number) => {
    heap.push([f, i]); let k = heap.length - 1;
    while (k) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; }
  };
  const pop = () => {
    const topo = heap[0], ult = heap.pop()!;
    if (heap.length) {
      heap[0] = ult; let k = 0;
      for (;;) {
        const l = k * 2 + 1, r = l + 1; let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m;
      }
    }
    return topo;
  };
  const h = (x: number, y: number) => { const dx = Math.abs(x - tx), dy = Math.abs(y - ty); return dx + dy - 0.5858 * Math.min(dx, dy); };
  const ini = sy * g.gx + sx, fim = ty * g.gx + tx;
  custo[ini] = 0; push(ini, h(sx, sy));
  while (heap.length) {
    const [, i] = pop(); if (fechado[i]) continue; fechado[i] = 1; if (i === fim) break;
    const x = i % g.gx, y = (i / g.gx) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= g.gx || ny >= g.gy) continue;
      const j = ny * g.gx + nx; if (g.bloq[j] || fechado[j]) continue;
      if (dx && dy && (g.bloq[y * g.gx + nx] || g.bloq[ny * g.gx + x])) continue;
      const c = custo[i] + (dx && dy ? 1.4142 : 1);
      if (c < custo[j]) { custo[j] = c; veio[j] = i; push(j, c + h(nx, ny)); }
    }
  }
  if (veio[fim] < 0 && fim !== ini) return [para];
  const cel: P2[] = [];
  for (let i = fim; i !== -1 && i !== ini; i = veio[i]) cel.push({ x: (i % g.gx + 0.5) * GR, y: (((i / g.gx) | 0) + 0.5) * GR });
  cel.reverse(); cel.push(para);
  const out: P2[] = []; let atual = de;
  for (let i = 0; i < cel.length; i++) {
    let j = cel.length - 1; while (j > i && !vistaLivre(g, atual, cel[j])) j--;
    out.push(cel[j]); atual = cel[j]; i = j;
  }
  return out;
}
