// Briefing guiado: a Clara conduz, uma pergunta por vez, com o direcionamento de cada resposta e o fechamento que vira trabalho.
import { useEffect, useRef, useState } from 'react';
import type { ApiBriefing } from '../hooks/useBriefing';
import { MODELOS_DE_BRIEFING, clienteDoBriefing, pedidoDoBriefing, resumoDoBriefing } from '../lib/briefing';
import { Retrato } from './Retrato';
import { Icone } from './Icones';

/** Página da esquerda: o roteiro do modelo, marcando o que já fechou e onde a conversa está. */
export function RoteiroBriefing({ b }: { b: ApiBriefing }) {
  if (!b.modelo) return <p className="nota-mao">Escolha o tipo de trabalho e a Clara puxa as perguntas certas.</p>;
  const total = b.modelo.passos.length;
  return (
    <div className="roteiro">
      <div className="andou" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={b.atual} aria-label="Andamento do briefing"><i style={{ transform: `scaleX(${b.atual / total})` }} /></div>
      <p className="conta">{b.fechado ? 'Briefing fechado' : `Pergunta ${b.atual + 1} de ${total}`}</p>
      <ol>
        {b.modelo.passos.map((p, i) => {
          const feito = p.id in b.respostas, pulado = feito && !b.respostas[p.id];
          return (
            <li key={p.id} className={feito ? 'feito' : i === b.atual ? 'vez' : ''}>
              <span className="marca" aria-hidden="true">{feito ? (pulado ? '–' : '✓') : i + 1}</span>
              {feito ? <button type="button" onClick={() => b.corrige(p.id)} title="Responder de novo"><b>{p.rotulo}</b><small>{pulado ? 'Pulado' : b.respostas[p.id]}</small></button>
                : <span className="texto"><b>{p.rotulo}</b>{p.opcional && <small>Opcional</small>}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Escolha({ b }: { b: ApiBriefing }) {
  return (
    <div className="briefing-escolha">
      <div className="fala ele"><Retrato id="clara" tamanho={28} /><p>Oi, eu sou a Clara. Sobre o que é o briefing de hoje? Escolha o tipo de trabalho e eu puxo as perguntas certas, uma de cada vez.</p></div>
      <ul className="modelos-briefing">
        {MODELOS_DE_BRIEFING.map((m, i) => (
          <li key={m.id} style={{ ['--i' as string]: i }}>
            <button type="button" onClick={() => b.escolhe(m.id)}><b>{m.nome}</b><span>{m.para}</span><small>{m.passos.length} perguntas</small></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fechamento({ b, pedir, cadastra }: { b: ApiBriefing; pedir: (texto: string) => void; cadastra: (c: { setor: string; situacao: string }) => void }) {
  const [copiou, setCopiou] = useState(false);
  const m = b.modelo!, cliente = clienteDoBriefing(b.respostas);
  return (
    <section className="briefing-fecho" aria-label="Resumo do briefing">
      <h4>Briefing de {m.nome.toLowerCase()}</h4>
      <dl>
        {m.passos.map(p => (
          <div key={p.id}><dt>{p.rotulo}</dt><dd className={b.respostas[p.id] ? '' : 'vazio'}>{b.respostas[p.id] || 'Não informado'}</dd>
            <button type="button" className="link" onClick={() => b.corrige(p.id)}>Corrigir</button></div>
        ))}
      </dl>
      {b.leitura.estado === 'lendo' && <div className="fala ele nova"><Retrato id="clara" tamanho={28} /><p className="digitando"><i /><i /><i /></p></div>}
      {b.leitura.estado === 'pronta' && <div className="fala ele nova"><Retrato id="clara" tamanho={28} /><p>{b.leitura.texto}</p></div>}
      {b.leitura.estado === 'erro' && <div className="aviso-conversa nova" role="alert"><p>{b.leitura.texto}</p><button type="button" className="leve mini" onClick={b.pedeLeitura}>Tentar de novo</button></div>}
      <div className="linha acoes-fecho">
        <button type="button" className="primario" onClick={() => pedir(pedidoDoBriefing(m, b.respostas))}>Pedir ao lab</button>
        {cliente && <button type="button" className="leve" onClick={() => cadastra(cliente)}>Cadastrar o cliente</button>}
        <button type="button" className="leve" disabled={b.leitura.estado === 'lendo'} onClick={b.pedeLeitura}>{b.leitura.estado === 'pronta' ? 'Pedir outra leitura' : 'O que falta, Clara?'}</button>
        <button type="button" className="leve" onClick={async () => { try { await navigator.clipboard.writeText(resumoDoBriefing(m, b.respostas)); setCopiou(true); setTimeout(() => setCopiou(false), 1800); } catch { /* sem área de transferência */ } }}>{copiou ? 'Copiado' : 'Copiar'}</button>
        <button type="button" className="leve" onClick={b.recomeca}>Novo briefing</button>
      </div>
    </section>
  );
}

export function Briefing({ b, pedir, cadastra, conversaLivre }: { b: ApiBriefing; pedir: (texto: string) => void; cadastra: (c: { setor: string; situacao: string }) => void; conversaLivre: () => void }) {
  const [texto, setTexto] = useState('');
  const lista = useRef<HTMLDivElement>(null), campo = useRef<HTMLTextAreaElement>(null);
  // a conversa desce a cada fala nova e o campo volta a ter o foco quando a vez é de quem responde
  useEffect(() => { const l = lista.current; if (l) l.scrollTo({ top: l.scrollHeight, behavior: 'smooth' }); }, [b.falas.length, b.digitando, b.fechado, b.leitura.estado]);
  useEffect(() => { if (!b.digitando && b.passo) campo.current?.focus({ preventScroll: true }); }, [b.digitando, b.passo?.id, b.pendente]);
  if (!b.modelo) return <div className="briefing"><Escolha b={b} /><button type="button" className="link livre" onClick={conversaLivre}>Prefiro conversar livremente com a Clara</button></div>;
  // enquanto a Clara digita, a fala dela que vem a seguir ainda não aparece
  const falas = b.digitando ? b.falas.slice(0, -1) : b.falas;
  const manda = () => { if (b.responde(texto)) setTexto(''); };
  return (
    <div className="briefing conversa">
      <div className="topo-briefing">
        <span className="tipo"><Icone nome="briefing" tam={18} />{b.modelo.nome}</span>
        <button type="button" className="link" onClick={b.volta}>{b.pendente ? 'Deixar a resposta como está' : b.atual > 0 ? 'Voltar uma pergunta' : 'Trocar de modelo'}</button>
        <button type="button" className="link" onClick={conversaLivre}>Conversa livre</button>
      </div>
      <div ref={lista} className="falas" aria-live="polite">
        {falas.map((f, i) => (
          <div key={i} className={`fala ${f.de === 'eu' ? 'eu' : 'ele'} nova`}>{f.de === 'clara' && <Retrato id="clara" tamanho={28} />}<p>{f.texto}</p></div>
        ))}
        {b.digitando && <div className="fala ele nova"><Retrato id="clara" tamanho={28} /><p className="digitando"><i /><i /><i /></p></div>}
        {b.fechado && !b.digitando && <Fechamento b={b} pedir={pedir} cadastra={cadastra} />}
      </div>
      {b.passo && (
        <form className="responde" onSubmit={e => { e.preventDefault(); manda(); }}>
          {!b.digitando && <p className="guia" key={'g' + b.passo.id + (b.pendente ? 'x' : '')}><b>Direcionamento</b>{b.pendente ? 'Uma cena concreta vale mais que um adjetivo. Onde, com quem e o que aconteceu.' : b.passo.guia}</p>}
          {!b.digitando && !b.pendente && b.passo.opcoes && (
            <div className="opcoes" role="group" aria-label="Respostas prontas" key={'o' + b.passo.id}>
              {b.passo.opcoes.map((o, i) => <button key={o} type="button" style={{ ['--i' as string]: i }} onClick={() => b.responde(o, true)}>{o}</button>)}
            </div>
          )}
          <div className="campo">
            <label htmlFor="bresp" className="so-leitor">{b.passo.pergunta}</label>
            <textarea id="bresp" ref={campo} rows={2} value={texto} maxLength={1200} disabled={b.digitando} placeholder={b.passo.opcoes && !b.pendente ? 'Ou escreva com as suas palavras' : 'Sua resposta'} onChange={e => setTexto(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); manda(); } }} />
            {b.passo.opcional && !b.pendente && <button type="button" className="leve" disabled={b.digitando} onClick={b.pula}>Pular</button>}
            <button type="submit" disabled={!texto.trim() || b.digitando}>Responder</button>
          </div>
        </form>
      )}
    </div>
  );
}
