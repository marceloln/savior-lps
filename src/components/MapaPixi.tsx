import { useEffect, useRef } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Texture, type FederatedPointerEvent } from 'pixi.js';
import type { DadosLab } from '../lib/lab';
import { zonaEm, ZONAS } from '../lib/lab';
import { criaProjecao } from '../lib/projecao';
import { criaSimulacao, type Agente } from '../lib/simulacao';
import { criaPessoa } from './genteShader';

export type AtlasGente = { escala: number; q: Record<string, number[]> };
export type Alvo = { tipo: 'agente'; agente: Agente } | { tipo: 'zona'; id: string } | null;
type Props = { lab: DadosLab; gente: AtlasGente; onHover: (a: Alvo, x: number, y: number) => void; onClique: (a: Alvo) => void; zonaAtiva: string | null };

const QUADROS = { parado: ['parado0', 'parado1'], andar: ['andar0', 'andar1', 'andar2', 'andar3'], digitar: ['digitar0', 'digitar1'] };

async function carregaProfundidade(url: string) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const t = Texture.from(bmp);
  t.source.scaleMode = 'nearest'; t.source.autoGenerateMipmaps = false;
  return t;
}

export function MapaPixi({ lab, gente, onHover, onClique, zonaAtiva }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const zonaRef = useRef(zonaAtiva); zonaRef.current = zonaAtiva;
  const cb = useRef({ onHover, onClique }); cb.current = { onHover, onClique };

  useEffect(() => {
    let vivo = true;
    const app = new Application();
    (async () => {
      await app.init({ resizeTo: host.current!, background: '#E3E2D6', antialias: true, autoDensity: true, resolution: Math.min(2, devicePixelRatio) });
      if (!vivo) { app.destroy(true); return; }
      host.current!.appendChild(app.canvas);
      const [fundo, atlas, prof] = await Promise.all([Assets.load<Texture>('assets/lab.webp'), Assets.load<Texture>('assets/gente3.webp'), carregaProfundidade('assets/lab_prof_rg.png')]);
      if (!vivo) return;
      const proj = criaProjecao(lab), sim = criaSimulacao(lab), K = lab.k;
      const mundo = new Container(); app.stage.addChild(mundo);
      mundo.addChild(new Sprite(fundo));
      const destaque = new Graphics(); mundo.addChild(destaque);
      const sombras = new Graphics(); mundo.addChild(sombras);
      const camada = new Container(); mundo.addChild(camada);
      const comum = { atlas, profundidade: prof.source, kz: 1 / (K * lab.U[2]), dz: lab.D[2], larg: lab.larg, alt: lab.alt, prof: lab.prof };
      const pessoas = new Map(sim.agentes.map(a => { const p = criaPessoa(comum); camada.addChild(p.mesh); return [a.id, p]; }));

      // câmera: enquadra o deck, arrasta, zoom na roda e na pinça
      const cantos = [proj.px(0, 0), proj.px(lab.X, 0), proj.px(lab.X, lab.Y), proj.px(0, lab.Y), proj.px(0, 0, 2.6)];
      const box = { x0: Math.min(...cantos.map(c => c[0])), x1: Math.max(...cantos.map(c => c[0])), y0: Math.min(...cantos.map(c => c[1])), y1: Math.max(...cantos.map(c => c[1])) };
      const cam = { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, z: 1 }, alvo = { ...cam };
      const base = () => Math.min(app.screen.width / ((box.x1 - box.x0) * 1.04), (app.screen.height - 60) / ((box.y1 - box.y0) * 1.08));
      const zmin = 0.55, zmax = () => 1.6 / base();
      const telaParaMundo = (sx: number, sy: number) => { const s = base() * cam.z; return [(sx - app.screen.width / 2) / s + cam.x, (sy - app.screen.height / 2) / s + cam.y]; };
      const toques = new Map<number, { x: number; y: number }>();
      let arrasto: { x: number; y: number; cx: number; cy: number; moveu: boolean } | null = null, pinca = 0;
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
      app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
        toques.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (toques.size === 2) { const [a, b] = [...toques.values()]; pinca = Math.hypot(a.x - b.x, a.y - b.y); arrasto = null; }
        else arrasto = { x: e.global.x, y: e.global.y, cx: alvo.x, cy: alvo.y, moveu: false };
      });
      app.stage.on('pointermove', (e: FederatedPointerEvent) => {
        if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (toques.size === 2 && pinca) {
          const [a, b] = [...toques.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
          alvo.z = cam.z = Math.max(zmin, Math.min(zmax(), cam.z * d / pinca)); pinca = d; return;
        }
        if (arrasto) {
          const dx = e.global.x - arrasto.x, dy = e.global.y - arrasto.y;
          if (Math.hypot(dx, dy) > 5) arrasto.moveu = true;
          if (arrasto.moveu) { const s = base() * cam.z; alvo.x = cam.x = arrasto.cx - dx / s; alvo.y = cam.y = arrasto.cy - dy / s; cb.current.onHover(null, 0, 0); return; }
        }
        cb.current.onHover(acha(e.global.x, e.global.y), e.global.x, e.global.y);
      });
      const solta = (e: FederatedPointerEvent) => {
        if (arrasto && !arrasto.moveu && toques.size === 1) cb.current.onClique(acha(e.global.x, e.global.y));
        toques.delete(e.pointerId); if (toques.size < 2) pinca = 0; arrasto = null;
      };
      app.stage.on('pointerup', solta); app.stage.on('pointerupoutside', solta);
      app.canvas.addEventListener('wheel', ev => { ev.preventDefault(); alvo.z = Math.max(zmin, Math.min(zmax(), alvo.z * (ev.deltaY < 0 ? 1.12 : 0.89))); }, { passive: false });

      let t = 0;
      app.ticker.add(tk => {
        const dt = Math.min(0.05, tk.deltaMS / 1000); t += dt;
        sim.passo(dt);
        const k = 1 - Math.exp(-dt * 7);
        cam.x += (alvo.x - cam.x) * k; cam.y += (alvo.y - cam.y) * k; cam.z += (alvo.z - cam.z) * k;
        const s = base() * cam.z;
        mundo.scale.set(s); mundo.position.set(app.screen.width / 2 - cam.x * s, app.screen.height / 2 - cam.y * s);
        // contorno da área aberta
        destaque.clear();
        const z = zonaRef.current && lab.zonas[zonaRef.current];
        if (z) {
          const [x, y, w, h] = z, cor = ZONAS.find(q => q.id === zonaRef.current)!.cor;
          const pts = [proj.px(x, y), proj.px(x + w, y), proj.px(x + w, y + h), proj.px(x, y + h)].flat();
          destaque.poly(pts).fill({ color: cor, alpha: 0.1 }).stroke({ color: cor, width: 3, alpha: 0.9 });
        }
        // pessoas de trás para frente
        sombras.clear();
        const ordem = [...sim.agentes].sort((a, b) => proj.profundidade(b.pos.x, b.pos.y) - proj.profundidade(a.pos.x, a.pos.y));
        ordem.forEach((a, i) => {
          const [fx, fy] = proj.px(a.pos.x, a.pos.y);
          sombras.ellipse(fx, fy, 0.3 * K, 0.15 * K).fill({ color: 0x28200f, alpha: 0.2 });
          const pose = sim.pose(a), lista = QUADROS[pose];
          const f = pose === 'andar' ? Math.floor(t * 7) : Math.floor(t * (pose === 'digitar' ? 2.2 : 1.2) + a.semente);
          const q = gente.q[`${a.id}_${a.vista}_${lista[f % lista.length]}`];
          const p = pessoas.get(a.id)!;
          if (q) p.poe(fx, fy, proj.profundidade(a.pos.x, a.pos.y), q, a.flip, 1 / gente.escala);
          camada.setChildIndex(p.mesh, i);
        });
      });
    })();
    return () => { vivo = false; try { app.destroy(true, { children: true }); } catch { /* ainda iniciando */ } };
  }, [lab, gente]);

  return <div ref={host} className="mapa" aria-label="Mapa do laboratório. Arraste para mover, use a roda ou a pinça para aproximar, clique numa área ou pessoa." />;
}
