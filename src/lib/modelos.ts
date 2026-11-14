// Modelos de IA que o lab sabe chamar. O identificador é provedor:modelo, e dá para digitar um que não esteja na lista.
export type Provedor = 'anthropic' | 'openai' | 'google';

export const PROVEDORES: Record<Provedor, { nome: string; segredo: string }> = {
  anthropic: { nome: 'Anthropic', segredo: 'ANTHROPIC_API_KEY' },
  openai: { nome: 'OpenAI', segredo: 'OPENAI_API_KEY' },
  google: { nome: 'Google', segredo: 'GOOGLE_API_KEY' },
};

export const MODELO_PADRAO = 'anthropic:claude-sonnet-5-5';

export const MODELOS: { id: string; nome: string; uso: string }[] = [
  { id: 'anthropic:claude-sonnet-5-5', nome: 'Claude Sonnet 5.5', uso: 'Equilíbrio para o dia a dia' },
  { id: 'anthropic:claude-opus-5-5', nome: 'Claude Opus 5.5', uso: 'Raciocínio mais fundo, custa mais' },
  { id: 'anthropic:claude-haiku-5-5', nome: 'Claude Haiku 5.5', uso: 'Rápido e barato para tarefa simples' },
  { id: 'openai:gpt-6-astra', nome: 'GPT-6 Astra', uso: 'Modelo principal da OpenAI' },
  { id: 'openai:gpt-6-luna', nome: 'GPT-6 Luna', uso: 'Versão eficiente da OpenAI' },
  { id: 'google:gemini-4-argon', nome: 'Gemini 4 Argon', uso: 'Modelo principal do Google' },
  { id: 'google:gemini-3.8-flash', nome: 'Gemini 3.8 Flash', uso: 'Versão rápida do Google' },
];

/** Separa provedor e modelo. Devolve null se o texto não tiver o formato provedor:modelo. */
export function leModelo(s: string): { provedor: Provedor | 'simulado'; id: string } | null {
  const m = /^(anthropic|openai|google|simulado):([A-Za-z0-9._-]{2,80})$/.exec(s.trim());
  return m ? { provedor: m[1] as Provedor | 'simulado', id: m[2] } : null;
}

export const nomeDoModelo = (id: string) => MODELOS.find(m => m.id === id)?.nome ?? leModelo(id)?.id ?? id;
