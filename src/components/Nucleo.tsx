// Telas do núcleo multiagente: pedido ao lab, entrega de missão, treino, especialista novo e biblioteca de skills.
import { useState, type ReactNode } from 'react';
import { useEstado } from '../hooks/useEstado';
import { useEquipe } from '../hooks/useEquipe';
import type { ApiPedido } from '../hooks/usePedido';
import { MAX_MISSOES, type MissaoProposta, type Pedido, type Skill, type Tarefa } from '../lib/dados';
import { APARENCIAS, ORQUESTRADOR, type Agente } from '../lib/equipe';
import { ZONAS } from '../lib/lab';
import { leMarkdown, type Trecho } from '../lib/markdown';
import { leModelo, MODELOS, nomeDoModelo } from '../lib/modelos';
import { skillDeTreino } from '../lib/skills';
import { Retrato } from './Retrato';
import { Apagar } from './Apagar';

const linha = (x: Trecho[]): ReactNode => x.map((t, i) => (t.forte ? <strong key={i}>{t.x}</strong> : t.x));

/** Desenha a entrega de um especialista. Só texto e estrutura, nunca HTML vindo do modelo. */
export function Markdown({ texto }: { texto: string }) {
  return (
    <div className="md">
      {leMarkdown(texto).map((b, i) => {
        if (b.t === 'titulo') return b.nivel === 2 ? <h4 key={i}>{linha(b.x)}</h4> : <h5 key={i}>{linha(b.x)}</h5>;
        if (b.t === 'texto') return <p key={i}>{linha(b.x)}</p>;
        if (b.t === 'lista') { const L = b.ordenada ? 'ol' : 'ul'; return <L key={i}>{b.itens.map((it, j) => <li key={j}>{linha(it)}</li>)}</L>; }
        return <div key={i} className="md-tabela"><table><thead><tr>{b.cabeca.map((c, j) => <th key={j}>{linha(c)}</th>)}</tr></thead>
          <tbody>{b.linhas.map((l, j) => <tr key={j}>{l.map((c, k) => <td key={k}>{linha(c)}</td>)}</tr>)}</tbody></table></div>;
      })}
    </div>
  );
}

function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="leve mini" onClick={async () => { try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1800); } catch { /* sem permissão de área de transferência */ } }}>{ok ? 'Copiado' : 'Copiar'}</button>;
}

/** Escolha de modelo de IA: a lista conhecida ou um identificador digitado, no formato provedor:modelo. */
export function SeletorModelo({ id, valor, aoMudar, padrao }: { id: string; valor: string; aoMudar: (m: string) => void; padrao?: string }) {
  const naLista = valor === '' || MODELOS.some(m => m.id === valor);
  const [outro, setOutro] = useState(!naLista), [texto, setTexto] = useState(naLista ? '' : valor);
  return (
    <div className="seletor-modelo">
      <select id={id} value={outro ? 'outro' : valor} onChange={e => { const v = e.target.value; setOutro(v === 'outro'); if (v !== 'outro') aoMudar(v); }}>
        {padrao !== undefined && <option value="">Padrão do lab ({nomeDoModelo(padrao)})</option>}
        {MODELOS.map(m => <option key={m.id} value={m.id}>{m.nome}. {m.uso}</option>)}
        <option value="outro">Outro modelo</option>
      </select>
      {outro && <span className="outro-modelo">
        <label className="so-leitor" htmlFor={id + '-o'}>Identificador do modelo</label>
        <input id={id + '-o'} value={texto} onChange={e => setTexto(e.target.value)} placeholder="provedor:modelo, por exemplo openai:gpt-6-luna" />
        <button type="button" className="leve mini" disabled={!leModelo(texto) || leModelo(texto)!.provedor === 'simulado'} onClick={() => aoMudar(texto.trim())}>Usar</button>
      </span>}
    </div>
  );
}

/** Botão que põe o especialista para trabalhar na missão. */
export function Executar({ t, rotulo }: { t: Tarefa; rotulo?: string }) {
  const { executa, executando } = useEstado();
  const rodando = executando.includes(t.id);
  if (t.id < 0) return null;
  return <button type="button" className="leve mini executar" disabled={rodando} onClick={() => executa(t.id)}>{rodando ? 'Escrevendo' : rotulo ?? (t.entrega ? 'Refazer' : 'Executar')}</button>;
}

/** A entrega de uma missão, com quem escreveu, pedido de ajuste e o que guardar para a próxima vez. */
export function Entrega({ t }: { t: Tarefa }) {
  const { executa, executando, criaMemoria } = useEstado();
  const { nome } = useEquipe();
  const [ajuste, setAjuste] = useState(''), [licao, setLicao] = useState(''), [guardou, setGuardou] = useState(false);
  const rodando = executando.includes(t.id);
  return (
    <article className="entrega">
      <header><Retrato id={t.agente} tamanho={26} /><span><b>{nome(t.agente)}</b><small>{t.modelo ? `Escrito com ${nomeDoModelo(t.modelo)}` : 'Entrega'}</small></span><Copiar texto={t.entrega} /></header>
      {rodando ? <p className="andamento">{nome(t.agente)} está reescrevendo.</p> : <Markdown texto={t.entrega} />}
      <form className="nova-linha" onSubmit={async e => { e.preventDefault(); if (ajuste.trim() && (await executa(t.id, ajuste.trim()))) setAjuste(''); }}>
        <label className="so-leitor" htmlFor={'aj' + t.id}>Pedir ajuste nesta entrega</label>
        <input id={'aj' + t.id} value={ajuste} onChange={e => setAjuste(e.target.value)} placeholder="Pedir ajuste. Ex.: mais curto, com foco no turno da noite" maxLength={2000} />
        <button type="submit" disabled={!ajuste.trim() || rodando}>Refazer</button>
      </form>
      <form className="nova-linha" onSubmit={async e => { e.preventDefault(); if (licao.trim() && (await criaMemoria(t.agente, licao.trim()))) { setLicao(''); setGuardou(true); setTimeout(() => setGuardou(false), 2200); } }}>
        <label className="so-leitor" htmlFor={'li' + t.id}>O que {nome(t.agente)} deve lembrar da próxima vez</label>
        <input id={'li' + t.id} value={licao} onChange={e => setLicao(e.target.value)} placeholder={`Ensinar: o que ${nome(t.agente)} deve lembrar da próxima vez`} maxLength={1500} />
        <button type="submit" disabled={!licao.trim()}>{guardou ? 'Guardado' : 'Guardar'}</button>
      </form>
    </article>
  );
}

// ---------- pedido ao lab ----------

function Plano({ p }: { p: ApiPedido }) {
  const { equipe } = useEquipe();
  const time = equipe.filter(a => a.id !== ORQUESTRADOR);
  const [plano, setPlano] = useState<MissaoProposta[]>(p.corrida.plano);
  const muda = (i: number, m: Partial<MissaoProposta>) => setPlano(l => l.map((x, j) => (j === i ? { ...x, ...m } : x)));
  const pronto = plano.length > 0 && plano.every(m => m.titulo.trim());
  return (
    <section className="plano" aria-label="Plano proposto">
      <header><Retrato id={ORQUESTRADOR} tamanho={32} /><p><b>Plano da orquestração.</b> Ajuste quem faz e o que entrega. Quem vem depois lê a entrega de quem veio antes.</p></header>
      <ol>
        {plano.map((m, i) => (
          <li key={i}>
            <Retrato id={m.agente} tamanho={36} />
            <div>
              <label className="so-leitor" htmlFor={'pa' + i}>Quem faz a missão {i + 1}</label>
              <select id={'pa' + i} value={m.agente} onChange={e => muda(i, { agente: e.target.value })}>{time.map(a => <option key={a.id} value={a.id}>{a.nome}, {a.papel.toLowerCase()}</option>)}</select>
              <label className="so-leitor" htmlFor={'pt' + i}>Título da missão {i + 1}</label>
              <input id={'pt' + i} value={m.titulo} onChange={e => muda(i, { titulo: e.target.value })} maxLength={200} />
              <label className="so-leitor" htmlFor={'pd' + i}>O que entregar na missão {i + 1}</label>
              <textarea id={'pd' + i} rows={2} value={m.detalhe} onChange={e => muda(i, { detalhe: e.target.value })} maxLength={2000} placeholder="O que entregar e em que formato" />
            </div>
            <button type="button" className="leve mini" onClick={() => setPlano(l => l.filter((_, j) => j !== i))} aria-label={`Tirar a missão ${i + 1} do plano`}>Tirar</button>
          </li>
        ))}
      </ol>
      <div className="linha">
        <button type="button" className="primario" disabled={!pronto} onClick={() => p.aprova(plano.map(m => ({ ...m, titulo: m.titulo.trim() })))}>Distribuir e executar</button>
        {plano.length < MAX_MISSOES && <button type="button" className="leve" onClick={() => setPlano(l => [...l, { agente: time[0].id, titulo: '', detalhe: '' }])}>Mais uma missão</button>}
        <button type="button" className="leve" onClick={p.desiste}>Desistir</button>
      </div>
    </section>
  );
}

function CartaoPedido({ ped, p, aberto }: { ped: Pedido; p: ApiPedido; aberto: boolean }) {
  const { estado, executando, apagaPedido } = useEstado();
  const { nome } = useEquipe();
  const missoes = estado.tarefas.filter(t => t.pedido_id === ped.id);
  const meu = p.corrida.pedido === ped.id, rodando = meu && p.ocupado;
  const prontas = missoes.filter(t => t.entrega).length;
  const quando = new Date(ped.criado_em.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  return (
    <details className="pedido" open={aberto || rodando}>
      <summary><span className={`estado ${ped.estado === 'entregue' ? 'feito' : 'fazendo'}`}>{ped.estado === 'entregue' ? 'Entregue' : rodando ? 'Andando' : 'Parado'}</span>
        <span className="tit">{ped.texto}</span><small>{quando}, {prontas} de {missoes.length}</small></summary>
      <ol className="passos">
        {missoes.map(t => {
          const escrevendo = executando.includes(t.id);
          return (
            <li key={t.id} className={escrevendo ? 'escrevendo' : t.entrega ? 'pronta' : ''}>
              <details>
                <summary><Retrato id={t.agente} tamanho={28} /><span className="tit"><b>{nome(t.agente)}</b> {t.titulo}</span>
                  <small>{escrevendo ? 'Escrevendo' : t.entrega ? 'Entregou' : 'Na fila'}</small></summary>
                {t.entrega ? <Entrega t={t} /> : <p className="nota">{t.detalhe || 'Ainda sem entrega.'}</p>}
              </details>
            </li>
          );
        })}
      </ol>
      {meu && p.corrida.etapa === 'sintetizando' && <p className="andamento"><Retrato id={ORQUESTRADOR} tamanho={26} />{nome(ORQUESTRADOR)} está juntando as entregas.</p>}
      {ped.sintese && <section className="sintese"><header><h4>Resposta ao pedido</h4><Copiar texto={ped.sintese} /></header><Markdown texto={ped.sintese} /></section>}
      {!rodando && <div className="linha">
        {ped.estado !== 'entregue' && missoes.length > 0 && <button type="button" className="primario" disabled={p.ocupado} onClick={() => p.continua(ped.id)}>Continuar de onde parou</button>}
        <Apagar oque="este pedido" apaga={() => apagaPedido(ped.id)} />
      </div>}
    </details>
  );
}

/** Centro de pedidos: o sócio escreve o que precisa, aprova o plano e acompanha as entregas até a síntese. */
export function Pedidos({ p, rascunho }: { p: ApiPedido; rascunho?: string }) {
  const { estado } = useEstado();
  const { nome } = useEquipe();
  const [texto, setTexto] = useState(rascunho ?? ''), [proj, setProj] = useState('');
  return (
    <div className="pedidos">
      <form className="pedir" onSubmit={e => { e.preventDefault(); if (texto.trim().length >= 8 && !p.ocupado) { p.planeja(texto.trim(), proj || null); setTexto(''); } }}>
        <label htmlFor="ped">O que você precisa do lab?</label>
        <textarea id="ped" rows={3} value={texto} onChange={e => setTexto(e.target.value)} maxLength={4000} autoFocus
          placeholder="Ex.: montar a pauta do ritual de segunda da distribuidora e o que o gerente precisa olhar antes" />
        <div className="linha">
          <label className="so-leitor" htmlFor="pedp">Projeto</label>
          <select id="pedp" value={proj} onChange={e => setProj(e.target.value)}><option value="">Sem projeto</option>{estado.projetos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
          <button className="primario" type="submit" disabled={texto.trim().length < 8 || p.ocupado}>Pedir ao lab</button>
        </div>
      </form>
      {p.corrida.etapa === 'planejando' && <p className="andamento"><Retrato id={ORQUESTRADOR} tamanho={26} />{nome(ORQUESTRADOR)} está dividindo o pedido em missões.</p>}
      {p.corrida.etapa === 'plano' && <Plano key={p.corrida.texto} p={p} />}
      {p.corrida.etapa === 'erro' && <p className="andamento erro" role="alert">O pedido parou no meio. O motivo está no aviso. Dá para continuar de onde parou.</p>}
      {estado.pedidos.length
        ? <div className="lista-pedidos">{estado.pedidos.map((ped, i) => <CartaoPedido key={ped.id} ped={ped} p={p} aberto={p.corrida.pedido === ped.id || (p.corrida.pedido === null && p.corrida.etapa === 'parado' && i === 0)} />)}</div>
        : <p className="vazio">Nenhum pedido ainda. Escreva o que você precisa e a orquestração divide entre a equipe.</p>}
    </div>
  );
}

// ---------- treino e equipe ----------

/** Treino de um especialista: modelo de IA, skills e ensino de uma tarefa nova. */
export function Treino({ m }: { m: Agente }) {
  const { estado, mudaAgente, vinculaSkills, criaSkill } = useEstado();
  const dele = estado.vinculos[m.id] ?? [];
  const [t, setT] = useState({ tarefa: '', passos: '', exemplo: '' }), [ensinou, setEnsinou] = useState(false);
  const pronto = t.tarefa.trim().length >= 3 && t.passos.trim().length >= 20;
  return (
    <div className="treino">
      <div className="campo">
        <label htmlFor="tm">Modelo de IA de {m.nome}</label>
        <SeletorModelo key={m.modelo} id="tm" valor={m.modelo} padrao={estado.modeloPadrao} aoMudar={modelo => mudaAgente(m.id, { modelo })} />
      </div>
      <fieldset className="skills-do-agente">
        <legend>Skills</legend>
        {estado.skills.map(k => (
          <label key={k.id} className={k.para_todos || dele.includes(k.id) ? 'on' : ''}>
            <input type="checkbox" checked={k.para_todos || dele.includes(k.id)} disabled={k.para_todos}
              onChange={e => vinculaSkills(m.id, e.target.checked ? [...dele, k.id] : dele.filter(x => x !== k.id))} />
            <span><b>{k.nome}</b><small>{k.para_todos ? 'Vale para todo o lab. ' : ''}{k.descricao}</small></span>
          </label>
        ))}
      </fieldset>
      <form className="treinar" onSubmit={async e => { e.preventDefault(); if (pronto && (await criaSkill({ ...skillDeTreino(t), para_todos: false }, m.id))) { setT({ tarefa: '', passos: '', exemplo: '' }); setEnsinou(true); setTimeout(() => setEnsinou(false), 2500); } }}>
        <h4>Treinar {m.nome} em uma tarefa nova</h4>
        <label htmlFor="tt">Qual é a tarefa</label>
        <input id="tt" value={t.tarefa} onChange={e => setT({ ...t, tarefa: e.target.value })} maxLength={80} placeholder="Ex.: ata do ritual semanal" />
        <label htmlFor="tp">Como fazer bem</label>
        <textarea id="tp" rows={4} value={t.passos} onChange={e => setT({ ...t, passos: e.target.value })} maxLength={6000} placeholder="Os passos, o que nunca pode faltar e o que evitar" />
        <label htmlFor="te">Exemplo de boa entrega (se tiver)</label>
        <textarea id="te" rows={3} value={t.exemplo} onChange={e => setT({ ...t, exemplo: e.target.value })} maxLength={5000} placeholder="Cole uma entrega que você considera no nível certo" />
        <div className="linha"><button className="primario" type="submit" disabled={!pronto}>Ensinar</button>{ensinou && <span className="ok" role="status">Virou skill de {m.nome}</span>}</div>
      </form>
      {!m.base && <p className="nota">Especialista criado pelos sócios. <Apagar oque={`${m.nome} do lab`} verbo="Desligar" apaga={() => mudaAgente(m.id, { ativo: false })} /></p>}
    </div>
  );
}

/** Formulário para pôr um especialista novo no lab. */
export function NovoEspecialista({ aoCriar }: { aoCriar: (id: string) => void }) {
  const { estado, criaAgente } = useEstado();
  const { equipe } = useEquipe();
  const emUso = new Set(equipe.map(a => a.aparencia));
  const livres = APARENCIAS.filter(a => !emUso.has(a));
  const [f, setF] = useState({ nome: '', papel: '', zona: 'dados', aparencia: livres[0] ?? APARENCIAS[0], modelo: '' });
  const pronto = f.nome.trim().length >= 2 && f.papel.trim().length >= 3;
  return (
    <form className="novo-especialista" onSubmit={async e => { e.preventDefault(); if (!pronto) return; const id = await criaAgente({ ...f, nome: f.nome.trim(), papel: f.papel.trim() }); if (id) aoCriar(id); }}>
      <h4>Novo especialista</h4>
      <div className="duas">
        <div><label htmlFor="en">Nome</label><input id="en" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} maxLength={40} placeholder="Como a equipe vai chamar" /></div>
        <div><label htmlFor="ep">Papel</label><input id="ep" value={f.papel} onChange={e => setF({ ...f, papel: e.target.value })} maxLength={80} placeholder="Ex.: pricing de combustíveis" /></div>
      </div>
      <div className="duas">
        <div><label htmlFor="ez">Sala</label><select id="ez" value={f.zona} onChange={e => setF({ ...f, zona: e.target.value })}>{ZONAS.map(z => <option key={z.id} value={z.id}>{z.nome}</option>)}</select></div>
        <div><label htmlFor="em">Modelo de IA</label><SeletorModelo id="em" valor={f.modelo} padrao={estado.modeloPadrao} aoMudar={modelo => setF({ ...f, modelo })} /></div>
      </div>
      <fieldset className="aparencias"><legend>Aparência</legend>
        {[...livres, ...APARENCIAS.filter(a => emUso.has(a))].map(a => (
          <label key={a} className={f.aparencia === a ? 'on' : ''} title={emUso.has(a) ? 'Já usada por alguém da equipe' : 'Livre'}>
            <input type="radio" name="apar" className="so-leitor" checked={f.aparencia === a} onChange={() => setF({ ...f, aparencia: a })} />
            <RostoDe aparencia={a} /><span className="so-leitor">Aparência {a}{emUso.has(a) ? ', já usada' : ''}</span>
          </label>
        ))}
      </fieldset>
      <p className="nota">Depois de criar, abra a ficha e treine: instruções, skills e memória. Se a sala não tiver mesa vaga, ele trabalha de pé por ali.</p>
      <button className="primario" type="submit" disabled={!pronto}>Pôr no lab</button>
    </form>
  );
}

/** Rosto de uma aparência do atlas, sem depender de quem a usa. */
function RostoDe({ aparencia }: { aparencia: string }) { return <Retrato id={aparencia} rosto={aparencia} tamanho={40} />; }

/** Biblioteca de skills do lab: o que os especialistas sabem fazer do jeito V30. */
export function Skills() {
  const { estado, criaSkill, mudaSkill, apagaSkill } = useEstado();
  const { equipe } = useEquipe();
  const vazia = { nome: '', descricao: '', conteudo: '', para_todos: false };
  const [edita, setEdita] = useState<string | null>(null), [f, setF] = useState(vazia);
  const abre = (k: Skill | null) => { setEdita(k ? k.id : 'nova'); setF(k ? { nome: k.nome, descricao: k.descricao, conteudo: k.conteudo, para_todos: k.para_todos } : vazia); };
  const pronto = f.nome.trim().length >= 3 && f.conteudo.trim().length >= 20;
  const salva = async () => { if (!pronto) return; const ok = edita === 'nova' ? await criaSkill(f) : await mudaSkill(edita!, f); if (ok) setEdita(null); };
  if (edita) return (
    <form className="skill-form" onSubmit={e => { e.preventDefault(); salva(); }}>
      <h4>{edita === 'nova' ? 'Nova skill' : 'Editar skill'}</h4>
      <label htmlFor="sn">Nome</label><input id="sn" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} maxLength={80} />
      <label htmlFor="sd">Para que serve, em uma linha</label><input id="sd" value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} maxLength={200} />
      <label htmlFor="sc">O que o especialista precisa saber</label>
      <textarea id="sc" rows={10} value={f.conteudo} onChange={e => setF({ ...f, conteudo: e.target.value })} maxLength={12000} placeholder="Passos, critérios, formato da entrega, o que evitar. Escreva como você explicaria a um consultor novo." />
      <label className="caixa"><input type="checkbox" checked={f.para_todos} onChange={e => setF({ ...f, para_todos: e.target.checked })} /> Vale para todo o lab</label>
      <div className="linha"><button className="primario" type="submit" disabled={!pronto}>Salvar skill</button><button type="button" className="leve" onClick={() => setEdita(null)}>Voltar</button></div>
    </form>
  );
  return (
    <div className="skills">
      <div className="linha"><button className="primario" onClick={() => abre(null)}>Nova skill</button><p className="nota">Skill é o jeito V30 de fazer uma coisa, escrito uma vez e usado por quem for treinado nela.</p></div>
      <ul>
        {estado.skills.map(k => {
          const quem = k.para_todos ? equipe : equipe.filter(a => (estado.vinculos[a.id] ?? []).includes(k.id));
          return (
            <li key={k.id}>
              <div><b>{k.nome}</b><small>{k.descricao || k.conteudo.slice(0, 110)}</small>
                <span className="quem">{k.para_todos ? 'Todo o lab' : quem.length ? quem.slice(0, 8).map(a => <Retrato key={a.id} id={a.id} tamanho={22} />) : 'Ninguém treinado ainda'}</span></div>
              <span className="linha"><button className="leve mini" onClick={() => abre(k)}>Editar</button>
                <Apagar oque={`a skill ${k.nome}`} apaga={() => apagaSkill(k.id)} /></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Quem está no lab, com a porta para pôr gente nova. */
export function PainelPessoas({ abre }: { abre: (id: string) => void }) {
  const { equipe } = useEquipe();
  const [novo, setNovo] = useState(false);
  if (novo) return <><NovoEspecialista aoCriar={id => { setNovo(false); abre(id); }} /><button type="button" className="leve" onClick={() => setNovo(false)}>Voltar para a equipe</button></>;
  return (<>
    <div className="linha"><button className="primario" onClick={() => setNovo(true)}>Novo especialista</button><p className="nota">Crie alguém para uma competência que falta e treine pela ficha.</p></div>
    <ul className="elenco">{equipe.map(e => <li key={e.id}><button onClick={() => abre(e.id)}><Retrato id={e.id} tamanho={44} /><span><b>{e.nome}</b><small>{e.papel}</small></span></button></li>)}</ul>
  </>);
}
