// Rádio V30: o tocador que abre pelo aparelho do lounge e o botão pequeno que fica no menu enquanto a música toca.
import { useRadio } from '../hooks/useRadio';
import { ESTACOES } from '../lib/radio';

/** Três barrinhas que sobem e descem enquanto toca. Paradas quando está em pausa ou quando a pessoa pediu menos movimento. */
function Barras({ ligadas }: { ligadas: boolean }) {
  return <span className={`radio-barras ${ligadas ? 'on' : ''}`} aria-hidden="true"><i /><i /><i /></span>;
}

/** Página da direita do livro: as estações em cartão, tocar ou pausar e o volume. */
export function Radio() {
  const r = useRadio();
  if (!r.disponivel) return <p className="nota">Este navegador não toca áudio gerado na página. A rádio fica desligada aqui.</p>;
  return (
    <div className="radio">
      <ul className="radio-estacoes">
        {ESTACOES.map(e => {
          const esta = r.estacao.id === e.id, noAr = esta && r.tocando;
          return (
            <li key={e.id}>
              <button type="button" className={esta ? 'on' : ''} aria-pressed={noAr} onClick={() => (noAr ? r.pausa() : r.toca(e.id))}>
                <span className="radio-topo"><b>{e.nome}</b><Barras ligadas={noAr} /></span>
                <small>{e.sobre}</small>
                <em>{noAr ? 'No ar. Toque para pausar' : `${e.bpm} batidas por minuto`}</em>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="radio-controles">
        <button type="button" className="primario" onClick={() => (r.tocando ? r.pausa() : r.toca())}>{r.tocando ? 'Pausar' : `Tocar ${r.estacao.nome}`}</button>
        <button type="button" className="leve" onClick={r.proxima}>Próxima estação</button>
        <label className="radio-volume" htmlFor="radio-vol">Volume
          <input id="radio-vol" type="range" min={0} max={1} step={0.05} value={r.volume} onChange={e => r.poeVolume(Number(e.target.value))} aria-valuetext={`${Math.round(r.volume * 100)} por cento`} />
        </label>
      </div>
      <p className="radio-estado" role="status">{r.tocando ? `No ar: ${r.estacao.nome}. A música continua quando você fecha este livro.` : 'Rádio em pausa.'}</p>
    </div>
  );
}

/** Página da esquerda: o que é a rádio. */
export function SobreARadio() {
  return (
    <div className="pong-regras">
      <ul>
        <li><b>Feita na hora</b>Cada compasso é composto pelo navegador. Não há gravação nem música de terceiros.</li>
        <li><b>Três estações</b>Uma para acordar, uma para trabalhar de cabeça baixa e uma para fechar o dia.</li>
        <li><b>Segue com você</b>Feche o livro e a música continua. O botão do menu pausa de qualquer tela.</li>
      </ul>
      <p className="nota-mao">Lab em silêncio demais desconfia. Lab com som baixinho trabalha.</p>
    </div>
  );
}

/** Botão do menu lateral: abre a rádio e, com ela no ar, mostra a estação e deixa pausar sem abrir nada. */
export function BotaoDaRadio({ abre }: { abre: () => void }) {
  const r = useRadio();
  if (!r.disponivel) return null;
  return (
    <div className={`radio-mini ${r.tocando ? 'on' : ''}`}>
      <button type="button" className="radio-abre" onClick={abre} title="Abrir a Rádio V30" aria-label={r.tocando ? `Rádio V30 no ar, ${r.estacao.nome}. Abrir` : 'Abrir a Rádio V30'}>
        <Barras ligadas={r.tocando} /><span className="radio-mini-texto"><b>Rádio V30</b><small>{r.tocando ? r.estacao.nome : 'Desligada'}</small></span>
      </button>
      {r.tocando && <button type="button" className="radio-pausa" onClick={r.pausa} aria-label="Pausar a rádio" title="Pausar a rádio"><span aria-hidden="true">❙❙</span></button>}
    </div>
  );
}
