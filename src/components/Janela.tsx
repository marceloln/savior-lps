import { useEffect, useRef, type ReactNode } from 'react';

type Props = { titulo: string; sobre?: string; cor?: string; largura?: 'media' | 'larga'; aoFechar: () => void; children: ReactNode };

/** Uma janela por vez: no centro no desktop, folha de baixo no celular. Esc fecha e o foco volta para onde estava. */
export function Janela({ titulo, sobre, cor = '#20352F', largura = 'media', aoFechar, children }: Props) {
  const caixa = useRef<HTMLElement>(null);
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    caixa.current?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') aoFechar(); };
    addEventListener('keydown', tecla);
    return () => { removeEventListener('keydown', tecla); antes?.focus?.(); };
  }, [aoFechar]);
  return (
    <section ref={caixa} tabIndex={-1} role="dialog" aria-label={titulo} className={`janela vidro ${largura}`} style={{ ['--c' as string]: cor }}>
      <header className="janela-topo">
        <span className="selo" />
        <div><h2>{titulo}</h2>{sobre && <p>{sobre}</p>}</div>
        <button className="fechar" onClick={aoFechar} aria-label="Fechar janela">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </header>
      <div className="janela-corpo">{children}</div>
    </section>
  );
}
