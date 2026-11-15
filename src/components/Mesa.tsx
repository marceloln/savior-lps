// A mesa de cada especialista: a pessoa trabalhando, o que ela tem em cima da mesa e o mural atrás.
import { useEffect, useState } from 'react';
import { cartoesDoMural, peculiaridadeDe, quadrosDaMesa } from '../lib/peculiaridades';
import type { Agente } from '../lib/equipe';
import { Retrato } from './Retrato';

let lista: Promise<Record<string, number>> | null = null;
const carregaLista = () => (lista ??= fetch('assets/mesa/mesas.json').then(r => r.json()).catch(() => ({})));

/** A cena renderizada. Quem trabalha sentado alterna dois quadros, como no mapa; com movimento reduzido fica parada. */
export function CenaDaMesa({ aparencia, legenda }: { aparencia: string; legenda: string }) {
  const [quadros, setQuadros] = useState<string[]>([]);
  const [b, setB] = useState(false);
  useEffect(() => { let vivo = true; carregaLista().then(l => { if (vivo) setQuadros(quadrosDaMesa(aparencia, l)); }); return () => { vivo = false; }; }, [aparencia]);
  useEffect(() => {
    if (quadros.length < 2) return;
    const mm = matchMedia('(prefers-reduced-motion: reduce)');
    let t = 0;
    const liga = () => { clearInterval(t); setB(false); if (!mm.matches) t = window.setInterval(() => { if (!document.hidden) setB(x => !x); }, 430); };
    liga(); mm.addEventListener('change', liga);
    return () => { clearInterval(t); mm.removeEventListener('change', liga); };
  }, [quadros]);
  if (!quadros.length) return <figure className="cena-mesa vazia" aria-hidden="true" />;
  return (
    <figure className={`cena-mesa ${b ? 'b' : ''}`}>
      <img src={quadros[0]} alt={legenda} />
      {quadros[1] && <img src={quadros[1]} alt="" aria-hidden="true" />}
    </figure>
  );
}

/** Página da direita: a cena grande, o que está na mesa e o que está no mural. */
export function MesaDe({ m, zona }: { m: Agente; zona: string }) {
  const p = m.base ? peculiaridadeDe(m.id) : null;
  return (
    <div className="mesa-de">
      <CenaDaMesa key={m.aparencia} aparencia={m.aparencia} legenda={`${m.nome} trabalhando na ${zona}${p ? `. No mural: ${p.mural.titulo}.` : ''}`} />
      {p ? (
        <div className="mesa-itens">
          <section><h4 className="rotulo">Na mesa</h4><ul className="etiquetas">{p.mesa.map(x => <li key={x}>{x}</li>)}</ul></section>
          <section><h4 className="rotulo">No mural, {p.mural.titulo}</h4><ul className="etiquetas">{cartoesDoMural(p).map(x => <li key={x}>{x}</li>)}</ul></section>
        </div>
      ) : <p className="nota">{m.nome} chegou depois ao lab. A mesa ainda está sendo montada do jeito dela.</p>}
    </div>
  );
}

/** Página da esquerda: o rosto, a frase que resume a pessoa, as manias e o que fazer a seguir. */
export function JeitoDe({ m, cor, conversa, missao, ficha }: { m: Agente; cor: string; conversa: () => void; missao: () => void; ficha: () => void }) {
  const p = m.base ? peculiaridadeDe(m.id) : null;
  return (
    <div className="mesa-jeito">
      <Retrato id={m.id} tamanho={104} cor={cor + '40'} />
      {p && <p className="nota-mao">{p.frase}</p>}
      {p && <section><h4 className="rotulo">Manias</h4><ul className="manias">{p.manias.map(x => <li key={x}>{x}</li>)}</ul></section>}
      <div className="mesa-acoes">
        <button type="button" className="primario" onClick={conversa}>{m.id === 'clara' ? 'Começar briefing' : `Conversar com ${m.nome}`}</button>
        <button type="button" className="leve" onClick={missao}>Dar uma missão</button>
        <button type="button" className="leve" onClick={ficha}>Abrir a ficha</button>
      </div>
    </div>
  );
}
