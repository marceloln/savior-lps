import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { missoesIniciais, SEMENTE, hojeLocal, type Cliente, type Decisao, type EstadoLab, type Memoria, type MissaoProposta, type Pedido, type Projeto, type Reuniao, type Skill, type Tarefa } from '../lib/dados';
import { ORQUESTRADOR, type Agente } from '../lib/equipe';
import { entregaSimulada, planoSimulado, sinteseSimulada } from '../lib/simulado';
import { recadoDeErro } from '../lib/rede';

type Modo = 'carregando' | 'banco' | 'previa';
type Api = {
  estado: EstadoLab; modo: Modo; motivo: string | null; aviso: string | null; limpaAviso: () => void;
  /** Missões que um especialista está escrevendo neste momento. */
  executando: number[];
  /** Devolve true só quando a missão foi gravada. */
  criaTarefa: (t: Pick<Tarefa, 'agente' | 'titulo' | 'projeto_id'> & { detalhe?: string }) => Promise<boolean>;
  mudaTarefa: (id: number, m: Partial<Pick<Tarefa, 'estado' | 'titulo' | 'agente' | 'detalhe'>>) => Promise<boolean>;
  /** O especialista executa a missão com o modelo dele e a entrega fica guardada. Com ajuste, refaz a partir da versão anterior. */
  executa: (id: number, ajuste?: string) => Promise<boolean>;
  /** A orquestração propõe as missões de um pedido. Nada é gravado até o sócio aprovar. */
  planeja: (texto: string, projeto_id: string | null) => Promise<MissaoProposta[] | null>;
  criaPedido: (texto: string, projeto_id: string | null, missoes: MissaoProposta[]) => Promise<{ pedido: number; tarefas: number[] } | null>;
  sintetiza: (pedido: number) => Promise<boolean>;
  apagaPedido: (pedido: number) => Promise<boolean>;
  criaAgente: (a: Pick<Agente, 'nome' | 'papel' | 'zona' | 'aparencia' | 'modelo'>) => Promise<string | null>;
  mudaAgente: (id: string, m: Partial<Pick<Agente, 'nome' | 'papel' | 'zona' | 'modelo' | 'ativo'>>) => Promise<boolean>;
  criaSkill: (k: Pick<Skill, 'nome' | 'descricao' | 'conteudo' | 'para_todos'>, agente?: string) => Promise<boolean>;
  mudaSkill: (id: string, m: Partial<Pick<Skill, 'nome' | 'descricao' | 'conteudo' | 'para_todos'>>) => Promise<boolean>;
  apagaSkill: (id: string) => Promise<boolean>;
  vinculaSkills: (agente: string, skills: string[]) => Promise<boolean>;
  salvaModeloPadrao: (modelo: string) => Promise<boolean>;
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
const pausa = (ms: number) => new Promise(r => setTimeout(r, ms));
const NOVA = { detalhe: '', estado: 'fila' as const, pedido_id: null, entrega: '', modelo: '' };

async function chama<T>(metodo: string, rota: string, corpo?: unknown): Promise<T> {
  const r = await fetch('api/' + rota, { method: metodo, headers: corpo ? { 'content-type': 'application/json' } : undefined, body: corpo ? JSON.stringify(corpo) : undefined });
  const d = await r.json().catch(() => null);
  if (!r.ok || d === null) throw new Error((d as { erro?: string } | null)?.erro ?? 'O servidor do lab não respondeu.');
  return d as T;
}

/** Estado do lab lido do D1 pelo Worker. Sem servidor, roda em prévia com os exemplos e não grava nada. */
export function EstadoProvider({ children }: { children: ReactNode }) {
  const [estado, poeNaTela] = useState<EstadoLab>(SEMENTE);
  // o estado mais novo fica também numa referência: o pedido ao lab encadeia várias chamadas e cada uma precisa ler o que a anterior gravou
  const vivo = useRef(estado);
  // versao conta cada mudança feita aqui e emCurso conta o que está indo para o servidor: a releitura só entra se nada mudou no meio
  const versao = useRef(0), emCurso = useRef(0);
  const setEstado = useCallback((f: EstadoLab | ((e: EstadoLab) => EstadoLab)) => { vivo.current = typeof f === 'function' ? f(vivo.current) : f; versao.current++; poeNaTela(vivo.current); }, []);
  const ocupa = useCallback(async <T,>(f: () => Promise<T>): Promise<T> => { emCurso.current++; try { return await f(); } finally { emCurso.current--; } }, []);
  // um envio por tipo de registro de cada vez: o segundo clique enquanto o primeiro grava não cria nada
  const travas = useRef(new Set<string>());
  const trava = useCallback(async <T,>(chave: string, recusa: T, f: () => Promise<T>): Promise<T> => {
    if (travas.current.has(chave)) return recusa;
    travas.current.add(chave);
    try { return await f(); } finally { travas.current.delete(chave); }
  }, []);
  const [modo, setModo] = useState<Modo>('carregando');
  const [aviso, setAviso] = useState<string | null>(null);
  const [executando, setExecutando] = useState<number[]>([]);
  const [motivo, setMotivo] = useState<string | null>(null);   // por que caiu em prévia, dito pelo servidor

  useEffect(() => {
    chama<EstadoLab>('GET', 'estado').then(e => { setEstado(e); setModo('banco'); }).catch((e: Error) => { setMotivo(e instanceof TypeError ? null : e.message); setModo('previa'); });
  }, []);

  // o lab é de várias pessoas e várias abas: relê ao voltar para a aba e a cada minuto, sem passar por cima do que está sendo gravado
  useEffect(() => {
    if (modo !== 'banco') return;
    const rele = async () => {
      if (document.visibilityState !== 'visible' || emCurso.current > 0) return;
      const v = versao.current;
      try { const e = await chama<EstadoLab>('GET', 'estado'); if (versao.current === v && emCurso.current === 0) setEstado(e); }
      catch { /* fica com o que já está na tela e tenta de novo no próximo minuto */ }
    };
    const relogio = setInterval(rele, 60_000);
    document.addEventListener('visibilitychange', rele);
    return () => { clearInterval(relogio); document.removeEventListener('visibilitychange', rele); };
  }, [modo, setEstado]);

  // grava no banco; em prévia só muda na tela. Se o banco recusar, desfaz e avisa.
  const grava = useCallback(async <T,>(otimista: (e: EstadoLab) => EstadoLab, rede: () => Promise<T>, depois?: (e: EstadoLab, r: T) => EstadoLab) => {
    // enquanto o banco não respondeu, a leitura sobrescreveria a mudança: melhor recusar e avisar
    if (modo === 'carregando') { setAviso('O lab ainda está carregando. Tente de novo em um instante.'); return false; }
    let anterior: EstadoLab | null = null;
    setEstado(e => { anterior = e; return otimista(e); });
    if (modo !== 'banco') return true;
    try { const r = await ocupa(rede); if (depois) setEstado(e => depois(e, r)); return true; }
    catch (err) {
      setAviso(recadoDeErro(err));
      // a foto de antes pode estar velha se outra coisa mudou nesse meio tempo: a verdade é o banco. Só sem rede volta a foto.
      try { setEstado(await chama<EstadoLab>('GET', 'estado')); } catch { if (anterior) setEstado(anterior); }
      return false;
    }
  }, [modo, setEstado, ocupa]);

  const api = useMemo<Api>(() => {
    const tmp = () => -Math.floor(Math.random() * 1e9);
    return {
      estado, modo, motivo, aviso, executando, limpaAviso: () => setAviso(null),
      criaTarefa: t => trava('tarefa', false, async () => {
        if (vivo.current.tarefas.some(x => x.agente === t.agente && x.estado !== 'feito' && x.titulo.trim().toLowerCase() === t.titulo.trim().toLowerCase())) { setAviso('Essa missão já está aberta com essa pessoa.'); return false; }
        const id = tmp(); return grava(e => ({ ...e, tarefas: [...e.tarefas, { ...NOVA, ...t, id }] }), () => chama<Tarefa>('POST', 'tarefas', t), (e, r) => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? r : x)) })); }),
      mudaTarefa: async (id, m) => grava(e => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `tarefas/${id}`, m)),
      apagaTarefa: async id => { await grava(e => ({ ...e, tarefas: e.tarefas.filter(x => x.id !== id) }), () => chama('DELETE', `tarefas/${id}`)); },
      mudaFase: async (id, fase) => grava(e => {
        const p = e.projetos.find(x => x.id === id);
        return { ...e, projetos: e.projetos.map(x => (x.id === id ? { ...x, fase } : x)), clientes: e.clientes.map(c => (c.id === p?.cliente_id ? { ...c, fase } : c)) };
      }, () => chama('PATCH', `projetos/${id}`, { fase })),
      criaCliente: c => trava('cliente', null, async () => {
        const id = 'novo-' + Date.now().toString(36);
        let final: string | null = id;
        const ok = await grava(e => ({ ...e, clientes: [...e.clientes, { ...c, id, fase: 0 }] }), () => chama<Cliente>('POST', 'clientes', c).then(r => { final = r.id; return r; }),
          (e, r) => ({ ...e, clientes: e.clientes.map(x => (x.id === id ? r : x)) }));
        return ok ? final : null;
      }),
      criaProjeto: (cliente_id, nome) => trava('projeto', null, async () => {
        const id = 'novo-' + Date.now().toString(36), inicio = hojeLocal();
        const iniciais: Tarefa[] = missoesIniciais(nome).map(t => ({ ...NOVA, ...t, id: tmp(), projeto_id: id }));
        let final: string | null = id;
        const ok = await grava(e => ({ ...e, projetos: [...e.projetos, { id, cliente_id, nome, fase: 0, dia: 1, mesa: null, inicio }], tarefas: [...e.tarefas, ...iniciais],
          clientes: e.clientes.map(c => (c.id === cliente_id ? { ...c, fase: 0 } : c)) }),
          () => chama<{ projeto: Projeto; missoes: Tarefa[] }>('POST', 'projetos', { cliente_id, nome }).then(r => { final = r.projeto.id; return r; }),
          (e, r) => { return { ...e, projetos: e.projetos.map(x => (x.id === id ? r.projeto : x)),
            tarefas: [...e.tarefas.filter(t => t.projeto_id !== id), ...r.missoes] }; });
        return ok ? final : null;
      }),
      criaReuniao: r => trava('reuniao', false, async () => { const id = tmp(); return grava(e => ({ ...e, reunioes: [...e.reunioes, { ...r, id, status: 'agendada' as const, ata: '' }].sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)) }), () => chama<Reuniao>('POST', 'reunioes', r), (e, n) => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? n : x)) })); }),
      gravaAta: (id, ata) => trava('ata', false, () => grava(e => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? { ...x, ata, status: 'feita' } : x)) }), () => chama('PUT', `reunioes/${id}/ata`, { ata }))),
      mudaReuniao: async (id, m) => grava(e => ({ ...e, reunioes: e.reunioes.map(x => (x.id === id ? { ...x, ...m } : x)).sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)) }), () => chama('PATCH', `reunioes/${id}`, m)),
      apagaReuniao: async id => grava(e => ({ ...e, reunioes: e.reunioes.filter(x => x.id !== id), decisoes: e.decisoes.map(d => (d.reuniao_id === id ? { ...d, reuniao_id: null } : d)) }), () => chama('DELETE', `reunioes/${id}`)),
      mudaDecisao: async (id, m) => grava(e => ({ ...e, decisoes: e.decisoes.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `decisoes/${id}`, m)),
      apagaDecisao: async id => grava(e => ({ ...e, decisoes: e.decisoes.filter(x => x.id !== id) }), () => chama('DELETE', `decisoes/${id}`)),
      criaDecisao: d => trava('decisao', false, async () => { const id = tmp(); return grava(e => ({ ...e, decisoes: [{ ...d, id, criado_em: agora() }, ...e.decisoes] }), () => chama<Decisao>('POST', 'decisoes', d), (e, n) => ({ ...e, decisoes: e.decisoes.map(x => (x.id === id ? n : x)) })); }),
      salvaInstrucao: async (agente, texto) => grava(e => { const i = { ...e.instrucoes }; if (texto.trim()) i[agente] = texto.trim(); else delete i[agente]; return { ...e, instrucoes: i }; }, () => chama('PUT', `instrucoes/${agente}`, { texto })),
      criaMemoria: (agente, texto, origem = 'manual') => trava('memoria', false, async () => { const id = tmp(); return grava(e => ({ ...e, memorias: [{ id, agente, texto, origem, criado_em: agora() }, ...e.memorias] }), () => chama<Memoria>('POST', 'memorias', { agente, texto, origem }), (e, n) => ({ ...e, memorias: e.memorias.map(x => (x.id === id ? n : x)) })); }),
      executa: async (id, ajuste) => {
        const t = vivo.current.tarefas.find(x => x.id === id); if (!t) return false;
        const antes = t.estado, titulo = t.titulo, dono = t.agente;
        const poe = (m: Partial<Tarefa>) => setEstado(e => ({ ...e, tarefas: e.tarefas.map(x => (x.id === id ? { ...x, ...m } : x)) }));
        poe({ estado: 'fazendo' });
        setExecutando(l => [...l, id]);
        try { return await ocupa(roda); } finally { setExecutando(l => l.filter(x => x !== id)); }
        async function roda() {
        if (modo !== 'banco') {   // prévia: mostra o fluxo com uma entrega que se declara simulada
          await pausa(1400);
          const a = vivo.current.agentes.find(x => x.id === dono);
          poe({ estado: 'feito', entrega: entregaSimulada(a?.nome ?? 'O especialista', a?.papel ?? 'especialista', titulo), modelo: 'simulado:previa' });
          return true;
        }
        try { poe(await chama<Tarefa>('POST', `tarefas/${id}/executar`, { ajuste: ajuste ?? '' })); return true; }
        catch (err) { poe({ estado: antes }); setAviso(recadoDeErro(err)); return false; }
        }
      },
      planeja: async (texto, projeto_id) => {
        if (modo !== 'banco') { await pausa(900); return planoSimulado(texto, vivo.current.agentes.filter(a => a.ativo && a.id !== ORQUESTRADOR)); }
        try { return (await ocupa(() => chama<{ missoes: MissaoProposta[] }>('POST', 'pedidos/plano', { texto, projeto_id }))).missoes; }
        catch (err) { setAviso(recadoDeErro(err)); return null; }
      },
      criaPedido: async (texto, projeto_id, missoes) => {
        if (modo !== 'banco') {
          const pedido = Math.max(0, ...vivo.current.pedidos.map(p => p.id)) + 1;
          const novas: Tarefa[] = missoes.map(m => ({ ...NOVA, ...m, id: tmp(), projeto_id, pedido_id: pedido }));
          setEstado(e => ({ ...e, pedidos: [{ id: pedido, texto, projeto_id, estado: 'andando', sintese: '', criado_em: agora() }, ...e.pedidos], tarefas: [...e.tarefas, ...novas] }));
          return { pedido, tarefas: novas.map(t => t.id) };
        }
        try {
          const r = await ocupa(() => chama<{ pedido: Pedido; missoes: Tarefa[] }>('POST', 'pedidos', { texto, projeto_id, missoes }));
          setEstado(e => ({ ...e, pedidos: [r.pedido, ...e.pedidos], tarefas: [...e.tarefas, ...r.missoes] }));
          return { pedido: r.pedido.id, tarefas: r.missoes.map(t => t.id) };
        } catch (err) { setAviso(recadoDeErro(err)); return null; }
      },
      sintetiza: async id => {
        const poe = (m: Partial<Pedido>) => setEstado(e => ({ ...e, pedidos: e.pedidos.map(p => (p.id === id ? { ...p, ...m } : p)) }));
        if (modo !== 'banco') {
          await pausa(1200);
          setEstado(e => {
            const ped = e.pedidos.find(p => p.id === id); if (!ped) return e;
            const partes = e.tarefas.filter(t => t.pedido_id === id).map(t => ({ nome: e.agentes.find(a => a.id === t.agente)?.nome ?? 'Colega', titulo: t.titulo }));
            return { ...e, pedidos: e.pedidos.map(p => (p.id === id ? { ...p, estado: 'entregue', sintese: sinteseSimulada(ped.texto, partes) } : p)) };
          });
          return true;
        }
        try { poe(await ocupa(() => chama<Pedido>('POST', `pedidos/${id}/sintese`))); return true; }
        catch (err) { setAviso(recadoDeErro(err)); return false; }
      },
      apagaPedido: async id => grava(e => ({ ...e, pedidos: e.pedidos.filter(p => p.id !== id), tarefas: e.tarefas.filter(t => t.pedido_id !== id || t.entrega).map(t => (t.pedido_id === id ? { ...t, pedido_id: null } : t)) }), () => chama('DELETE', `pedidos/${id}`)),
      criaAgente: a => trava('agente', null, async () => {
        const id = 'novo-' + Date.now().toString(36); let final: string | null = id;
        const ok = await grava(e => ({ ...e, agentes: [...e.agentes, { ...a, id, base: false, ativo: true }] }), () => chama<Agente>('POST', 'agentes', a).then(r => { final = r.id; return r; }),
          (e, r) => ({ ...e, agentes: e.agentes.map(x => (x.id === id ? r : x)) }));
        return ok ? final : null;
      }),
      mudaAgente: async (id, m) => grava(e => ({ ...e, agentes: e.agentes.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `agentes/${id}`, m)),
      criaSkill: (k, agente) => trava('skill', false, async () => {
        const id = 'nova-' + Date.now().toString(36);
        const liga = (e: EstadoLab, sid: string) => (agente && !k.para_todos ? { ...e.vinculos, [agente]: [...(e.vinculos[agente] ?? []).filter(x => x !== id), sid] } : e.vinculos);
        return grava(e => ({ ...e, skills: [...e.skills, { ...k, id }], vinculos: liga(e, id) }), () => chama<Skill>('POST', 'skills', { ...k, agente }),
          (e, r) => ({ ...e, skills: e.skills.map(x => (x.id === id ? r : x)), vinculos: liga(e, r.id) }));
      }),
      mudaSkill: async (id, m) => grava(e => ({ ...e, skills: e.skills.map(x => (x.id === id ? { ...x, ...m } : x)) }), () => chama('PATCH', `skills/${id}`, m)),
      apagaSkill: async id => grava(e => ({ ...e, skills: e.skills.filter(x => x.id !== id), vinculos: Object.fromEntries(Object.entries(e.vinculos).map(([a, l]) => [a, l.filter(x => x !== id)])) }), () => chama('DELETE', `skills/${id}`)),
      vinculaSkills: async (agente, skills) => grava(e => ({ ...e, vinculos: { ...e.vinculos, [agente]: skills } }), () => chama('PUT', `agentes/${agente}/skills`, { skills })),
      salvaModeloPadrao: async modelo => grava(e => ({ ...e, modeloPadrao: modelo }), () => chama('PUT', 'config/modelo', { modelo })),
      apagaMemoria: async id => { await grava(e => ({ ...e, memorias: e.memorias.filter(x => x.id !== id) }), () => chama('DELETE', `memorias/${id}`)); },
    };
  }, [estado, modo, motivo, aviso, executando, grava, setEstado, ocupa, trava]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEstado() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useEstado fora do EstadoProvider');
  return c;
}
