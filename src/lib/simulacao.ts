// Vida no lab: cada pessoa trabalha na mesa e de vez em quando vai ao café ou à mesa de um colega.
import type { DadosLab } from './lab';
import { EQUIPE, type Membro } from './equipe';
import { criaGrade, rota, type Grade, type P2 } from './rotas';

export type Vista = 'F' | 'C';
export type Pose = 'parado' | 'andar' | 'digitar';
export type Agente = Membro & {
  casa: P2; pos: P2; caminho: P2[]; estado: 'mesa' | 'andando' | 'parado';
  vista: Vista; flip: boolean; vistaCasa: Vista; flipCasa: boolean;
  espera: number; semente: number; aoChegar: (() => void) | null;
};

const VEL = 1.45; // metros por segundo

export function criaSimulacao(lab: DadosLab) {
  const grade: Grade = criaGrade(lab);
  const usados: Record<string, number> = {};
  const agentes: Agente[] = EQUIPE.map((m, i) => {
    const lista = m.id === 'clara' ? lab.pontos.clara : lab.pontos['mesa_' + m.zona] ?? [];
    const k = (usados[m.zona] = (usados[m.zona] ?? -1) + 1);
    const p = lista[k % Math.max(1, lista.length)] ?? { x: lab.X / 2, y: lab.Y / 2 };
    const [vistaCasa, flipCasa]: [Vista, boolean] = m.id === 'clara' ? ['F', true] : ['C', false];
    return { ...m, casa: { x: p.x, y: p.y }, pos: { x: p.x, y: p.y }, caminho: [], estado: 'mesa', vista: vistaCasa, flip: flipCasa,
      vistaCasa, flipCasa, espera: 12 + i * 3.1, semente: i * 1.37, aoChegar: null };
  });
  const cafe = lab.pontos.cafe ?? [];

  const vai = (a: Agente, alvo: P2, aoChegar: () => void) => {
    a.caminho = rota(grade, a.pos, alvo); a.estado = 'andando'; a.aoChegar = aoChegar;
  };
  const volta = (a: Agente) => vai(a, a.casa, () => { a.estado = 'mesa'; a.vista = a.vistaCasa; a.flip = a.flipCasa; });
  const olha = (a: Agente, vista: Vista, flip: boolean) => { a.vista = vista; a.flip = flip; };

  function passo(dt: number) {
    for (const a of agentes) {
      if (a.estado === 'andando') {
        const alvo = a.caminho[0];
        if (!alvo) { a.estado = 'parado'; const f = a.aoChegar; a.aoChegar = null; f?.(); continue; }
        const dx = alvo.x - a.pos.x, dy = alvo.y - a.pos.y, d = Math.hypot(dx, dy), v = VEL * dt;
        // F olha para +x; espelhado, para +y. C olha para -y; espelhado, para -x.
        if (d > 0.01) Math.abs(dx) >= Math.abs(dy) ? olha(a, dx > 0 ? 'F' : 'C', dx < 0) : olha(a, dy > 0 ? 'F' : 'C', dy > 0);
        if (d <= v) { a.pos = { ...alvo }; a.caminho.shift(); } else { a.pos.x += dx / d * v; a.pos.y += dy / d * v; }
      } else if (a.estado === 'parado') {
        a.espera -= dt; if (a.espera <= 0) volta(a);
      } else if (a.id !== 'clara' && a.id !== 'duda') {
        a.espera -= dt;
        if (a.espera <= 0) {
          a.espera = 25 + Math.random() * 35;
          const colega = agentes[Math.floor(Math.random() * agentes.length)];
          if (Math.random() < 0.4 && cafe.length) {
            const c = cafe[Math.floor(Math.random() * cafe.length)];
            vai(a, c, () => { olha(a, 'C', false); a.estado = 'parado'; a.espera = 5; });
          } else if (colega !== a) {
            vai(a, { x: colega.casa.x + 0.62, y: colega.casa.y + 0.22 }, () => { olha(a, 'C', true); a.estado = 'parado'; a.espera = 3; });
          }
        }
      }
    }
  }
  const pose = (a: Agente): Pose => a.estado === 'andando' ? 'andar' : a.estado === 'mesa' && a.id !== 'clara' ? 'digitar' : 'parado';
  return { agentes, passo, pose, grade };
}
