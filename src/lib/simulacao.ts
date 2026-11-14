// Vida no lab: cada pessoa trabalha na mesa e de vez em quando vai ao café ou à mesa de um colega.
import type { DadosLab } from './lab';
import type { Membro } from './equipe';
import { criaGrade, rota, type Grade, type P2 } from './rotas';
import { direcaoDe, giraUmPasso, olharPara } from './direcao';

export type Pose = 'parado' | 'andar' | 'digitar';
/** Quem entra no mapa: o especialista e o boneco que ele usa. */
export type Pessoa = Membro & { aparencia: string };
export type Agente = Pessoa & {
  semMesa: boolean; casa: P2; pos: P2; caminho: P2[]; estado: 'mesa' | 'andando' | 'parado';
  dir: number; dirCasa: number; espera: number; semente: number; aoChegar: (() => void) | null; mandado: boolean;
  /** direção para onde o corpo está virando; `dir` chega nela aos poucos */
  dirAlvo: number; giro: number;
  /** metros andados desde que saiu (dá o quadro do passo e a rampa de partida) e metros que faltam até o fim do caminho */
  andado: number; falta: number;
  /** tempo de pé, parado, antes de andar (levantou da cadeira) ou antes de sentar */
  pausa: number;
};

const VEL = 1.35; // metros por segundo, passo de quem anda no escritório
export const MIN_FORA = 2, MAX_FORA = 3; // sempre 2 ou 3 circulando por conta própria, o resto trabalha
export const PASSADA = 1.6; // metros de chão cobertos pelos 4 quadros de andar; a perna só mexe quando o corpo anda
const PAUSA = 0.22; // segundos de pé ao levantar e ao sentar, para a troca de pose não ser um corte
const GIRO = 0.06; // segundos por passo de 45 graus: meia-volta leva um quarto de segundo
const RAMPA = 0.4; // metros para ganhar e para perder velocidade

/** Quadro (0 a 3) do ciclo de andar para a distância já andada. */
export const quadroDoPasso = (andado: number) => Math.floor(andado / PASSADA * 4) % 4;

/** Velocidade em m/s: sai e chega a 35% e ganha o resto em 40 cm, para ninguém arrancar nem frear de uma vez. */
export const velocidadeNaRampa = (percorrido: number, falta: number) =>
  VEL * Math.min(1, 0.35 + percorrido / RAMPA, 0.35 + falta / RAMPA);

/** Anda `dist` metros pelo caminho. A sobra de um trecho passa para o seguinte, senão cada curva comeria um pedaço do quadro.
 *  Tira do caminho os pontos alcançados; devolve o quanto andou e o rumo do último trecho pisado (null se não saiu do lugar). */
export function avanca(pos: P2, caminho: P2[], dist: number): { andou: number; dir: number | null } {
  let resta = dist, dir: number | null = null;
  while (resta > 0 && caminho.length) {
    const alvo = caminho[0], dx = alvo.x - pos.x, dy = alvo.y - pos.y, d = Math.hypot(dx, dy);
    if (d > 0.02) dir = direcaoDe(dx, dy);
    if (d <= resta) { pos.x = alvo.x; pos.y = alvo.y; caminho.shift(); resta -= d; }
    else { pos.x += dx / d * resta; pos.y += dy / d * resta; resta = 0; }
  }
  return { andou: dist - resta, dir };
}

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
        espera: 15 + (i % 17) * 11, semente: i * 1.37, aoChegar: null, mandado: false,
        dirAlvo: dirCasa, giro: 0, andado: 0, falta: 0, pausa: 0 });
    }
  }
  sincroniza(equipe);
  const cafe = lab.pontos.cafe ?? [];

  /** Quem trabalha sentado: levanta antes de sair e para de pé antes de sentar. */
  const senta = (a: Agente) => a.id !== 'clara' && !a.semMesa;
  const vai = (a: Agente, alvo: P2, aoChegar: () => void) => {
    a.pausa = a.estado === 'mesa' && senta(a) ? PAUSA : 0;
    a.caminho = rota(grade, a.pos, alvo); a.estado = 'andando'; a.aoChegar = aoChegar; a.andado = 0;
    let de = a.pos; a.falta = 0;
    for (const p of a.caminho) { a.falta += Math.hypot(p.x - de.x, p.y - de.y); de = p; }
  };
  const chega = (a: Agente) => { a.estado = 'parado'; const f = a.aoChegar; a.aoChegar = null; f?.(); };
  const volta = (a: Agente) => vai(a, a.casa, () => {
    const naMesa = () => { a.estado = 'mesa'; a.mandado = false; };
    a.dirAlvo = a.dirCasa;
    // chegou à cadeira: fica de pé, vira para a mesa e só então senta
    if (senta(a)) { a.estado = 'andando'; a.pausa = PAUSA; a.aoChegar = naMesa; } else naMesa();
  });

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
      // o corpo vira um passo de 45 graus por vez; o relógio não acumula enquanto não há para onde virar
      a.giro = Math.max(-dt, a.giro - dt);
      if (a.dir !== a.dirAlvo && a.giro <= 0) { a.dir = giraUmPasso(a.dir, a.dirAlvo); a.giro += GIRO; }
      if (a.estado === 'andando') {
        if (a.pausa > 0) {
          // a pausa só conta com o corpo já virado, senão a pessoa sentaria no meio do giro
          if (a.dir === a.dirAlvo) a.pausa -= dt;
          if (a.pausa <= 0) { a.pausa = 0; if (!a.caminho.length) chega(a); }
        } else {
          const { andou, dir } = avanca(a.pos, a.caminho, velocidadeNaRampa(a.andado, a.falta) * dt);
          a.andado += andou; a.falta = Math.max(0, a.falta - andou);
          if (dir !== null) a.dirAlvo = dir;
          if (!a.caminho.length) chega(a);
        }
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
            vai(a, c, () => { a.dirAlvo = 0; a.estado = 'parado'; a.espera = entre(20, 40); });
          } else if (colega !== a) {
            vai(a, { x: colega.casa.x + 0.62, y: colega.casa.y + 0.22 }, () => { a.dirAlvo = olharPara(a.pos, colega.casa); a.estado = 'parado'; a.espera = entre(10, 20); });
          }
        }
      }
    }
  }
  const pose = (a: Agente): Pose => a.estado === 'andando' ? (a.pausa > 0 ? 'parado' : 'andar') : a.estado === 'mesa' && a.id !== 'clara' && !a.semMesa ? 'digitar' : 'parado';
  const caminhoAte = (id: string, alvo: P2) => { const a = agentes.find(x => x.id === id); return a ? rota(grade, a.pos, alvo) : []; };
  return { agentes, passo, pose, grade, mover, caminhoAte, livre, fora, sincroniza };
}
