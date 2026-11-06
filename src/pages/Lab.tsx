import { useCallback, useState } from 'react';
import { MapaPixi, type Alvo } from '../components/MapaPixi';
import { Chat } from '../components/Chat';
import { FichaAgente, PainelZona } from '../components/Fichas';
import { Agenda, Clientes, Conexoes, Decisoes, Projetos, Trofeus } from '../components/Paineis';
import { CartaoLugar, Console, FotoLugar, FasesIlustradas, ListaMissoes, Livro, MapaTinta, MenuDiario, Missoes, Placa, Selos, ABAS, SOBRE_ZONA, type Aba, type Acao } from '../components/Diario';
import { Retrato } from '../components/Retrato';
import { useEstado } from '../hooks/useEstado';
import { useLab } from '../hooks/useLab';
import { ZONAS } from '../lib/lab';
import { EQUIPE } from '../lib/equipe';

type Aberto =
  | { tipo: 'aba'; aba: Aba; novo?: boolean } | { tipo: 'ficha'; id: string; aba?: 'visao' | 'instrucoes' | 'memoria'; foca?: boolean }
  | { tipo: 'conversa'; id: string } | { tipo: 'reuniao'; com: string[] } | { tipo: 'sala'; id: string } | null;

const SOBRE_ABA: Record<Aba, string> = {
  missoes: 'O que a equipe tem nas mãos agora.',
  clientes: 'Por setor e situação, nunca pelo nome.', projetos: 'A mesa do método e as tarefas de cada projeto.',
  pessoas: 'Quem está no lab e o que cada um faz.', lugares: 'A planta do open space. Clique numa sala para abrir.',
  agenda: 'Reuniões com ata e decisão.', decisoes: 'O que foi resolvido e por quê.',
  memoria: 'O que cada especialista já sabe sobre vocês.', conexoes: 'O que está ligado ao lab agora.', trofeus: 'O que a equipe já entregou.',
};

export function Lab() {
  const { lab, gente, erro } = useLab();
  const { estado, aviso, limpaAviso } = useEstado();
  const [dica, setDica] = useState<{ alvo: Alvo; x: number; y: number }>({ alvo: null, x: 0, y: 0 });
  const [aberto, setAberto] = useState<Aberto>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [zona, setZona] = useState<string | null>(null);
  const [mirando, setMirando] = useState(false);
  const [foco, setFoco] = useState<{ zona: string; n: number } | null>(null);
  const [projeto, setProjeto] = useState<string | undefined>();
  const [registro, setRegistro] = useState<string[]>([]);
  const anota = (s: string) => setRegistro(r => [...r.slice(-5), s]);
  const fecha = useCallback(() => setAberto(null), []);
  const m = EQUIPE.find(e => e.id === escolhido) ?? null;

  const abreSala = useCallback((z: string) => {
    setZona(z); setFoco(f => ({ zona: z, n: (f?.n ?? 0) + 1 })); setAberto({ tipo: 'sala', id: z });
  }, []);
  /** Escolhe alguém, leva a câmera até a sala da pessoa e fecha o livro. */
  const escolhe = useCallback((id: string) => {
    const p = EQUIPE.find(e => e.id === id); if (!p) return;
    setEscolhido(id); setZona(p.zona); setMirando(false); setAberto(null);
    setFoco(f => ({ zona: p.zona, n: (f?.n ?? 0) + 1 }));
  }, []);
  const abreAba = (a: Aba) => setAberto(x => (x?.tipo === 'aba' && x.aba === a ? null : { tipo: 'aba', aba: a }));
  const onHover = useCallback((alvo: Alvo, x: number, y: number) => setDica({ alvo, x, y }), []);
  const onClique = useCallback((alvo: Alvo) => {
    setDica(d => ({ ...d, alvo: null }));
    if (!alvo) { setZona(null); return; }
    if (alvo.tipo === 'zona') { abreSala(alvo.id); return; }
    setEscolhido(alvo.agente.id); setZona(alvo.agente.zona); setMirando(false);
  }, [abreSala]);
  const onMovido = useCallback((ok: boolean) => {
    if (!ok) { anota('Ali tem móvel no caminho. Escolha uma casa verde do piso.'); return; }
    setMirando(false); setEscolhido(id => { const p = EQUIPE.find(e => e.id === id); if (p) anota(`${p.nome} está a caminho.`); return id; });
  }, []);
  const abreProjeto = (id: string) => { setProjeto(id); setAberto({ tipo: 'aba', aba: 'projetos' }); };
  const age = (a: Acao) => {
    if (!m) return;
    if (a === 'mover') { setMirando(v => !v); return; }
    setMirando(false);
    if (a === 'conversar') setAberto(m.id === 'clara' ? { tipo: 'conversa', id: 'clara' } : { tipo: 'conversa', id: m.id });
    if (a === 'missao') setAberto({ tipo: 'ficha', id: m.id, aba: 'visao', foca: true });
    if (a === 'memoria') setAberto({ tipo: 'ficha', id: m.id, aba: 'memoria' });
    if (a === 'reuniao') setAberto({ tipo: 'reuniao', com: [m.id] });
  };

  let livro = null;
  if (aberto && lab && gente) {
    if (aberto.tipo === 'aba') {
      const a = aberto.aba, nome = ABAS.find(x => x.id === a)!.nome;
      const p = estado.projetos.find(x => x.id === projeto) ?? estado.projetos[0];
      const ilustracao = {
        missoes: null,
        clientes: <figure className="foto-colada"><img src="assets/mesa_postos.webp" alt="" /><figcaption>A mesa do método</figcaption></figure>,
        projetos: p ? <>{p.mesa && <figure className="foto-colada"><img src={`assets/${p.mesa}`} alt={`Mesa de ${p.nome}`} /><figcaption>{p.nome}</figcaption></figure>}<FasesIlustradas fase={p.fase} /></> : null,
        pessoas: <p className="nota-mao">Dezessete especialistas, cada um com mesa, papel e memória própria.</p>,
        lugares: <><MapaTinta lab={lab} escolhe={abreSala} /><p className="nota-mao">Um deck de madeira solto no campus, com salas de vidro para reunião e protótipo.</p></>,
        agenda: <p className="nota-mao">Toda reunião termina com ata. Se não teve decisão, foi conversa.</p>,
        decisoes: <p className="nota-mao">Decisão sem motivo escrito vira discussão de novo daqui a um mês.</p>,
        memoria: <p className="nota-mao">O que fica aqui entra em toda conversa com aquela pessoa.</p>,
        conexoes: null, trofeus: <p className="nota-mao">Contam o que foi feito de verdade, sem inventar número.</p>,
      }[a];
      const corpo = {
        missoes: <div className="missoes-livro"><ListaMissoes abreProjeto={abreProjeto} escolhe={escolhe} max={30} /></div>,
        clientes: <Clientes abreProjeto={abreProjeto} novo={aberto.novo} />, projetos: <Projetos inicial={projeto} />, agenda: <Agenda />, decisoes: <Decisoes />, conexoes: <Conexoes />, trofeus: <Trofeus />,
        pessoas: <ul className="elenco">{EQUIPE.map(e => <li key={e.id}><button onClick={() => { setEscolhido(e.id); setZona(e.zona); setAberto({ tipo: 'ficha', id: e.id }); }}><Retrato id={e.id} tamanho={44} /><span><b>{e.nome}</b><small>{e.papel}</small></span></button></li>)}</ul>,
        lugares: <><ul className="lista-lugares">{ZONAS.map(z => {
          const n = EQUIPE.filter(e => e.zona === z.id).length;
          return <li key={z.id}><button onClick={() => abreSala(z.id)} style={{ ['--c' as string]: z.cor }}><b>{z.nome}</b><small>{n ? `${n} ${n === 1 ? 'pessoa' : 'pessoas'}` : 'Uso comum'}</small><span>{SOBRE_ZONA[z.id]}</span></button></li>;
        })}</ul></>,
        memoria: estado.memorias.length ? <ul className="notas">{estado.memorias.map(n => <li key={n.id}><p>{n.texto}</p><footer><button className="link" onClick={() => setAberto({ tipo: 'ficha', id: n.agente, aba: 'memoria' })}>{EQUIPE.find(e => e.id === n.agente)?.nome}</button></footer></li>)}</ul> : <p className="vazio">Ninguém guardou nada ainda.</p>,
      }[a];
      livro = <Livro titulo={nome} sobre={SOBRE_ABA[a]} ilustracao={ilustracao} aoFechar={fecha}>{corpo}</Livro>;
    } else if (aberto.tipo === 'ficha') {
      const p = EQUIPE.find(e => e.id === aberto.id)!, z = ZONAS.find(q => q.id === p.zona)!;
      livro = <Livro titulo={p.nome} sobre={p.papel} cor={z.cor} ilustracao={<><Retrato id={p.id} tamanho={150} cor={z.cor + '40'} /><p className="nota-mao">{SOBRE_ZONA[z.id]}</p></>} aoFechar={fecha}>
        <FichaAgente key={p.id + (aberto.aba ?? '')} m={p} abaInicial={aberto.aba} focaMissao={aberto.foca} aoDar={anota}
          noMapa={() => escolhe(p.id)} conversa={() => setAberto({ tipo: 'conversa', id: p.id })} /></Livro>;
    } else if (aberto.tipo === 'conversa') {
      const p = EQUIPE.find(e => e.id === aberto.id)!;
      const dela = estado.tarefas.filter(t => t.agente === p.id && t.estado !== 'feito');
      livro = <Livro titulo={p.id === 'clara' ? 'Briefing com a Clara' : `Conversa com ${p.nome}`} sobre={p.id === 'clara' ? 'Uma pergunta por vez, até fechar o pedido.' : p.papel} aoFechar={fecha}
        ilustracao={<><Retrato id={p.id} tamanho={120} />{p.id === 'clara' && <button className="primario cadastrar" onClick={() => setAberto({ tipo: 'aba', aba: 'clientes', novo: true })}>Cadastrar o cliente deste briefing</button>}{dela.length > 0 && <div className="contexto"><h4>Nas mãos de {p.nome}</h4><ul>{dela.map(t => <li key={t.id}><span className={`estado ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span>{t.titulo}</li>)}</ul></div>}</>}>
        <Chat agente={p.id} setAgente={id => setAberto({ tipo: 'conversa', id })} so /></Livro>;
    } else if (aberto.tipo === 'sala') {
      const z = ZONAS.find(q => q.id === aberto.id)!;
      livro = <Livro titulo={z.nome} sobre={SOBRE_ZONA[z.id]} cor={z.cor} aoFechar={fecha}
        ilustracao={<figure className="foto-colada"><FotoLugar zona={z.id} lab={lab} larg={300} alt={190} esc={0.62} /><figcaption>{z.nome}</figcaption></figure>}>
        <PainelZona key={z.id} zona={z.id} abreAgente={id => { setEscolhido(id); setAberto({ tipo: 'ficha', id }); }} aoDar={anota}
          conversa={id => { setEscolhido(id); setAberto({ tipo: 'conversa', id }); }} darMissao={id => { setEscolhido(id); setAberto({ tipo: 'ficha', id, aba: 'visao', foca: true }); }}
          briefing={() => setAberto({ tipo: 'conversa', id: 'clara' })} marcaReuniao={com => setAberto({ tipo: 'reuniao', com })} /></Livro>;
    } else if (aberto.tipo === 'reuniao') {
      livro = <Livro titulo="Agenda" sobre={SOBRE_ABA.agenda} aoFechar={fecha}><Agenda com={aberto.com} /></Livro>;
    }
  }

  return (
    <div className={livro ? 'lab com-livro' : 'lab'}>
      {erro && <p className="falha-carga" role="alert">{erro}</p>}
      {lab && gente && <MapaPixi lab={lab} gente={gente} zonaAtiva={zona} selecionado={escolhido} modoMover={mirando} foco={foco}
        onHover={onHover} onClique={onClique} onMovido={onMovido} />}
      <div className="coluna-esquerda">
        <Placa />
        <MenuDiario ativa={aberto?.tipo === 'aba' ? aberto.aba : null} abre={abreAba} />
      </div>
      {lab && !aberto && <CartaoLugar zona={zona} lab={lab} abre={abreSala} />}
      <div className="coluna-direita">
        <Selos abre={abreAba} />
        <Missoes abreProjeto={abreProjeto} escolhe={escolhe} />
      </div>
      {dica.alvo && !aberto && (
        <div className="dica papel-borda" style={{ left: Math.min(dica.x + 18, innerWidth - 280), top: dica.y + 18 }}>
          {dica.alvo.tipo === 'agente'
            ? <><b>{dica.alvo.agente.nome}</b><small>{dica.alvo.agente.papel}</small><small className="acao">Clique para escolher</small></>
            : <><b>{ZONAS.find(q => q.id === (dica.alvo as { id: string }).id)?.nome}</b><small className="acao">Clique para abrir a sala</small></>}
        </div>
      )}
      <Console escolhido={m} mirando={mirando} registro={registro} age={age}
        briefing={() => setAberto({ tipo: 'conversa', id: 'clara' })} solta={() => { setEscolhido(null); setMirando(false); }} />
      {livro && <div className="cortina" onClick={fecha} />}
      {livro}
      {aviso && <div className="aviso papel-borda" role="alert"><p>{aviso}</p><button onClick={limpaAviso}>Entendi</button></div>}
    </div>
  );
}
