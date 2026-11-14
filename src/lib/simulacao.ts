// Vida no lab: cada pessoa trabalha na mesa e de vez em quando vai ao café ou à mesa de um colega.
import type { DadosLab } from './lab';
import type { Membro } from './equipe';
import { criaGrade, rota, type Grade, type P2 } from './rotas';
import { direcaoDe, olharPara } from './direcao';

export type Pose = 'parado' | 'andar' | 'digitar';
/** Quem entra no mapa: o especialista e o boneco que ele usa. */
export type Pessoa = Membro & { aparencia: string };
export type Agente = Pessoa & {
  semMesa: boolean; casa: P2; pos: P2; caminho: P2[]; estado: 'mesa' | 'andando' | 'parado';
  dir: number; dirCasa: number; espera: number; semente: number; aoChegar: (() => void) | null; mandado: boolean;
};

const VEL = 1.35; // metros por segundo, passo de quem anda no escritório
export const MIN_FORA = 2, MAX_FORA = 3; // sempre 2 ou 3 circulando por conta própria, o resto trabalha
const entre = (a: number, b: number) => a + Math.random() * (b - a);

export function criaSimulacao(lab: DadosLab, equipe: Pessoa[]) {
  const grade: Grade = criaGrade(lab);
  const livre = (p: P2) => { const i = Math.floor(p.x / 0.25), j = Math.floor(p.y / 0.25); return i >= 0 && j >= 0 && i < grade.gx && j < grade.gy && !grade.bloq[j * grade.gx + i]; };
  const agentes: Agente[] = [];
  let entrou = 0;

  /** Lugar de quem chega: a próxima mesa vaga da sala. Sem mesa vaga, fica de pé num ponto livre perto do meio da sala. */
  function lugar(m: Pessoa): { casa: P2; semMesa: boolean } {
    const mesas = m.id === 'clara' ? lab.pontos.clara ?? [] : lab.pontos['mesa_' + m.zona] ?? [];
    const vaga = mesas.find(p => !agentes.some(a => !a.semMesa && a.casa.x === p.x && a.casa.y === p.y));
    if (vaga) return { casa: { x: vaga.x, y: vaga.y }, semMesa: false };
    const r = lab.zonas[m.zona], cx = r ? r[0] + r[2] / 2 : lab.X / 2, cy = r ? r[1] + r[3] / 2 : lab.Y / 2;
    for (let raio = 0; raio < 12; raio++) for (let k = 0; k < 8; k++) {
      const p = { x: cx + Math.cos(k * 0.785) * raio * 0.5, y: cy + Math.sin(k * 0.785) * raio * 0.5 };
      if (livre(p) && !agentes.some(a => Math.hypot(a.casa.x - p.x, a.casa.y - p.y) < 0.7)) return { casa: p, semMesa: true };
    }
    return { casa: { x: cx, y: cy }, semMesa: true };
  }

  /** Põe a equipe do banco no mapa: entra quem é novo, sai quem foi desligado, muda de sala quem mudou. */
  function sincroniza(lista: Pessoa[]) {
    for (let i = agentes.length - 1; i >= 0; i--) if (!lista.some(m => m.id === agentes[i].id)) agentes.splice(i, 1);
    for (const m of lista) {
      const a = agentes.find(x => x.id === m.id);
      if (a && a.zona === m.zona) { a.nome = m.nome; a.papel = m.papel; a.aparencia = m.aparencia; continue; }
      if (a) agentes.splice(agentes.indexOf(a), 1);
      const { casa, semMesa } = lugar(m), i = entrou++;
      const dirCasa = m.id === 'clara' || semMesa ? 4 : 0; // mesa: olha para os monitores em -y; de pé: olha para quem chega
      agentes.push({ ...m, semMesa, casa, pos: { ...casa }, caminho: [], estado: 'mesa', dir: dirCasa, dirCasa,
        espera: 15 + (i % 17) * 11, semente: i * 1.37, aoChegar: null, mandado: false });
    }
  }
  sincroniza(equipe);
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
    // se o lab ficou parado demais, quem está há mais tempo sentado levanta logo
    if (fora() < MIN_FORA) {
      const livres = agentes.filter(a => a.estado === 'mesa' && a.id !== 'clara' && a.id !== 'duda');
      const prox = livres.reduce<Agente | null>((m, a) => (!m || a.espera < m.espera ? a : m), null);
      if (prox && prox.espera > 3) prox.espera = 3;
    }
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
  const pose = (a: Agente): Pose => a.estado === 'andando' ? 'andar' : a.estado === 'mesa' && a.id !== 'clara' && !a.semMesa ? 'digitar' : 'parado';
  const caminhoAte = (id: string, alvo: P2) => { const a = agentes.find(x => x.id === id); return a ? rota(grade, a.pos, alvo) : []; };
  return { agentes, passo, pose, grade, mover, caminhoAte, livre, fora, sincroniza };
}
