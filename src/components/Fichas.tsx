import { useState } from 'react';
import { EQUIPE, type Membro } from '../lib/equipe';
import { ZONAS } from '../lib/lab';
import { useEstado } from '../hooks/useEstado';
import { Retrato } from './Retrato';
import { AvisoPrevia } from './Paineis';

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
      {!notas.length && <p className="vazio">{m.nome} ainda não lembra de nada específico. Guarde aqui o que vale para todas as conversas, ou guarde uma resposta direto do chat.</p>}
      <ul className="notas">
        {notas.map(n => (
          <li key={n.id}><p>{n.texto}</p><footer><small>{n.origem === 'conversa' ? 'Da conversa' : 'Anotado'}, {new Date(n.criado_em.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR')}</small>
            <button onClick={() => apagaMemoria(n.id)} aria-label={`Esquecer: ${n.texto.slice(0, 40)}`}>Esquecer</button></footer></li>
        ))}
      </ul>
    </div>
  );
}

export function FichaAgente({ m, conversa, abaInicial }: { m: Membro; conversa: () => void; abaInicial?: 'visao' | 'instrucoes' | 'memoria' }) {
  const { estado, criaTarefa } = useEstado();
  const [aba, setAba] = useState<'visao' | 'instrucoes' | 'memoria'>(abaInicial ?? 'visao');
  const [nova, setNova] = useState(''), [proj, setProj] = useState(estado.projetos[0]?.id ?? '');
  const z = ZONAS.find(q => q.id === m.zona)!;
  const abertas = estado.tarefas.filter(t => t.agente === m.id && t.estado !== 'feito');
  return (
    <div className="ficha-agente">
      <div className="ficha">
        <Retrato id={m.id} tamanho={88} cor={z.cor + '40'} />
        <div><p className="rotulo">{z.nome}</p><p className="papel">{m.papel}</p>
          <button className="primario" onClick={conversa}>{m.id === 'clara' ? 'Começar briefing' : `Conversar com ${m.nome}`}</button></div>
      </div>
      <div className="abas" role="tablist">
        {([['visao', 'Missões'], ['instrucoes', 'Instruções'], ['memoria', 'Memória']] as const).map(([id, n]) =>
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}>{n}</button>)}
      </div>
      <AvisoPrevia />
      {aba === 'visao' && <>
        {abertas.length
          ? <ul className="tarefas-agente">{abertas.map(t => <li key={t.id}><span className={`estado ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span>{t.titulo}</li>)}</ul>
          : <p className="vazio">Nenhuma missão aberta com {m.nome}.</p>}
        <form className="nova-linha" onSubmit={e => { e.preventDefault(); if (!nova.trim()) return; criaTarefa({ agente: m.id, titulo: nova.trim(), projeto_id: proj || null }); setNova(''); }}>
          <label className="so-leitor" htmlFor="nmis">Nova missão para {m.nome}</label>
          <input id="nmis" value={nova} onChange={e => setNova(e.target.value)} placeholder={`Nova missão para ${m.nome}`} maxLength={200} />
          <label className="so-leitor" htmlFor="nproj">Projeto</label>
          <select id="nproj" value={proj} onChange={e => setProj(e.target.value)}><option value="">Sem projeto</option>{estado.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
          <button type="submit" disabled={!nova.trim()}>Dar missão</button>
        </form>
      </>}
      {aba === 'instrucoes' && <Instrucoes key={m.id} m={m} />}
      {aba === 'memoria' && <Memoria m={m} />}
    </div>
  );
}

type AbaZona = 'equipe' | 'missoes' | 'reunioes';

/** O que acontece numa sala: quem trabalha ali, o que está em aberto e as reuniões com essa turma. */
export function PainelZona({ zona, abreAgente, briefing, marcaReuniao }: {
  zona: string; abreAgente: (id: string) => void; briefing: () => void; marcaReuniao: (com: string) => void;
}) {
  const { estado, criaTarefa } = useEstado();
  const [aba, setAba] = useState<AbaZona>('equipe');
  const time = EQUIPE.filter(m => m.zona === zona), ids = new Set(time.map(m => m.id));
  const nome = (id: string) => EQUIPE.find(e => e.id === id)?.nome ?? id;
  const abertas = estado.tarefas.filter(t => ids.has(t.agente) && t.estado !== 'feito');
  const reunioes = estado.reunioes.filter(r => r.participantes.some(p => ids.has(p)));
  const [nova, setNova] = useState(''), [quem, setQuem] = useState(time[0]?.id ?? '');
  return (
    <div className="zona">
      <div className="abas" role="tablist">
        {([['equipe', 'Equipe'], ['missoes', `Missões (${abertas.length})`], ['reunioes', `Reuniões (${reunioes.length})`]] as const).map(([id, n]) =>
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}>{n}</button>)}
      </div>
      <AvisoPrevia />
      {aba === 'equipe' && <>
        {time.length
          ? <ul className="elenco">{time.map(m => (
              <li key={m.id}><button onClick={() => abreAgente(m.id)}>
                <Retrato id={m.id} tamanho={40} /><span><b>{m.nome}</b><small>{m.papel}</small></span>
              </button></li>))}</ul>
          : <p className="vazio">Ninguém tem mesa fixa aqui. É área de uso comum, cada um passa quando precisa.</p>}
        {zona === 'atendimento' && <button className="primario" onClick={briefing}>Começar briefing com a Clara</button>}
      </>}
      {aba === 'missoes' && <>
        {abertas.length
          ? <ul className="tarefas-agente">{abertas.map(t => <li key={t.id}><span className={`estado ${t.estado}`}>{t.estado === 'fazendo' ? 'Fazendo' : 'Na fila'}</span>{t.titulo} <small>{nome(t.agente)}</small></li>)}</ul>
          : <p className="vazio">A equipe daqui não tem missão aberta.</p>}
        {time.length > 0 && <form className="nova-linha" onSubmit={e => { e.preventDefault(); if (!nova.trim() || !quem) return; criaTarefa({ agente: quem, titulo: nova.trim(), projeto_id: null }); setNova(''); }}>
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
        {time.length > 0 && <button className="primario" onClick={() => marcaReuniao(time[0].id)}>Marcar reunião com a sala</button>}
      </>}
    </div>
  );
}
