import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Briefing, RoteiroBriefing } from '../components/Briefing';
import { useBriefing } from '../hooks/useBriefing';
import { Ferramentas, FERRAMENTAS, type Ferramenta } from '../components/Ferramentas';
import { linhaDoTempo, resumoDasTelas } from '../lib/ferramentas';
import { hojeLocal } from '../lib/dados';
import { paraVoce } from '../lib/pedidos';
import type { Alvo } from '../components/MapaPixi';
// o motor do mapa pesa mais que o resto da interface: vem em pedaço próprio, e o livro e os menus aparecem antes
const MapaPixi = lazy(() => import('../components/MapaPixi').then(m => ({ default: m.MapaPixi })));
import { Chat } from '../components/Chat';
import { FichaAgente, PainelZona } from '../components/Fichas';
import { Agenda, Clientes, Conexoes, Decisoes, Projetos, Trofeus, itensConexao } from '../components/Paineis';
import { AreaDoSocio, Carregando, CartaoLugar, Console, Destaque, FotoLugar, FasesIlustradas, ListaMissoes, Livro, MapaTinta, MenuDiario, Missoes, Placa, Resumo, Selos, Vazio, ABAS, SOBRE_ZONA, type Aba, type Acao, type Voltar } from '../components/Diario';
import { Retrato } from '../components/Retrato';
import { JeitoDe, MesaDe } from '../components/Mesa';
import { ComoJogar, Pong } from '../components/Pong';
import { BotaoDaRadio, Radio, SobreARadio } from '../components/Radio';
import { useEstado } from '../hooks/useEstado';
import { useLab } from '../hooks/useLab';
import { ZONAS } from '../lib/lab';
import { useEquipe } from '../hooks/useEquipe';
import { ORQUESTRADOR } from '../lib/equipe';
import { useConexoes } from '../hooks/useConexoes';
import { useAgendaGoogle } from '../hooks/useAgendaGoogle';
import { comecaLogo, horaLocal } from '../lib/agendaGoogle';
import { usePedido } from '../hooks/usePedido';
import { useSaida } from '../hooks/useSaida';
import { PainelPessoas, Pauta, Pedidos, Skills } from '../components/Nucleo';
import type { AbaFicha } from '../components/Fichas';
import { cargaDaEquipe, clientesPorEtapa, decisoesPorProjeto, decisoesRecentes, notasPorPessoa, progressoPorProjeto, projetosEmCiclo, proximasReunioes, semNota, situacaoEquipe, skillsMaisTreinadas, trofeus, ultimosPedidos } from '../lib/resumo';

type Aberto =
  | { tipo: 'aba'; aba: Aba; novo?: boolean; pre?: { setor: string; situacao: string } } | { tipo: 'briefing' } | { tipo: 'ficha'; id: string; aba?: AbaFicha; foca?: boolean }
  | { tipo: 'conversa'; id: string } | { tipo: 'reuniao'; com: string[] } | { tipo: 'sala'; id: string } | { tipo: 'mesa'; id: string } | { tipo: 'pong' } | { tipo: 'radio' } | null;

/** O que o mapa deixa clicar além de gente, sala e tela: o nome que aparece na dica e o convite. */
const OBJETOS: Record<string, { nome: string; convite: string }> = {
  pingpong: { nome: 'Mesa de pingue-pongue', convite: 'Clique para jogar Pong' },
  radio: { nome: 'Rádio V30', convite: 'Clique para ouvir' },
};

const SOBRE_ABA: Record<Aba, string> = {
  pedidos: 'Diga o que precisa. A orquestração divide, a equipe entrega e você recebe a resposta pronta.',
  paineis: 'O andamento dos projetos em quadro, linha do tempo e calendário. São as telas do lab, ampliadas.',
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
  const r = proximasReunioes(estado)[0];
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
      <Pauta texto={r.pauta} />
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
  const [foco, setFoco] = useState<{ zona: string; n: number } | null>(null);
  const [projeto, setProjeto] = useState<string | undefined>();
  const [registro, setRegistro] = useState<string[]>([]);
  const anota = (s: string) => setRegistro(r => [...r.slice(-5), s]);
  // meia hora antes de uma reunião do Google Agenda, o aviso do console lembra uma vez
  const google = useAgendaGoogle(), lembradas = useRef(new Set<string>());
  useEffect(() => {
    const confere = () => {
      for (const { r, faltam } of comecaLogo(google.lista, hojeLocal(), horaLocal())) {
        const chave = r.id + r.dia;
        if (lembradas.current.has(chave)) continue;
        lembradas.current.add(chave);
        anota(`Daqui a ${faltam} ${faltam === 1 ? 'minuto' : 'minutos'}: ${r.titulo}. O link do Meet está em Para você e na Agenda.`);
      }
    };
    confere();
    const t = setInterval(confere, 60_000);
    return () => clearInterval(t);
  }, [google.lista]);
  const pedido = usePedido();
  const escrevendo = [...estado.tarefas.filter(t => executando.includes(t.id)).map(t => t.agente), ...(pedido.corrida.etapa === 'planejando' || pedido.corrida.etapa === 'sintetizando' ? [ORQUESTRADOR] : [])];
  const fecha = useCallback(() => setAberto(null), []);
  const briefing = useBriefing();
  // menu recolhido fica só nos ícones. A escolha é lembrada neste navegador
  const [recolhido, setRecolhido] = useState(() => { try { return localStorage.getItem('lab.menu-recolhido') === '1'; } catch { return false; } });
  const alternaMenu = () => setRecolhido(r => { try { localStorage.setItem('lab.menu-recolhido', r ? '0' : '1'); } catch { /* vale só nesta visita */ } return !r; });
  // as miniaturas das telas do mapa só mudam quando o estado muda
  const telasDoMapa = useMemo(() => resumoDasTelas(estado, hojeLocal()), [estado]);
  // qual ferramenta dos Painéis está aberta e se o livro ocupa a tela inteira
  const [ferramenta, setFerramenta] = useState<Ferramenta>('quadro');
  const [cheia, setCheia] = useState(false);
  const abreFerramenta = useCallback((f: Ferramenta) => { setFerramenta(f); setCheia(true); setAberto({ tipo: 'aba', aba: 'paineis' }); }, []);
  useEffect(() => { if (!aberto) setCheia(false); }, [aberto]);
  // a tela de espera só sai quando o mapa tem as texturas. Se o mapa não avisar em 8 segundos, sai assim mesmo
  const [mapaPronto, setMapaPronto] = useState(false);
  const [respostaNova, setRespostaNova] = useState(false);
  const avisaPronto = useCallback(() => setMapaPronto(true), []);
  useEffect(() => { const t = setTimeout(avisaPronto, 8000); return () => clearTimeout(t); }, [avisaPronto]);
  // plano aprovado: o livro sai da frente para o mapa mostrar o papel chegando em cada mesa e quem está escrevendo
  const distribuido = pedido.distribuicao?.n;
  useEffect(() => { if (distribuido) { setAberto(null); setRegistro(r => [...r.slice(-5), 'Plano distribuído. A equipe está escrevendo.']); } }, [distribuido]);
  // quando a corrida termina ou trava, Pedidos volta sozinho se nada mais estiver aberto
  const etapa = pedido.corrida.etapa, etapaAntes = useRef(etapa);
  useEffect(() => {
    const antes = etapaAntes.current; etapaAntes.current = etapa;
    const abrePedidos = () => setAberto(x => x ?? { tipo: 'aba', aba: 'pedidos' });
    if (etapa === 'erro' && antes !== 'erro') abrePedidos();
    if (antes !== 'sintetizando' || etapa !== 'parado') return;
    // com outro livro aberto, a resposta não toma a tela: fica um sinal no menu, o selo no mapa e um recado com atalho
    setRespostaNova(true); anota('Resposta pronta. Está em Pedidos.');
    // o livro espera o papel voltar e o selo aparecer no mapa. Com movimento reduzido, abre na hora
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { abrePedidos(); return; }
    const t = setTimeout(abrePedidos, 1600);
    return () => clearTimeout(t);
  }, [etapa]);
  const emPedidos = aberto?.tipo === 'aba' && aberto.aba === 'pedidos';
  useEffect(() => { if (emPedidos) setRespostaNova(false); }, [emPedidos]);
  // o livro que acabou de fechar fica montado até a saída terminar
  const { mostrado, saindo, saiu } = useSaida(aberto);
  // fora do livro, Escape solta a pessoa escolhida
  useEffect(() => {
    if (aberto || !escolhido) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setEscolhido(null); };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [aberto, escolhido]);
  const { equipe, de } = useEquipe();
  const m = (escolhido && de(escolhido)) || null;

  const abreSala = useCallback((z: string) => {
    setZona(z); setFoco(f => ({ zona: z, n: (f?.n ?? 0) + 1 })); setAberto({ tipo: 'sala', id: z });
  }, []);
  /** Escolhe alguém, leva a câmera até a sala da pessoa e fecha o livro. */
  const escolhe = useCallback((id: string) => {
    const p = de(id); if (!p) return;
    setEscolhido(id); setZona(p.zona); setAberto(null);
    setFoco(f => ({ zona: p.zona, n: (f?.n ?? 0) + 1 }));
  }, []);
  const abreAba = (a: Aba) => setAberto(x => (x?.tipo === 'aba' && x.aba === a ? null : { tipo: 'aba', aba: a }));
  const onHover = useCallback((alvo: Alvo, x: number, y: number) => setDica({ alvo, x, y }), []);
  const onClique = useCallback((alvo: Alvo) => {
    setDica(d => ({ ...d, alvo: null }));
    if (!alvo) { setZona(null); return; }
    if (alvo.tipo === 'zona') { abreSala(alvo.id); return; }
    if (alvo.tipo === 'tela') { abreFerramenta(alvo.ferramenta); return; }
    if (alvo.tipo === 'objeto') { if (alvo.id === 'pingpong') setAberto({ tipo: 'pong' }); if (alvo.id === 'radio') setAberto({ tipo: 'radio' }); return; }
    // clicar numa pessoa aproxima a câmera (no mapa) e abre a mesa dela
    setEscolhido(alvo.agente.id); setZona(alvo.agente.zona); setAberto({ tipo: 'mesa', id: alvo.agente.id });
  }, [abreSala, abreFerramenta]);
  const abreProjeto = (id: string) => { setProjeto(id); setAberto({ tipo: 'aba', aba: 'projetos' }); };
  const age = (a: Acao) => {
    if (!m) return;
    if (a === 'conversar') setAberto(m.id === 'clara' ? { tipo: 'briefing' } : { tipo: 'conversa', id: m.id });
    if (a === 'missao') setAberto({ tipo: 'ficha', id: m.id, aba: 'visao', foca: true });
    if (a === 'perfil') setAberto({ tipo: 'ficha', id: m.id, aba: 'instrucoes' });
    if (a === 'memoria') setAberto({ tipo: 'ficha', id: m.id, aba: 'memoria' });
    if (a === 'reuniao') setAberto({ tipo: 'reuniao', com: [m.id] });
  };

  // as duas páginas de Projetos falam do mesmo projeto: a escolha mora aqui
  const projAtual = estado.projetos.find(x => x.id === projeto) ?? estado.projetos[0];
  const vaiPara = (aba: Aba) => () => setAberto({ tipo: 'aba', aba });

  let folha: { titulo: string; sobre?: string; cor?: string; largo?: boolean; voltar?: Voltar; ilustracao?: ReactNode; corpo: ReactNode } | null = null;
  if (mostrado && lab && gente) {
    if (mostrado.tipo === 'aba') {
      const a = mostrado.aba, nome = ABAS.find(x => x.id === a)!.nome;
      const p = projAtual;
      const eq = situacaoEquipe(estado, equipe.map(e => e.id));
      const tr = trofeus(estado), ganhos = tr.filter(t => t.atual >= t.meta).length;
      const ultima = decisoesRecentes(estado)[0]?.criado_em;
      const entregues = estado.pedidos.filter(x => x.estado === 'entregue').length;
      const ilustracao = {
        pedidos: <Resumo itens={[{ n: estado.pedidos.length - entregues, rotulo: 'Em andamento' }, { n: entregues, rotulo: 'Entregues' }, { n: estado.tarefas.filter(t => t.entrega).length, rotulo: 'Entregas da equipe' }]} nota="Você aprova o plano antes de a equipe começar." bloco={<Destaque titulo="Últimos pedidos" linhas={ultimosPedidos(estado)} />} />,
        skills: <Resumo itens={[{ n: estado.skills.length, rotulo: 'Skills no lab' }, { n: estado.skills.filter(k => k.para_todos).length, rotulo: 'Valem para todos' }]} nota="Quem é treinado numa skill passa a seguir o que ela diz." bloco={<Destaque titulo="Mais treinadas" linhas={skillsMaisTreinadas(estado)} />} />,
        paineis: <Resumo itens={[{ n: linhaDoTempo(estado, hojeLocal()).projetos.filter(x => x.dia >= 1 && x.dia <= 30).length, rotulo: 'Projetos em ciclo' }, { n: estado.tarefas.filter(t => t.estado === 'fazendo').length, rotulo: 'Missões andando' }, { n: estado.reunioes.filter(r => r.status === 'agendada').length, rotulo: 'Reuniões marcadas' }]} nota="As mesmas telas que estão nas paredes do lab." bloco={<Destaque titulo="Projetos no ciclo" linhas={projetosEmCiclo(estado, hojeLocal())} />} />,
        missoes: <Resumo itens={[{ n: estado.tarefas.filter(t => t.estado === 'fazendo').length, rotulo: 'Fazendo agora' }, { n: estado.tarefas.filter(t => t.estado === 'fila').length, rotulo: 'Na fila' }, { n: estado.tarefas.filter(t => t.estado === 'feito').length, rotulo: 'Feitas' }]} nota="Missão boa cabe numa frase e tem dono." bloco={<Destaque titulo="Andamento por projeto" linhas={progressoPorProjeto(estado)} />} />,
        clientes: <Resumo itens={clientesPorEtapa(estado).map(x => ({ n: x.n, rotulo: x.etapa }))} nota="Cliente entra em conversa e só vira projeto com diagnóstico." bloco={<Destaque titulo="Projetos no ciclo" linhas={projetosEmCiclo(estado, hojeLocal())} />} />,
        projetos: p ? <>{p.mesa && <figure className="foto-colada"><img src={`assets/${p.mesa}`} alt={`Mesa de ${p.nome}`} /><figcaption>{p.nome}</figcaption></figure>}<FasesIlustradas fase={p.fase} /></> : null,
        pessoas: <Resumo itens={[{ n: eq.fazendo, rotulo: 'Fazendo uma missão' }, { n: eq.fila, rotulo: 'Só com fila' }, { n: eq.livres.length, rotulo: 'Livres', extra: eq.livres.length > 0 && <span className="rostos">{eq.livres.slice(0, 6).map(id => <Retrato key={id} id={id} tamanho={26} />)}</span> }]} nota={`${equipe.length} especialistas, cada um com mesa, papel e memória.`} bloco={<Destaque titulo="Mais carregados" linhas={cargaDaEquipe(estado, equipe)} />} />,
        lugares: <><MapaTinta lab={lab} escolhe={abreSala} /><p className="nota-mao">Um deck de madeira solto no campus, com salas de vidro para reunião e protótipo.</p></>,
        agenda: <ProximaReuniao />,
        decisoes: <Resumo itens={[{ n: estado.decisoes.length, rotulo: 'Decisões registradas' }, ...(ultima ? [{ n: new Date(ultima.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }), rotulo: 'A última' }] : [])]} nota="Decisão sem motivo escrito vira discussão de novo daqui a um mês." bloco={<Destaque titulo="Por projeto" linhas={decisoesPorProjeto(estado)} />} />,
        memoria: <Resumo itens={notasPorPessoa(estado).slice(0, 5).map(x => ({ n: x.n, rotulo: de(x.agente)?.nome ?? 'Quem saiu do lab', extra: <Retrato id={x.agente} tamanho={26} /> }))} nota="O que fica aqui entra em toda conversa com aquela pessoa." bloco={<Destaque titulo="Ainda sem nota" linhas={semNota(estado, equipe).slice(0, 6)} dica="Converse com eles e guarde o que importar." />} />,
        conexoes: <Resumo itens={[{ n: `${itensConexao(conexoes, modo === 'banco').filter(i => i.ok).length} de ${itensConexao(conexoes, modo === 'banco').length}`, rotulo: 'Ligados' }]} nota="Com Worker, banco, login e a chave de um provedor ligados, o lab abre para a equipe e os especialistas respondem de verdade." />, trofeus: <Resumo itens={[{ n: `${ganhos} de ${tr.length}`, rotulo: 'Conquistados' }]} nota="Contam o que foi feito de verdade, sem inventar número." />,
      }[a];
      const corpo = {
        pedidos: <Pedidos p={pedido} />, skills: <Skills />,
        paineis: <Ferramentas qual={ferramenta} muda={setFerramenta} abreProjeto={abreProjeto} escolhe={escolhe} abreAgenda={() => setAberto({ tipo: 'aba', aba: 'agenda' })} />,
        missoes: <div className="missoes-livro"><ListaMissoes abreProjeto={abreProjeto} escolhe={escolhe} max={30} /></div>,
        clientes: <Clientes key={mostrado.pre ? mostrado.pre.setor + mostrado.pre.situacao : 'c'} abreProjeto={abreProjeto} novo={mostrado.novo} inicial={mostrado.pre} volta={mostrado.pre ? { rotulo: 'Voltar ao briefing', vai: () => setAberto({ tipo: 'briefing' }) } : undefined} />, projetos: <Projetos atual={p?.id} escolhe={setProjeto} />, agenda: <Agenda abreConexoes={() => setAberto({ tipo: 'aba', aba: 'conexoes' })} />, decisoes: <Decisoes />, conexoes: <Conexoes c={conexoes} />, trofeus: <Trofeus />,
        pessoas: <PainelPessoas abre={id => { setEscolhido(id); setZona(de(id)?.zona ?? null); setAberto({ tipo: 'ficha', id }); }} />,
        lugares: <><ul className="lista-lugares">{ZONAS.map(z => {
          const n = equipe.filter(e => e.zona === z.id).length;
          return <li key={z.id}><button onClick={() => abreSala(z.id)} style={{ ['--c' as string]: z.cor }}><b><i className="num">{ZONAS.indexOf(z) + 1}</i>{z.nome}</b><small>{n ? `${n} ${n === 1 ? 'pessoa' : 'pessoas'}` : 'Uso comum'}</small><span>{SOBRE_ZONA[z.id]}</span></button></li>;
        })}</ul></>,
        memoria: estado.memorias.length ? <ul className="notas">{estado.memorias.map(n => <li key={n.id}><p>{n.texto}</p><footer><button className="link" onClick={() => setAberto({ tipo: 'ficha', id: n.agente, aba: 'memoria' })}>{de(n.agente)?.nome ?? 'Quem saiu do lab'}</button></footer></li>)}</ul>
          : <Vazio icone="memoria" acao={{ rotulo: 'Escolher alguém da equipe', vai: vaiPara('pessoas') }}>Ninguém guardou nada ainda. A memória de cada pessoa fica na ficha dela.</Vazio>,
      }[a];
      folha = { titulo: nome, sobre: SOBRE_ABA[a], largo: a === 'projetos' || a === 'paineis', ilustracao, corpo };
    } else if (mostrado.tipo === 'ficha') {
      const p = de(mostrado.id) ?? equipe[0], z = ZONAS.find(q => q.id === p.zona)!;
      folha = { titulo: p.nome, sobre: p.papel, cor: z.cor, voltar: { rotulo: 'Pessoas', vai: vaiPara('pessoas') },
        ilustracao: <><figure className="foto-colada estacao"><img style={{ background: `linear-gradient(${z.cor}30, ${z.cor}12)` }} src={`assets/estacao/${p.aparencia}.webp`} alt={`${p.nome} trabalhando na ${z.nome}`} /><figcaption>{p.nome} na {z.nome}</figcaption></figure><p className="nota-mao">{SOBRE_ZONA[z.id]}</p></>,
        corpo: <FichaAgente key={p.id + (mostrado.aba ?? '')} m={p} abaInicial={mostrado.aba} focaMissao={mostrado.foca} aoDar={anota}
          noMapa={() => escolhe(p.id)} naMesa={() => setAberto({ tipo: 'mesa', id: p.id })} conversa={() => setAberto({ tipo: 'conversa', id: p.id })} /> };
    } else if (mostrado.tipo === 'mesa') {
      const p = de(mostrado.id) ?? equipe[0], z = ZONAS.find(q => q.id === p.zona)!;
      const jeito = <JeitoDe m={p} cor={z.cor} conversa={() => setAberto(p.id === 'clara' ? { tipo: 'briefing' } : { tipo: 'conversa', id: p.id })}
        missao={() => setAberto({ tipo: 'ficha', id: p.id, aba: 'visao', foca: true })} ficha={() => setAberto({ tipo: 'ficha', id: p.id })} />;
      // no celular o livro só tem a página da direita, então o jeito da pessoa desce para baixo da cena
      folha = { titulo: `Mesa de ${p.nome}`, sobre: p.papel, cor: z.cor, largo: true, voltar: { rotulo: 'Pessoas', vai: vaiPara('pessoas') },
        ilustracao: jeito, corpo: <><MesaDe key={p.id} m={p} zona={z.nome} /><div className="so-celular">{jeito}</div></> };
    } else if (mostrado.tipo === 'pong') {
      folha = { titulo: 'Pingue-pongue', sobre: 'Pong clássico na mesa do lounge. Vence quem fizer sete.', cor: ZONAS.find(q => q.id === 'lounge')!.cor, largo: true, ilustracao: <ComoJogar />, corpo: <Pong /> };
    } else if (mostrado.tipo === 'radio') {
      folha = { titulo: 'Rádio V30', sobre: 'A trilha do lab. Estações da casa ou rádios de todo o Brasil, e deixe tocando.', cor: ZONAS.find(q => q.id === 'lounge')!.cor, ilustracao: <SobreARadio />, corpo: <Radio /> };
    } else if (mostrado.tipo === 'conversa') {
      const p = de(mostrado.id) ?? equipe[0];
      const dela = estado.tarefas.filter(t => t.agente === p.id && t.estado !== 'feito');
      folha = { titulo: p.id === 'clara' ? 'Briefing com a Clara' : `Conversa com ${p.nome}`, sobre: p.id === 'clara' ? 'Uma pergunta por vez, até fechar o pedido.' : p.papel,
        voltar: p.id === 'clara' ? { rotulo: 'Briefing guiado', vai: () => setAberto({ tipo: 'briefing' }) } : { rotulo: `Ficha de ${p.nome}`, vai: () => setAberto({ tipo: 'ficha', id: p.id }) },
        ilustracao: <><Retrato id={p.id} tamanho={120} />{p.id === 'clara' && <button className="primario cadastrar" onClick={() => setAberto({ tipo: 'aba', aba: 'clientes', novo: true })}>Cadastrar o cliente deste briefing</button>}{dela.length > 0 && <div className="contexto"><h4>Nas mãos de {p.nome}</h4><ul>{dela.map(t => <li key={t.id}><span className={`estado ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span>{t.titulo}</li>)}</ul></div>}</>,
        corpo: <Chat agente={p.id} setAgente={id => setAberto({ tipo: 'conversa', id })} so /> };
    } else if (mostrado.tipo === 'briefing') {
      folha = { titulo: 'Briefing com a Clara', sobre: 'Ela pergunta uma coisa por vez e o briefing vira pedido para a equipe.', largo: true,
        ilustracao: <><Retrato id="clara" tamanho={96} /><RoteiroBriefing b={briefing} /></>,
        corpo: <Briefing b={briefing} conversaLivre={() => setAberto({ tipo: 'conversa', id: 'clara' })}
          pedir={texto => { pedido.planeja(texto, null); setAberto({ tipo: 'aba', aba: 'pedidos' }); }}
          cadastra={pre => setAberto({ tipo: 'aba', aba: 'clientes', novo: true, pre })} /> };
    } else if (mostrado.tipo === 'sala') {
      const z = ZONAS.find(q => q.id === mostrado.id)!;
      folha = { titulo: z.nome, sobre: SOBRE_ZONA[z.id], cor: z.cor, voltar: { rotulo: 'Lugares', vai: vaiPara('lugares') },
        ilustracao: <figure className="foto-colada"><FotoLugar zona={z.id} lab={lab} larg={300} alt={190} esc={0.62} /><figcaption>{z.nome}</figcaption></figure>,
        corpo: <PainelZona key={z.id} zona={z.id} abreAgente={id => { setEscolhido(id); setAberto({ tipo: 'ficha', id }); }} aoDar={anota}
          conversa={id => { setEscolhido(id); setAberto({ tipo: 'conversa', id }); }} darMissao={id => { setEscolhido(id); setAberto({ tipo: 'ficha', id, aba: 'visao', foca: true }); }}
          briefing={() => setAberto({ tipo: 'briefing' })} marcaReuniao={com => setAberto({ tipo: 'reuniao', com })}
          lazer={{ radio: () => setAberto({ tipo: 'radio' }), pong: () => setAberto({ tipo: 'pong' }) }} abreAgenda={() => setAberto({ tipo: 'aba', aba: 'agenda' })} /> };
    } else if (mostrado.tipo === 'reuniao') {
      folha = { titulo: 'Agenda', sobre: SOBRE_ABA.agenda, ilustracao: <ProximaReuniao />, corpo: <Agenda com={mostrado.com} abreConexoes={() => setAberto({ tipo: 'aba', aba: 'conexoes' })} /> };
    }
  }
  // onde estou: o menu marca a seção de quem está aberto, mesmo fora das abas
  const secao: Aba | null = !aberto ? null : aberto.tipo === 'aba' ? aberto.aba : aberto.tipo === 'sala' || aberto.tipo === 'pong' || aberto.tipo === 'radio' ? 'lugares' : aberto.tipo === 'reuniao' ? 'agenda' : 'pessoas';
  const carregando = !erro && (modo === 'carregando' || !lab || !gente || !mapaPronto);

  return (
    <div className={`lab ${aberto ? 'com-livro' : ''} ${recolhido ? 'menu-recolhido' : ''}`}>
      {erro && <p className="falha-carga" role="alert">{erro}</p>}
      {lab && gente && <Suspense fallback={null}><MapaPixi lab={lab} gente={gente} equipe={equipe} telas={telasDoMapa} aoPronto={avisaPronto} escrevendo={escrevendo} distribuicao={pedido.distribuicao ? { de: ORQUESTRADOR, ...pedido.distribuicao } : null} fecho={pedido.fecho ? { para: ORQUESTRADOR, ...pedido.fecho } : null} selo={respostaNova ? ORQUESTRADOR : null} zonaAtiva={zona} selecionado={escolhido} foco={foco}
        onHover={onHover} onClique={onClique} /></Suspense>}
      <aside className="coluna-esquerda lateral" aria-label="Menu do lab">
        <Placa />
        <button type="button" className="recolher" onClick={alternaMenu} aria-pressed={recolhido} aria-label={recolhido ? 'Abrir o menu' : 'Recolher o menu'} title={recolhido ? 'Abrir o menu' : 'Recolher o menu'}><span aria-hidden="true">{recolhido ? '›' : '‹'}</span></button>
        <MenuDiario ativa={secao} abre={abreAba} novidade={respostaNova && !emPedidos ? 'pedidos' : null} />
        <BotaoDaRadio abre={() => setAberto({ tipo: 'radio' })} />
        <AreaDoSocio abreConexoes={() => setAberto({ tipo: 'aba', aba: 'conexoes' })} />
      </aside>
      {lab && <CartaoLugar zona={zona} lab={lab} abre={abreSala} oculto={!!aberto} />}
      <div className="coluna-direita">
        <Selos abre={abreAba} />
        <Missoes abreProjeto={abreProjeto} escolhe={escolhe} verTodas={() => setAberto({ tipo: 'aba', aba: 'missoes' })} abre={a => setAberto({ tipo: 'aba', aba: a })}
          atencao={paraVoce(estado, hojeLocal(), Date.now(), pedido.ocupado ? pedido.corrida.pedido : null, google.lista, horaLocal())} />
      </div>
      {dica.alvo && !aberto && (
        <div className="dica papel-borda" style={{ left: Math.min(dica.x + 18, innerWidth - 280), top: dica.y + 18 }}>
          {dica.alvo.tipo === 'agente'
            ? <><b>{dica.alvo.agente.nome}</b><small>{dica.alvo.agente.papel}</small><small className="acao">Clique para ver a mesa</small></>
            : dica.alvo.tipo === 'objeto' ? <><b>{OBJETOS[dica.alvo.id]?.nome}</b><small className="acao">{OBJETOS[dica.alvo.id]?.convite}</small></>
            : dica.alvo.tipo === 'tela' ? <><b>{FERRAMENTAS.find(f => f.id === (dica.alvo as { ferramenta: Ferramenta }).ferramenta)?.nome}</b><small>{FERRAMENTAS.find(f => f.id === (dica.alvo as { ferramenta: Ferramenta }).ferramenta)?.sobre}</small><small className="acao">Clique para abrir em tela inteira</small></>
            : <><b>{ZONAS.find(q => q.id === (dica.alvo as { id: string }).id)?.nome}</b><small className="acao">Clique para abrir a sala</small></>}
        </div>
      )}
      <Console escolhido={m} registro={registro} age={age} ocupado={pedido.ocupado}
        pedir={texto => { pedido.planeja(texto, null); setAberto({ tipo: 'aba', aba: 'pedidos' }); }}
        briefing={() => setAberto({ tipo: 'briefing' })} solta={() => setEscolhido(null)} />
      {folha && <Livro titulo={folha.titulo} sobre={folha.sobre} cor={folha.cor} largo={folha.largo} voltar={folha.voltar} ilustracao={folha.ilustracao} saindo={saindo} aoSair={saiu} aoFechar={fecha} cheia={cheia} aoAmpliar={() => setCheia(c => !c)}>{folha.corpo}</Livro>}
      {carregando && <Carregando />}
      {aviso && <div className="aviso papel-borda" role="alert"><p>{aviso}</p><button onClick={limpaAviso}>Entendi</button></div>}
      {!aviso && respostaNova && !emPedidos && <div className="aviso papel-borda" role="status"><p>A resposta do seu pedido está pronta.</p><button onClick={() => setAberto({ tipo: 'aba', aba: 'pedidos' })}>Ver resposta</button></div>}
    </div>
  );
}
