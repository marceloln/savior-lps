import { useCallback, useState } from 'react';
import { MapaPixi, type Alvo } from '../components/MapaPixi';
import { Chat } from '../components/Chat';
import { FichaAgente, PainelZona } from '../components/Fichas';
import { Agenda, Clientes, Conexoes, Decisoes, Projetos, Trofeus, itensConexao } from '../components/Paineis';
import { CartaoLugar, Console, FotoLugar, FasesIlustradas, ListaMissoes, Livro, MapaTinta, MenuDiario, Missoes, Placa, Resumo, Selos, ABAS, SOBRE_ZONA, type Aba, type Acao } from '../components/Diario';
import { Retrato } from '../components/Retrato';
import { useEstado } from '../hooks/useEstado';
import { useLab } from '../hooks/useLab';
import { ZONAS } from '../lib/lab';
import { useEquipe } from '../hooks/useEquipe';
import { ORQUESTRADOR } from '../lib/equipe';
import { useConexoes } from '../hooks/useConexoes';
import { usePedido } from '../hooks/usePedido';
import { PainelPessoas, Pedidos, Skills } from '../components/Nucleo';
import type { AbaFicha } from '../components/Fichas';
import { clientesPorEtapa, notasPorPessoa, situacaoEquipe, trofeus } from '../lib/resumo';

type Aberto =
  | { tipo: 'aba'; aba: Aba; novo?: boolean } | { tipo: 'ficha'; id: string; aba?: AbaFicha; foca?: boolean }
  | { tipo: 'conversa'; id: string } | { tipo: 'reuniao'; com: string[] } | { tipo: 'sala'; id: string } | null;

const SOBRE_ABA: Record<Aba, string> = {
  pedidos: 'Diga o que precisa. A orquestração divide, a equipe entrega e você recebe a resposta pronta.',
  skills: 'O jeito V30 de fazer cada coisa, para treinar a equipe.',
  missoes: 'O que a equipe tem nas mãos agora.',
  clientes: 'Por setor e situação, nunca pelo nome.', projetos: 'A mesa do método e as missões de cada projeto.',
  pessoas: 'Quem está no lab e o que cada um faz.', lugares: 'A planta do open space. Clique numa sala para abrir.',
  agenda: 'Reuniões com ata e decisão.', decisoes: 'O que foi resolvido e por quê.',
  memoria: 'O que cada especialista já sabe sobre vocês.', conexoes: 'O que está ligado ao lab agora.', trofeus: 'O que a equipe já entregou.',
};

/** Página da esquerda da Agenda: a próxima reunião em destaque. */
function ProximaReuniao() {
  const { estado } = useEstado();
  const r = estado.reunioes.find(x => x.status === 'agendada');
  if (!r) return <p className="nota-mao">Nada marcado. Uma reunião curta por semana por projeto segura o ritmo.</p>;
  const p = estado.projetos.find(x => x.id === r.projeto_id);
  const quando = new Date(r.dia + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const quandoFrase = quando.charAt(0).toUpperCase() + quando.slice(1);
  return (
    <div className="proxima">
      <span className="rotulo">Próxima reunião</span>
      <h3>{r.titulo}</h3>
      <p className="quando-grande">{quandoFrase}, {r.hora}</p>
      {p && <p className="de-projeto">{p.nome}</p>}
      {r.pauta && <p>{r.pauta}</p>}
      <div className="rostos">{r.participantes.map(id => <Retrato key={id} id={id} tamanho={34} />)}</div>
      <p className="nota-mao">Toda reunião termina com ata. Se não teve decisão, foi conversa.</p>
    </div>
  );
}

export function Lab() {
  const { lab, gente, erro } = useLab();
  const { estado, modo, aviso, limpaAviso, executando } = useEstado();
  const [dica, setDica] = useState<{ alvo: Alvo; x: number; y: number }>({ alvo: null, x: 0, y: 0 });
  const [aberto, setAberto] = useState<Aberto>(null);
  const conexoes = useConexoes(aberto?.tipo === 'aba' && aberto.aba === 'conexoes');
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [zona, setZona] = useState<string | null>(null);
  const [mirando, setMirando] = useState(false);
  const [foco, setFoco] = useState<{ zona: string; n: number } | null>(null);
  const [projeto, setProjeto] = useState<string | undefined>();
  const [registro, setRegistro] = useState<string[]>([]);
  const anota = (s: string) => setRegistro(r => [...r.slice(-5), s]);
  const pedido = usePedido();
  const escrevendo = [...estado.tarefas.filter(t => executando.includes(t.id)).map(t => t.agente), ...(pedido.corrida.etapa === 'planejando' || pedido.corrida.etapa === 'sintetizando' ? [ORQUESTRADOR] : [])];
  const fecha = useCallback(() => setAberto(null), []);
  const { equipe, de } = useEquipe();
  const m = (escolhido && de(escolhido)) || null;

  const abreSala = useCallback((z: string) => {
    setZona(z); setFoco(f => ({ zona: z, n: (f?.n ?? 0) + 1 })); setAberto({ tipo: 'sala', id: z });
  }, []);
  /** Escolhe alguém, leva a câmera até a sala da pessoa e fecha o livro. */
  const escolhe = useCallback((id: string) => {
    const p = de(id); if (!p) return;
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
    setMirando(false); setEscolhido(id => { const p = id ? de(id) : null; if (p) anota(`${p.nome} está a caminho.`); return id; });
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
      const eq = situacaoEquipe(estado, equipe.map(e => e.id));
      const tr = trofeus(estado), ganhos = tr.filter(t => t.atual >= t.meta).length;
      const ultima = estado.decisoes[0]?.criado_em;
      const entregues = estado.pedidos.filter(x => x.estado === 'entregue').length;
      const ilustracao = {
        pedidos: <Resumo itens={[{ n: estado.pedidos.length - entregues, rotulo: 'Em andamento' }, { n: entregues, rotulo: 'Entregues' }, { n: estado.tarefas.filter(t => t.entrega).length, rotulo: 'Entregas da equipe' }]} nota="Você aprova o plano antes de a equipe começar." />,
        skills: <Resumo itens={[{ n: estado.skills.length, rotulo: 'Skills no lab' }, { n: estado.skills.filter(k => k.para_todos).length, rotulo: 'Valem para todos' }]} nota="Quem é treinado numa skill passa a seguir o que ela diz." />,
        missoes: <Resumo itens={[{ n: estado.tarefas.filter(t => t.estado === 'fazendo').length, rotulo: 'Fazendo agora' }, { n: estado.tarefas.filter(t => t.estado === 'fila').length, rotulo: 'Na fila' }, { n: estado.tarefas.filter(t => t.estado === 'feito').length, rotulo: 'Feitas' }]} nota="Missão boa cabe numa frase e tem dono." />,
        clientes: <Resumo itens={clientesPorEtapa(estado).map(x => ({ n: x.n, rotulo: x.etapa }))} nota="Cliente entra em conversa e só vira projeto com diagnóstico." />,
        projetos: p ? <>{p.mesa && <figure className="foto-colada"><img src={`assets/${p.mesa}`} alt={`Mesa de ${p.nome}`} /><figcaption>{p.nome}</figcaption></figure>}<FasesIlustradas fase={p.fase} /></> : null,
        pessoas: <Resumo itens={[{ n: eq.fazendo, rotulo: 'Fazendo uma missão' }, { n: eq.fila, rotulo: 'Só com fila' }, { n: eq.livres.length, rotulo: 'Livres', extra: eq.livres.length > 0 && <span className="rostos">{eq.livres.slice(0, 6).map(id => <Retrato key={id} id={id} tamanho={26} />)}</span> }]} nota={`${equipe.length} especialistas, cada um com mesa, papel e memória.`} />,
        lugares: <><MapaTinta lab={lab} escolhe={abreSala} /><p className="nota-mao">Um deck de madeira solto no campus, com salas de vidro para reunião e protótipo.</p></>,
        agenda: <ProximaReuniao />,
        decisoes: <Resumo itens={[{ n: estado.decisoes.length, rotulo: 'Decisões registradas' }, ...(ultima ? [{ n: new Date(ultima.replace(' ', 'T')).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }), rotulo: 'A última' }] : [])]} nota="Decisão sem motivo escrito vira discussão de novo daqui a um mês." />,
        memoria: <Resumo itens={notasPorPessoa(estado).slice(0, 5).map(x => ({ n: x.n, rotulo: de(x.agente)?.nome ?? 'Quem saiu do lab', extra: <Retrato id={x.agente} tamanho={26} /> }))} nota="O que fica aqui entra em toda conversa com aquela pessoa." />,
        conexoes: <Resumo itens={[{ n: `${itensConexao(conexoes, modo === 'banco').filter(i => i.ok).length} de ${itensConexao(conexoes, modo === 'banco').length}`, rotulo: 'Ligados' }]} nota="Com Worker, banco, login e a chave de um provedor ligados, o lab abre para a equipe e os especialistas respondem de verdade." />, trofeus: <Resumo itens={[{ n: `${ganhos} de ${tr.length}`, rotulo: 'Conquistados' }]} nota="Contam o que foi feito de verdade, sem inventar número." />,
      }[a];
      const corpo = {
        pedidos: <Pedidos p={pedido} />, skills: <Skills />,
        missoes: <div className="missoes-livro"><ListaMissoes abreProjeto={abreProjeto} escolhe={escolhe} max={30} /></div>,
        clientes: <Clientes abreProjeto={abreProjeto} novo={aberto.novo} />, projetos: <Projetos inicial={projeto} />, agenda: <Agenda />, decisoes: <Decisoes />, conexoes: <Conexoes c={conexoes} />, trofeus: <Trofeus />,
        pessoas: <PainelPessoas abre={id => { setEscolhido(id); setZona(de(id)?.zona ?? null); setAberto({ tipo: 'ficha', id }); }} />,
        lugares: <><ul className="lista-lugares">{ZONAS.map(z => {
          const n = equipe.filter(e => e.zona === z.id).length;
          return <li key={z.id}><button onClick={() => abreSala(z.id)} style={{ ['--c' as string]: z.cor }}><b><i className="num">{ZONAS.indexOf(z) + 1}</i>{z.nome}</b><small>{n ? `${n} ${n === 1 ? 'pessoa' : 'pessoas'}` : 'Uso comum'}</small><span>{SOBRE_ZONA[z.id]}</span></button></li>;
        })}</ul></>,
        memoria: estado.memorias.length ? <ul className="notas">{estado.memorias.map(n => <li key={n.id}><p>{n.texto}</p><footer><button className="link" onClick={() => setAberto({ tipo: 'ficha', id: n.agente, aba: 'memoria' })}>{de(n.agente)?.nome ?? 'Quem saiu do lab'}</button></footer></li>)}</ul> : <p className="vazio">Ninguém guardou nada ainda.</p>,
      }[a];
      livro = <Livro titulo={nome} sobre={SOBRE_ABA[a]} ilustracao={ilustracao} aoFechar={fecha}>{corpo}</Livro>;
    } else if (aberto.tipo === 'ficha') {
      const p = de(aberto.id) ?? equipe[0], z = ZONAS.find(q => q.id === p.zona)!;
      livro = <Livro titulo={p.nome} sobre={p.papel} cor={z.cor} ilustracao={<><figure className="foto-colada estacao"><img style={{ background: `linear-gradient(${z.cor}30, ${z.cor}12)` }} src={`assets/estacao/${p.aparencia}.webp`} alt={`${p.nome} trabalhando na ${z.nome}`} /><figcaption>{p.nome} na {z.nome}</figcaption></figure><p className="nota-mao">{SOBRE_ZONA[z.id]}</p></>} aoFechar={fecha}>
        <FichaAgente key={p.id + (aberto.aba ?? '')} m={p} abaInicial={aberto.aba} focaMissao={aberto.foca} aoDar={anota}
          noMapa={() => escolhe(p.id)} conversa={() => setAberto({ tipo: 'conversa', id: p.id })} /></Livro>;
    } else if (aberto.tipo === 'conversa') {
      const p = de(aberto.id) ?? equipe[0];
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
      {lab && gente && <MapaPixi lab={lab} gente={gente} equipe={equipe} escrevendo={escrevendo} distribuicao={pedido.distribuicao ? { de: ORQUESTRADOR, ...pedido.distribuicao } : null} zonaAtiva={zona} selecionado={escolhido} modoMover={mirando} foco={foco}
        onHover={onHover} onClique={onClique} onMovido={onMovido} />}
      <div className="coluna-esquerda">
        <Placa />
        <MenuDiario ativa={aberto?.tipo === 'aba' ? aberto.aba : null} abre={abreAba} />
      </div>
      {lab && !aberto && <CartaoLugar zona={zona} lab={lab} abre={abreSala} />}
      <div className="coluna-direita">
        <Selos abre={abreAba} />
        <Missoes abreProjeto={abreProjeto} escolhe={escolhe} verTodas={() => setAberto({ tipo: 'aba', aba: 'missoes' })} />
      </div>
      {dica.alvo && !aberto && (
        <div className="dica papel-borda" style={{ left: Math.min(dica.x + 18, innerWidth - 280), top: dica.y + 18 }}>
          {dica.alvo.tipo === 'agente'
            ? <><b>{dica.alvo.agente.nome}</b><small>{dica.alvo.agente.papel}</small><small className="acao">Clique para escolher</small></>
            : <><b>{ZONAS.find(q => q.id === (dica.alvo as { id: string }).id)?.nome}</b><small className="acao">Clique para abrir a sala</small></>}
        </div>
      )}
      <Console escolhido={m} mirando={mirando} registro={registro} age={age} ocupado={pedido.ocupado}
        pedir={texto => { pedido.planeja(texto, null); setAberto({ tipo: 'aba', aba: 'pedidos' }); }}
        briefing={() => setAberto({ tipo: 'conversa', id: 'clara' })} solta={() => { setEscolhido(null); setMirando(false); }} />
      {livro && <div className="cortina" onClick={fecha} />}
      {livro}
      {aviso && <div className="aviso papel-borda" role="alert"><p>{aviso}</p><button onClick={limpaAviso}>Entendi</button></div>}
    </div>
  );
}
