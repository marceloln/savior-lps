// Vida no lab: cada pessoa trabalha na mesa e de vez em quando vai ao café ou à mesa de um colega.
import type { DadosLab } from './lab';
import { EQUIPE, type Membro } from './equipe';
import { criaGrade, rota, type Grade, type P2 } from './rotas';
import { direcaoDe, olharPara } from './direcao';

export type Pose = 'parado' | 'andar' | 'digitar';
export type Agente = Membro & {
  casa: P2; pos: P2; caminho: P2[]; estado: 'mesa' | 'andando' | 'parado';
  dir: number; dirCasa: number; espera: number; semente: number; aoChegar: (() => void) | null; mandado: boolean;
};

const VEL = 1.35; // metros por segundo, passo de quem anda no escritório
export const MAX_FORA = 3; // quantos podem estar fora da mesa por conta própria ao mesmo tempo
const entre = (a: number, b: number) => a + Math.random() * (b - a);

export function criaSimulacao(lab: DadosLab) {
  const grade: Grade = criaGrade(lab);
  const usados: Record<string, number> = {};
  const agentes: Agente[] = EQUIPE.map((m, i) => {
    const lista = m.id === 'clara' ? lab.pontos.clara : lab.pontos['mesa_' + m.zona] ?? [];
    const k = (usados[m.zona] = (usados[m.zona] ?? -1) + 1);
    const p = lista[k % Math.max(1, lista.length)] ?? { x: lab.X / 2, y: lab.Y / 2 };
    const dirCasa = m.id === 'clara' ? 4 : 0; // mesa: olha para os monitores em -y; Clara olha para quem chega
    return { ...m, casa: { x: p.x, y: p.y }, pos: { x: p.x, y: p.y }, caminho: [], estado: 'mesa', dir: dirCasa, dirCasa,
      espera: 15 + i * 11, semente: i * 1.37, aoChegar: null, mandado: false };
  });
  const cafe = lab.pontos.cafe ?? [];

  const vai = (a: Agente, alvo: P2, aoChegar: () => void) => {
    a.caminho = rota(grade, a.pos, alvo); a.estado = 'andando'; a.aoChegar = aoChegar;
  };
  const volta = (a: Agente) => vai(a, a.casa, () => { a.estado = 'mesa'; a.dir = a.dirCasa; a.mandado = false; });

  /** Comando do jogador: a pessoa vai até o ponto e espera lá um tempo antes de voltar. */
  function mover(id: string, alvo: P2) {
    const a = agentes.find(x => x.id === id); if (!a) return;
    a.mandado = true;
    vai(a, alvo, () => { a.estado = 'parado'; a.espera = 25; });
  }

  const fora = () => agentes.filter(a => a.estado !== 'mesa' && !a.mandado).length;

  function passo(dt: number) {
    for (const a of agentes) {
      if (a.estado === 'andando') {
        const alvo = a.caminho[0];
        if (!alvo) { a.estado = 'parado'; const f = a.aoChegar; a.aoChegar = null; f?.(); continue; }
        const dx = alvo.x - a.pos.x, dy = alvo.y - a.pos.y, d = Math.hypot(dx, dy), v = VEL * dt;
        if (d > 0.02) a.dir = direcaoDe(dx, dy);
        if (d <= v) { a.pos = { ...alvo }; a.caminho.shift(); } else { a.pos.x += dx / d * v; a.pos.y += dy / d * v; }
      } else if (a.estado === 'parado') {
        a.espera -= dt; if (a.espera <= 0) volta(a);
      } else if (a.id !== 'clara' && a.id !== 'duda') {
        a.espera -= dt;
        if (a.espera <= 0) {
          a.espera = entre(60, 180);
          // escritório tem ritmo: a maioria fica trabalhando, só uns poucos circulam
          if (fora() >= MAX_FORA) { a.espera = entre(10, 25); continue; }
          const colega = agentes[Math.floor(Math.random() * agentes.length)];
          if (Math.random() < 0.4 && cafe.length) {
            const c = cafe[Math.floor(Math.random() * cafe.length)];
            vai(a, c, () => { a.dir = 0; a.estado = 'parado'; a.espera = entre(20, 40); });
          } else if (colega !== a) {
            vai(a, { x: colega.casa.x + 0.62, y: colega.casa.y + 0.22 }, () => { a.dir = olharPara(a.pos, colega.casa); a.estado = 'parado'; a.espera = entre(10, 20); });
          }
        }
      }
    }
  }
  const pose = (a: Agente): Pose => a.estado === 'andando' ? 'andar' : a.estado === 'mesa' && a.id !== 'clara' ? 'digitar' : 'parado';
  const caminhoAte = (id: string, alvo: P2) => { const a = agentes.find(x => x.id === id); return a ? rota(grade, a.pos, alvo) : []; };
  const livre = (p: P2) => { const i = Math.floor(p.x / 0.25), j = Math.floor(p.y / 0.25); return i >= 0 && j >= 0 && i < grade.gx && j < grade.gy && !grade.bloq[j * grade.gx + i]; };
  return { agentes, passo, pose, grade, mover, caminhoAte, livre, fora };
}
