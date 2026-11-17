import { useState } from 'react';
import { dataCurta, diaCurto, hojeLocal } from '../lib/dados';
import { fimDoSquad } from '../lib/squad';
import { atrasada } from '../lib/ferramentas';
import { ProximaNaSala } from './AgendaGoogle';
import { sugestoesDeMissao } from '../lib/sugestoes';
import type { Agente, Membro } from '../lib/equipe';
import { useEquipe } from '../hooks/useEquipe';
import { ZONAS } from '../lib/lab';
import { useEstado } from '../hooks/useEstado';
import { useRecem } from '../hooks/useRecem';
import { Retrato } from './Retrato';
import { Apagar } from './Apagar';
import { EditaMissao } from './Missao';
import { Vazio, Bloco } from './Diario';
import { Entrega, Executar, Treino } from './Nucleo';
import { nomeDoModelo } from '../lib/modelos';
import { convidadoDe } from '../lib/convidados';
import { partesDoPerfil, perfilDe } from '../lib/perfis';

/** Quem a pessoa é, como fala, o que domina e o que guarda. É o que o lab diz ao modelo antes de qualquer conversa com ela. */
function PerfilDaPessoa({ m }: { m: Membro }) {
  const p = perfilDe(m.id);
  if (!p) return <p className="nota">{m.nome} foi criado por vocês e ainda não tem perfil escrito. O que estiver nas instruções abaixo vale como o jeito dele.</p>;
  return (
    <section className="perfil" aria-label={`Perfil de ${m.nome}`}>
      <h4>Quem é {m.nome}</h4>
      <p className="perfil-identidade">{p.identidade}</p>
      {partesDoPerfil(p).map(x => <div key={x.titulo} className="perfil-parte"><h5>{x.titulo}</h5><ul>{x.linhas.map(l => <li key={l}>{l}</li>)}</ul></div>)}
    </section>
  );
}

function Instrucoes({ m }: { m: Membro }) {
  const { estado, salvaInstrucao } = useEstado();
  const [texto, setTexto] = useState(estado.instrucoes[m.id] ?? '');
  const [salvo, setSalvo] = useState(false);
  const mudou = texto.trim() !== (estado.instrucoes[m.id] ?? '');
  return (
    <form className="instrucoes" onSubmit={async e => { e.preventDefault(); if (await salvaInstrucao(m.id, texto)) { setSalvo(true); setTimeout(() => setSalvo(false), 2200); } }}>
      <label htmlFor="ins">Como {m.nome} deve trabalhar com vocês</label>
      <textarea id="ins" rows={6} value={texto} maxLength={3000} onChange={e => setTexto(e.target.value)}
        placeholder={`Ex.: responda em no máximo cinco linhas, sempre termine com o próximo passo, use a linguagem de quem está na loja.`} />
      <p className="nota">Entra em toda conversa com {m.nome}. Deixe vazio para usar só o jeito padrão da V30.</p>
      <div className="linha"><button className="primario" type="submit" disabled={!mudou}>Salvar instruções</button>{salvo && <span className="ok" role="status">Salvo</span>}</div>
    </form>
  );
}

function Memoria({ m }: { m: Membro }) {
  const { estado, criaMemoria, apagaMemoria } = useEstado();
  const [texto, setTexto] = useState('');
  const notas = estado.memorias.filter(x => x.agente === m.id);
  return (
    <div className="memoria">
      <form className="nova-linha" onSubmit={async e => { e.preventDefault(); if (texto.trim() && (await criaMemoria(m.id, texto.trim()))) setTexto(''); }}>
        <label className="so-leitor" htmlFor="nm">Nova nota para {m.nome}</label>
        <input id="nm" value={texto} onChange={e => setTexto(e.target.value)} placeholder={`Algo que ${m.nome} precisa lembrar`} maxLength={1500} />
        <button type="submit" disabled={!texto.trim()}>Guardar</button>
      </form>
      {!notas.length && <Vazio icone="memoria" acao={{ rotulo: 'Guardar a primeira nota', vai: () => document.getElementById('nm')?.focus() }}>{m.nome} ainda não lembra de nada específico. Guarde aqui o que vale para todas as conversas, ou guarde uma resposta direto do chat.</Vazio>}
      <ul className="notas">
        {notas.map(n => (
          <li key={n.id}><p>{n.texto}</p><footer><small>{n.origem === 'conversa' ? 'Da conversa' : 'Anotado'}, {new Date(n.criado_em.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR')}</small>
            <Apagar oque={`a nota: ${n.texto.slice(0, 40)}`} verbo="Esquecer" apaga={() => apagaMemoria(n.id)} /></footer></li>
        ))}
      </ul>
    </div>
  );
}

export type AbaFicha = 'visao' | 'treino' | 'instrucoes' | 'memoria';

export function FichaAgente({ m, conversa, abaInicial, noMapa, naMesa, aoDar, focaMissao }: {
  m: Agente; conversa: () => void; abaInicial?: AbaFicha; noMapa?: () => void; naMesa?: () => void; aoDar?: (texto: string) => void; focaMissao?: boolean;
}) {
  const { estado, criaTarefa, mudaTarefa, mudaAgente } = useEstado();
  const [aba, setAba] = useState<AbaFicha>(abaInicial ?? 'visao');
  const [nova, setNova] = useState(''), [proj, setProj] = useState(''), [prazo, setPrazo] = useState('');
  const [edita, setEdita] = useState<number | null>(null);
  const z = ZONAS.find(q => q.id === m.zona)!;
  const abertas = estado.tarefas.filter(t => t.agente === m.id && t.estado !== 'feito');
  const entregas = estado.tarefas.filter(t => t.agente === m.id && t.entrega).reverse();
  // a entrega que chega com a ficha aberta aparece no lugar onde a missão estava, aberta, e não no fim da página
  const recem = useRecem(entregas.map(t => t.id));
  const novas = entregas.filter(t => recem.has(t.id)), guardadas = entregas.filter(t => !recem.has(t.id));
  const nSkills = estado.skills.filter(k => k.para_todos || (estado.vinculos[m.id] ?? []).includes(k.id)).length;
  // convidado chamado para um projeto: o squad vale até o fim do ciclo, e depois a ficha sugere dispensar
  const doSquad = m.projeto_id ? estado.projetos.find(p => p.id === m.projeto_id) : undefined;
  const squadVale = doSquad && hojeLocal() <= fimDoSquad(doSquad);
  return (
    <div className="ficha-agente">
      <div className="ficha">
        <Retrato id={m.id} tamanho={88} cor={z.cor + '40'} />
        <div><p className="rotulo">{z.nome}</p><p className="papel">{m.papel}</p>
          <p className="selos-ficha"><span>{nomeDoModelo(m.modelo || estado.modeloPadrao)}</span><span>{nSkills} {nSkills === 1 ? 'skill' : 'skills'}</span>{convidadoDe(m.id) && <span>Do banco de convidados</span>}{doSquad && squadVale && <span>No squad de {doSquad.nome} até {dataCurta(fimDoSquad(doSquad))}</span>}</p>
          {convidadoDe(m.id) && m.ativo && <p className="dispensa-topo">{doSquad && !squadVale ? `O ciclo de ${doSquad.nome} acabou em ${dataCurta(fimDoSquad(doSquad))}.` : 'Chamado do banco.'} <Apagar oque={`${m.nome} do lab`} verbo="Dispensar" apaga={() => mudaAgente(m.id, { ativo: false })} /></p>}
          <div className="linha"><button className="primario" onClick={conversa}>{m.id === 'clara' ? 'Começar briefing' : `Conversar com ${m.nome}`}</button>
            {noMapa && <button className="leve" onClick={noMapa}>Ver no mapa</button>}
            {naMesa && <button className="leve" onClick={naMesa}>Ver a mesa</button>}</div></div>
      </div>
      <div className="abas" role="tablist">
        {([['visao', 'Missões'], ['treino', 'Treino'], ['instrucoes', 'Perfil'], ['memoria', 'Memória']] as const).map(([id, n]) =>
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}>{n}</button>)}
      </div>
      {aba === 'visao' && <>
        {abertas.length
          ? <ul className="tarefas-agente">{abertas.map(t => edita === t.id ? <li key={t.id} className="editando"><EditaMissao t={t} aoFechar={() => setEdita(null)} /></li> : <li key={t.id}><span className={`estado ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span><span className="tit">{t.titulo}{t.detalhe && <small className="detalhe">{t.detalhe}</small>}{t.prazo && <small className={`prazo ${atrasada(t, hojeLocal()) ? 'atrasada' : ''}`}>{atrasada(t, hojeLocal()) ? 'Atrasada, era até' : 'Até'} {diaCurto(t.prazo)}</small>}</span>
              {t.id > 0 && <button className="leve mini" onClick={() => setEdita(t.id)} aria-label={`Editar ${t.titulo}`}>Editar</button>}
              <Executar t={t} />
              {t.id > 0 && <button className="leve mini" onClick={() => mudaTarefa(t.id, { estado: t.estado === 'fila' ? 'fazendo' : 'feito' })}>{t.estado === 'fila' ? 'Começar' : 'Concluir'}</button>}</li>)}</ul>
          : !novas.length && <p className="vazio">Nenhuma missão aberta com {m.nome}.</p>}
        {novas.map(t => <section key={t.id} className="entrega-nova" aria-label={`Entrega de ${t.titulo}`}><p className="entrega-nova-topo"><span className="estado feito">Entregue</span><b>{t.titulo}</b></p><Entrega t={t} /></section>)}
        <form className="nova-linha" onSubmit={async e => { e.preventDefault(); const titulo = nova.trim(); if (titulo && (await criaTarefa({ agente: m.id, titulo, projeto_id: proj || null, prazo: prazo || null }))) { aoDar?.(`Missão dada a ${m.nome}: ${titulo}.`); setNova(''); setPrazo(''); } }}>
          <label className="so-leitor" htmlFor="nmis">Nova missão para {m.nome}</label>
          <input id="nmis" autoFocus={focaMissao} value={nova} onChange={e => setNova(e.target.value)} placeholder={`Nova missão para ${m.nome}`} maxLength={200} />
          <label className="so-leitor" htmlFor="nproj">Projeto</label>
          <select id="nproj" value={proj} onChange={e => setProj(e.target.value)}><option value="">Sem projeto</option>{estado.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
          <label className="so-leitor" htmlFor="nprazo">Prazo</label>
          <input id="nprazo" type="date" value={prazo} onChange={e => setPrazo(e.target.value)} title="Prazo, opcional" />
          <button type="submit" disabled={!nova.trim()}>Dar missão</button>
        </form>
        {!nova && <div className="sugestoes-missao" role="group" aria-label="Sugestões de missão">{sugestoesDeMissao(m.zona).map(s => <button key={s} type="button" onClick={() => { setNova(s); document.getElementById('nmis')?.focus(); }}>{s}</button>)}</div>}
        {guardadas.length > 0 && <section className="entregas-agente"><h4>Entregas de {m.nome}</h4>
          {guardadas.slice(0, 8).map(t => <details key={t.id} className="ver-entrega"><summary>{t.titulo}</summary><Entrega t={t} /></details>)}</section>}
        <div className="blocos">
          {perfilDe(m.id) && <Bloco icone="pessoas" titulo={`Jeito de ${m.nome}`} acao={{ rotulo: 'Ver perfil', vai: () => setAba('instrucoes') }}>
            <p className="perfil-resumo">{perfilDe(m.id)!.identidade}</p>
          </Bloco>}
          <Bloco icone="skills" titulo={`No que ${m.nome} foi treinado`} acao={{ rotulo: 'Treinar', vai: () => setAba('treino') }}>
            <ul className="fichas-skill">{estado.skills.filter(k => k.para_todos || (estado.vinculos[m.id] ?? []).includes(k.id)).slice(0, 6).map(k => <li key={k.id}>{k.nome}</li>)}</ul>
          </Bloco>
          <Bloco icone="memoria" titulo={`O que ${m.nome} lembra`} acao={{ rotulo: 'Ver tudo', vai: () => setAba('memoria') }}>
            {estado.memorias.some(n => n.agente === m.id)
              ? <ul className="lembra">{estado.memorias.filter(n => n.agente === m.id).slice(0, 2).map(n => <li key={n.id}>{n.texto}</li>)}</ul>
              : <p className="nota">Nada guardado ainda. Uma resposta boa na conversa pode virar nota.</p>}
          </Bloco>
          <Bloco icone="projetos" titulo="Em que projetos está">
            {estado.projetos.some(p => estado.tarefas.some(t => t.agente === m.id && t.projeto_id === p.id))
              ? <ul className="onde">{estado.projetos.filter(p => estado.tarefas.some(t => t.agente === m.id && t.projeto_id === p.id)).map(p => { const dele = estado.tarefas.filter(t => t.agente === m.id && t.projeto_id === p.id), f = dele.filter(t => t.estado === 'feito').length; return <li key={p.id}><b>{p.nome}</b><span className="barra"><i style={{ transform: `scaleX(${f / dele.length})` }} /></span><small>{f} de {dele.length}</small></li>; })}</ul>
              : <p className="nota">Sem missão em projeto. O que {m.nome} faz hoje é do lab.</p>}
          </Bloco>
        </div>
      </>}
      {aba === 'treino' && <Treino m={m} />}
      {aba === 'instrucoes' && <><PerfilDaPessoa m={m} /><Instrucoes key={m.id} m={m} /></>}
      {aba === 'memoria' && <Memoria m={m} />}
    </div>
  );
}

type AbaZona = 'equipe' | 'missoes' | 'reunioes';

/** O que acontece numa sala: quem trabalha ali, o que está em aberto e as reuniões com essa turma. */
export function PainelZona({ zona, abreAgente, briefing, marcaReuniao, conversa, darMissao, aoDar, lazer, abreAgenda }: {
  zona: string; abreAgente: (id: string) => void; briefing: () => void; marcaReuniao: (com: string[]) => void; abreAgenda?: () => void;
  conversa: (id: string) => void; darMissao: (id: string) => void; aoDar?: (texto: string) => void;
  /** O que o lounge tem para abrir sem depender de clicar no mapa: a rádio e o Pong. */
  lazer?: { radio: () => void; pong: () => void };
}) {
  const { estado, criaTarefa } = useEstado();
  const [aba, setAba] = useState<AbaZona>('equipe');
  const { equipe, nome } = useEquipe();
  const time = equipe.filter(m => m.zona === zona), ids = new Set(time.map(m => m.id));
  const abertas = estado.tarefas.filter(t => ids.has(t.agente) && t.estado !== 'feito');
  const reunioes = estado.reunioes.filter(r => r.participantes.some(p => ids.has(p)));
  const [nova, setNova] = useState(''), [quem, setQuem] = useState(time[0]?.id ?? '');
  return (
    <div className="zona">
      <div className="abas" role="tablist">
        {([['equipe', 'Equipe'], ['missoes', `Missões (${abertas.length})`], ['reunioes', `Reuniões (${reunioes.length})`]] as const).map(([id, n]) =>
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}>{n}</button>)}
      </div>
      {aba === 'equipe' && <>
        {time.length
          ? <ul className="elenco">{time.map(m => (
              <li key={m.id} className="com-acoes"><button onClick={() => abreAgente(m.id)}>
                <Retrato id={m.id} tamanho={40} /><span><b>{m.nome}</b><small>{m.papel}</small></span>
              </button>
              <div className="acoes-pessoa"><button className="leve mini" onClick={() => conversa(m.id)}>Conversar</button><button className="leve mini" onClick={() => darMissao(m.id)}>Missão</button></div></li>))}</ul>
          : <p className="vazio">Ninguém tem mesa fixa aqui. É área de uso comum, cada um passa quando precisa.</p>}
        {zona === 'atendimento' && <button className="primario" onClick={briefing}>Começar briefing com a Clara</button>}
        {zona === 'reuniao' && abreAgenda && <ProximaNaSala abreAgenda={abreAgenda} />}
        {zona === 'lounge' && lazer && <div className="linha"><button className="primario" onClick={lazer.radio}>Abrir a Rádio V30</button><button className="leve" onClick={lazer.pong}>Jogar Pong</button></div>}
      </>}
      {aba === 'missoes' && <>
        {abertas.length
          ? <ul className="tarefas-agente">{abertas.map(t => <li key={t.id}><span className={`estado ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span><span className="tit">{t.titulo}{t.detalhe && <small className="detalhe">{t.detalhe}</small>}{t.prazo && <small className={`prazo ${atrasada(t, hojeLocal()) ? 'atrasada' : ''}`}>{atrasada(t, hojeLocal()) ? 'Atrasada, era até' : 'Até'} {diaCurto(t.prazo)}</small>}</span><small>{nome(t.agente)}</small></li>)}</ul>
          : <p className="vazio">A equipe daqui não tem missão aberta.</p>}
        {time.length > 0 && <form className="nova-linha" onSubmit={async e => { e.preventDefault(); const titulo = nova.trim(); if (titulo && quem && (await criaTarefa({ agente: quem, titulo, projeto_id: null }))) { aoDar?.(`Missão dada a ${nome(quem)}: ${titulo}.`); setNova(''); } }}>
          <label className="so-leitor" htmlFor="zmis">Nova missão</label>
          <input id="zmis" value={nova} onChange={e => setNova(e.target.value)} placeholder="Nova missão para esta sala" maxLength={200} />
          <label className="so-leitor" htmlFor="zquem">Para quem</label>
          <select id="zquem" value={quem} onChange={e => setQuem(e.target.value)}>{time.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select>
          <button type="submit" disabled={!nova.trim()}>Dar missão</button>
        </form>}
      </>}
      {aba === 'reunioes' && <>
        {reunioes.length
          ? <ul className="tarefas-agente">{reunioes.map(r => <li key={r.id}><span className={`estado ${r.status === 'feita' ? 'feito' : 'fila'}`}>{r.status === 'feita' ? 'Feita' : `${r.dia.slice(8, 10)}/${r.dia.slice(5, 7)} ${r.hora}`}</span>{r.titulo} <small>{r.participantes.map(nome).join(', ')}</small></li>)}</ul>
          : <p className="vazio">Nenhuma reunião com a equipe daqui.</p>}
        {time.length > 0 && <button className="primario" onClick={() => marcaReuniao(time.map(m => m.id))}>Marcar reunião com a sala</button>}
      </>}
    </div>
  );
}
