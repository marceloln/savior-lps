import { useEffect, useRef } from 'react';
import { Application, Assets, BlurFilter, Container, Graphics, Matrix, Sprite, Text, Texture, type FederatedPointerEvent } from 'pixi.js';
import type { DadosLab } from '../lib/lab';
import { zonaEm, ZONAS } from '../lib/lab';
import { criaProjecao, velocidadeDoArrasto, zoomDaRoda, type Amostra } from '../lib/projecao';
import { criaSimulacao, quadroDoPasso, type Agente, type Pessoa } from '../lib/simulacao';
import { criaPessoa } from './genteShader';

export type AtlasGente = { escala: number; q: Record<string, number[]> };
export type Alvo = { tipo: 'agente'; agente: Agente } | { tipo: 'zona'; id: string } | null;
type Props = {
  lab: DadosLab; gente: AtlasGente; equipe: Pessoa[]; zonaAtiva: string | null;
  selecionado: string | null; modoMover: boolean; foco: { zona: string; n: number } | null;
  /** Quem está escrevendo uma entrega ou planejando agora (ids). O mapa mostra um balão sobre a pessoa. */
  escrevendo: string[];
  /** Pedido recém-distribuído: um papel sai da mesa de quem orquestra para a mesa de cada um. n muda a cada distribuição. */
  distribuicao: { de: string; para: string[]; n: number } | null;
  onHover: (a: Alvo, x: number, y: number) => void; onClique: (a: Alvo) => void; onMovido: (ok: boolean) => void;
};
type Vivos = Record<string, [number, number]>;

const QUADROS = { parado: ['parado0', 'parado1'], andar: ['andar0', 'andar1', 'andar2', 'andar3'], digitar: ['digitar0', 'digitar1'] };
const CASA = 0.5; // casas do piso desenhadas no modo Mover, em metros
const TINTA = 0x3B2F25, OURO = 0xC99A3A, PAPEL = 0xfaf3df;
const SEGUE = 7; // taxa do seguidor da câmera, por segundo
/** Leva v até o alvo andando no máximo `passo`. */
const rumo = (v: number, alvo: number, passo: number) => v + Math.sign(alvo - v) * Math.min(Math.abs(alvo - v), passo);
const sai = (p: number) => p * (2 - p); // desacelera no fim
const entraSai = (p: number) => p < 0.5 ? 8 * p ** 4 : 1 - 8 * (1 - p) ** 4; // parte e pousa devagar, corre no meio
type P3 = { x: number; y: number; z: number };

async function carregaProfundidade(url: string) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const t = Texture.from(bmp);
  t.source.scaleMode = 'nearest'; t.source.autoGenerateMipmaps = false;
  return t;
}

export function MapaPixi(props: Props) {
  const { lab, gente } = props;
  const host = useRef<HTMLDivElement>(null);
  const atual = useRef(props); atual.current = props;

  useEffect(() => {
    let vivo = true;
    const app = new Application();
    // a preferência pode mudar com o lab aberto, então ouvimos em vez de ler uma vez
    const mm = matchMedia('(prefers-reduced-motion: reduce)');
    let reduz = mm.matches;
    const aoMudarMovimento = () => { reduz = mm.matches; };
    mm.addEventListener('change', aoMudarMovimento);
    (async () => {
      await app.init({ resizeTo: host.current!, backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(2, devicePixelRatio) });
      if (!vivo) { app.destroy(true); return; }
      host.current!.appendChild(app.canvas);
      const [fundo, atlas, prof, ancoras] = await Promise.all([
        Assets.load<Texture>('assets/lab.webp'), Assets.load<Texture>('assets/gente8.webp'), carregaProfundidade('assets/lab_prof_rg.png'),
        fetch('assets/vivos/ancoras.json').then(r => r.json() as Promise<Vivos>).catch(() => ({} as Vivos)),
      ]);
      const texVivo: Record<string, Texture> = {};
      await Promise.all(Object.keys(ancoras).map(async k => { texVivo[k] = await Assets.load<Texture>(`assets/vivos/${k}.webp`); }));
      if (!vivo) return;
      const proj = criaProjecao(lab), sim = criaSimulacao(lab, atual.current.equipe), K = lab.k;
      let equipeNoMapa = atual.current.equipe;
      const base0 = { profundidade: prof.source, kz: 1 / (K * lab.U[2]), dz: lab.D[2], larg: lab.larg, alt: lab.alt, prof: lab.prof };
      const mundo = new Container(); app.stage.addChild(mundo);
      mundo.addChild(new Sprite(fundo));

      // entorno vivo: árvores com vento e carros na rua, desfocados como o resto de fora
      const fora = new Container(); const desfoque = new BlurFilter({ strength: 4, quality: 3 });
      fora.filters = [desfoque]; mundo.addChild(fora);
      // o entorno vivo não passa da borda da foto de fundo
      const recorte = new Graphics().rect(0, 0, fundo.width, fundo.height).fill(0xffffff); mundo.addChild(recorte); fora.mask = recorte;
      const arvores = (lab as DadosLab & { arvores?: { x: number; y: number; s: number; v: number }[] }).arvores ?? [];
      const copas = arvores.filter(a => texVivo['arvore' + a.v]).map((a, i) => {
        const tex = texVivo['arvore' + a.v], [ax, ay] = ancoras['arvore' + a.v];
        const p = criaPessoa({ ...base0, atlas: tex, folga: 1.6 }); fora.addChild(p.mesh);
        return { ...a, p, q: [0, 0, tex.source.width, tex.source.height, ax, ay], fase: i * 1.7 };
      }).sort((a, b) => proj.profundidade(b.x, b.y) - proj.profundidade(a.x, a.y));
      copas.forEach(c => fora.addChild(c.p.mesh));
      const rua = (lab as DadosLab & { rua?: { faixas: number[]; x0: number; x1: number } }).rua;
      const carros = rua ? [0, 1, 2, 3].filter(i => texVivo['carro' + i]).map(i => {
        const s = new Sprite(texVivo['carro' + i]), [ax, ay] = ancoras['carro' + i];
        s.anchor.set(ax / s.texture.width, ay / s.texture.height); fora.addChild(s);
        const faixa = i % 2;
        return { s, faixa, x: rua.x0 + (rua.x1 - rua.x0) * (i * 0.27 + 0.1), v: (faixa ? -1 : 1) * (7 + i * 1.3) };
      }) : [];

      // nomes das salas deitados no piso: a base do texto segue o eixo do chão que vai para a direita na tela
      const nomes = new Container(); mundo.addChild(nomes);
      const [ox, oy] = proj.px(0, 0), [x1, y1] = proj.px(1, 0), [x2, y2] = proj.px(0, 1);
      const emX = x1 > ox, eb = emX ? [x1 - ox, y1 - oy] : [x2 - ox, y2 - oy], ed = emX ? [x2 - ox, y2 - oy] : [x1 - ox, y1 - oy];
      const nb = Math.hypot(eb[0], eb[1]), nd = Math.hypot(ed[0], ed[1]), mNome = new Matrix();
      // o texto do Pixi é pintado uma vez só, então os nomes só entram depois que a fonte da página carregou
      const fonte = getComputedStyle(host.current!).fontFamily;
      let rotulos: { tx: Text; cx: number; cy: number; cabe: number }[] = [];
      document.fonts.load(`700 12px ${fonte}`).catch(() => null).then(() => {
        if (!vivo) return;
        rotulos = ZONAS.filter(q => lab.zonas[q.id]).map(q => {
          const [x, y, w, h] = lab.zonas[q.id];
          const tx = new Text({ text: q.curto, resolution: 3, style: { fontFamily: fonte, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, fill: TINTA } });
          tx.anchor.set(0.5); nomes.addChild(tx);
          // as mesas ficam no fundo da sala (em -y); o nome vai no tapete livre da frente
          const [cx, cy] = proj.px(x + w / 2, y + h * 0.82);
          // cabe: quanto o nome pode crescer sem passar de 80% da sala ao longo da base do texto
          return { tx, cx, cy, cabe: (emX ? w : h) * nb * 0.8 / tx.width };
        });
      });

      const casas = new Graphics(); mundo.addChild(casas);
      const destaque = new Graphics(); mundo.addChild(destaque);
      const piscas = new Container(); mundo.addChild(piscas);
      const anel = new Graphics(); anel.visible = false; mundo.addChild(anel);
      const sombras = new Graphics(); mundo.addChild(sombras);
      const camada = new Container(); mundo.addChild(camada);
      const papeis = new Container(); mundo.addChild(papeis);
      const baloes = new Container(); mundo.addChild(baloes);
      const pessoas = new Map(sim.agentes.map(a => { const p = criaPessoa({ ...base0, atlas }); camada.addChild(p.mesh); return [a.id, p]; }));

      // câmera
      const cantos = [proj.px(0, 0), proj.px(lab.X, 0), proj.px(lab.X, lab.Y), proj.px(0, lab.Y), proj.px(0, 0, 2.6)];
      const box = { x0: Math.min(...cantos.map(c => c[0])), x1: Math.max(...cantos.map(c => c[0])), y0: Math.min(...cantos.map(c => c[1])), y1: Math.max(...cantos.map(c => c[1])) };
      const cam = { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, z: app.screen.width < 760 ? 2.3 : 1 }, alvo = { ...cam };
      const base = () => Math.min(app.screen.width / ((box.x1 - box.x0) * 1.04), (app.screen.height - 60) / ((box.y1 - box.y0) * 1.08));
      // a câmera nunca mostra além da foto: zoom mínimo cobre a tela e o centro fica preso dentro dela
      const zcobre = () => Math.max(app.screen.width / fundo.width, app.screen.height / fundo.height) / base();
      const zmax = () => 1.6 / base();
      const prende = (c: { x: number; y: number; z: number }) => {
        c.z = Math.max(zcobre(), Math.min(zmax(), c.z));
        const s = base() * c.z, mx = app.screen.width / 2 / s, my = app.screen.height / 2 / s;
        c.x = Math.max(mx, Math.min(fundo.width - mx, c.x)); c.y = Math.max(my, Math.min(fundo.height - my, c.y));
      };
      const telaParaMundo = (sx: number, sy: number) => { const s = base() * cam.z; return [(sx - app.screen.width / 2) / s + cam.x, (sy - app.screen.height / 2) / s + cam.y]; };
      const toques = new Map<number, { x: number; y: number }>();
      let arrasto: { x: number; y: number; cx: number; cy: number; moveu: boolean } | null = null;
      let pinca: { d: number; mx: number; my: number } | null = null, amostras: Amostra[] = [];
      // ponto do mundo que fica parado sob o cursor enquanto o zoom da roda desliza
      let ancora: { sx: number; sy: number; wx: number; wy: number } | null = null;
      let sob: string | null = null; // pessoa sob o ponteiro
      let mira: { x: number; y: number } | null = null, rotaMira: { x: number; y: number }[] = [];
      let focoVisto = 0;
      app.stage.eventMode = 'static'; app.stage.hitArea = app.screen;
      const acha = (sx: number, sy: number): Alvo => {
        const [wx, wy] = telaParaMundo(sx, sy);
        let melhor: Agente | null = null, pm = Infinity;
        for (const a of sim.agentes) {
          const [fx, fy] = proj.px(a.pos.x, a.pos.y), alt = 1.7 * K * lab.U[2];
          if (Math.abs(wx - fx) < 0.32 * K && wy < fy + 6 && wy > fy - alt) { const p = proj.profundidade(a.pos.x, a.pos.y); if (p < pm) { pm = p; melhor = a; } }
        }
        if (melhor) return { tipo: 'agente', agente: melhor };
        const c = proj.chao(wx, wy), z = zonaEm(lab, c.x, c.y);
        return z ? { tipo: 'zona', id: z.id } : null;
      };
      const pontoChao = (sx: number, sy: number) => { const [wx, wy] = telaParaMundo(sx, sy); const c = proj.chao(wx, wy); return { x: (Math.floor(c.x / CASA) + 0.5) * CASA, y: (Math.floor(c.y / CASA) + 0.5) * CASA }; };
      /** Dica, cursor de mão e pessoa levantada andam juntos: tudo sai do que está sob o ponteiro. */
      const aponta = (a: Alvo, x = 0, y = 0) => {
        sob = a?.tipo === 'agente' ? a.agente.id : null;
        app.stage.cursor = a ? 'pointer' : 'default';
        atual.current.onHover(a, x, y);
      };
      /** Zoom com o ponto do mundo em (sx, sy) da tela parado no lugar. */
      const zoomEm = (z: number, sx: number, sy: number) => {
        const [wx, wy] = telaParaMundo(sx, sy);
        alvo.z = Math.max(zcobre(), Math.min(zmax(), z));
        const s = base() * alvo.z;
        alvo.x = wx - (sx - app.screen.width / 2) / s; alvo.y = wy - (sy - app.screen.height / 2) / s;
        prende(alvo); ancora = { sx, sy, wx, wy };
      };
      const meio = () => { const [a, b] = [...toques.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
      app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
        toques.set(e.pointerId, { x: e.global.x, y: e.global.y });
        // pegar o mapa para o que estiver deslizando, senão ele pularia para o alvo antigo
        alvo.x = cam.x; alvo.y = cam.y; ancora = null;
        if (toques.size === 2) { pinca = meio(); arrasto = null; }
        else { arrasto = { x: e.global.x, y: e.global.y, cx: alvo.x, cy: alvo.y, moveu: false }; amostras = [{ t: performance.now(), x: e.global.x, y: e.global.y }]; }
      });
      app.stage.on('pointermove', (e: FederatedPointerEvent) => {
        if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (toques.size === 2 && pinca) {
          // o ponto do mundo que estava entre os dois dedos continua entre eles: a pinça aproxima e arrasta ao mesmo tempo
          const m = meio(), [wx, wy] = telaParaMundo(pinca.mx, pinca.my);
          if (pinca.d > 0) cam.z = Math.max(zcobre(), Math.min(zmax(), cam.z * m.d / pinca.d));
          const s = base() * cam.z;
          cam.x = wx - (m.mx - app.screen.width / 2) / s; cam.y = wy - (m.my - app.screen.height / 2) / s;
          prende(cam); alvo.x = cam.x; alvo.y = cam.y; alvo.z = cam.z; pinca = m; return;
        }
        if (arrasto) {
          const dx = e.global.x - arrasto.x, dy = e.global.y - arrasto.y;
          if (Math.hypot(dx, dy) > 5) arrasto.moveu = true;
          if (arrasto.moveu) {
            const s = base() * cam.z, agora = performance.now();
            alvo.x = cam.x = arrasto.cx - dx / s; alvo.y = cam.y = arrasto.cy - dy / s;
            amostras.push({ t: agora, x: e.global.x, y: e.global.y });
            while (amostras.length > 2 && amostras[0].t < agora - 200) amostras.shift();
            aponta(null); return;
          }
        }
        const { modoMover, selecionado } = atual.current;
        if (modoMover && selecionado) {
          const p = pontoChao(e.global.x, e.global.y);
          if (!mira || p.x !== mira.x || p.y !== mira.y) { mira = p; rotaMira = sim.livre(p) ? sim.caminhoAte(selecionado, p) : []; }
          aponta(null); return;
        }
        aponta(acha(e.global.x, e.global.y), e.global.x, e.global.y);
      });
      const solta = (e: FederatedPointerEvent) => {
        if (arrasto && !arrasto.moveu && toques.size === 1) {
          const { modoMover, selecionado } = atual.current;
          if (modoMover && selecionado) {
            const p = pontoChao(e.global.x, e.global.y);
            if (sim.livre(p)) { sim.mover(selecionado, p); mira = null; rotaMira = []; atual.current.onMovido(true); } else atual.current.onMovido(false);
          } else atual.current.onClique(acha(e.global.x, e.global.y));
        }
        // soltou em movimento: o mapa segue um pouco. O alvo vai à frente o bastante para o seguidor sair na mesma velocidade do dedo
        if (arrasto?.moveu && !reduz) {
          const v = velocidadeDoArrasto(amostras, performance.now());
          if (v) { const s = base() * cam.z; alvo.x = cam.x - v.vx / SEGUE / s; alvo.y = cam.y - v.vy / SEGUE / s; }
        }
        toques.delete(e.pointerId); if (toques.size < 2) pinca = null; arrasto = null;
      };
      app.stage.on('pointerup', solta); app.stage.on('pointerupoutside', solta);
      app.canvas.addEventListener('wheel', ev => {
        ev.preventDefault();
        const r = app.canvas.getBoundingClientRect(), d = ev.deltaMode === 1 ? ev.deltaY * 40 : ev.deltaY; // deltaMode 1 conta em linhas
        zoomEm(zoomDaRoda(alvo.z, d), ev.clientX - r.left, ev.clientY - r.top);
      }, { passive: false });
      // o ponteiro saiu do mapa: a dica não pode ficar pendurada
      app.canvas.addEventListener('pointerleave', () => aponta(null));

      const anelDe = { id: null as string | null, t: 0, s: 0 };
      const sobe = new Map<string, number>();
      // sinais de trabalho
      const balao = new Map<string, { c: Container; pontos: Graphics[]; v: number }>();
      const criaBalao = () => {
        // 24 por 13 px, com a ponta em (0, 0) apontando para a cabeça
        const c = new Container(), g = new Graphics();
        g.poly([-3, -7, 3, -7, 0, -1]).fill(PAPEL).stroke({ color: TINTA, width: 1, alpha: 0.9 });
        g.roundRect(-12, -19.5, 24, 13, 6.5).fill(PAPEL).stroke({ color: TINTA, width: 1, alpha: 0.9 });
        g.poly([-2.4, -7.6, 2.4, -7.6, 0, -2.4]).fill(PAPEL); // apaga o traço entre o balão e a ponta
        c.addChild(g);
        const pontos = [-5.5, 0, 5.5].map(x => { const p = new Graphics().circle(x, -13, 1.7).fill(TINTA); c.addChild(p); return p; });
        baloes.addChild(c);
        return { c, pontos, v: 0 };
      };
      /** Onde o papel sai e pousa: o tampo da mesa à frente da cadeira; quem trabalha de pé recebe na mão. */
      const mesaDe = (a: Agente): P3 => {
        if (a.semMesa) return { x: a.casa.x, y: a.casa.y, z: 1 };
        const ang = a.dirCasa * Math.PI / 4;
        return { x: a.casa.x + Math.sin(ang) * 0.6, y: a.casa.y - Math.cos(ang) * 0.6, z: 0.78 };
      };
      type Voo = { g: Graphics; de: P3; para: P3; t0: number; dur: number; pisca: Graphics | null };
      let voos: Voo[] = [], distVisto = atual.current.distribuicao?.n;

      const losango = (g: Graphics, x: number, y: number, lado: number, cor: number, alfa: number, borda = 0) => {
        const h = lado / 2, pts = [proj.px(x - h, y - h), proj.px(x + h, y - h), proj.px(x + h, y + h), proj.px(x - h, y + h)].flat();
        g.poly(pts).fill({ color: cor, alpha: alfa }); if (borda) g.poly(pts).stroke({ color: 0xfaf3df, width: borda, alpha: 0.9 });
      };

      let t = 0;
      app.ticker.add(tk => {
        const dt = Math.min(0.05, tk.deltaMS / 1000); t += dt;
        sim.passo(dt);
        const { foco, selecionado, modoMover, zonaAtiva, escrevendo, distribuicao } = atual.current;
        if (foco && foco.n !== focoVisto) {
          focoVisto = foco.n; const r = lab.zonas[foco.zona]; ancora = null;
          if (r) { const [fx, fy] = proj.px(r[0] + r[2] / 2, r[1] + r[3] / 2, 0.8); alvo.x = fx; alvo.y = fy; alvo.z = Math.min(zmax(), 2.4); }
        }
        // com movimento reduzido a câmera corta seco em vez de deslizar
        const k = reduz ? 1 : 1 - Math.exp(-dt * SEGUE);
        prende(alvo); cam.z += (alvo.z - cam.z) * k;
        if (ancora) {
          const sz = base() * cam.z;
          cam.x = ancora.wx - (ancora.sx - app.screen.width / 2) / sz; cam.y = ancora.wy - (ancora.sy - app.screen.height / 2) / sz;
          if (Math.abs(alvo.z - cam.z) < 1e-3) ancora = null;
        } else { cam.x += (alvo.x - cam.x) * k; cam.y += (alvo.y - cam.y) * k; }
        prende(cam);
        const s = base() * cam.z;
        mundo.scale.set(s); mundo.position.set(app.screen.width / 2 - cam.x * s, app.screen.height / 2 - cam.y * s);
        desfoque.strength = Math.max(1, 5 * s);

        // vento: a copa inclina devagar, cada árvore no seu tempo; carros passam e voltam ao começo da rua
        for (const c of copas) {
          const [fx, fy] = proj.px(c.x, c.y), vento = reduz ? 0 : (Math.sin(t * 0.9 + c.fase) * 0.6 + Math.sin(t * 2.3 + c.fase * 2) * 0.25) * 9 * c.s;
          c.p.poe(fx, fy, proj.profundidade(c.x, c.y), c.q, false, c.s, 1, vento);
        }
        if (rua) for (const c of carros) {
          if (!reduz) c.x += c.v * dt;
          if (c.x > rua.x1) c.x = rua.x0; if (c.x < rua.x0) c.x = rua.x1;
          const [cx, cy] = proj.px(c.x, rua.faixas[c.faixa]); c.s.position.set(cx, cy);
        }

        // nome das salas: só com a vista aberta, quando ainda não dá para ler as placas; some ao aproximar
        nomes.alpha = 0.7 * Math.max(0, Math.min(1, (1.5 - cam.z / zcobre()) / 0.3));
        nomes.visible = nomes.alpha > 0.01;
        if (nomes.visible) for (const r of rotulos) {
          const e = Math.min(1 / s, r.cabe);
          r.tx.setFromMatrix(mNome.set(eb[0] / nb * e, eb[1] / nb * e, ed[0] / nd * e, ed[1] / nd * e, r.cx, r.cy));
        }

        // casas do piso: área aberta, quem está escolhido e o caminho do Mover
        casas.clear(); destaque.clear();
        const z = zonaAtiva && lab.zonas[zonaAtiva];
        if (z) {
          const [x, y, w, h] = z, cor = ZONAS.find(q => q.id === zonaAtiva)!.cor;
          destaque.poly([proj.px(x, y), proj.px(x + w, y), proj.px(x + w, y + h), proj.px(x, y + h)].flat()).fill({ color: cor, alpha: 0.08 }).stroke({ color: cor, width: 3, alpha: 0.85 });
        }
        const sel = selecionado ? sim.agentes.find(a => a.id === selecionado) : null;
        if (sel) {
          const cx = (Math.floor(sel.pos.x / CASA) + 0.5) * CASA, cy = (Math.floor(sel.pos.y / CASA) + 0.5) * CASA;
          if (modoMover) for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
            if (Math.abs(i) + Math.abs(j) > 7) continue; const p = { x: cx + i * CASA, y: cy + j * CASA };
            if (sim.livre(p)) losango(casas, p.x, p.y, CASA * 0.94, 0x5fb8a8, 0.18 + (reduz ? 0 : 0.05 * Math.sin(t * 3 - (Math.abs(i) + Math.abs(j)) * 0.5)));
          }
          for (const p of rotaMira) losango(casas, p.x, p.y, CASA * 0.8, 0x5fb8a8, 0.55, 1.5);
          if (mira && modoMover) losango(casas, mira.x, mira.y, CASA, sim.livre(mira) ? 0x2f8f7c : 0xd9776a, 0.75, 2);
          if (modoMover) losango(casas, cx, cy, CASA * 1.1, 0xe9b949, 0.35, 2.5);
        }
        // anel de quem está escolhido: no pé da pessoa, onde ela estiver, e não na casa da grade
        if (selecionado !== anelDe.id) { anelDe.id = selecionado; anelDe.t = 0; }
        anel.visible = !!sel;
        if (sel) {
          anelDe.t = reduz ? 1 : Math.min(1, anelDe.t + dt / 0.16);
          // o traço tem 2 px de tela, então só redesenha quando o zoom muda
          if (s !== anelDe.s) { anelDe.s = s; anel.clear().ellipse(0, 0, 0.38 * K, 0.19 * K).fill({ color: OURO, alpha: 0.14 }).stroke({ color: OURO, width: 2 / s }); }
          const e = sai(anelDe.t), [ax, ay] = proj.px(sel.pos.x, sel.pos.y);
          anel.position.set(ax, ay); anel.scale.set(0.85 + 0.15 * e); anel.alpha = e;
        }
        // a equipe mudou no banco: entra quem chegou, sai quem foi desligado
        if (atual.current.equipe !== equipeNoMapa) {
          equipeNoMapa = atual.current.equipe; sim.sincroniza(equipeNoMapa);
          for (const a of sim.agentes) if (!pessoas.has(a.id)) { const p = criaPessoa({ ...base0, atlas }); camada.addChild(p.mesh); pessoas.set(a.id, p); }
          for (const [id, p] of pessoas) if (!sim.agentes.some(a => a.id === id)) { camada.removeChild(p.mesh); p.mesh.destroy(); pessoas.delete(id); sobe.delete(id); }
        }
        // pessoas de trás para frente
        sombras.clear();
        const ordem = [...sim.agentes].sort((a, b) => proj.profundidade(b.pos.x, b.pos.y) - proj.profundidade(a.pos.x, a.pos.y));
        ordem.forEach((a, i) => {
          const [fx, fy] = proj.px(a.pos.x, a.pos.y);
          let pose = sim.pose(a);
          if (pose === 'digitar' && a.dir !== 0) pose = 'parado';
          // sentado, a cadeira já está no chão do render e a mancha de sombra ficaria por cima dela
          if (pose !== 'digitar') sombras.ellipse(fx, fy, 0.3 * K, 0.15 * K).fill({ color: 0x28200f, alpha: 0.2 });
          const lista = QUADROS[pose];
          // andando, o quadro sai do chão percorrido e não do relógio: a perna não patina
          const f = pose === 'andar' ? quadroDoPasso(a.andado) : Math.floor(t * (pose === 'digitar' ? 2.2 : 1.2) + a.semente);
          const q = gente.q[`${a.aparencia}_d${a.dir}_${lista[f % lista.length]}`] ?? gente.q[`${a.aparencia}_d${a.dir}_parado0`];
          const p = pessoas.get(a.id)!;
          if (q) p.poe(fx, fy, proj.profundidade(a.pos.x, a.pos.y), q, false, 1 / gente.escala);
          // sob o ponteiro a pessoa sobe 2 px de tela; mexe só a posição da malha, o teste de profundidade fica no pé
          const alto = a.id === sob ? 1 : 0, v = reduz ? alto : rumo(sobe.get(a.id) ?? 0, alto, dt / 0.12);
          sobe.set(a.id, v); p.mesh.position.y = -2 / s * sai(v);
          camada.setChildIndex(p.mesh, i);
        });

        // quem está escrevendo ganha um balão com três pontos sobre a cabeça
        for (const id of escrevendo) if (!balao.has(id) && sim.agentes.some(a => a.id === id)) balao.set(id, criaBalao());
        for (const [id, b] of balao) {
          const a = sim.agentes.find(x => x.id === id), on = !!a && escrevendo.includes(id);
          b.v = reduz ? +on : rumo(b.v, +on, dt / 0.15);
          if (!a || (!on && b.v <= 0)) { baloes.removeChild(b.c); b.c.destroy({ children: true }); balao.delete(id); continue; }
          const [bx, by] = proj.px(a.pos.x, a.pos.y, sim.pose(a) === 'digitar' ? 1.42 : 1.86), e = sai(b.v);
          b.c.position.set(bx, by); b.c.scale.set((0.85 + 0.15 * e) / s); b.c.alpha = e;
          b.pontos.forEach((p, i) => { p.alpha = reduz ? 0.8 : 0.3 + 0.7 * Math.max(0, Math.sin(t * 5 - i * 1.1)) ** 2; });
        }

        // pedido distribuído: um papel voa da mesa de quem orquestra para a mesa de cada um
        if (distribuicao && distribuicao.n !== distVisto) {
          distVisto = distribuicao.n;
          const de = sim.agentes.find(a => a.id === distribuicao.de);
          if (de) distribuicao.para.forEach((id, i) => {
            const a = sim.agentes.find(x => x.id === id); if (!a || a === de) return;
            const o = mesaDe(de), d = mesaDe(a), m = Math.hypot(d.x - o.x, d.y - o.y);
            const g = new Graphics().rect(-5, -3.5, 10, 7).fill(0xfffbf0).stroke({ color: TINTA, width: 1, alpha: 0.85 });
            g.visible = false; papeis.addChild(g);
            // quem está longe espera um pouco mais, mas ninguém passa de 0,9 s; com movimento reduzido o papel não voa
            voos.push({ g, de: o, para: d, t0: t + i * 0.08, dur: reduz ? 0 : Math.min(0.9, 0.45 + m / 80), pisca: null });
          });
        }
        voos = voos.filter(v => {
          if (t < v.t0) return true;
          const p = v.dur ? (t - v.t0) / v.dur : 1;
          if (p < 1) {
            const e = entraSai(p), [vx, vy] = proj.px(v.de.x + (v.para.x - v.de.x) * e, v.de.y + (v.para.y - v.de.y) * e, v.de.z + (v.para.z - v.de.z) * e + 0.8 * 4 * e * (1 - e));
            v.g.visible = true; v.g.position.set(vx, vy); v.g.scale.set(1 / s);
            return true;
          }
          // pousou: a casa da mesa pisca e apaga
          if (!v.pisca) {
            v.g.visible = false; v.pisca = new Graphics(); piscas.addChild(v.pisca);
            losango(v.pisca, (Math.floor(v.para.x / CASA) + 0.5) * CASA, (Math.floor(v.para.y / CASA) + 0.5) * CASA, CASA * 1.4, 0xe9b949, 1);
          }
          const q = (t - v.t0 - v.dur) / 0.4;
          if (q < 1) { v.pisca.alpha = 0.5 * (1 - q); return true; }
          v.g.destroy(); v.pisca.destroy(); return false;
        });
      });
    })();
    return () => { vivo = false; mm.removeEventListener('change', aoMudarMovimento); try { app.destroy(true, { children: true }); } catch { /* ainda iniciando */ } };
  }, [lab, gente]);

  return <div ref={host} className={`mapa ${props.modoMover ? 'mirando' : ''}`} aria-label="Mapa do laboratório. Arraste para mover a vista, use a roda ou a pinça para aproximar, clique numa área ou pessoa." />;
}
