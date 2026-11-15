// O jeito de cada especialista: a frase que o resume, as manias, o que tem na mesa e o que está no mural.
// O mesmo arquivo alimenta a tela e o desenho do mural na cena da mesa (arte/murais.cjs).
import dados from './peculiaridades.json';

export type Cartao = { t: string; r?: string; x?: string; i?: string[]; c?: string };
export type Peculiaridade = { frase: string; manias: string[]; mesa: string[]; mural: { titulo: string; cartoes: Cartao[] } };

const TODAS = dados as Record<string, Peculiaridade>;

/** Só a equipe de partida tem. Quem os sócios criam depois no lab ainda não tem mesa montada. */
export const peculiaridadeDe = (id: string): Peculiaridade | null => TODAS[id] ?? null;

/** O que está pregado no mural, em palavras, para a legenda e para quem não enxerga a imagem. */
export const cartoesDoMural = (p: Peculiaridade): string[] => p.mural.cartoes.map(c => c.r ?? c.x ?? '').filter(Boolean);

/** Quadros da cena da mesa de cada boneco: quem trabalha sentado tem dois (as mãos alternam), quem fica de pé tem um. */
export const quadrosDaMesa = (aparencia: string, lista: Record<string, number>): string[] =>
  Array.from({ length: lista[aparencia] ?? 0 }, (_, i) => `assets/mesa/${aparencia}_${i}.webp`);
