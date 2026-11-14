import { useRef } from 'react';

/** Quais itens entraram na lista depois que a tela abriu. Serve para animar só o que acabou de acontecer. */
export function useRecem(ids: number[]): Set<number> {
  const vistos = useRef<Set<number> | null>(null), recem = useRef(new Set<number>());
  if (!vistos.current) vistos.current = new Set(ids);
  for (const id of ids) if (!vistos.current.has(id)) { vistos.current.add(id); recem.current.add(id); }
  return recem.current;
}
