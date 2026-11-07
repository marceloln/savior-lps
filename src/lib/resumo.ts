// Resumos do estado do lab para as páginas da esquerda do diário. Só contas, sem tela.
import { FASES, type EstadoLab } from './dados';

export type Trofeu = { nome: string; meta: number; atual: number; txt: string };

export function trofeus(e: EstadoLab): Trofeu[] {
  const feitas = e.tarefas.filter(t => t.estado === 'feito').length;
  return [
    { nome: 'Primeira entrega', meta: 1, atual: feitas, txt: 'Concluir uma missão' },
    { nome: 'Semana redonda', meta: 10, atual: feitas, txt: 'Concluir dez missões' },
    { nome: 'Lab conversando', meta: 5, atual: e.conversas, txt: 'Cinco respostas de especialistas' },
    { nome: 'Decisão registrada', meta: 3, atual: e.decisoes.length, txt: 'Três decisões no registro' },
    { nome: 'Memória viva', meta: 5, atual: e.memorias.length, txt: 'Cinco notas na memória da equipe' },
    { nome: 'Ritual em dia', meta: 3, atual: e.reunioes.filter(r => r.status === 'feita').length, txt: 'Três reuniões com ata' },
  ];
}

/** Quantos clientes em cada etapa. Cliente sem projeto ainda está em conversa. */
export function clientesPorEtapa(e: EstadoLab): { etapa: string; n: number }[] {
  const etapas = ['Em conversa', ...FASES];
  const conta = new Map(etapas.map(x => [x, 0]));
  for (const c of e.clientes) {
    const etapa = e.projetos.some(p => p.cliente_id === c.id) ? FASES[c.fase] : 'Em conversa';
    conta.set(etapa, (conta.get(etapa) ?? 0) + 1);
  }
  return etapas.map(etapa => ({ etapa, n: conta.get(etapa) ?? 0 }));
}

/** Quem está fazendo algo agora, quem só tem fila e quem está livre. */
export function situacaoEquipe(e: EstadoLab, ids: string[]) {
  const fazendo = ids.filter(id => e.tarefas.some(t => t.agente === id && t.estado === 'fazendo'));
  const fila = ids.filter(id => !fazendo.includes(id) && e.tarefas.some(t => t.agente === id && t.estado === 'fila'));
  return { fazendo: fazendo.length, fila: fila.length, livres: ids.filter(id => !fazendo.includes(id) && !fila.includes(id)) };
}

/** Quem tem mais notas na memória, do maior para o menor. */
export function notasPorPessoa(e: EstadoLab): { agente: string; n: number }[] {
  const conta = new Map<string, number>();
  for (const m of e.memorias) conta.set(m.agente, (conta.get(m.agente) ?? 0) + 1);
  return [...conta].map(([agente, n]) => ({ agente, n })).sort((a, b) => b.n - a.n || a.agente.localeCompare(b.agente));
}
