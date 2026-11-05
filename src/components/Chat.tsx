import { useEffect, useRef, useState } from 'react';
import { useConversa } from '../hooks/useConversa';
import { EQUIPE } from '../lib/equipe';
import { ZONAS } from '../lib/lab';
import { Retrato } from './Retrato';
import { useEstado } from '../hooks/useEstado';

const corDe = (zona: string) => ZONAS.find(z => z.id === zona)?.cor ?? '#C5AA81';

function Conversa({ agente }: { agente: string }) {
  const { falas, enviando, envia } = useConversa(agente);
  const { criaMemoria, estado } = useEstado();
  const [guardadas, setGuardadas] = useState<Set<number>>(new Set());
  const [texto, setTexto] = useState('');
  const lista = useRef<HTMLDivElement>(null);
  const m = EQUIPE.find(e => e.id === agente)!;
  useEffect(() => { const l = lista.current; if (l) l.scrollTop = l.scrollHeight; }, [falas, enviando]);
  const manda = async () => { if (await envia(texto)) setTexto(''); };
  return (
    <div className="conversa">
      <div ref={lista} className="falas" aria-live="polite">
        {!falas.length && <p className="vazio">Ainda não tem conversa com {m.nome}. Pergunte algo sobre {m.papel.toLowerCase()}.</p>}
        {falas.map((f, i) => (
          <div key={i} className={`fala ${f.papel === 'user' ? 'eu' : 'ele'} ${f.erro ? 'erro' : ''}`}>
            {f.papel === 'assistant' && <Retrato id={agente} tamanho={28} cor={corDe(m.zona) + '40'} />}
            <p>{f.texto}</p>
            {f.papel === 'assistant' && !f.erro && i > 0 && (guardadas.has(i) || estado.memorias.some(x => x.agente === agente && x.texto === f.texto.slice(0, 1500))
              ? <span className="guardada">Na memória</span>
              : <button className="guardar" onClick={async () => { if (await criaMemoria(agente, f.texto.slice(0, 1500), 'conversa')) setGuardadas(g => new Set(g).add(i)); }}>Guardar na memória</button>)}
          </div>
        ))}
        {enviando && <div className="fala ele"><Retrato id={agente} tamanho={28} cor={corDe(m.zona) + '40'} /><p className="digitando"><i /><i /><i /></p></div>}
      </div>
      <form className="campo" onSubmit={e => { e.preventDefault(); manda(); }}>
        <label htmlFor="msg" className="so-leitor">Mensagem para {m.nome}</label>
        <textarea id="msg" rows={2} value={texto} placeholder={`Escreva para ${m.nome}`} onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); manda(); } }} />
        <button type="submit" disabled={!texto.trim() || enviando}>Enviar</button>
      </form>
    </div>
  );
}

export function Chat({ agente, setAgente, so }: { agente: string; setAgente: (id: string) => void; so?: boolean }) {
  return (
    <div className={`chat ${so ? 'so' : ''}`}>
      {!so && (
        <nav className="contatos" aria-label="Especialistas">
          {EQUIPE.filter(e => e.id !== 'clara').map(e => (
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
