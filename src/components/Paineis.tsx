import { useEffect, useState } from 'react';
import { useEstado } from '../hooks/useEstado';
import { EQUIPE } from '../lib/equipe';
import { FASES, type Estado, type Projeto } from '../lib/dados';
import { Retrato } from './Retrato';
import { trofeus } from '../lib/resumo';

const nome = (id: string) => EQUIPE.find(e => e.id === id)?.nome ?? id;
const dataCurta = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
/** Botão de apagar que pede confirmação no próprio lugar, sem janela por cima. */
function Apagar({ oque, apaga }: { oque: string; apaga: () => void }) {
  const [certo, setCerto] = useState(false);
  if (!certo) return <button className="leve mini" onClick={() => setCerto(true)} aria-label={`Apagar ${oque}`}>Apagar</button>;
  return <span className="confirma">Apagar de vez?<button className="perigo mini" onClick={apaga}>Apagar</button><button className="leve mini" onClick={() => setCerto(false)}>Manter</button></span>;
}

const COLUNAS: { id: Estado; nome: string }[] = [{ id: 'fila', nome: 'Na fila' }, { id: 'fazendo', nome: 'Fazendo' }, { id: 'feito', nome: 'Feito' }];

export function AvisoPrevia() {
  const { modo, motivo } = useEstado();
  if (modo !== 'previa') return null;
  return <p className="previa">{motivo && motivo !== 'O servidor do lab não respondeu.' ? motivo + ' ' : 'Prévia sem servidor. '}Os dados são de exemplo e o que você mudar some ao recarregar.</p>;
}

/** Abre projeto para um cliente que ainda não tem. */
function AbreProjeto({ cliente, abreProjeto }: { cliente: string; abreProjeto: (id: string) => void }) {
  const { criaProjeto } = useEstado();
  const [nome, setNome] = useState('');
  return (
    <form className="nova-linha" onSubmit={async e => { e.preventDefault(); const id = await criaProjeto(cliente, nome.trim()); if (id) abreProjeto(id); }}>
      <label className="so-leitor" htmlFor={`np-${cliente}`}>Nome do projeto</label>
      <input id={`np-${cliente}`} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do projeto, por exemplo Padrão de atendimento na loja" maxLength={120} />
      <button type="submit" disabled={nome.trim().length < 3}>Abrir projeto</button>
    </form>
  );
}

export function Clientes({ abreProjeto, novo = false }: { abreProjeto: (id: string) => void; novo?: boolean }) {
  const { estado, criaCliente, criaProjeto } = useEstado();
  const [form, setForm] = useState(novo);
  const [f, setF] = useState({ setor: '', situacao: '', projeto: '' });
  const salva = async () => {
    const id = await criaCliente({ setor: f.setor.trim(), situacao: f.situacao.trim() });
    if (!id) return;
    setForm(false); setF({ setor: '', situacao: '', projeto: '' });
    if (f.projeto.trim().length >= 3) { const p = await criaProjeto(id, f.projeto.trim()); if (p) abreProjeto(p); }
  };
  return (
    <div className="lista-clientes">
      <AvisoPrevia />
      {!form ? <button className="primario" onClick={() => setForm(true)}>Novo cliente</button> : (
        <form className="form-reuniao" onSubmit={e => { e.preventDefault(); salva(); }}>
          <p className="ajuda">Cliente entra por setor e situação, nunca pelo nome.</p>
          <label>Setor<input autoFocus value={f.setor} onChange={e => setF({ ...f, setor: e.target.value })} placeholder="Rede de postos no interior" maxLength={120} /></label>
          <label>Situação<input value={f.situacao} onChange={e => setF({ ...f, situacao: e.target.value })} placeholder="O que trava a operação hoje, em uma frase" maxLength={300} /></label>
          <label>Projeto<input value={f.projeto} onChange={e => setF({ ...f, projeto: e.target.value })} placeholder="Opcional. Se tiver nome, o projeto já abre no diagnóstico" maxLength={120} /></label>
          <div className="linha"><button className="primario" type="submit" disabled={f.setor.trim().length < 3 || f.situacao.trim().length < 3}>Cadastrar</button><button type="button" className="leve" onClick={() => setForm(false)}>Desistir</button></div>
        </form>
      )}
      {estado.clientes.map(c => {
        const projs = estado.projetos.filter(p => p.cliente_id === c.id);
        return (
          <article key={c.id} className="cliente">
            <header><h3>{c.setor}</h3>{projs.length ? <span className="fase" data-f={c.fase}>{FASES[c.fase]}</span> : <span className="fase conversa">Em conversa</span>}</header>
            <p>{c.situacao}</p>
            {projs.map(p => <button key={p.id} className="link" onClick={() => abreProjeto(p.id)}>{p.nome}, dia {p.dia} de 30</button>)}
            {!projs.length && <AbreProjeto cliente={c.id} abreProjeto={abreProjeto} />}
          </article>
        );
      })}
    </div>
  );
}

function Kanban({ projeto }: { projeto: Projeto }) {
  const { estado, criaTarefa, mudaTarefa, apagaTarefa } = useEstado();
  const [titulo, setTitulo] = useState(''), [agente, setAgente] = useState('rui');
  const tarefas = estado.tarefas.filter(t => t.projeto_id === projeto.id);
  const proximo: Record<Estado, Estado | null> = { fila: 'fazendo', fazendo: 'feito', feito: null };
  const anterior: Record<Estado, Estado | null> = { fila: null, fazendo: 'fila', feito: 'fazendo' };
  return (
    <>
      <div className="kanban">
        {COLUNAS.map(col => {
          const lista = tarefas.filter(t => t.estado === col.id);
          return (
            <section key={col.id} aria-label={col.nome}>
              <h4>{col.nome} <span>{lista.length}</span></h4>
              {!lista.length && <p className="vazio">Nada aqui.</p>}
              {lista.map(t => (
                <div key={t.id} className={`cartao ${t.estado}`}>
                  <p>{t.titulo}</p>
                  <footer>
                    <span className="dono"><Retrato id={t.agente} tamanho={22} />{nome(t.agente)}</span>
                    {t.id < 0 ? <span className="salvando">Salvando</span> : <span className="acoes">
                      {anterior[t.estado] && <button onClick={() => mudaTarefa(t.id, { estado: anterior[t.estado]! })} aria-label={`Voltar ${t.titulo}`}>Voltar</button>}
                      {proximo[t.estado] && <button className="avanca" onClick={() => mudaTarefa(t.id, { estado: proximo[t.estado]! })}>{t.estado === 'fila' ? 'Começar' : 'Concluir'}</button>}
                      {t.estado === 'feito' && <button onClick={() => apagaTarefa(t.id)} aria-label={`Arquivar ${t.titulo}`}>Arquivar</button>}
                    </span>}
                  </footer>
                </div>
              ))}
            </section>
          );
        })}
      </div>
      <form className="nova-linha" onSubmit={e => { e.preventDefault(); if (!titulo.trim()) return; criaTarefa({ agente, titulo: titulo.trim(), projeto_id: projeto.id }); setTitulo(''); }}>
        <label className="so-leitor" htmlFor="nt">Nova missão</label>
        <input id="nt" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Nova missão para este projeto" maxLength={200} />
        <label className="so-leitor" htmlFor="nd">Quem faz</label>
        <select id="nd" value={agente} onChange={e => setAgente(e.target.value)}>{EQUIPE.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select>
        <button type="submit" disabled={!titulo.trim()}>Dar missão</button>
      </form>
    </>
  );
}

export function Projetos({ inicial }: { inicial?: string }) {
  const { estado, mudaFase } = useEstado();
  const [id, setId] = useState(inicial ?? estado.projetos[0]?.id);
  const [confirma, setConfirma] = useState(false);
  useEffect(() => { if (inicial) setId(inicial); }, [inicial]);
  const p = estado.projetos.find(x => x.id === id) ?? estado.projetos[0];
  if (!p) return <p className="vazio">Nenhum projeto ainda. Um briefing com a Clara é o começo de um.</p>;
  const c = estado.clientes.find(x => x.id === p.cliente_id);
  const feitas = estado.tarefas.filter(t => t.projeto_id === p.id && t.estado === 'feito').length, total = estado.tarefas.filter(t => t.projeto_id === p.id).length;
  return (
    <div className="projetos">
      <AvisoPrevia />
      <div className="abas" role="tablist">
        {estado.projetos.map(x => <button key={x.id} role="tab" aria-selected={x.id === p.id} onClick={() => setId(x.id)}>{estado.clientes.find(k => k.id === x.cliente_id)?.setor}</button>)}
      </div>
      {p.mesa && (
        <figure className="mesa">
          <img src={`assets/${p.mesa}`} alt={`Mesa de projetos de ${p.nome}: maquetes do posto da planta ao modelo pronto, com o squad na fase ${FASES[p.fase]}`} />
          <div className="placas">{FASES.map((f, k) => <span key={f} className={k < p.fase ? 'ok' : k === p.fase ? 'atual' : ''}><b>{k + 1}</b>{f}</span>)}</div>
        </figure>
      )}
      <div className="resumo-proj">
        <div><span className="rotulo">Projeto</span><b>{p.nome}</b></div>
        <div><span className="rotulo">Ciclo</span><b>Dia {p.dia} de 30</b></div>
        <div><span className="rotulo">Missões</span><b>{feitas} de {total} feitas</b></div>
      </div>
      {c && <p className="situacao">{c.situacao}</p>}
      {p.fase < FASES.length - 1 && (
        <div className="troca-fase">
          {!confirma ? <button className="leve" onClick={() => (total - feitas ? setConfirma(true) : mudaFase(p.id, p.fase + 1))}>Fechar {FASES[p.fase]} e passar para {FASES[p.fase + 1]}</button> : <>
            <span>Ainda tem {total - feitas} {total - feitas === 1 ? 'missão aberta' : 'missões abertas'} neste projeto. Passar mesmo assim?</span>
            <button className="primario" onClick={() => { mudaFase(p.id, p.fase + 1); setConfirma(false); }}>Passar de fase</button>
            <button className="leve" onClick={() => setConfirma(false)}>Ainda não</button>
          </>}
        </div>
      )}
      <Kanban projeto={p} />
    </div>
  );
}

export function Agenda({ com }: { com?: string[] }) {
  const { estado, criaReuniao, gravaAta, criaDecisao, mudaReuniao, apagaReuniao } = useEstado();
  const [remarca, setRemarca] = useState<{ id: number; dia: string; hora: string } | null>(null);
  const [nova, setNova] = useState(!!com);
  const [f, setF] = useState({ titulo: '', pauta: '', dia: new Date().toISOString().slice(0, 10), hora: '09:30', participantes: com ?? [] as string[], projeto_id: '' });
  const [ataDe, setAtaDe] = useState<number | null>(null), [ata, setAta] = useState(''), [decisao, setDecisao] = useState('');
  const salva = async () => { if (await criaReuniao({ ...f, projeto_id: f.projeto_id || null })) { setNova(false); setF({ ...f, titulo: '', pauta: '', participantes: [] }); } };
  const fecha = async (id: number, projeto_id: string | null) => {
    if (!ata.trim()) return;
    if (await gravaAta(id, ata.trim())) {
      if (decisao.trim()) await criaDecisao({ titulo: decisao.trim(), contexto: '', projeto_id, reuniao_id: id });
      setAtaDe(null); setAta(''); setDecisao('');
    }
  };
  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = estado.reunioes.filter(r => r.status === 'agendada');
  const feitas = estado.reunioes.filter(r => r.status === 'feita').sort((a, b) => (b.dia + b.hora).localeCompare(a.dia + a.hora));
  return (
    <div className="agenda">
      <AvisoPrevia />
      {!nova ? <button className="primario" onClick={() => setNova(true)}>Marcar reunião</button> : (
        <form className="form-reuniao" onSubmit={e => { e.preventDefault(); salva(); }}>
          <label>Assunto<input required value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} placeholder="Ritual semanal do piloto" /></label>
          <label>Pauta<input value={f.pauta} onChange={e => setF({ ...f, pauta: e.target.value })} placeholder="O que precisa sair decidido" /></label>
          <div className="linha"><label>Dia<input type="date" required value={f.dia} onChange={e => setF({ ...f, dia: e.target.value })} /></label>
            <label>Hora<input type="time" required value={f.hora} onChange={e => setF({ ...f, hora: e.target.value })} /></label>
            <label>Projeto<select value={f.projeto_id} onChange={e => setF({ ...f, projeto_id: e.target.value })}><option value="">Nenhum</option>{estado.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label></div>
          <fieldset><legend>Quem participa</legend><div className="escolha">
            {EQUIPE.map(m => <label key={m.id} className={f.participantes.includes(m.id) ? 'on' : ''}><input type="checkbox" checked={f.participantes.includes(m.id)} onChange={e => setF({ ...f, participantes: e.target.checked ? [...f.participantes, m.id] : f.participantes.filter(x => x !== m.id) })} />{m.nome}</label>)}
          </div></fieldset>
          <div className="linha"><button className="primario" type="submit" disabled={f.titulo.trim().length < 3 || !f.participantes.length}>Marcar</button><button type="button" className="leve" onClick={() => setNova(false)}>Desistir</button></div>
        </form>
      )}
      <h3 className="secao">Próximas</h3>
      {!proximas.length && <p className="vazio">Nada marcado. Uma reunião curta por semana por projeto segura o ritmo.</p>}
      {proximas.map(r => (
        <article key={r.id} className="reuniao">
          <div className="quando"><b>{dataCurta(r.dia)}</b><span>{r.hora}</span></div>
          <div className="o-que"><h4>{r.titulo}</h4>{r.pauta && <p>{r.pauta}</p>}<div className="rostos">{r.participantes.map(p => <Retrato key={p} id={p} tamanho={24} />)}</div>
            {remarca?.id === r.id ? (
              <form className="linha remarca" onSubmit={async e => { e.preventDefault(); if (await mudaReuniao(r.id, { dia: remarca.dia, hora: remarca.hora })) setRemarca(null); }}>
                <label>Dia<input type="date" value={remarca.dia} onChange={e => setRemarca({ ...remarca, dia: e.target.value })} /></label>
                <label>Hora<input type="time" value={remarca.hora} onChange={e => setRemarca({ ...remarca, hora: e.target.value })} /></label>
                <button className="primario mini" type="submit">Salvar</button><button type="button" className="leve mini" onClick={() => setRemarca(null)}>Desistir</button>
              </form>
            ) : r.id > 0 && <div className="linha acoes-reuniao"><button className="leve mini" onClick={() => setRemarca({ id: r.id, dia: r.dia, hora: r.hora })}>Remarcar</button><Apagar oque={r.titulo} apaga={() => apagaReuniao(r.id)} /></div>}
          </div>
          {r.dia > hoje ? <span className="ainda">Ata abre no dia</span> : ataDe !== r.id ? <button className="leve" onClick={() => { setAtaDe(r.id); setAta(''); }}>Registrar ata</button> : (
            <form className="form-ata" onSubmit={e => { e.preventDefault(); fecha(r.id, r.projeto_id); }}>
              <label>Ata<textarea rows={3} value={ata} onChange={e => setAta(e.target.value)} placeholder="O que foi falado, em poucas linhas" /></label>
              <label>Decisão tomada<input value={decisao} onChange={e => setDecisao(e.target.value)} placeholder="Opcional. Entra no registro de decisões" /></label>
              <div className="linha"><button className="primario" type="submit" disabled={!ata.trim()}>Fechar reunião</button><button type="button" className="leve" onClick={() => setAtaDe(null)}>Desistir</button></div>
            </form>
          )}
        </article>
      ))}
      <h3 className="secao">Feitas</h3>
      {feitas.map(r => <article key={r.id} className="reuniao feita"><div className="quando"><b>{dataCurta(r.dia)}</b><span>{r.hora}</span></div><div className="o-que"><h4>{r.titulo}</h4><p>{r.ata}</p>{r.id > 0 && <div className="linha acoes-reuniao"><Apagar oque={r.titulo} apaga={() => apagaReuniao(r.id)} /></div>}</div></article>)}
    </div>
  );
}

export function Decisoes() {
  const { estado, criaDecisao, mudaDecisao, apagaDecisao } = useEstado();
  const [edita, setEdita] = useState<{ id: number; titulo: string; contexto: string } | null>(null);
  const [t, setT] = useState(''), [c, setC] = useState(''), [p, setP] = useState('');
  return (
    <div className="decisoes">
      <AvisoPrevia />
      <form className="form-decisao" onSubmit={async e => { e.preventDefault(); if (await criaDecisao({ titulo: t.trim(), contexto: c.trim(), projeto_id: p || null, reuniao_id: null })) { setT(''); setC(''); } }}>
        <label>O que foi decidido<input value={t} onChange={e => setT(e.target.value)} placeholder="Piloto roda primeiro na unidade com mais fluxo" /></label>
        <label>Por quê<input value={c} onChange={e => setC(e.target.value)} placeholder="O motivo, em uma frase" /></label>
        <div className="linha"><select aria-label="Projeto" value={p} onChange={e => setP(e.target.value)}><option value="">Sem projeto</option>{estado.projetos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
          <button className="primario" type="submit" disabled={!t.trim()}>Registrar decisão</button></div>
      </form>
      {!estado.decisoes.length && <p className="vazio">Nenhuma decisão registrada. Toda reunião que termina com algo resolvido deveria deixar uma aqui.</p>}
      <ol className="linha-tempo">
        {estado.decisoes.map(d => (
          <li key={d.id}><time>{new Date(d.criado_em.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</time>
            {edita?.id === d.id ? (
              <form className="form-decisao" onSubmit={async e => { e.preventDefault(); if (await mudaDecisao(d.id, { titulo: edita.titulo, contexto: edita.contexto })) setEdita(null); }}>
                <label>O que foi decidido<input value={edita.titulo} onChange={e => setEdita({ ...edita, titulo: e.target.value })} /></label>
                <label>Por quê<input value={edita.contexto} onChange={e => setEdita({ ...edita, contexto: e.target.value })} /></label>
                <div className="linha"><button className="primario mini" type="submit" disabled={!edita.titulo.trim()}>Salvar</button><button type="button" className="leve mini" onClick={() => setEdita(null)}>Desistir</button></div>
              </form>
            ) : <div><b>{d.titulo}</b>{d.contexto && <p>{d.contexto}</p>}{d.projeto_id && <small>{estado.projetos.find(x => x.id === d.projeto_id)?.nome}</small>}
              {d.id > 0 && <div className="linha acoes-reuniao"><button className="leve mini" onClick={() => setEdita({ id: d.id, titulo: d.titulo, contexto: d.contexto })}>Editar</button><Apagar oque={d.titulo} apaga={() => apagaDecisao(d.id)} /></div>}</div>}</li>
        ))}
      </ol>
    </div>
  );
}

export function Conexoes() {
  const { modo } = useEstado();
  const [c, setC] = useState<{ banco: boolean; chave: boolean; mensagens: number } | null>(null);
  useEffect(() => { fetch('api/conexoes').then(r => r.json()).then(setC).catch(() => setC(null)); }, []);
  const itens = [
    { nome: 'Worker na Cloudflare', ok: modo === 'banco', txt: modo === 'banco' ? 'Respondendo' : 'Esta é a prévia, sem Worker por trás' },
    { nome: 'Banco D1', ok: !!c?.banco, txt: c?.banco ? `Ligado, ${c.mensagens} mensagens guardadas` : 'Sem acesso daqui' },
    { nome: 'API do Claude', ok: !!c?.chave, txt: c?.chave ? 'Chave configurada' : 'Falta configurar o segredo ANTHROPIC_API_KEY no Worker' },
  ];
  return <ul className="conexoes">{itens.map(i => <li key={i.nome}><span className={`ponto ${i.ok ? 'ok' : ''}`} aria-hidden="true" /><div><b>{i.nome}</b><small>{i.txt}</small></div></li>)}</ul>;
}

export function Trofeus() {
  const { estado } = useEstado();
  const lista = trofeus(estado);
  return (
    <ul className="trofeus">
      {lista.map(t => { const ok = t.atual >= t.meta; return (
        <li key={t.nome} className={ok ? 'ok' : ''}>
          <b>{t.nome}</b><small>{t.txt}</small>
          <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={t.meta} aria-valuenow={Math.min(t.atual, t.meta)} aria-label={t.nome}><i style={{ transform: `scaleX(${Math.min(1, t.atual / t.meta)})` }} /></div>
          <span className="conta">{ok ? 'Conquistado' : `${Math.min(t.atual, t.meta)} de ${t.meta}`}</span>
        </li>); })}
    </ul>
  );
}
