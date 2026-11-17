// Rádio V30: o tocador que abre pelo aparelho do lounge e o botão pequeno que fica no menu enquanto a música toca.
// Duas fontes: as estações da casa, compostas pelo navegador, e rádios de verdade do Brasil inteiro.
import { useEffect, useMemo, useState } from 'react';
import { useRadio } from '../hooks/useRadio';
import { useRadiosDoBrasil } from '../hooks/useRadiosDoBrasil';
import { ESTACOES } from '../lib/radio';
import { GENEROS, filtra, porEstado, type RadioAoVivo } from '../lib/radios';

/** Três barrinhas que sobem e descem enquanto toca. Paradas quando está em pausa ou quando a pessoa pediu menos movimento. */
function Barras({ ligadas }: { ligadas: boolean }) {
  return <span className={`radio-barras ${ligadas ? 'on' : ''}`} aria-hidden="true"><i /><i /><i /></span>;
}

const ABA = 'lab.radio.aba';
const lembraAba = (): 'casa' | 'brasil' => { try { return localStorage.getItem(ABA) === 'brasil' ? 'brasil' : 'casa'; } catch { return 'casa'; } };
const POR_PAGINA = 30;

/** As estações da casa, em cartão. */
function DaCasa() {
  const r = useRadio();
  return (
    <ul className="radio-estacoes">
      {ESTACOES.map((e, i) => {
        const esta = !r.aoVivo && r.estacao.id === e.id, noAr = esta && r.tocando;
        return (
          <li key={e.id} style={{ ['--i' as string]: i }}>
            <button type="button" className={esta ? 'on' : ''} aria-pressed={noAr} onClick={() => (noAr ? r.pausa() : r.toca(e.id))}>
              <span className="radio-topo"><b>{e.nome}</b><Barras ligadas={noAr} /></span>
              <small>{e.sobre}</small>
              <em>{noAr ? 'No ar. Toque para pausar' : `${e.bpm} batidas por minuto`}</em>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Logo da rádio, quando ela tem um seguro e ele carrega. Senão, a inicial do nome. */
function Logo({ r }: { r: RadioAoVivo }) {
  const [quebrou, setQuebrou] = useState(false);
  return r.logo && !quebrou
    ? <img className="radio-logo" src={r.logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setQuebrou(true)} />
    : <span className="radio-logo letra" aria-hidden="true">{r.nome.replace(/^r[aá]dio\s+/i, '').charAt(0).toUpperCase()}</span>;
}

/** Rádios de verdade, com filtro por estado, gênero e busca. */
function DoBrasil() {
  const r = useRadio();
  const { lista, carregando, erro } = useRadiosDoBrasil(true);
  const [uf, setUf] = useState(() => r.ultimaAoVivo?.uf ?? '');
  const [genero, setGenero] = useState(''), [busca, setBusca] = useState(''), [quantas, setQuantas] = useState(POR_PAGINA);
  const estados = useMemo(() => porEstado(lista), [lista]);
  const achadas = useMemo(() => filtra(lista, { uf, genero, busca }), [lista, uf, genero, busca]);
  useEffect(() => setQuantas(POR_PAGINA), [uf, genero, busca]);

  if (carregando) return <p className="radio-estado" role="status">Buscando as rádios do Brasil.</p>;
  if (erro) return <p className="nota">{erro}</p>;
  return (
    <div className="radio-brasil">
      <div className="radio-filtros">
        <label htmlFor="radio-uf">Estado
          <select id="radio-uf" value={uf} onChange={e => setUf(e.target.value)}>
            <option value="">Brasil inteiro ({lista.length})</option>
            {estados.map(e => <option key={e.sigla} value={e.sigla}>{e.nome} ({e.total})</option>)}
          </select>
        </label>
        <label htmlFor="radio-busca">Procurar
          <input id="radio-busca" type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome ou cidade" />
        </label>
      </div>
      <div className="radio-generos" role="group" aria-label="Gênero">
        <button type="button" className={genero === '' ? 'on' : ''} aria-pressed={genero === ''} onClick={() => setGenero('')}>Todos</button>
        {GENEROS.map(([g]) => <button key={g} type="button" className={genero === g ? 'on' : ''} aria-pressed={genero === g} onClick={() => setGenero(genero === g ? '' : g)}>{g}</button>)}
      </div>
      <p className="radio-estado" role="status">{achadas.length ? `${achadas.length} ${achadas.length === 1 ? 'rádio' : 'rádios'}` : 'Nenhuma rádio com esse filtro. Tente outro gênero ou o Brasil inteiro.'}</p>
      <ul className="radio-lista">
        {achadas.slice(0, quantas).map(a => {
          const esta = r.aoVivo?.id === a.id, noAr = esta && r.tocando;
          return (
            <li key={a.id}>
              <button type="button" className={esta ? 'on' : ''} aria-pressed={noAr} onClick={() => (noAr ? r.pausa() : r.tocaAoVivo(a))}>
                <Logo r={a} />
                <span className="radio-dados">
                  <b>{a.nome}</b>
                  <small>{[a.cidade, a.uf].filter(Boolean).join(', ') || 'Sem estado informado'}{a.generos.length ? `. ${a.generos.slice(0, 2).join(', ')}` : ''}</small>
                </span>
                <span className="radio-acao">{noAr ? (r.conectando ? 'Conectando' : <Barras ligadas />) : 'Ouvir'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {achadas.length > quantas && <button type="button" className="leve" onClick={() => setQuantas(q => q + POR_PAGINA)}>Ver mais {Math.min(POR_PAGINA, achadas.length - quantas)}</button>}
      <p className="nota">Catálogo aberto do Radio Browser, mantido por ouvintes. Só entram rádios com som seguro que responderam na última checagem.</p>
    </div>
  );
}

/** Página da direita do livro: as duas fontes em abas, tocar ou pausar e o volume. */
export function Radio() {
  const r = useRadio();
  const [aba, setAba] = useState<'casa' | 'brasil'>(() => (r.aoVivo ? 'brasil' : lembraAba()));
  useEffect(() => { try { localStorage.setItem(ABA, aba); } catch { /* vale só nesta visita */ } }, [aba]);
  if (!r.disponivel) return <p className="nota">Este navegador não toca áudio gerado na página. A rádio fica desligada aqui.</p>;
  const nome = r.aoVivo?.nome ?? r.estacao.nome;
  const retoma = () => (r.aoVivo ? r.tocaAoVivo(r.aoVivo) : r.toca());
  return (
    <div className="radio">
      <div className="abas" role="tablist" aria-label="Fonte da rádio">
        <button type="button" role="tab" aria-selected={aba === 'casa'} onClick={() => setAba('casa')}>Da casa</button>
        <button type="button" role="tab" aria-selected={aba === 'brasil'} onClick={() => setAba('brasil')}>Do Brasil</button>
      </div>
      {aba === 'casa' ? <DaCasa /> : <DoBrasil />}
      {r.falhou && <p className="aviso-radio" role="alert">{r.falhou}</p>}
      <div className="radio-controles">
        <button type="button" className="primario" onClick={() => (r.tocando ? r.pausa() : retoma())}>{r.tocando ? 'Pausar' : `Tocar ${nome}`}</button>
        {aba === 'casa' && <button type="button" className="leve" onClick={r.proxima}>Próxima estação</button>}
        <label className="radio-volume" htmlFor="radio-vol">Volume
          <input id="radio-vol" type="range" min={0} max={1} step={0.05} value={r.volume} onChange={e => r.poeVolume(Number(e.target.value))} aria-valuetext={`${Math.round(r.volume * 100)} de 100`} />
        </label>
      </div>
      <p className="radio-estado" role="status">{r.tocando ? (r.conectando ? `Conectando com ${nome}.` : `No ar: ${nome}. A música continua quando você fecha este livro.`) : 'Rádio em pausa.'}</p>
    </div>
  );
}

/** Página da esquerda: o que é a rádio. */
export function SobreARadio() {
  return (
    <div className="pong-regras">
      <ul>
        <li><b>Da casa</b>Três estações compostas pelo navegador, compasso por compasso. Sem gravação e sem música de terceiros.</li>
        <li><b>Do Brasil</b>Rádios de verdade, de todos os estados, por gênero ou pelo nome. Do sertanejo do interior à notícia da capital.</li>
        <li><b>Segue com você</b>Feche o livro e a música continua. O botão do menu pausa de qualquer tela.</li>
      </ul>
      <p className="nota-mao">Lab em silêncio demais desconfia. Lab com som baixinho trabalha.</p>
    </div>
  );
}

/** Botão do menu lateral: abre a rádio e, com ela no ar, mostra o que toca e deixa pausar sem abrir nada. */
export function BotaoDaRadio({ abre }: { abre: () => void }) {
  const r = useRadio();
  if (!r.disponivel) return null;
  const nome = r.aoVivo?.nome ?? r.estacao.nome;
  return (
    <div className={`radio-mini ${r.tocando ? 'on' : ''}`}>
      <button type="button" className="radio-abre" onClick={abre} title="Abrir a Rádio V30" aria-label={r.tocando ? `Rádio V30 no ar, ${nome}. Abrir` : 'Abrir a Rádio V30'}>
        <Barras ligadas={r.tocando && !r.conectando} /><span className="radio-mini-texto"><b>Rádio V30</b><small>{r.tocando ? nome : 'Desligada'}</small></span>
      </button>
      {r.tocando && <button type="button" className="radio-pausa" onClick={r.pausa} aria-label="Pausar a rádio" title="Pausar a rádio"><span aria-hidden="true">❙❙</span></button>}
    </div>
  );
}
