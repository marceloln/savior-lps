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

  // manda a conversa que termina na pergunta de quem usa. Se falhar, a pergunta fica e o erro entra como aviso.
  const manda = useCallback(async (novas: Fala[]) => {
    const avisa = (texto: string) => setFalas([...novas, { papel: 'assistant', texto, erro: true, nova: true }]);
    setFalas(novas); setEnviando(true);
    try {
      const r = await fetch('api/conversa', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ agente, mensagens: paraApi(novas) }) });
      const corpo = await r.json().catch(() => null);
      const resposta = corpo && typeof (corpo as { texto?: unknown }).texto === 'string' ? (corpo as { texto: string }).texto : null;
      // sem Worker por trás, o host devolve a página em vez de JSON: trata como servidor ausente
      if (!r.ok || resposta === null) avisa(textoDeErro(r.ok ? 404 : r.status, corpo));
      else setFalas([...novas, { papel: 'assistant', texto: resposta, nova: true }]);
    } catch { avisa(textoDeErro(null, null)); }
    finally { setEnviando(false); }
  }, [agente]);

  /** Devolve true quando a mensagem entrou na conversa, para o campo poder ser limpo. */
  const envia = useCallback((texto: string): boolean => {
    const t = texto.trim();
    if (!t || enviando) return false;
    manda([...falas.filter(f => !f.erro), { papel: 'user', texto: t, nova: true }]);
    return true;
  }, [falas, enviando, manda]);

  /** Reenvia a última pergunta que ficou sem resposta. */
  const tentaDeNovo = useCallback(() => {
    const semAviso = falas.filter(f => !f.erro);
    if (!enviando && semAviso.at(-1)?.papel === 'user') manda(semAviso);
  }, [falas, enviando, manda]);

  return { falas, enviando, envia, tentaDeNovo };
}
