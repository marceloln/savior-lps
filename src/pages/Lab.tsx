import { useCallback, useState } from 'react';
import { MapaPixi, type Alvo } from '../components/MapaPixi';
import { useLab } from '../hooks/useLab';
import { ZONAS } from '../lib/lab';
import { EQUIPE } from '../lib/equipe';

export function Lab() {
  const { lab, gente, erro } = useLab();
  const [dica, setDica] = useState<{ alvo: Alvo; x: number; y: number }>({ alvo: null, x: 0, y: 0 });
  const [zona, setZona] = useState<string | null>(null);
  const onHover = useCallback((alvo: Alvo, x: number, y: number) => setDica({ alvo, x, y }), []);
  const onClique = useCallback((alvo: Alvo) => {
    if (!alvo) setZona(null);
    else setZona(alvo.tipo === 'zona' ? alvo.id : alvo.agente.zona);
  }, []);
  const z = ZONAS.find(q => q.id === zona);

  return (
    <div className="lab">
      {erro && <p className="erro">{erro}</p>}
      {lab && gente && <MapaPixi lab={lab} gente={gente} onHover={onHover} onClique={onClique} zonaAtiva={zona} />}
      <header className="topo vidro"><span className="marca">V30</span><b>Lab V30</b><small>formato final · primeira etapa</small></header>
      {dica.alvo && (
        <div className="dica vidro" style={{ left: dica.x + 18, top: dica.y + 18 }}>
          {dica.alvo.tipo === 'agente'
            ? <><b>{dica.alvo.agente.nome}</b><small>{dica.alvo.agente.papel}</small></>
            : <><b>{ZONAS.find(q => q.id === (dica.alvo as { id: string }).id)?.nome}</b><small>Clique para abrir a área</small></>}
        </div>
      )}
      {z && (
        <aside className="painel vidro" aria-label={z.nome}>
          <span className="selo" style={{ background: z.cor }} />
          <h2>{z.nome}</h2>
          <ul>{EQUIPE.filter(m => m.zona === z.id).map(m => <li key={m.id}><b>{m.nome}</b> {m.papel}</li>)}</ul>
          <button onClick={() => setZona(null)}>Fechar</button>
        </aside>
      )}
    </div>
  );
}
