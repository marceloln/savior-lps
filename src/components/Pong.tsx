// Pong clássico, aberto pela mesa de pingue-pongue do lounge. As regras ficam em lib/pong; aqui é só tela e controle.
import { useEffect, useRef, useState } from 'react';
import { ATE, BOLA, CAMPO, RAQUETE, novoPong, passoDoPong, type Entrada, type Pong as Jogo } from '../lib/pong';

const VERDE = '#20352F', CREME = '#F0EAD6', AREIA = '#C5AA81';
/** Algarismos de placar em grade de 3 por 5, como no jogo de 1972. */
const DIGITOS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];

function desenha(g: CanvasRenderingContext2D, p: Jogo, L: number, A: number) {
  const e = L / CAMPO.w;
  g.fillStyle = VERDE; g.fillRect(0, 0, L, A);
  // rede: tracejado no meio do campo
  g.fillStyle = 'rgba(240,234,214,.35)';
  for (let y = 2; y < CAMPO.h; y += 6) g.fillRect((CAMPO.w / 2 - 0.5) * e, y * e, e, 3 * e);
  // placar
  g.fillStyle = AREIA;
  p.pontos.forEach((n, lado) => {
    const d = DIGITOS[Math.min(9, n)], t = 2.2 * e, x0 = (CAMPO.w / 2 + (lado ? 12 : -12 - 3 * 2.2)) * e;
    for (let i = 0; i < 15; i++) if (d[i] === '1') g.fillRect(x0 + (i % 3) * t, 6 * e + Math.floor(i / 3) * t, t + 0.5, t + 0.5);
  });
  g.fillStyle = CREME;
  g.fillRect(RAQUETE.margem * e, (p.esq - RAQUETE.h / 2) * e, RAQUETE.w * e, RAQUETE.h * e);
  g.fillRect((CAMPO.w - RAQUETE.margem - RAQUETE.w) * e, (p.dir - RAQUETE.h / 2) * e, RAQUETE.w * e, RAQUETE.h * e);
  if (!p.fim) g.fillRect((p.bola.x - BOLA.lado / 2) * e, (p.bola.y - BOLA.lado / 2) * e, BOLA.lado * e, BOLA.lado * e);
}

/** O campo do Pong. Mouse ou dedo levam a raquete; as setas e W e S também. Espaço pausa. */
export function Pong({ aoPlacar }: { aoPlacar?: (pontos: [number, number], fim: 0 | 1 | 2) => void }) {
  const tela = useRef<HTMLCanvasElement>(null);
  const jogo = useRef<Jogo>(novoPong());
  const entrada = useRef<Entrada>({ alvo: null, dir: 0 });
  const [pausado, setPausado] = useState(true);
  const [placar, setPlacar] = useState<{ pontos: [number, number]; fim: 0 | 1 | 2 }>({ pontos: [0, 0], fim: 0 });
  const avisa = useRef(aoPlacar); avisa.current = aoPlacar;

  const recomeca = () => { jogo.current = novoPong(); setPlacar({ pontos: [0, 0], fim: 0 }); avisa.current?.([0, 0], 0); setPausado(false); tela.current?.focus(); };

  useEffect(() => {
    const c = tela.current!, g = c.getContext('2d')!;
    let quadro = 0, antes = performance.now(), visto = '0,0,0';
    const mede = () => { const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); c.width = Math.round(r.width * dpr); c.height = Math.round(r.width * dpr * CAMPO.h / CAMPO.w); };
    mede();
    const ro = new ResizeObserver(mede); ro.observe(c);
    const roda = (agora: number) => {
      const dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
      const p = jogo.current;
      if (!pausado && !p.fim) passoDoPong(p, entrada.current, dt);
      desenha(g, p, c.width, c.height);
      const chave = `${p.pontos[0]},${p.pontos[1]},${p.fim}`;
      if (chave !== visto) { visto = chave; const novo = { pontos: [...p.pontos] as [number, number], fim: p.fim }; setPlacar(novo); avisa.current?.(novo.pontos, novo.fim); }
      quadro = requestAnimationFrame(roda);
    };
    quadro = requestAnimationFrame(roda);
    // quem sai da aba volta com o jogo parado, não com três pontos a menos
    const some = () => { if (document.hidden) setPausado(true); };
    document.addEventListener('visibilitychange', some);
    return () => { cancelAnimationFrame(quadro); ro.disconnect(); document.removeEventListener('visibilitychange', some); };
  }, [pausado]);

  const ponteiro = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    entrada.current = { alvo: ((e.clientY - r.top) / r.height) * CAMPO.h, dir: 0 };
  };
  const tecla = (e: React.KeyboardEvent, apertou: boolean) => {
    const dir = e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' ? -1 : e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' ? 1 : 0;
    if (dir) { e.preventDefault(); if (apertou) entrada.current = { alvo: null, dir }; else if (entrada.current.dir === dir) entrada.current = { alvo: null, dir: 0 }; return; }
    if (apertou && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); if (placar.fim) recomeca(); else setPausado(x => !x); }
  };

  const fim = placar.fim;
  return (
    <div className="pong">
      <div className="pong-campo">
        <canvas ref={tela} tabIndex={0} role="img" aria-label={`Campo do Pong. Você ${placar.pontos[0]}, máquina ${placar.pontos[1]}.`}
          onPointerMove={ponteiro} onPointerDown={e => { ponteiro(e); if (pausado && !fim) setPausado(false); }}
          onKeyDown={e => tecla(e, true)} onKeyUp={e => tecla(e, false)} />
        {(pausado || fim > 0) && (
          <div className="pong-aviso">
            {fim ? <><b>{fim === 1 ? 'Você venceu' : 'A máquina venceu'}</b><span>{placar.pontos[0]} a {placar.pontos[1]}</span><button type="button" className="primario" onClick={recomeca}>Jogar de novo</button></>
              : <><b>{placar.pontos[0] + placar.pontos[1] ? 'Pausado' : 'Pong'}</b><button type="button" className="primario" autoFocus onClick={() => { setPausado(false); tela.current?.focus(); }}>{placar.pontos[0] + placar.pontos[1] ? 'Continuar' : 'Sacar'}</button></>}
          </div>
        )}
      </div>
      <p className="pong-placar" aria-live="polite">Você {placar.pontos[0]}, máquina {placar.pontos[1]}. Vence quem fizer {ATE}.</p>
    </div>
  );
}

/** Página da esquerda do livro: como se joga. */
export function ComoJogar() {
  return (
    <div className="pong-regras">
      <ul>
        <li><b>Mouse ou dedo</b>Leve a raquete da esquerda para cima e para baixo.</li>
        <li><b>Teclado</b>Setas ou W e S movem. Espaço pausa.</li>
        <li><b>Efeito</b>Pegar a bola na ponta da raquete manda ela em diagonal.</li>
      </ul>
      <p className="nota-mao">Cinco minutos de pingue-pongue destravam mais reunião do que meia hora de slide.</p>
    </div>
  );
}
