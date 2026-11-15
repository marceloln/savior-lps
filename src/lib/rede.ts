// Regras puras de rede da interface: como um erro vira aviso para quem está usando.

/** Frase do aviso. Falha de rede do navegador (TypeError) nunca aparece crua. */
export function recadoDeErro(erro: unknown): string {
  if (erro instanceof TypeError) return 'Sem conexão com o servidor do lab. Tente de novo.';
  return erro instanceof Error && erro.message ? erro.message : 'O servidor do lab não respondeu.';
}
