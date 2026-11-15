import { useMemo } from 'react';
import { useEstado } from './useEstado';
import type { Agente } from '../lib/equipe';

/** A equipe viva, lida do banco. Quem foi desligado some das listas, mas o nome continua aparecendo no que ele fez. */
export function useEquipe() {
  const { estado } = useEstado();
  return useMemo(() => {
    const de = (id: string): Agente | undefined => estado.agentes.find(a => a.id === id);
    return { equipe: estado.agentes.filter(a => a.ativo), de, nome: (id: string) => de(id)?.nome ?? 'Quem saiu do lab' };
  }, [estado.agentes]);
}
