import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SEMENTE, type Decisao, type EstadoLab, type Memoria, type Reuniao, type Tarefa } from '../lib/dados';

type Modo = 'carregando' | 'banco' | 'previa';
type Api = {
  estado: EstadoLab; modo: Modo; aviso: string | null; limpaAviso: () => void;
  criaTarefa: (t: Pick<Tarefa, 'agente' | 'titulo' | 'projeto_id'>) => Promise<void>;
  mudaTarefa: (id: number, m: Partial<Pick<Tarefa, 'estado' | 'titulo' | 'agente'>>) => Promise<void>;
  apagaTarefa: (id: number) => Promise<void>;
  mudaFase: (projeto: string, fase: number) => Promise<boolean>;
  criaReuniao: (r: Pick<Reuniao, 'titulo' | 'pauta' | 'dia' | 'hora' | 'participantes' | 'projeto_id'>) => Promise<boolean>;
  gravaAta: (id: number, ata: string) => Promise<boolean>;
  criaDecisao: (d: Pick<Decisao, 'titulo' | 'contexto' | 'projeto_id' | 'reuniao_id'>) => Promise<boolean>;
  salvaInstrucao: (agente: string, texto: string) => Promise<boolean>;
  criaMemoria: (agente: string, texto: string, origem?: Memoria['origem']) => Promise<boolean>;
  apagaMemoria: (id: number) => Promise<void>;
};

const Ctx = createContext<Api | null>(null);
const agora = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

async function chama<T>(metodo: string, rota: string, corpo?: unknown): Promise<T> {
  const r = await fetch('api/' + rota, { method: metodo, headers: corpo ? { 'content-type': 'application/json' } : undefined, body: corpo ? JSON.stringify(corpo) : undefined });
  const d = await r.json().catch(() => null);
  if (!r.ok || d === null) throw new Error((d as { erro?: string } | null)?.erro ?? 'O servidor do lab não respondeu.');
  return d as T;
}

/** Estado do lab lido do D1 pelo Worker. Sem servidor, roda em prévia com os exemplos e não grava nada. */
export function EstadoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoLab>(SEMENTE);
  const [modo, setModo] = useState<Modo>('carregando');
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    chama<EstadoLab>('GET', 'estado').then(e => { setEstado(e); setModo('banco'); }).catch(() => setModo('previa'));
  }, []);

  // grava no banco; em prévia só muda na tela. Se o banco recusar, desfaz e avisa.
  const grava = useCallback(async <T,>(otimista: (e: EstadoLab) => EstadoLab, rede: () => Promise<T>, depois?: (e: EstadoLab, r: T) => EstadoLab) => {
    let anterior: EstadoLab | null = null;
    setEstado(e => { anterior = e; return otimista(e); });
    if (modo !== 'banco') return true;
    try { const r = await rede(); if (depois) setEstado(e => depois(e, r)); return true; }
    catch (err) { if (anterior) setEstado(anterior); setAviso((err as Error).message); return false; }
  }, [modo]);

  const api = useMemo<Api>(() => {
    const tmp = () => -Math.floor(Math.random() * 1e9);
    return {
      estado, modo, aviso, limpaAviso: () => setAviso(null),
      criaTarefa: async t => {
        if (estado.tarefas.some(x => x.agente === t.agente && x.estado !== 'feito' && x.titulo.trim().toLowerCase() === t.titulo.trim().toLowerCase())) { setAviso('Essa missão já está aberta com essa pessoa.'); return; }
        const id = tmp(); await grava(e => ({ ...e, tarefas: [...e.tarefas, { ...t, id, detalhe: '', estado: 'fila' }] }), () => chama<Tarefa>('POST', 'tarefas', t), (e, r) => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? r : x)) })); },
      mudaTarefa: async (id, m) => { await grava(e => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `tarefas/${id}`, m)); },
      apagaTarefa: async id => { await grava(e => ({ ...e, tarefas: e.tarefas.filter(x => x.id !== id) }), () => chama('DELETE', `tarefas/${id}`)); },
      mudaFase: async (id, fase) => grava(e => {
        const p = e.projetos.find(x => x.id === id);
        return { ...e, projetos: e.projetos.map(x => (x.id === id ? { ...x, fase } : x)), clientes: e.clientes.map(c => (c.id === p?.cliente_id ? { ...c, fase } : c)) };
      }, () => chama('PATCH', `projetos/${id}`, { fase })),
      criaReuniao: async r => { const id = tmp(); return grava(e => ({ ...e, reunioes: [...e.reunioes, { ...r, id, status: 'agendada' as const, ata: '' }].sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)) }), () => chama<Reuniao>('POST', 'reunioes', r), (e, n) => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? n : x)) })); },
      gravaAta: async (id, ata) => grava(e => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? { ...x, ata, status: 'feita' } : x)) }), () => chama('PUT', `reunioes/${id}/ata`, { ata })),
      criaDecisao: async d => { const id = tmp(); return grava(e => ({ ...e, decisoes: [{ ...d, id, criado_em: agora() }, ...e.decisoes] }), () => chama<Decisao>('POST', 'decisoes', d), (e, n) => ({ ...e, decisoes: e.decisoes.map(x => (x.id === id ? n : x)) })); },
      salvaInstrucao: async (agente, texto) => grava(e => { const i = { ...e.instrucoes }; if (texto.trim()) i[agente] = texto.trim(); else delete i[agente]; return { ...e, instrucoes: i }; }, () => chama('PUT', `instrucoes/${agente}`, { texto })),
      criaMemoria: async (agente, texto, origem = 'manual') => { const id = tmp(); return grava(e => ({ ...e, memorias: [{ id, agente, texto, origem, criado_em: agora() }, ...e.memorias] }), () => chama<Memoria>('POST', 'memorias', { agente, texto, origem }), (e, n) => ({ ...e, memorias: e.memorias.map(x => (x.id === id ? n : x)) })); },
      apagaMemoria: async id => { await grava(e => ({ ...e, memorias: e.memorias.filter(x => x.id !== id) }), () => chama('DELETE', `memorias/${id}`)); },
    };
  }, [estado, modo, aviso, grava]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEstado() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useEstado fora do EstadoProvider');
  return c;
}
