// Regras puras da conversa no navegador: o que vai para o servidor e como o erro aparece.
export type Fala = { papel: 'user' | 'assistant'; texto: string; erro?: boolean };

/** Converte as falas para o formato da rota /api/conversa, sem avisos de erro e começando por quem pergunta. */
export function paraApi(falas: Fala[]): { role: 'user' | 'assistant'; content: string }[] {
  const limpas = falas.filter(f => !f.erro && f.texto.trim());
  while (limpas.length && limpas[0].papel !== 'user') limpas.shift();
  return limpas.map(f => ({ role: f.papel, content: f.texto }));
}

/** Texto para mostrar quando a rota falha. Nunca mostra detalhe técnico cru. */
export function textoDeErro(status: number | null, corpo: unknown): string {
  const msg = corpo && typeof corpo === 'object' && 'erro' in corpo && typeof (corpo as { erro: unknown }).erro === 'string' ? (corpo as { erro: string }).erro : null;
  if (status === null) return 'Sem conexão com o servidor do lab. O que você escreveu continua no campo.';
  if (status === 404) return 'O servidor do lab não está nesta versão. A conversa funciona na versão publicada na Cloudflare.';
  return msg ?? 'Algo deu errado do lado do servidor. Tente de novo em instantes.';
}

export const ABERTURA: Record<string, string> = {
  clara: 'Oi, eu sou a Clara. Vou te fazer umas perguntas, uma de cada vez, para montar o briefing. Para começar, em que setor é a operação?',
};
