import { useEffect, useRef } from 'react';
import { Application, Assets, BlurFilter, Container, Graphics, Sprite, Texture, type FederatedPointerEvent } from 'pixi.js';
import type { DadosLab } from '../lib/lab';
import { zonaEm, ZONAS } from '../lib/lab';
import { criaProjecao } from '../lib/projecao';
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
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

      const casas = new Graphics(); mundo.addChild(casas);
      const destaque = new Graphics(); mundo.addChild(destaque);
      const sombras = new Graphics(); mundo.addChild(sombras);
      const camada = new Container(); mundo.addChild(camada);
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
      let arrasto: { x: number; y: number; cx: number; cy: number; moveu: boolean } | null = null, pinca = 0;
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
      app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
        toques.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (toques.size === 2) { const [a, b] = [...toques.values()]; pinca = Math.hypot(a.x - b.x, a.y - b.y); arrasto = null; }
        else arrasto = { x: e.global.x, y: e.global.y, cx: alvo.x, cy: alvo.y, moveu: false };
      });
      app.stage.on('pointermove', (e: FederatedPointerEvent) => {
        if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (toques.size === 2 && pinca) {
          const [a, b] = [...toques.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
          alvo.z = cam.z = cam.z * d / pinca; pinca = d; return;
        }
        if (arrasto) {
          const dx = e.global.x - arrasto.x, dy = e.global.y - arrasto.y;
          if (Math.hypot(dx, dy) > 5) arrasto.moveu = true;
          if (arrasto.moveu) { const s = base() * cam.z; alvo.x = cam.x = arrasto.cx - dx / s; alvo.y = cam.y = arrasto.cy - dy / s; atual.current.onHover(null, 0, 0); return; }
        }
        const { modoMover, selecionado } = atual.current;
        if (modoMover && selecionado) {
          const p = pontoChao(e.global.x, e.global.y);
          if (!mira || p.x !== mira.x || p.y !== mira.y) { mira = p; rotaMira = sim.livre(p) ? sim.caminhoAte(selecionado, p) : []; }
          atual.current.onHover(null, 0, 0); return;
        }
        atual.current.onHover(acha(e.global.x, e.global.y), e.global.x, e.global.y);
      });
      const solta = (e: FederatedPointerEvent) => {
        if (arrasto && !arrasto.moveu && toques.size === 1) {
          const { modoMover, selecionado } = atual.current;
          if (modoMover && selecionado) {
            const p = pontoChao(e.global.x, e.global.y);
            if (sim.livre(p)) { sim.mover(selecionado, p); mira = null; rotaMira = []; atual.current.onMovido(true); } else atual.current.onMovido(false);
          } else atual.current.onClique(acha(e.global.x, e.global.y));
        }
        toques.delete(e.pointerId); if (toques.size < 2) pinca = 0; arrasto = null;
      };
      app.stage.on('pointerup', solta); app.stage.on('pointerupoutside', solta);
      app.canvas.addEventListener('wheel', ev => { ev.preventDefault(); alvo.z = alvo.z * (ev.deltaY < 0 ? 1.12 : 0.89); prende(alvo); }, { passive: false });

      const losango = (g: Graphics, x: number, y: number, lado: number, cor: number, alfa: number, borda = 0) => {
        const h = lado / 2, pts = [proj.px(x - h, y - h), proj.px(x + h, y - h), proj.px(x + h, y + h), proj.px(x - h, y + h)].flat();
        g.poly(pts).fill({ color: cor, alpha: alfa }); if (borda) g.poly(pts).stroke({ color: 0xfaf3df, width: borda, alpha: 0.9 });
      };

      let t = 0;
      app.ticker.add(tk => {
        const dt = Math.min(0.05, tk.deltaMS / 1000); t += dt;
        sim.passo(dt);
        const { foco, selecionado, modoMover, zonaAtiva } = atual.current;
        if (foco && foco.n !== focoVisto) {
          focoVisto = foco.n; const r = lab.zonas[foco.zona];
          if (r) { const [fx, fy] = proj.px(r[0] + r[2] / 2, r[1] + r[3] / 2, 0.8); alvo.x = fx; alvo.y = fy; alvo.z = Math.min(zmax(), 2.4); }
        }
        const k = 1 - Math.exp(-dt * 7);
        prende(alvo); cam.x += (alvo.x - cam.x) * k; cam.y += (alvo.y - cam.y) * k; cam.z += (alvo.z - cam.z) * k; prende(cam);
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
          losango(casas, cx, cy, CASA * 1.1, 0xe9b949, 0.35, 2.5);
        }
        // a equipe mudou no banco: entra quem chegou, sai quem foi desligado
        if (atual.current.equipe !== equipeNoMapa) {
          equipeNoMapa = atual.current.equipe; sim.sincroniza(equipeNoMapa);
          for (const a of sim.agentes) if (!pessoas.has(a.id)) { const p = criaPessoa({ ...base0, atlas }); camada.addChild(p.mesh); pessoas.set(a.id, p); }
          for (const [id, p] of pessoas) if (!sim.agentes.some(a => a.id === id)) { camada.removeChild(p.mesh); p.mesh.destroy(); pessoas.delete(id); }
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
          camada.setChildIndex(p.mesh, i);
        });
      });
    })();
    return () => { vivo = false; try { app.destroy(true, { children: true }); } catch { /* ainda iniciando */ } };
  }, [lab, gente]);

  return <div ref={host} className={`mapa ${props.modoMover ? 'mirando' : ''}`} aria-label="Mapa do laboratório. Arraste para mover a vista, use a roda ou a pinça para aproximar, clique numa área ou pessoa." />;
}
