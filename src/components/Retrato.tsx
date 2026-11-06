import { useEffect, useRef } from 'react';
import { EQUIPE } from '../lib/equipe';

let atlas: HTMLImageElement | null = null;
let ordem: Promise<string[]> | null = null;
const carrega = () => {
  if (!atlas) { atlas = new Image(); atlas.src = 'assets/retratos.webp'; }
  ordem ??= fetch('assets/retratos.json').then(r => r.json());
  return { img: atlas, ordem };
};

/** Rosto de frente, renderizado do mesmo modelo 3D que anda no mapa. */
export function Retrato({ id, tamanho = 44, cor }: { id: string; tamanho?: number; cor?: string }) {
  const tela = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let vivo = true;
    const { img, ordem } = carrega();
    ordem.then(ids => {
      const i = ids.indexOf(id);
      const desenha = () => {
        const c = tela.current; if (!vivo || !c || i < 0) return;
        const g = c.getContext('2d')!; g.clearRect(0, 0, c.width, c.height); g.drawImage(img, i * 128, 0, 128, 128, 0, 0, c.width, c.height);
      };
      if (img.complete) desenha(); else img.addEventListener('load', desenha, { once: true });
    });
    return () => { vivo = false; };
  }, [id]);
  return <canvas ref={tela} width={tamanho * 2} height={tamanho * 2} className="retrato" style={{ width: tamanho, height: tamanho, background: cor }} title={EQUIPE.find(e => e.id === id)?.nome} aria-hidden="true" />;
}
