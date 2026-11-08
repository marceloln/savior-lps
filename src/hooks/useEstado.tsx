import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { missoesIniciais, SEMENTE, hojeLocal, type Cliente, type Decisao, type EstadoLab, type Memoria, type Projeto, type Reuniao, type Tarefa } from '../lib/dados';

type Modo = 'carregando' | 'banco' | 'previa';
type Api = {
  estado: EstadoLab; modo: Modo; motivo: string | null; aviso: string | null; limpaAviso: () => void;
  criaTarefa: (t: Pick<Tarefa, 'agente' | 'titulo' | 'projeto_id'>) => Promise<void>;
  mudaTarefa: (id: number, m: Partial<Pick<Tarefa, 'estado' | 'titulo' | 'agente'>>) => Promise<void>;
  apagaTarefa: (id: number) => Promise<void>;
  mudaFase: (projeto: string, fase: number) => Promise<boolean>;
  criaCliente: (c: Pick<Cliente, 'setor' | 'situacao'>) => Promise<string | null>;
  criaProjeto: (cliente_id: string, nome: string) => Promise<string | null>;
  criaReuniao: (r: Pick<Reuniao, 'titulo' | 'pauta' | 'dia' | 'hora' | 'participantes' | 'projeto_id'>) => Promise<boolean>;
  gravaAta: (id: number, ata: string) => Promise<boolean>;
  mudaReuniao: (id: number, m: Partial<Pick<Reuniao, 'dia' | 'hora' | 'titulo'>>) => Promise<boolean>;
  apagaReuniao: (id: number) => Promise<boolean>;
  mudaDecisao: (id: number, m: Partial<Pick<Decisao, 'titulo' | 'contexto'>>) => Promise<boolean>;
  apagaDecisao: (id: number) => Promise<boolean>;
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
  const [motivo, setMotivo] = useState<string | null>(null);   // por que caiu em prévia, dito pelo servidor

  useEffect(() => {
    chama<EstadoLab>('GET', 'estado').then(e => { setEstado(e); setModo('banco'); }).catch((e: Error) => { setMotivo(e instanceof TypeError ? null : e.message); setModo('previa'); });
  }, []);

  // grava no banco; em prévia só muda na tela. Se o banco recusar, desfaz e avisa.
  const grava = useCallback(async <T,>(otimista: (e: EstadoLab) => EstadoLab, rede: () => Promise<T>, depois?: (e: EstadoLab, r: T) => EstadoLab) => {
    // enquanto o banco não respondeu, a leitura sobrescreveria a mudança: melhor recusar e avisar
    if (modo === 'carregando') { setAviso('O lab ainda está carregando. Tente de novo em um instante.'); return false; }
    let anterior: EstadoLab | null = null;
    setEstado(e => { anterior = e; return otimista(e); });
    if (modo !== 'banco') return true;
    try { const r = await rede(); if (depois) setEstado(e => depois(e, r)); return true; }
    catch (err) { if (anterior) setEstado(anterior); setAviso((err as Error).message); return false; }
  }, [modo]);

  const api = useMemo<Api>(() => {
    const tmp = () => -Math.floor(Math.random() * 1e9);
    return {
      estado, modo, motivo, aviso, limpaAviso: () => setAviso(null),
      criaTarefa: async t => {
        if (estado.tarefas.some(x => x.agente === t.agente && x.estado !== 'feito' && x.titulo.trim().toLowerCase() === t.titulo.trim().toLowerCase())) { setAviso('Essa missão já está aberta com essa pessoa.'); return; }
        const id = tmp(); await grava(e => ({ ...e, tarefas: [...e.tarefas, { ...t, id, detalhe: '', estado: 'fila' }] }), () => chama<Tarefa>('POST', 'tarefas', t), (e, r) => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? r : x)) })); },
      mudaTarefa: async (id, m) => { await grava(e => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `tarefas/${id}`, m)); },
      apagaTarefa: async id => { await grava(e => ({ ...e, tarefas: e.tarefas.filter(x => x.id !== id) }), () => chama('DELETE', `tarefas/${id}`)); },
      mudaFase: async (id, fase) => grava(e => {
        const p = e.projetos.find(x => x.id === id);
        return { ...e, projetos: e.projetos.map(x => (x.id === id ? { ...x, fase } : x)), clientes: e.clientes.map(c => (c.id === p?.cliente_id ? { ...c, fase } : c)) };
      }, () => chama('PATCH', `projetos/${id}`, { fase })),
      criaCliente: async c => {
        const id = 'novo-' + Date.now().toString(36);
        let final: string | null = id;
        const ok = await grava(e => ({ ...e, clientes: [...e.clientes, { ...c, id, fase: 0 }] }), () => chama<Cliente>('POST', 'clientes', c).then(r => { final = r.id; return r; }),
          (e, r) => ({ ...e, clientes: e.clientes.map(x => (x.id === id ? r : x)) }));
        return ok ? final : null;
      },
      criaProjeto: async (cliente_id, nome) => {
        const id = 'novo-' + Date.now().toString(36), inicio = hojeLocal();
        const iniciais: Tarefa[] = missoesIniciais(nome).map(t => ({ ...t, id: tmp(), detalhe: '', estado: 'fila', projeto_id: id }));
        let final: string | null = id;
        const ok = await grava(e => ({ ...e, projetos: [...e.projetos, { id, cliente_id, nome, fase: 0, dia: 1, mesa: null, inicio }], tarefas: [...e.tarefas, ...iniciais],
          clientes: e.clientes.map(c => (c.id === cliente_id ? { ...c, fase: 0 } : c)) }),
          () => chama<{ projeto: Projeto; missoes: Tarefa[] }>('POST', 'projetos', { cliente_id, nome }).then(r => { final = r.projeto.id; return r; }),
          (e, r) => { return { ...e, projetos: e.projetos.map(x => (x.id === id ? r.projeto : x)),
            tarefas: [...e.tarefas.filter(t => t.projeto_id !== id), ...r.missoes] }; });
        return ok ? final : null;
      },
      criaReuniao: async r => { const id = tmp(); return grava(e => ({ ...e, reunioes: [...e.reunioes, { ...r, id, status: 'agendada' as const, ata: '' }].sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)) }), () => chama<Reuniao>('POST', 'reunioes', r), (e, n) => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? n : x)) })); },
      gravaAta: async (id, ata) => grava(e => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? { ...x, ata, status: 'feita' } : x)) }), () => chama('PUT', `reunioes/${id}/ata`, { ata })),
      mudaReuniao: async (id, m) => grava(e => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? { ...x, ...m } : x)).sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)) }), () => chama('PATCH', `reunioes/${id}`, m)),
      apagaReuniao: async id => grava(e => ({ ...e, reunioes: e.reunioes.filter(x => x.id !== id), decisoes: e.decisoes.map(d => (d.reuniao_id === id ? { ...d, reuniao_id: null } : d)) }), () => chama('DELETE', `reunioes/${id}`)),
      mudaDecisao: async (id, m) => grava(e => ({ ...e, decisoes: e.decisoes.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `decisoes/${id}`, m)),
      apagaDecisao: async id => grava(e => ({ ...e, decisoes: e.decisoes.filter(x => x.id !== id) }), () => chama('DELETE', `decisoes/${id}`)),
      criaDecisao: async d => { const id = tmp(); return grava(e => ({ ...e, decisoes: [{ ...d, id, criado_em: agora() }, ...e.decisoes] }), () => chama<Decisao>('POST', 'decisoes', d), (e, n) => ({ ...e, decisoes: e.decisoes.map(x => (x.id === id ? n : x)) })); },
      salvaInstrucao: async (agente, texto) => grava(e => { const i = { ...e.instrucoes }; if (texto.trim()) i[agente] = texto.trim(); else delete i[agente]; return { ...e, instrucoes: i }; }, () => chama('PUT', `instrucoes/${agente}`, { texto })),
      criaMemoria: async (agente, texto, origem = 'manual') => { const id = tmp(); return grava(e => ({ ...e, memorias: [{ id, agente, texto, origem, criado_em: agora() }, ...e.memorias] }), () => chama<Memoria>('POST', 'memorias', { agente, texto, origem }), (e, n) => ({ ...e, memorias: e.memorias.map(x => (x.id === id ? n : x)) })); },
      apagaMemoria: async id => { await grava(e => ({ ...e, memorias: e.memorias.filter(x => x.id !== id) }), () => chama('DELETE', `memorias/${id}`)); },
    };
  }, [estado, modo, motivo, aviso, grava]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEstado() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useEstado fora do EstadoProvider');
  return c;
}
