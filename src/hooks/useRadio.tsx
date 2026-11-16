import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { estacaoDe, proximaEstacao, volumeValido, type Estacao } from '../lib/radio';
import { agendaCompasso, criaMesa, type Mesa } from '../lib/tocador';
import type { RadioAoVivo } from '../lib/radios';

type Api = {
  /** Falso em navegador sem áudio. A rádio então não aparece. */
  disponivel: boolean;
  tocando: boolean; estacao: Estacao; volume: number;
  /** A rádio de verdade escolhida agora. Nula quando a fonte é estação da casa. */
  aoVivo: RadioAoVivo | null;
  /** A última rádio de verdade escolhida neste navegador, para voltar a ela com um toque. */
  ultimaAoVivo: RadioAoVivo | null;
  /** Rádio de verdade conectando, ou que não respondeu. */
  conectando: boolean; falhou: string | null;
  /** Liga uma rádio de verdade do Brasil. Para a estação da casa, se estiver tocando. */
  tocaAoVivo: (r: RadioAoVivo) => void;
  /** Liga na estação dada, ou na que estava. Só funciona a partir de um clique: navegador nenhum deixa som começar sozinho. */
  toca: (id?: string) => void;
  pausa: () => void;
  proxima: () => void;
  poeVolume: (v: number) => void;
};

const Ctx = createContext<Api | null>(null);
const CHAVE = 'lab.radio';
const ADIANTE = 0.5;   // quantos segundos de música ficam agendados à frente do relógio
const lembrado = (): { estacao: string; volume: number; aoVivo: RadioAoVivo | null } => {
  try {
    const g = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as { estacao?: unknown; volume?: unknown; aoVivo?: RadioAoVivo };
    const r = g.aoVivo && typeof g.aoVivo.url === 'string' && g.aoVivo.url.startsWith('https://') ? g.aoVivo : null;
    return { estacao: typeof g.estacao === 'string' ? g.estacao : 'bossa', volume: volumeValido(g.volume), aoVivo: r };
  } catch { return { estacao: 'bossa', volume: 0.6, aoVivo: null }; }
};

/** A Rádio V30 toca por cima de qualquer tela: o estado mora aqui, acima do lab, e a música continua quando o livro fecha. */
export function RadioProvider({ children }: { children: ReactNode }) {
  const inicio = useMemo(lembrado, []);
  const [tocando, setTocando] = useState(false);
  const [estacao, setEstacao] = useState<Estacao>(() => estacaoDe(inicio.estacao));
  const [volume, setVolume] = useState(inicio.volume);
  const [aoVivo, setAoVivo] = useState<RadioAoVivo | null>(inicio.aoVivo);
  const [fonte, setFonte] = useState<'casa' | 'aovivo'>('casa');
  const [conectando, setConectando] = useState(false), [falhou, setFalhou] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const prazo = useRef(0);
  const motor = useRef<{ ctx: AudioContext; mesa: Mesa; relogio: number; proximo: number; n: number } | null>(null);
  const atual = useRef({ estacao, volume }); atual.current = { estacao, volume };
  const disponivel = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);

  useEffect(() => { try { localStorage.setItem(CHAVE, JSON.stringify({ estacao: estacao.id, volume, aoVivo })); } catch { /* vale só nesta visita */ } }, [estacao, volume, aoVivo]);

  /** Cala o que já estava agendado e deixa uma mesa nova pronta. Trocar de estação e voltar da pausa passam por aqui. */
  const mesaNova = useCallback((m: NonNullable<typeof motor.current>) => {
    const velha = m.mesa, agora = m.ctx.currentTime;
    velha.volume.gain.cancelScheduledValues(agora); velha.volume.gain.setTargetAtTime(0.0001, agora, 0.04);
    setTimeout(() => velha.volume.disconnect(), 400);
    m.mesa = criaMesa(m.ctx, atual.current.volume); m.n = 0; m.proximo = agora + 0.18;
  }, []);

  const para = useCallback(() => {
    const m = motor.current; if (!m) return;
    clearInterval(m.relogio); m.relogio = 0;
    m.mesa.volume.gain.setTargetAtTime(0.0001, m.ctx.currentTime, 0.05);
    setTimeout(() => { if (motor.current === m && !m.relogio) void m.ctx.suspend(); }, 300);
  }, []);

  /** Cala a rádio de verdade, sem mexer no que ela guardou como última escolhida. */
  const calaAoVivo = useCallback(() => {
    const a = audio.current; if (!a) return;
    clearTimeout(prazo.current);
    a.pause(); a.removeAttribute('src'); a.load(); setConectando(false);
  }, []);

  const toca = useCallback((id?: string) => {
    if (!disponivel) return;
    calaAoVivo(); setFonte('casa'); setFalhou(null);
    const e = id ? estacaoDe(id) : atual.current.estacao;
    atual.current.estacao = e; setEstacao(e);
    let m = motor.current;
    if (!m) {
      const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Classe();
      m = motor.current = { ctx, mesa: criaMesa(ctx, atual.current.volume), relogio: 0, proximo: ctx.currentTime + 0.12, n: 0 };
    } else mesaNova(m);
    void m.ctx.resume();
    const eu = m;
    const anda = () => { while (eu.proximo < eu.ctx.currentTime + ADIANTE) eu.proximo += agendaCompasso(eu.ctx, eu.mesa, atual.current.estacao, eu.n++, eu.proximo); };
    clearInterval(eu.relogio); eu.relogio = window.setInterval(anda, 120); anda();
    setTocando(true);
  }, [disponivel, mesaNova, calaAoVivo]);

  const tocaAoVivo = useCallback((r: RadioAoVivo) => {
    para();
    const a = audio.current ?? (audio.current = new Audio());
    a.preload = 'none'; a.volume = atual.current.volume;
    const desiste = () => { clearTimeout(prazo.current); a.pause(); setConectando(false); setTocando(false); setFalhou(`${r.nome} não respondeu agora. Escolha outra rádio.`); };
    a.onplaying = () => { clearTimeout(prazo.current); setConectando(false); setFalhou(null); };
    a.onwaiting = () => setConectando(true);
    a.onerror = desiste;
    // rádio fora do ar às vezes não dá erro, só fica conectando. Quinze segundos é o prazo
    clearTimeout(prazo.current); prazo.current = window.setTimeout(() => { if (a.readyState < 3) desiste(); }, 15000);
    a.src = r.url;
    setAoVivo(r); setFonte('aovivo'); setFalhou(null); setConectando(true); setTocando(true);
    // o navegador pode recusar sem clique, e a rádio pode estar fora do ar: os dois casos caem no mesmo aviso
    a.play().catch(desiste);
  }, [para]);

  const pausa = useCallback(() => { para(); calaAoVivo(); setTocando(false); }, [para, calaAoVivo]);
  const proxima = useCallback(() => { const e = proximaEstacao(atual.current.estacao.id); if (motor.current?.relogio) toca(e.id); else { atual.current.estacao = e; setEstacao(e); } }, [toca]);
  const poeVolume = useCallback((v: number) => {
    const x = volumeValido(v); setVolume(x);
    const m = motor.current; if (m) m.mesa.volume.gain.setTargetAtTime(Math.max(0.0001, x), m.ctx.currentTime, 0.03);
    if (audio.current) audio.current.volume = x;
  }, []);

  // ao sair da página, o áudio fecha junto
  useEffect(() => () => { const m = motor.current; if (m) { clearInterval(m.relogio); void m.ctx.close(); motor.current = null; } audio.current?.pause(); }, []);

  const api = useMemo<Api>(() => ({ disponivel, tocando, estacao, volume, aoVivo: fonte === 'aovivo' ? aoVivo : null, conectando, falhou, tocaAoVivo, toca, pausa, proxima, poeVolume, ultimaAoVivo: aoVivo }),
    [disponivel, tocando, estacao, volume, fonte, aoVivo, conectando, falhou, tocaAoVivo, toca, pausa, proxima, poeVolume]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useRadio() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useRadio fora do RadioProvider');
  return c;
}
