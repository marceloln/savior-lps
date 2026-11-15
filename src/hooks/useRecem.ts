import { useRef } from 'react';
import type { Tarefa } from '../lib/dados';
import { chaveDaColuna } from '../lib/ferramentas';

/** Quais itens entraram na lista depois que a tela abriu. Serve para animar só o que acabou de acontecer. */
export function useRecem(ids: number[]): Set<number> {
  const vistos = useRef<Set<number> | null>(null), recem = useRef(new Set<number>());
  if (!vistos.current) vistos.current = new Set(ids);
  for (const id of ids) if (!vistos.current.has(id)) { vistos.current.add(id); recem.current.add(id); }
  return recem.current;
}

/** Quais missões mudaram de coluna, ou nasceram, depois que a tela abriu. O cartão que chega numa coluna entra com movimento; os que já estavam lá ficam parados. */
export function useMudouDeColuna(missoes: Tarefa[]): (m: Tarefa) => boolean {
  const recem = useRecem(missoes.map(chaveDaColuna));
  return m => recem.has(chaveDaColuna(m));
}
