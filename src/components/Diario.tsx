// Peças fixas da tela no tema do diário de campo: placa, abas, cartão do lugar, missões, console e o livro.
import { useEffect, useRef, type ReactNode } from 'react';
import { Icone, type NomeIcone } from './Icones';
import { Retrato } from './Retrato';
import { useEstado } from '../hooks/useEstado';
import { EQUIPE, type Membro } from '../lib/equipe';
import { ZONAS, type DadosLab } from '../lib/lab';
import { criaProjecao } from '../lib/projecao';
import { FASES } from '../lib/dados';

export type Aba = 'missoes' | 'clientes' | 'projetos' | 'pessoas' | 'lugares' | 'agenda' | 'decisoes' | 'memoria' | 'conexoes' | 'trofeus';
export const ABAS: { id: Aba; nome: string; so?: 'celular' }[] = [
  { id: 'missoes', nome: 'Missões', so: 'celular' },
  { id: 'clientes', nome: 'Clientes' }, { id: 'projetos', nome: 'Projetos' }, { id: 'pessoas', nome: 'Pessoas' },
  { id: 'lugares', nome: 'Lugares' }, { id: 'agenda', nome: 'Agenda' }, { id: 'decisoes', nome: 'Decisões' },
  { id: 'memoria', nome: 'Memória' }, { id: 'conexoes', nome: 'Conexões' }, { id: 'trofeus', nome: 'Troféus' },
];

export const SOBRE_ZONA: Record<string, string> = {
  estrategia: 'Onde o diagnóstico vira tese. Lousa cheia, pouca reunião e muita pergunta.',
  planejamento: 'A mesa da planta azul. Cada projeto anda aqui de fase em fase.',
  comercial: 'Proposta que cabe na realidade do cliente sai desta mesa alta.',
  arquivo: 'Tudo que já foi entregue, guardado para não começar do zero.',
  reuniao: 'Sala de vidro para o ritual da semana. Entra com pauta, sai com decisão.',
  marca: 'Tom de voz, posts e peças. A parede de referências muda toda semana.',
  trafego: 'O centro do lab. Todo pedido passa por aqui antes de virar missão.',
  cx: 'Um pedaço de loja de verdade para testar abordagem antes de levar à unidade.',
  produto: 'Laboratório de vidro com impressoras, laser e bancada. Protótipo em pé em dias.',
  dados: 'O painel do gerente nasce aqui, com o que medir e o que ignorar.',
  academia: 'Arquibancada e estações de treino. Skill nova se aprende fazendo.',
  lounge: 'Café, ping pong e sofá. Metade das boas ideias aparece aqui.',
  atendimento: 'O balcão da Clara. Todo cliente novo começa por uma conversa aqui.',
};

export function Placa() {
  return (
    <header className="placa papel-borda">
      <b>Lab V30</b>
      <small>Diário de campo</small>
    </header>
  );
}

export function MenuDiario({ ativa, abre }: { ativa: Aba | null; abre: (a: Aba) => void }) {
  return (
    <nav className="menu-diario papel-borda" aria-label="Diário">
      {ABAS.map(a => (
        <button key={a.id} className={a.so ? 'so-celular' : undefined} aria-pressed={ativa === a.id} onClick={() => abre(a.id)}>
          <Icone nome={(a.id === 'missoes' ? 'missao' : a.id) as NomeIcone} /><span>{a.nome}</span>
        </button>
      ))}
    </nav>
  );
}

/** Recorte da sala tirado da própria foto do lab. */
export function FotoLugar({ zona, lab, larg = 236, alt = 112, esc = 0.42 }: { zona: string; lab: DadosLab; larg?: number; alt?: number; esc?: number }) {
  const r = lab.zonas[zona]; if (!r) return null;
  const [cx, cy] = criaProjecao(lab).px(r[0] + r[2] / 2, r[1] + r[3] / 2, 0.6);
  return <div className="foto-lugar" style={{ width: larg, height: alt, backgroundImage: 'url(assets/lab.webp)', backgroundSize: `${lab.larg * esc}px ${lab.alt * esc}px`, backgroundPosition: `${larg / 2 - cx * esc}px ${alt / 2 - cy * esc}px` }} />;
}

export function CartaoLugar({ zona, lab, abre }: { zona: string | null; lab: DadosLab; abre: (z: string) => void }) {
  const z = ZONAS.find(q => q.id === zona);
  if (!z) return null;
  const time = EQUIPE.filter(m => m.zona === z.id);
  return (
    <aside className="cartao-lugar papel-borda" aria-label={`Lugar: ${z.nome}`}>
      <h3>{z.nome}</h3>
      <FotoLugar zona={z.id} lab={lab} />
      <p>{SOBRE_ZONA[z.id]}</p>
      {time.length > 0 && <div className="rostos">{time.map(m => <Retrato key={m.id} id={m.id} tamanho={26} />)}</div>}
      <button className="primario" onClick={() => abre(z.id)}>Abrir a sala</button>
    </aside>
  );
}

export function Selos({ abre }: { abre: (a: Aba) => void }) {
  const { estado } = useEstado();
  const p = estado.projetos[0];
  const feitas = estado.tarefas.filter(t => t.estado === 'feito').length, n = estado.decisoes.length;
  return (
    <nav className="selos papel-borda" aria-label="Situação do lab">
      {p && <button onClick={() => abre('projetos')} title={`Ciclo de ${p.nome}`}><Icone nome="projetos" tam={18} />Dia {p.dia} de 30</button>}
      <button onClick={() => abre('trofeus')} title="Missões concluídas em todos os projetos"><Icone nome="estrela" tam={18} />{feitas} {feitas === 1 ? 'feita' : 'feitas'}</button>
      <button onClick={() => abre('decisoes')} title="Decisões registradas"><Icone nome="decisoes" tam={18} />{n} {n === 1 ? 'decisão' : 'decisões'}</button>
    </nav>
  );
}

/** O que a equipe tem nas mãos agora. O rosto leva à pessoa no mapa, o texto leva ao projeto. */
export function ListaMissoes({ abreProjeto, escolhe, verTodas, max = 5 }: { abreProjeto: (id: string) => void; escolhe: (id: string) => void; verTodas?: () => void; max?: number }) {
  const { estado } = useEstado();
  const abertas = estado.tarefas.filter(t => t.estado !== 'feito').sort((a, b) => (a.estado === b.estado ? 0 : a.estado === 'fazendo' ? -1 : 1));
  if (!abertas.length) return <p className="vazio">Ninguém tem missão aberta. Escolha alguém e aperte Missão no console.</p>;
  return (
    <>
      <ul>
        {abertas.slice(0, max).map(t => {
          const m = EQUIPE.find(e => e.id === t.agente), z = ZONAS.find(q => q.id === m?.zona), p = estado.projetos.find(x => x.id === t.projeto_id);
          return (
            <li key={t.id} className="cartao-missao" style={{ ['--c' as string]: z?.cor ?? '#C5AA81' }}>
              <button className="marcador" onClick={() => escolhe(t.agente)} aria-label={`Ver ${m?.nome} no mapa`} title={`Ver ${m?.nome} no mapa`}><Retrato id={t.agente} tamanho={30} /></button>
              <button className="texto" onClick={() => (t.projeto_id ? abreProjeto(t.projeto_id) : escolhe(t.agente))}>
                <b>{t.titulo}</b><small>{m?.nome}{p ? `, ${p.nome}` : ''}</small>
              </button>
              <span className={`estado-fita ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span>
            </li>
          );
        })}
      </ul>
      {abertas.length > max && verTodas && <button className="link ver-todas" onClick={verTodas}>Ver as {abertas.length} missões abertas</button>}
    </>
  );
}

export function Missoes({ abreProjeto, escolhe, verTodas }: { abreProjeto: (id: string) => void; escolhe: (id: string) => void; verTodas: () => void }) {
  const { estado } = useEstado();
  const todas = estado.tarefas.filter(t => t.projeto_id);
  const feitas = todas.filter(t => t.estado === 'feito').length;
  const pct = todas.length ? Math.round((feitas / todas.length) * 100) : 0;
  return (
    <aside className="missoes papel-borda" aria-label="Missões">
      <h3 className="titulo-coluna">Missões</h3>
      <div className="progresso-geral" title="Missões concluídas somando todos os projetos"><span>Todos os projetos</span><div className="barra"><i style={{ transform: `scaleX(${pct / 100})` }} /></div><b>{pct}%</b></div>
      <ListaMissoes abreProjeto={abreProjeto} escolhe={escolhe} verTodas={verTodas} />
    </aside>
  );
}

export type Acao = 'mover' | 'conversar' | 'missao' | 'memoria' | 'reuniao';
const ACOES: { id: Acao; nome: string; icone: NomeIcone }[] = [
  { id: 'mover', nome: 'Mover', icone: 'mover' }, { id: 'conversar', nome: 'Conversar', icone: 'conversar' },
  { id: 'missao', nome: 'Missão', icone: 'missao' }, { id: 'memoria', nome: 'Memória', icone: 'memoria' }, { id: 'reuniao', nome: 'Reunião', icone: 'reuniao' },
];

export function Console({ escolhido, mirando, registro, age, briefing, solta }: {
  escolhido: Membro | null; mirando: boolean; registro: string[]; age: (a: Acao) => void; briefing: () => void; solta: () => void;
}) {
  const { estado } = useEstado();
  const z = escolhido ? ZONAS.find(q => q.id === escolhido.zona) : null;
  const minhas = escolhido ? estado.tarefas.filter(t => t.agente === escolhido.id) : [];
  const feitas = minhas.filter(t => t.estado === 'feito').length, notas = escolhido ? estado.memorias.filter(m => m.agente === escolhido.id).length : 0;
  const agora = minhas.find(t => t.estado === 'fazendo'), fila = minhas.filter(t => t.estado === 'fila').length;
  const situacao = !escolhido ? '' : agora ? `Agora: ${agora.titulo}.${fila ? ` Mais ${fila} na fila.` : ''}`
    : fila ? `${escolhido.nome} tem ${fila} ${fila === 1 ? 'missão' : 'missões'} na fila. Abra Missão para começar.` : `${escolhido.nome} está livre. Dê uma missão.`;
  return (
    <section className={`console madeira ${escolhido ? '' : 'vazio-console'}`} aria-label="Console">
      <div className={`console-ficha papel-borda ${escolhido ? 'com' : 'sem'}`}>
        {escolhido ? (
          <>
            <Retrato id={escolhido.id} tamanho={56} cor={(z?.cor ?? '#C5AA81') + '55'} />
            <div className="dados">
              <b>{escolhido.nome}</b><small>{escolhido.papel}</small>
              <div className="medidor"><span>Missões</span><div className="barra verde"><i style={{ transform: `scaleX(${minhas.length ? feitas / minhas.length : 0})` }} /></div><em>{feitas}/{minhas.length}</em></div>
              <div className="medidor"><span>Memória</span><div className="barra roxa"><i style={{ transform: `scaleX(${Math.min(1, notas / 5)})` }} /></div><em>{notas}</em></div>
            </div>
            <button className="soltar" onClick={solta} aria-label={`Soltar ${escolhido.nome}`}><Icone nome="fechar" tam={14} /></button>
          </>
        ) : (
          <button className="briefing" onClick={briefing}><Icone nome="briefing" tam={30} /><span><b>Novo briefing</b><small>A Clara faz as perguntas</small></span></button>
        )}
      </div>
      <div className="console-recado papel-borda" aria-live="polite">
        {mirando ? <p className="mira">Clique numa casa do piso para {escolhido?.nome} ir até lá.</p>
          : escolhido ? <><p><b>{z?.nome}</b> {situacao}</p>{registro.length > 0 && <p className="ultimo">{registro[registro.length - 1]}</p>}</>
          : registro.length ? registro.slice(-2).map((r, i) => <p key={i}>{r}</p>)
          : <p>Escolha alguém no mapa ou em Pessoas para conversar, dar missão ou marcar reunião. Clique numa sala para ver o que acontece nela.</p>}
      </div>
      {escolhido && <div className="console-acoes" role="toolbar" aria-label={`Ações com ${escolhido.nome}`}>
        {ACOES.map(a => (
          <button key={a.id} aria-pressed={a.id === 'mover' && mirando} onClick={() => age(a.id)} title={`${a.nome} com ${escolhido.nome}`}>
            <Icone nome={a.icone} tam={26} /><span>{a.nome}</span>
          </button>
        ))}
      </div>}
    </section>
  );
}

export function Livro({ titulo, sobre, ilustracao, cor = '#2F4A3A', aoFechar, children }: { titulo: string; sobre?: string; ilustracao?: ReactNode; cor?: string; aoFechar: () => void; children: ReactNode }) {
  const caixa = useRef<HTMLElement>(null);
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    // quem abriu o livro com um campo em foco mantém o foco ali
    if (!caixa.current?.contains(document.activeElement)) caixa.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { aoFechar(); return; }
      if (e.key !== 'Tab' || !caixa.current) return;
      const f = caixa.current.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,textarea,a[href]');
      if (!f.length) return;
      const [pri, ult] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    };
    addEventListener('keydown', tecla);
    return () => { removeEventListener('keydown', tecla); antes?.focus?.(); };
  }, [aoFechar]);
  return (
    <section ref={caixa} tabIndex={-1} role="dialog" aria-label={titulo} className="livro" style={{ ['--c' as string]: cor }}>
      <div className="pagina esquerda">
        <h2>{titulo}</h2>
        {sobre && <p className="sobre">{sobre}</p>}
        <div className="ilustracao">{ilustracao}</div>
      </div>
      <div className="pagina direita">{children}</div>
      <button className="fechar-livro" onClick={aoFechar} aria-label="Fechar o diário"><Icone nome="fechar" tam={16} /></button>
    </section>
  );
}

/** Números grandes para a página da esquerda: o que dá para saber de relance. */
export function Resumo({ itens, nota }: { itens: { n: number | string; rotulo: string; extra?: ReactNode }[]; nota?: string }) {
  return (
    <div className="resumo">
      <dl>{itens.map(i => <div key={i.rotulo} className={i.n === 0 ? 'zero' : undefined}><dt>{i.rotulo}</dt><dd>{i.n}{i.extra}</dd></div>)}</dl>
      {nota && <p className="nota-mao">{nota}</p>}
    </div>
  );
}

export function FasesIlustradas({ fase }: { fase: number }) {
  return (
    <ol className="fases-ilustradas">
      {FASES.map((f, k) => <li key={f} className={k < fase ? 'ok' : k === fase ? 'atual' : ''}><b>{k + 1}</b><span>{f}</span></li>)}
    </ol>
  );
}

export function MapaTinta({ lab, escolhe }: { lab: DadosLab; escolhe: (zona: string) => void }) {
  const W = lab.X, H = lab.Y;
  return (
    <svg viewBox={`-1 -1 ${W + 2} ${H + 2}`} className="mapa-tinta" role="group" aria-label="Planta do lab">
      <rect x="-0.4" y="-0.4" width={W + 0.8} height={H + 0.8} rx="0.6" fill="#EAD9B4" stroke="#3B2F25" strokeWidth="0.12" />
      {ZONAS.map((z, i) => {
        const [x, y, w, h] = lab.zonas[z.id];
        return (
          <g key={z.id} className="zona-tinta" tabIndex={0} role="button" aria-label={z.nome} onClick={() => escolhe(z.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolhe(z.id); } }}>
            <rect x={x} y={y} width={w} height={h} rx="0.5" fill={z.cor} fillOpacity=".32" stroke="#3B2F25" strokeWidth="0.08" strokeDasharray="0.4 0.25" />
            {/* número grande no mapa e o nome na lista ao lado: legível até no celular */}
            <circle cx={x + w / 2} cy={y + h / 2} r="1.25" fill="#FBF3E4" stroke="#3B2F25" strokeWidth="0.1" />
            <text x={x + w / 2} y={y + h / 2 + 0.06} textAnchor="middle" dominantBaseline="middle" fontSize="1.5">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}
