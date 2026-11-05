export type Entrada = 'conversar' | 'briefing' | 'clientes' | 'projetos' | 'agenda' | 'decisoes' | 'conexoes' | 'trofeus';

const ICONES: Record<Entrada, string> = {
  conversar: 'M4 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  briefing: 'M6 3h8l3 3v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 9h6M8 12h6M8 15h4',
  clientes: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 18c.6-3.4 3-5 6-5s5.4 1.6 6 5',
  projetos: 'M3 6h14v10H3zM3 9h14M7 6V4h6v2',
  agenda: 'M4 5h12v12H4zM4 9h12M8 3v4M12 3v4',
  decisoes: 'M10 3v14M5 7l5-4 5 4M5 13h10',
  conexoes: 'M7 7a3 3 0 1 0 0 6M13 7a3 3 0 1 1 0 6M7 10h6',
  trofeus: 'M6 3h8v4a4 4 0 0 1-8 0zM6 5H3a3 3 0 0 0 3 3M14 5h3a3 3 0 0 1-3 3M10 11v4M7 17h6',
};
export const NOMES: Record<Entrada, string> = {
  conversar: 'Conversar', briefing: 'Briefing', clientes: 'Clientes', projetos: 'Projetos',
  agenda: 'Agenda', decisoes: 'Decisões', conexoes: 'Conexões', trofeus: 'Troféus',
};

export function Icone({ nome }: { nome: Entrada }) {
  return <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d={ICONES[nome]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Menu({ ativo, abre }: { ativo: Entrada | null; abre: (e: Entrada) => void }) {
  return (
    <nav className="menu vidro" aria-label="Menu do lab">
      {(Object.keys(NOMES) as Entrada[]).map(e => (
        <button key={e} aria-pressed={ativo === e} onClick={() => abre(e)}>
          <Icone nome={e} /><span>{NOMES[e]}</span>
        </button>
      ))}
    </nav>
  );
}
