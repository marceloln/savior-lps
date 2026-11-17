// Reuniões com gente de verdade: moram no Google Agenda, acontecem no Meet e voltam para o lab como ata,
// decisões e missões, sempre com a aprovação de um sócio.
import { useState } from 'react';
import { useEstado, type AtaProposta } from '../hooks/useEstado';
import { useEquipe } from '../hooks/useEquipe';
import { aindaHoje, horaLocal, type NovaReuniaoMeet, type ReuniaoGoogle } from '../lib/agendaGoogle';
import { dataCurta, hojeLocal } from '../lib/dados';
import { ORQUESTRADOR } from '../lib/equipe';
import { useAgendaGoogle } from '../hooks/useAgendaGoogle';

type Google = ReturnType<typeof useAgendaGoogle>;
/** De onde a ata vem: uma reunião do Google Agenda ou anotações coladas à mão. */
export type Origem = { titulo: string; dia: string; hora: string; projeto: string | null; docId: string | null };

const DURACOES = [30, 45, 60, 90, 120];
const emails = (t: string) => t.split(/[\s,;]+/).map(e => e.trim()).filter(Boolean);

/** Formulário para marcar no Google Agenda, com Meet e convite por e-mail. */
export function MarcaNoMeet({ g, aoMarcar, desiste }: { g: Google; aoMarcar: () => void; desiste: () => void }) {
  const { estado } = useEstado();
  const [f, setF] = useState({ titulo: '', pauta: '', dia: hojeLocal(), hora: '10:00', duracao: 60, convidados: '', projeto_id: '' });
  const [enviando, setEnviando] = useState(false), [erro, setErro] = useState('');
  const envia = async () => {
    setEnviando(true); setErro('');
    const n: NovaReuniaoMeet = { titulo: f.titulo, pauta: f.pauta, dia: f.dia, hora: f.hora, duracao: f.duracao, convidados: emails(f.convidados), projeto_id: f.projeto_id || null };
    const r = await g.marca(n);
    setEnviando(false);
    if (r.ok) aoMarcar(); else setErro(r.erro);
  };
  return (
    <form className="form-reuniao" onSubmit={e => { e.preventDefault(); envia(); }}>
      <label>Assunto<input required autoFocus value={f.titulo} maxLength={160} onChange={e => setF({ ...f, titulo: e.target.value })} placeholder="Ritual semanal com a operação" /></label>
      <label>Pauta<textarea rows={2} value={f.pauta} maxLength={2000} onChange={e => setF({ ...f, pauta: e.target.value })} placeholder="Vai na descrição do convite" /></label>
      <div className="linha">
        <label>Dia<input type="date" required value={f.dia} onChange={e => setF({ ...f, dia: e.target.value })} /></label>
        <label>Hora<input type="time" required value={f.hora} onChange={e => setF({ ...f, hora: e.target.value })} /></label>
        <label>Duração<select value={f.duracao} onChange={e => setF({ ...f, duracao: Number(e.target.value) })}>{DURACOES.map(d => <option key={d} value={d}>{d < 60 ? `${d} min` : `${d / 60} h`.replace('.5', ' e meia')}</option>)}</select></label>
        <label>Projeto<select value={f.projeto_id} onChange={e => setF({ ...f, projeto_id: e.target.value })}><option value="">Nenhum</option>{estado.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
      </div>
      <label>Convidados<textarea rows={2} value={f.convidados} onChange={e => setF({ ...f, convidados: e.target.value })} placeholder="E-mails separados por vírgula ou um por linha" /></label>
      <p className="nota">O convite sai pelo Google Agenda da V30, com o link do Meet. Ligue as anotações do Gemini na chamada para o lab organizar a ata depois.</p>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
      <div className="linha"><button className="primario" type="submit" disabled={enviando || f.titulo.trim().length < 3}>{enviando ? 'Marcando' : 'Marcar no Meet'}</button><button type="button" className="leve" onClick={desiste}>Desistir</button></div>
    </form>
  );
}

/** Lista do Google Agenda: as próximas com Entrar no Meet e as que já aconteceram com as anotações para organizar. */
export function ReunioesDoGoogle({ g, organiza }: { g: Google; organiza: (o: Origem) => void }) {
  if (g.estado === 'carregando') return <p className="nota" role="status">Lendo o Google Agenda.</p>;
  if (g.estado !== 'ligado') return <p className="nota">{g.recado}{g.estado === 'erro' && <> <button className="link" onClick={g.recarrega}>Tentar de novo</button></>}</p>;
  const hoje = hojeLocal();
  const proximas = g.lista.filter(r => r.dia >= hoje), passadas = g.lista.filter(r => r.dia < hoje && r.anotacoes).reverse();
  const linha = (r: ReuniaoGoogle, passada: boolean) => (
    <article key={r.id + r.dia} className={`reuniao google ${passada ? 'feita' : ''}`}>
      <div className="quando"><b>{dataCurta(r.dia)}</b><span>{r.hora} às {r.fim}</span></div>
      <div className="o-que"><h4>{r.titulo}</h4><p>{r.convidados.length ? `${r.convidados.length} ${r.convidados.length === 1 ? 'convidado' : 'convidados'}` : 'Sem convidados'}</p>
        <div className="linha acoes-reuniao">
          {!passada && r.meet && <a className="primario mini" href={r.meet} target="_blank" rel="noreferrer">Entrar no Meet</a>}
          {r.anotacoesUrl && <a className="leve mini" href={r.anotacoesUrl} target="_blank" rel="noreferrer">Anotações do Gemini</a>}
        </div>
      </div>
      {r.anotacoes && <button className="leve" onClick={() => organiza({ titulo: r.titulo, dia: r.dia, hora: r.hora, projeto: r.projeto, docId: r.anotacoes })}>Organizar com a equipe</button>}
    </article>
  );
  return (<>
    {!proximas.length && <p className="vazio">Nada no Google Agenda nas próximas três semanas.</p>}
    {proximas.map(r => linha(r, false))}
    {passadas.length > 0 && <><h4 className="sub-secao">Com anotações para organizar</h4>{passadas.map(r => linha(r, true))}</>}
  </>);
}

/** Anotações viram ata, decisões e missões. O sócio confere, corta o que não foi decidido e aprova. */
export function OrganizaAta({ origem, g, fecha }: { origem: Origem; g: Google; fecha: () => void }) {
  const { estado, organizaAta, registraReuniao } = useEstado();
  const { equipe } = useEquipe();
  const [texto, setTexto] = useState(''), [lendo, setLendo] = useState(false), [pensando, setPensando] = useState(false);
  const [erro, setErro] = useState(''), [aviso, setAviso] = useState('');
  const [p, setP] = useState<(AtaProposta & { fica: { d: boolean[]; m: boolean[] } }) | null>(null);
  const [cab, setCab] = useState({ titulo: origem.titulo, dia: origem.dia, hora: origem.hora, projeto_id: origem.projeto ?? '' });
  const nome = (id: string) => equipe.find(m => m.id === id)?.nome ?? id;

  const busca = async () => {
    if (!origem.docId) return;
    setLendo(true); setErro('');
    const r = await g.anotacoes(origem.docId);
    setLendo(false);
    if (r.ok) { setTexto(r.v.texto); setAviso(r.v.cortado ? 'O documento é longo e veio cortado. O começo basta para a ata.' : ''); } else setErro(r.erro);
  };
  const pede = async () => {
    setPensando(true); setErro('');
    const r = await organizaAta(texto, cab.titulo);
    setPensando(false);
    if (r) setP({ ...r, fica: { d: r.decisoes.map(() => true), m: r.missoes.map(() => true) } });
  };
  const aprova = async () => {
    if (!p) return;
    const ok = await registraReuniao({
      titulo: cab.titulo, dia: cab.dia, hora: cab.hora, projeto_id: cab.projeto_id || null, participantes: [ORQUESTRADOR], ata: p.ata,
      decisoes: p.decisoes.filter((_, i) => p.fica.d[i]), missoes: p.missoes.filter((_, i) => p.fica.m[i]),
    });
    if (ok) fecha();
  };

  return (
    <section className="organiza-ata form-reuniao" aria-label="Organizar a reunião">
      <div className="linha">
        <label>Reunião<input value={cab.titulo} maxLength={160} onChange={e => setCab({ ...cab, titulo: e.target.value })} /></label>
        <label>Dia<input type="date" value={cab.dia} onChange={e => setCab({ ...cab, dia: e.target.value })} /></label>
        <label>Hora<input type="time" value={cab.hora} onChange={e => setCab({ ...cab, hora: e.target.value })} /></label>
        <label>Projeto<select value={cab.projeto_id} onChange={e => setCab({ ...cab, projeto_id: e.target.value })}><option value="">Nenhum</option>{estado.projetos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
      </div>
      {!p ? (<>
        {origem.docId && !texto && <button type="button" className="primario" onClick={busca} disabled={lendo}>{lendo ? 'Lendo o documento' : 'Trazer as anotações do Gemini'}</button>}
        <label>Anotações<textarea rows={8} value={texto} maxLength={60000} onChange={e => setTexto(e.target.value)} placeholder="Cole aqui as anotações do Gemini ou o resumo da reunião" /></label>
        {aviso && <p className="nota">{aviso}</p>}
        {erro && <p className="erro-campo" role="alert">{erro}</p>}
        <div className="linha"><button type="button" className="primario" onClick={pede} disabled={pensando || texto.trim().length < 40}>{pensando ? 'A orquestração está lendo' : 'Organizar com a equipe'}</button><button type="button" className="leve" onClick={fecha}>Desistir</button></div>
      </>) : (<>
        <label>Ata<textarea rows={6} value={p.ata} maxLength={6000} onChange={e => setP({ ...p, ata: e.target.value })} /></label>
        <fieldset><legend>Decisões</legend>
          {!p.decisoes.length && <p className="vazio">A orquestração não achou decisão tomada nesta reunião.</p>}
          {p.decisoes.map((d, i) => <label key={i} className="marca-item"><input type="checkbox" checked={p.fica.d[i]} onChange={e => setP({ ...p, fica: { ...p.fica, d: p.fica.d.map((v, j) => (j === i ? e.target.checked : v)) } })} /><span><b>{d.titulo}</b>{d.contexto && <small>{d.contexto}</small>}</span></label>)}
        </fieldset>
        <fieldset><legend>Missões para a equipe</legend>
          {!p.missoes.length && <p className="vazio">Nenhuma missão sugerida.</p>}
          {p.missoes.map((m, i) => <label key={i} className="marca-item"><input type="checkbox" checked={p.fica.m[i]} onChange={e => setP({ ...p, fica: { ...p.fica, m: p.fica.m.map((v, j) => (j === i ? e.target.checked : v)) } })} /><span><b>{m.titulo}</b><small>{nome(m.agente)}{m.detalhe ? `. ${m.detalhe}` : ''}</small></span></label>)}
        </fieldset>
        <p className="nota">Só entra no lab o que estiver marcado. A ata vai para Feitas, as decisões para o registro e as missões para o quadro.</p>
        <div className="linha"><button type="button" className="primario" onClick={aprova} disabled={!p.ata.trim() || !cab.titulo.trim()}>Aprovar e guardar</button><button type="button" className="leve" onClick={() => setP(null)}>Voltar às anotações</button></div>
      </>)}
    </section>
  );
}

/** Na sala de reunião do mapa: a próxima reunião de hoje, do Google ou do lab, com Entrar no Meet e o caminho para a Agenda. */
export function ProximaNaSala({ abreAgenda }: { abreAgenda: () => void }) {
  const g = useAgendaGoogle(), { estado } = useEstado();
  const hoje = hojeLocal(), agora = horaLocal();
  const doMeet = aindaHoje(g.lista, hoje, agora)[0];
  const doLab = estado.reunioes.filter(r => r.status === 'agendada' && r.dia === hoje && r.hora >= agora).sort((a, b) => a.hora.localeCompare(b.hora))[0];
  const proxima = doMeet && (!doLab || doMeet.hora <= doLab.hora) ? { titulo: doMeet.titulo, quando: `${doMeet.hora} às ${doMeet.fim}`, meet: doMeet.meet }
    : doLab ? { titulo: doLab.titulo, quando: `${doLab.hora}, rodada com a equipe`, meet: null } : null;
  return (
    <div className="proxima-sala">
      {proxima ? <><span className="rotulo">Próxima de hoje</span><h4>{proxima.titulo}</h4><p className="nota">{proxima.quando}</p></> : <p className="nota">Nenhuma reunião hoje nesta sala.</p>}
      <div className="linha">
        {proxima?.meet && <a className="primario" href={proxima.meet} target="_blank" rel="noreferrer">Entrar no Meet</a>}
        <button type="button" className={proxima?.meet ? 'leve' : 'primario'} onClick={abreAgenda}>Abrir a Agenda</button>
      </div>
    </div>
  );
}
