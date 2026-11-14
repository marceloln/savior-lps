import { useEffect, useRef, useState } from 'react';
import { useConversa } from '../hooks/useConversa';
import { useEquipe } from '../hooks/useEquipe';
import { ZONAS } from '../lib/lab';
import { Retrato } from './Retrato';
import { useEstado } from '../hooks/useEstado';
import { sugestoesDePergunta } from '../lib/conversa';
import { Icone } from './Icones';

const corDe = (zona: string) => ZONAS.find(z => z.id === zona)?.cor ?? '#C5AA81';

function Conversa({ agente }: { agente: string }) {
  const { falas, enviando, envia, tentaDeNovo } = useConversa(agente);
  const { criaMemoria, estado } = useEstado();
  const [guardadas, setGuardadas] = useState<Set<number>>(new Set());
  const [texto, setTexto] = useState('');
  const lista = useRef<HTMLDivElement>(null), perto = useRef(true);
  const m = useEquipe().de(agente)!;
  // desce sozinho só para quem já estava no fim; quem subiu para reler fica onde está
  useEffect(() => {
    const l = lista.current, ultima = falas.at(-1); if (!l) return;
    if (!ultima?.nova) l.scrollTop = l.scrollHeight;   // histórico carregado: vai direto ao fim
    else if (perto.current || ultima.papel === 'user') l.scrollTo({ top: l.scrollHeight, behavior: perto.current ? 'smooth' : 'auto' });
  }, [falas, enviando]);
  const manda = (t = texto) => { if (envia(t)) setTexto(''); };
  return (
    <div className="conversa">
      <div ref={lista} className="falas" aria-live="polite" onScroll={e => { const l = e.currentTarget; perto.current = l.scrollHeight - l.scrollTop - l.clientHeight < 80; }}>
        {!falas.length && (
          <div className="vazio-desenho">
            <span className="vazio-icone"><Icone nome="conversar" tam={34} /></span>
            <p>Vocês ainda não conversaram. Conte o que está travando ou comece por uma destas perguntas.</p>
            <ul className="sugestoes">{sugestoesDePergunta(m.zona, m.papel).map(s => <li key={s}><button type="button" onClick={() => manda(s)}>{s}</button></li>)}</ul>
          </div>
        )}
        {falas.map((f, i) => f.erro ? (
          <div key={i} className={`aviso-conversa ${f.nova ? 'nova' : ''}`} role="alert">
            <p>{f.texto}</p>
            {i === falas.length - 1 && <button type="button" className="leve mini" onClick={tentaDeNovo}>Tentar de novo</button>}
          </div>
        ) : (
          <div key={i} className={`fala ${f.papel === 'user' ? 'eu' : 'ele'} ${f.nova ? 'nova' : ''}`}>
            {f.papel === 'assistant' && <Retrato id={agente} tamanho={28} cor={corDe(m.zona) + '40'} />}
            <p>{f.texto}</p>
            {f.papel === 'assistant' && i > 0 && (guardadas.has(i) || estado.memorias.some(x => x.agente === agente && x.texto === f.texto.slice(0, 1500))
              ? <span className="guardada">Na memória</span>
              : <button className="guardar" onClick={async () => { if (await criaMemoria(agente, f.texto.slice(0, 1500), 'conversa')) setGuardadas(g => new Set(g).add(i)); }}>Guardar na memória</button>)}
          </div>
        ))}
        {enviando && <div className="fala ele nova"><Retrato id={agente} tamanho={28} cor={corDe(m.zona) + '40'} /><p className="digitando"><i /><i /><i /></p></div>}
      </div>
      <form className="campo" onSubmit={e => { e.preventDefault(); manda(); }}>
        <label htmlFor="msg" className="so-leitor">Mensagem para {m.nome}</label>
        <textarea id="msg" rows={2} value={texto} maxLength={4000} placeholder={`Escreva para ${m.nome}`} onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); manda(); } }} />
        <button type="submit" disabled={!texto.trim() || enviando}>Enviar</button>
      </form>
    </div>
  );
}

export function Chat({ agente, setAgente, so }: { agente: string; setAgente: (id: string) => void; so?: boolean }) {
  const { equipe } = useEquipe();
  return (
    <div className={`chat ${so ? 'so' : ''}`}>
      {!so && (
        <nav className="contatos" aria-label="Especialistas">
          {equipe.filter(e => e.id !== 'clara').map(e => (
            <button key={e.id} aria-pressed={e.id === agente} onClick={() => setAgente(e.id)}>
              <Retrato id={e.id} tamanho={32} cor={corDe(e.zona) + '40'} />
              <span><b>{e.nome}</b><small>{e.papel}</small></span>
            </button>
          ))}
        </nav>
      )}
      <Conversa key={agente} agente={agente} />
    </div>
  );
}
