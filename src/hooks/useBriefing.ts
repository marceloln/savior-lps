import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PULADO, falasDoBriefing, modeloDe, pedeExemplo, proximoPasso, resumoDoBriefing, type FalaBriefing, type Respostas } from '../lib/briefing';
import { textoDeErro } from '../lib/conversa';

const CHAVE = 'lab.briefing';
type Rascunho = { modelo: string | null; respostas: Respostas };
const le = (): Rascunho => { try { const r = JSON.parse(localStorage.getItem(CHAVE) ?? 'null'); if (r && typeof r === 'object' && modeloDe(r.modelo)) return { modelo: r.modelo, respostas: r.respostas ?? {} }; } catch { /* sem rascunho */ } return { modelo: null, respostas: {} }; };
export type Leitura = { estado: 'parada' | 'lendo' | 'pronta' | 'erro'; texto: string };

/** Conduz o briefing com a Clara: modelo escolhido, respostas, a vez de quem fala e a leitura dela no fim. O rascunho fica guardado no navegador. */
export function useBriefing() {
  const [r, setR] = useState<Rascunho>(le);
  // resposta curta esperando um exemplo antes de valer
  const [pendente, setPendente] = useState<string | null>(null);
  const [digitando, setDigitando] = useState(false);
  const [leitura, setLeitura] = useState<Leitura>({ estado: 'parada', texto: '' });
  const relogio = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => { try { localStorage.setItem(CHAVE, JSON.stringify(r)); } catch { /* vale só nesta visita */ } }, [r]);
  useEffect(() => () => clearTimeout(relogio.current), []);

  const modelo = modeloDe(r.modelo);
  const atual = modelo ? proximoPasso(modelo, r.respostas) : 0;
  const passo = modelo?.passos[atual] ?? null;
  const fechado = !!modelo && atual === modelo.passos.length;

  /** A Clara leva um instante para responder: quem lê percebe que a vez passou para ela. */
  const vezDaClara = useCallback(() => {
    const semMovimento = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setDigitando(true); clearTimeout(relogio.current);
    relogio.current = setTimeout(() => setDigitando(false), semMovimento ? 120 : 650);
  }, []);
  const grava = useCallback((id: string, texto: string) => { setR(x => ({ ...x, respostas: { ...x.respostas, [id]: texto } })); setPendente(null); setLeitura({ estado: 'parada', texto: '' }); vezDaClara(); }, [vezDaClara]);

  const escolhe = useCallback((id: string) => { setR({ modelo: id, respostas: {} }); setPendente(null); setLeitura({ estado: 'parada', texto: '' }); vezDaClara(); }, [vezDaClara]);
  /** Responde a pergunta da vez. Resposta digitada curta demais faz a Clara pedir um exemplo antes de seguir. */
  const responde = useCallback((texto: string, pronta = false) => {
    const t = texto.trim(); if (!passo || !t || digitando) return false;
    if (pendente !== null) grava(passo.id, `${pendente.replace(/[.\s]+$/, '')}. ${t}`);
    else if (!pronta && pedeExemplo(passo, t)) { setPendente(t); vezDaClara(); }
    else grava(passo.id, t);
    return true;
  }, [passo, pendente, digitando, grava, vezDaClara]);
  const pula = useCallback(() => { if (passo?.opcional && !digitando) grava(passo.id, PULADO); }, [passo, digitando, grava]);
  /** Reabre uma pergunta já respondida. As respostas seguintes ficam guardadas. */
  const corrige = useCallback((id: string) => { setR(x => { const respostas = { ...x.respostas }; delete respostas[id]; return { ...x, respostas }; }); setPendente(null); setLeitura({ estado: 'parada', texto: '' }); }, []);
  const volta = useCallback(() => {
    if (pendente !== null) { setPendente(null); return; }
    if (modelo && atual > 0) corrige(modelo.passos[atual - 1].id); else setR({ modelo: null, respostas: {} });
  }, [pendente, modelo, atual, corrige]);
  const recomeca = useCallback(() => { setR({ modelo: null, respostas: {} }); setPendente(null); setLeitura({ estado: 'parada', texto: '' }); }, []);

  /** Pede à Clara, pelo modelo de IA, o que ainda falta saber antes de a equipe começar. */
  const pedeLeitura = useCallback(async () => {
    if (!modelo || leitura.estado === 'lendo') return;
    setLeitura({ estado: 'lendo', texto: '' });
    const conteudo = resumoDoBriefing(modelo, r.respostas) + '\nLeia este briefing e diga, em até cinco linhas, o que ainda falta saber antes de a equipe começar e qual pergunta você faria ao cliente. Não repita o briefing.';
    try {
      const resp = await fetch('api/conversa', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ agente: 'clara', mensagens: [{ role: 'user', content: conteudo }] }) });
      const corpo = await resp.json().catch(() => null);
      const texto = corpo && typeof (corpo as { texto?: unknown }).texto === 'string' ? (corpo as { texto: string }).texto : null;
      setLeitura(resp.ok && texto !== null ? { estado: 'pronta', texto } : { estado: 'erro', texto: textoDeErro(resp.ok ? 404 : resp.status, corpo) });
    } catch { setLeitura({ estado: 'erro', texto: textoDeErro(null, null) }); }
  }, [modelo, r.respostas, leitura.estado]);

  const falas = useMemo<FalaBriefing[]>(() => {
    if (!modelo) return [];
    const base = falasDoBriefing(modelo, r.respostas);
    return pendente === null ? base : [...base, { de: 'eu', texto: pendente }, { de: 'clara', texto: 'Me dá um exemplo do dia a dia? Uma cena que você viu já basta, e a equipe para de chutar.' }];
  }, [modelo, r.respostas, pendente]);

  return { modelo, respostas: r.respostas, atual, passo, fechado, falas, digitando, pendente: pendente !== null, leitura, escolhe, responde, pula, volta, corrige, recomeca, pedeLeitura };
}
export type ApiBriefing = ReturnType<typeof useBriefing>;
