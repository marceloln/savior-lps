// Ícones desenhados no traço do diário: contorno em tinta marrom e um toque de cor dentro.
type Nome = 'clientes' | 'projetos' | 'pessoas' | 'lugares' | 'agenda' | 'decisoes' | 'memoria' | 'conexoes' | 'trofeus'
  | 'mover' | 'conversar' | 'missao' | 'reuniao' | 'briefing' | 'fechar' | 'estrela' | 'fita';

const D: Record<Nome, { cor: string; fill?: string; tracos: string }> = {
  clientes: { cor: '#C9603F', fill: 'M5 9h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z', tracos: 'M5 9h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM9 9V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 13h14M11 13v2h2v-2' },
  projetos: { cor: '#4F86C6', fill: 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z', tracos: 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14' },
  pessoas: { cor: '#E0A06A', fill: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', tracos: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c.8-4 3.6-6 7-6s6.2 2 7 6' },
  lugares: { cor: '#7FB069', fill: 'M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z', tracos: 'M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  agenda: { cor: '#D9776A', fill: 'M4 8h16v11H4z', tracos: 'M4 5h16v14H4zM4 9h16M8 3v4M16 3v4M8 13h2M12 13h2M8 16h2' },
  decisoes: { cor: '#C9A040', fill: 'M5 15h5l-2.5-5zM14 15h5l-2.5-5z', tracos: 'M12 4v16M8 20h8M5 7h14M7.5 7L5 15h5zM16.5 7L14 15h5zM12 4l-1 1M12 4l1 1' },
  memoria: { cor: '#8E7CC3', fill: 'M7 4c6 1 10 5 11 12l-4 3C10 15 8 10 7 4z', tracos: 'M7 4c6 1 10 5 11 12l-4 3C10 15 8 10 7 4zM7 4l7 15M4 20h8' },
  conexoes: { cor: '#E9B949', fill: 'M9 10h6v6H9z', tracos: 'M10 4h4v3h-4zM8 7h8l-1 3H9zM9 10h6v6a3 3 0 0 1-6 0zM12 19v2' },
  trofeus: { cor: '#E9B949', fill: 'M7 4h10v5a5 5 0 0 1-10 0z', tracos: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 20h8l-1-3H9z' },
  mover: { cor: '#8B6A45', fill: 'M7 4h5v9l6 3v3H7z', tracos: 'M7 4h5v9l6 3v3H7zM7 15h5M5 21h15' },
  conversar: { cor: '#5FA9C2', fill: 'M4 6h16v10H10l-4 3v-3H4z', tracos: 'M4 6h16v10H10l-4 3v-3H4zM8 10h8M8 13h5' },
  missao: { cor: '#C9603F', fill: 'M7 4h10l-2 4 2 4H7z', tracos: 'M7 4h10l-2 4 2 4H7zM7 4v17' },
  reuniao: { cor: '#7FB069', fill: 'M4 12h16v3H4z', tracos: 'M4 12h16v3H4zM6 15v5M18 15v5M9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM15 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z' },
  briefing: { cor: '#E9DDBF', fill: 'M6 4h9l3 3v13H6z', tracos: 'M6 4h9l3 3v13H6zM15 4v3h3M9 10h6M9 13h6M9 16h4' },
  fechar: { cor: 'transparent', tracos: 'M6 6l12 12M18 6L6 18' },
  estrela: { cor: '#E9B949', fill: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z', tracos: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z' },
  fita: { cor: '#C9603F', fill: 'M6 3h12v18l-6-4-6 4z', tracos: 'M6 3h12v18l-6-4-6 4z' },
};

export function Icone({ nome, tam = 22, cor }: { nome: Nome; tam?: number; cor?: string }) {
  const d = D[nome];
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" className="icone">
      {d.fill && <path d={d.fill} fill={cor ?? d.cor} opacity=".85" />}
      <path d={d.tracos} fill="none" stroke="#3B2F25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export type NomeIcone = Nome;
