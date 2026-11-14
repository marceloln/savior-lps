import { useCallback, useRef, useState } from 'react';
import { useEstado } from './useEstado';
import type { MissaoProposta } from '../lib/dados';

export type Corrida = {
  etapa: 'parado' | 'planejando' | 'plano' | 'executando' | 'sintetizando' | 'erro';
  texto: string; projeto: string | null; plano: MissaoProposta[]; pedido: number | null; atual: number | null;
};
const PARADA: Corrida = { etapa: 'parado', texto: '', projeto: null, plano: [], pedido: null, atual: null };

/** Conduz um pedido ao lab do começo ao fim: plano da orquestração, aprovação do sócio, cada entrega e a síntese. */
export function usePedido() {
  const api = useEstado(), agora = useRef(api); agora.current = api;
  const [c, setC] = useState<Corrida>(PARADA);
  // o mapa mostra o papel saindo da orquestração para cada mesa quando o plano é aprovado
  const [distribuicao, setDistribuicao] = useState<{ n: number; para: string[] } | null>(null);

  const roda = useCallback(async (pedido: number, tarefas: number[]) => {
    setC(x => ({ ...x, etapa: 'executando', pedido }));
    for (const id of tarefas) {
      setC(x => ({ ...x, atual: id }));
      if (!(await agora.current.executa(id))) { setC(x => ({ ...x, etapa: 'erro', atual: null })); return; }
    }
    setC(x => ({ ...x, etapa: 'sintetizando', atual: null }));
    const ok = await agora.current.sintetiza(pedido);
    setC(x => (ok ? { ...PARADA, pedido } : { ...x, etapa: 'erro' }));
  }, []);

  const planeja = useCallback(async (texto: string, projeto: string | null) => {
    setC({ ...PARADA, etapa: 'planejando', texto, projeto });
    const plano = await agora.current.planeja(texto, projeto);
    setC(x => (plano ? { ...x, etapa: 'plano', plano } : PARADA));
  }, []);

  // o segundo clique em Distribuir enquanto o primeiro ainda cria o pedido não cria outro
  const criando = useRef(false);
  const aprova = useCallback(async (plano: MissaoProposta[]) => {
    if (criando.current) return;
    criando.current = true;
    let r: Awaited<ReturnType<typeof agora.current.criaPedido>>;
    try { r = await agora.current.criaPedido(c.texto, c.projeto, plano); } finally { criando.current = false; }
    if (r) { setDistribuicao({ n: Date.now(), para: plano.map(m => m.agente) }); await roda(r.pedido, r.tarefas); }
  }, [c.texto, c.projeto, roda]);

  /** Retoma um pedido que parou no meio: executa o que ainda não tem entrega e fecha a síntese. */
  const continua = useCallback((pedido: number) => {
    const faltam = agora.current.estado.tarefas.filter(t => t.pedido_id === pedido && !t.entrega).map(t => t.id);
    return roda(pedido, faltam);
  }, [roda]);

  return { corrida: c, distribuicao, planeja, aprova, continua, desiste: () => setC(PARADA), ocupado: c.etapa === 'planejando' || c.etapa === 'executando' || c.etapa === 'sintetizando' };
}
export type ApiPedido = ReturnType<typeof usePedido>;
