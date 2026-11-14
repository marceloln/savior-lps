// Regras puras da conversa no navegador: o que vai para o servidor e como o erro aparece.
/** nova marca a fala que nasceu nesta sessão, para só ela entrar com animação. */
export type Fala = { papel: 'user' | 'assistant'; texto: string; erro?: boolean; nova?: boolean };

/** Converte as falas para o formato da rota /api/conversa, sem avisos de erro e começando por quem pergunta. */
export function paraApi(falas: Fala[]): { role: 'user' | 'assistant'; content: string }[] {
  const limpas = falas.filter(f => !f.erro && f.texto.trim());
  while (limpas.length && limpas[0].papel !== 'user') limpas.shift();
  return limpas.map(f => ({ role: f.papel, content: f.texto }));
}

/** Texto para mostrar quando a rota falha. Nunca mostra detalhe técnico cru. */
export function textoDeErro(status: number | null, corpo: unknown): string {
  const msg = corpo && typeof corpo === 'object' && 'erro' in corpo && typeof (corpo as { erro: unknown }).erro === 'string' ? (corpo as { erro: string }).erro : null;
  if (status === null) return 'Sem conexão com o servidor do lab. Sua pergunta continua aqui em cima.';
  if (status === 404) return 'O servidor do lab não está nesta versão. A conversa funciona na versão publicada na Cloudflare.';
  return msg ?? 'Algo deu errado do lado do servidor. Tente de novo em instantes.';
}

export const ABERTURA: Record<string, string> = {
  clara: 'Oi, eu sou a Clara. Vou te fazer umas perguntas, uma de cada vez, para montar o briefing. Para começar, em que setor é a operação?',
};

// Duas perguntas por sala, no assunto de quem trabalha ali. A terceira sai do papel da pessoa.
const POR_SALA: Record<string, [string, string]> = {
  estrategia: ['Que perguntas eu levo para a primeira visita ao cliente?', 'Como separo sintoma de causa num diagnóstico?'],
  planejamento: ['Como monto o calendário de um ciclo de 30 dias?', 'O que precisa estar pronto antes do kickoff?'],
  comercial: ['Como apresento o ciclo de 30 dias para uma diretoria?', 'O que não pode faltar numa proposta enxuta?'],
  marca: ['Como transformo um aprendizado de campo em post?', 'Que tom usar para falar com gerente de loja?'],
  trafego: ['Como divido um pedido grande entre a equipe?', 'Quem do lab é a pessoa certa para um diagnóstico de atendimento?'],
  cx: ['Como desenho a jornada do cliente da pista ao caixa?', 'O que entra num checklist de troca de turno?'],
  dados: ['Quais números o gerente deveria olhar toda semana?', 'Como sei se o piloto funcionou?'],
  produto: ['O que dá para prototipar em uma semana?', 'Como testo uma ideia antes de construir?'],
  arquivo: ['O que já fizemos de parecido com este projeto?', 'Como guardo um aprendizado para o próximo cliente usar?'],
};

/** Três perguntas para começar uma conversa vazia, coerentes com a sala e o papel do especialista. */
export function sugestoesDePergunta(zona: string, papel: string): string[] {
  const doPapel = `No seu papel de ${papel.trim().toLowerCase()}, por onde você começaria no projeto da vez?`;
  const [a, b] = POR_SALA[zona] ?? ['O que você precisa saber de mim para ajudar melhor?', 'Qual é o erro mais comum que você vê na sua área?'];
  return [a, b, doPapel];
}
