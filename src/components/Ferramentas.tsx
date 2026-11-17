// Ferramentas de acompanhamento: quadro geral, linha do tempo dos ciclos e calendário do mês.
// São as mesmas que aparecem em miniatura nas telas do lab.
import { useState } from 'react';
import { useAgendaGoogle } from '../hooks/useAgendaGoogle';
import { Icone } from './Icones';
import { useEstado } from '../hooks/useEstado';
import { useMudouDeColuna } from '../hooks/useRecem';
import { useEquipe } from '../hooks/useEquipe';
import { FASES, hojeLocal, type Estado } from '../lib/dados';
import { COLUNAS_DO_QUADRO, RITMO_DO_CICLO, atrasada, linhaDoTempo, mesDoCalendario, quadro } from '../lib/ferramentas';
import { Retrato } from './Retrato';
import { Bloco } from './Diario';
import { proximasReunioes } from '../lib/resumo';

export type Ferramenta = 'quadro' | 'linha' | 'calendario';
export const FERRAMENTAS: { id: Ferramenta; nome: string; sobre: string }[] = [
  { id: 'quadro', nome: 'Quadro', sobre: 'Todas as missões, da fila ao feito.' },
  { id: 'linha', nome: 'Linha do tempo', sobre: 'Cada projeto no seu ciclo de 30 dias.' },
  { id: 'calendario', nome: 'Calendário', sobre: 'Reuniões e marcos do mês.' },
];

const PROXIMO: Record<Estado, { para: Estado; rotulo: string } | null> = { fila: { para: 'fazendo', rotulo: 'Começar' }, fazendo: { para: 'feito', rotulo: 'Concluir' }, feito: null };

function Quadro({ abreProjeto, escolhe }: { abreProjeto: (id: string) => void; escolhe: (id: string) => void }) {
  const { estado, mudaTarefa } = useEstado();
  const { nome } = useEquipe();
  const [filtro, setFiltro] = useState('');
  const q = quadro(estado, filtro === '' ? null : filtro);
  const chegou = useMudouDeColuna(estado.tarefas);
  return (
    <div className="quadro-geral">
      <div className="linha filtro">
        <label htmlFor="qf">Mostrar</label>
        <select id="qf" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="">Todos os projetos e o lab</option>
          {estado.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          <option value="lab">Só o que é do lab, sem projeto</option>
        </select>
      </div>
      <div className="colunas">
        {COLUNAS_DO_QUADRO.map(c => (
          <section key={c.id} aria-label={c.nome} className={c.id}>
            <h4><Icone nome={c.id === 'fila' ? 'relogio' : c.id === 'fazendo' ? 'raio' : 'check'} tam={18} />{c.nome} <span>{q[c.id].length}</span></h4>
            {!q[c.id].length && <p className="vazio">Nada aqui.</p>}
            {q[c.id].map(t => {
              const p = estado.projetos.find(x => x.id === t.projeto_id), prox = PROXIMO[t.estado];
              return (
                <article key={t.id} className={`cartao ${t.estado} ${chegou(t) ? 'chegou' : ''}`}>
                  <button type="button" className="abre" onClick={() => (t.projeto_id ? abreProjeto(t.projeto_id) : escolhe(t.agente))} title={p ? `Abrir ${p.nome}` : `Ver ${nome(t.agente)} no mapa`}>{t.titulo}</button>
                  <footer>
                    <span className="dono"><Retrato id={t.agente} tamanho={22} />{nome(t.agente)}</span>
                    {prox && t.id > 0 && <button type="button" className="leve mini" onClick={() => mudaTarefa(t.id, { estado: prox.para })}>{prox.rotulo}</button>}
                  </footer>
                  <small className="de-onde">{p ? p.nome : 'Do lab'}</small>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

function LinhaDoTempo({ abreProjeto }: { abreProjeto: (id: string) => void }) {
  const { estado } = useEstado();
  const l = linhaDoTempo(estado, hojeLocal(), useAgendaGoogle().lista);
  if (!l.projetos.length) return <p className="vazio">Nenhum projeto com ciclo aberto. Abra um projeto em Clientes para ele aparecer aqui.</p>;
  const pct = (n: number) => `${(n / l.dias) * 100}%`;
  const hojeVisivel = l.hoje >= 0 && l.hoje < l.dias;
  return (
    <div className="linha-tempo">
      <ul className="legenda">{FASES.map((f, i) => <li key={f}><i className={`f${i}`} />{f}</li>)}<li><i className="m-reuniao" />Reunião</li><li><i className="m-prazo" />Prazo de missão</li><li><i className="m-hoje" />Hoje</li></ul>
      <div className="grade">
        <div className="cab"><span />
          <div className="trilho">{l.semanas.map(s => <span key={s.desloca} style={{ left: pct(s.desloca) }}>{s.rotulo}</span>)}</div>
        </div>
        {l.projetos.map(p => (
          <div className="proj" key={p.id}>
            <button type="button" className="nome" onClick={() => abreProjeto(p.id)}>
              <b>{p.nome}</b>
              <small>{p.dia === 0 ? 'Ainda não começou' : p.dia > 30 ? 'Ciclo encerrado' : `Dia ${p.dia} de 30`}, {p.fase}. {p.feitas} de {p.total} missões</small>
            </button>
            <div className="trilho">
              {l.semanas.map(s => <i key={s.desloca} className="semana" style={{ left: pct(s.desloca) }} />)}
              <div className="ciclo" style={{ left: pct(p.desloca), width: pct(30) }} title={`${p.nome}: de ${p.inicio.slice(8)}/${p.inicio.slice(5, 7)} a ${p.fim.slice(8)}/${p.fim.slice(5, 7)}`}>
                {RITMO_DO_CICLO.map(r => <i key={r.fase} className={`f${r.fase}`} style={{ width: `${((r.ate - r.de + 1) / 30) * 100}%` }} />)}
                {p.dia > 0 && <span className="andou" style={{ width: `${(Math.min(30, p.dia) / 30) * 100}%` }} />}
              </div>
              {p.reunioes.map(r => <span key={r.id} className={`marca ${r.feita ? 'feita' : ''}`} style={{ left: pct(r.desloca + 0.5) }} title={`${r.titulo}${r.feita ? ', com ata' : ''}`} />)}
              {p.prazos.map(t => <span key={t.id} className={`prazo-marca ${t.feita ? 'feita' : t.atrasada ? 'atrasada' : ''}`} style={{ left: pct(t.desloca + 0.5) }} title={`Prazo: ${t.titulo}${t.feita ? ', feita' : t.atrasada ? ', atrasada' : ''}`} />)}
            </div>
          </div>
        ))}
        {hojeVisivel && <div className="hoje" style={{ ['--x' as string]: pct(l.hoje + 0.5) }}><span>Hoje</span></div>}
      </div>
      <div className="blocos">
        <Bloco icone="agenda" titulo="Próximas reuniões">
          {proximasReunioes(estado).length
            ? <ul className="proximas">{proximasReunioes(estado).slice(0, 4).map(r => <li key={r.id}><b>{r.dia.slice(8)}/{r.dia.slice(5, 7)} às {r.hora}</b><span>{r.titulo}</span></li>)}</ul>
            : <p className="nota">Nenhuma reunião marcada.</p>}
        </Bloco>
        <Bloco icone="missao" titulo="Missões por projeto">
          <ul className="onde">{l.projetos.map(p => <li key={p.id}><b>{p.nome}</b><span className="barra"><i style={{ transform: `scaleX(${p.total ? p.feitas / p.total : 0})` }} /></span><small>{p.feitas} de {p.total}</small></li>)}</ul>
        </Bloco>
      </div>
      <p className="nota">As faixas mostram o ritmo de referência do ciclo. A fase em que o projeto está de fato é a escrita ao lado do nome.</p>
    </div>
  );
}

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function Calendario({ abreAgenda }: { abreAgenda: () => void }) {
  const { estado } = useEstado();
  const hoje = hojeLocal();
  const [ref, setRef] = useState({ ano: Number(hoje.slice(0, 4)), mes: Number(hoje.slice(5, 7)) - 1 });
  const anda = (n: number) => setRef(r => { const d = new Date(Date.UTC(r.ano, r.mes + n, 1)); return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() }; });
  const semanas = mesDoCalendario(estado, ref.ano, ref.mes, hoje);
  const mesPorExtenso = new Date(Date.UTC(ref.ano, ref.mes, 1, 12)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const titulo = mesPorExtenso[0].toUpperCase() + mesPorExtenso.slice(1);
  return (
    <div className="calendario">
      <div className="linha navega">
        <button type="button" className="leve mini" onClick={() => anda(-1)} aria-label="Mês anterior">‹</button>
        <h4 aria-live="polite">{titulo}</h4>
        <button type="button" className="leve mini" onClick={() => anda(1)} aria-label="Mês seguinte">›</button>
        <button type="button" className="leve mini" onClick={() => setRef({ ano: Number(hoje.slice(0, 4)), mes: Number(hoje.slice(5, 7)) - 1 })}>Hoje</button>
        <button type="button" className="leve mini" onClick={abreAgenda}>Marcar reunião</button>
      </div>
      <div className="mes" role="grid" aria-label={titulo}>
        {DIAS_DA_SEMANA.map(d => <span key={d} className="dia-semana" role="columnheader">{d}</span>)}
        {semanas.flat().map(d => (
          <div key={d.data} role="gridcell" className={`dia ${d.noMes ? '' : 'fora'} ${d.hoje ? 'hoje' : ''}`}>
            <b>{d.dia}</b>
            {d.reunioes.map(r => <button type="button" key={r.id} className={`reuniao ${r.status}`} onClick={abreAgenda} title={`${r.hora} ${r.titulo}${r.status === 'feita' ? ', com ata' : ''}`}><span>{r.hora}</span> {r.titulo}</button>)}
            {d.marcos.map(m => <small key={m} className="marco">{m}</small>)}
            {d.entregas.map(t => <small key={t.id} className={`entrega-dia ${t.estado === 'feito' ? 'feita' : atrasada(t, hojeLocal()) ? 'atrasada' : ''}`} title={`Prazo de ${t.titulo}`}>{t.titulo}</small>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** As três ferramentas com as abas para trocar entre elas. */
export function Ferramentas({ qual, muda, abreProjeto, escolhe, abreAgenda }: { qual: Ferramenta; muda: (f: Ferramenta) => void; abreProjeto: (id: string) => void; escolhe: (id: string) => void; abreAgenda: () => void }) {
  return (
    <div className="ferramentas">
      <div className="abas" role="tablist" aria-label="Ferramentas">
        {FERRAMENTAS.map(f => <button key={f.id} role="tab" aria-selected={qual === f.id} onClick={() => muda(f.id)}>{f.nome}</button>)}
      </div>
      {qual === 'quadro' && <Quadro abreProjeto={abreProjeto} escolhe={escolhe} />}
      {qual === 'linha' && <LinhaDoTempo abreProjeto={abreProjeto} />}
      {qual === 'calendario' && <Calendario abreAgenda={abreAgenda} />}
    </div>
  );
}
