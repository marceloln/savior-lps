import { useCallback, useEffect, useState } from 'react';
import { ABERTURA, paraApi, textoDeErro, type Fala } from '../lib/conversa';

/** Conversa com um especialista: carrega o histórico do banco e envia pelo Worker. */
export function useConversa(agente: string) {
  const [falas, setFalas] = useState<Fala[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    const abertura: Fala[] = ABERTURA[agente] ? [{ papel: 'assistant', texto: ABERTURA[agente] }] : [];
    setFalas(abertura);
    fetch(`api/historico/${agente}`)
      .then(r => (r.ok ? r.json() : null))
      .then((d: { mensagens?: { papel: Fala['papel']; texto: string }[] } | null) => {
        if (vivo && d?.mensagens?.length) setFalas([...abertura, ...d.mensagens.map(m => ({ papel: m.papel, texto: m.texto }))]);
      })
      .catch(() => { /* sem servidor: fica só a abertura */ });
    return () => { vivo = false; };
  }, [agente]);

  /** Devolve true quando a mensagem foi aceita, para o campo poder ser limpo. */
  const envia = useCallback(async (texto: string): Promise<boolean> => {
    const t = texto.trim();
    if (!t || enviando) return false;
    const novas: Fala[] = [...falas, { papel: 'user', texto: t }];
    setFalas(novas); setEnviando(true);
    try {
      const r = await fetch('api/conversa', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ agente, mensagens: paraApi(novas) }) });
      const corpo = await r.json().catch(() => null);
      const resposta = corpo && typeof (corpo as { texto?: unknown }).texto === 'string' ? (corpo as { texto: string }).texto : null;
      // sem Worker por trás, o host devolve a página em vez de JSON: trata como servidor ausente
      if (!r.ok || resposta === null) { setFalas([...falas, { papel: 'assistant', texto: textoDeErro(r.ok ? 404 : r.status, corpo), erro: true }]); return false; }
      setFalas([...novas, { papel: 'assistant', texto: resposta }]);
      return true;
    } catch {
      setFalas([...falas, { papel: 'assistant', texto: textoDeErro(null, null), erro: true }]);
      return false;
    } finally { setEnviando(false); }
  }, [agente, falas, enviando]);

  return { falas, enviando, envia };
}
