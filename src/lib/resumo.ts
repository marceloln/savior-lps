// Resumos do estado do lab para as páginas da esquerda do diário. Só contas, sem tela.
import { FASES, diaDoCiclo, type Decisao, type EstadoLab, type Reuniao } from './dados';

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

/** Reuniões que ainda vão acontecer, da mais próxima para a mais distante. */
export function proximasReunioes(e: EstadoLab): Reuniao[] {
  return e.reunioes.filter(r => r.status === 'agendada').sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora) || a.id - b.id);
}

/** Decisões da mais nova para a mais antiga. */
export function decisoesRecentes(e: EstadoLab): Decisao[] {
  return [...e.decisoes].sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id);
}

/** Uma linha de bloco da página da esquerda: o nome, o valor e, quando faz sentido, a fração para a barrinha. */
export type Linha = { id: string; rotulo: string; valor: string; parte?: number };
type Quem = { id: string; nome: string };
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Missões feitas sobre o total, por projeto. Missão sem projeto fica de fora. */
export function progressoPorProjeto(e: EstadoLab): Linha[] {
  return e.projetos.map(p => {
    const dele = e.tarefas.filter(t => t.projeto_id === p.id), feitas = dele.filter(t => t.estado === 'feito').length;
    return { id: p.id, rotulo: p.nome, valor: `${feitas} de ${dele.length}`, parte: dele.length ? feitas / dele.length : 0 };
  }).filter(l => l.valor !== '0 de 0');
}

/** Quem tem mais missão aberta, na fila ou fazendo. Quem está livre não entra. */
export function cargaDaEquipe(e: EstadoLab, quem: Quem[], n = 4): Linha[] {
  const abertas = quem.map(q => ({ q, n: e.tarefas.filter(t => t.agente === q.id && t.estado !== 'feito').length })).filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const max = abertas[0]?.n ?? 1;
  return abertas.slice(0, n).map(x => ({ id: x.q.id, rotulo: x.q.nome, valor: plural(x.n, 'aberta', 'abertas'), parte: x.n / max }));
}

/** Os pedidos mais recentes, do mais novo para o mais velho. */
export function ultimosPedidos(e: EstadoLab, n = 3): Linha[] {
  return [...e.pedidos].sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, n)
    .map(p => ({ id: String(p.id), rotulo: p.texto, valor: p.estado === 'entregue' ? 'Entregue' : 'Andando' }));
}

/** Skills com mais gente treinada. As que valem para todos ficam de fora, porque todo mundo já tem. */
export function skillsMaisTreinadas(e: EstadoLab, n = 4): Linha[] {
  const conta = new Map<string, number>();
  for (const ids of Object.values(e.vinculos)) for (const id of ids) conta.set(id, (conta.get(id) ?? 0) + 1);
  const lista = e.skills.filter(k => !k.para_todos && conta.get(k.id)).map(k => ({ k, n: conta.get(k.id)! })).sort((a, b) => b.n - a.n || a.k.nome.localeCompare(b.k.nome));
  const max = lista[0]?.n ?? 1;
  return lista.slice(0, n).map(x => ({ id: x.k.id, rotulo: x.k.nome, valor: plural(x.n, 'pessoa', 'pessoas'), parte: x.n / max }));
}

/** Quantas decisões cada projeto tem. As sem projeto vêm no fim. */
export function decisoesPorProjeto(e: EstadoLab): Linha[] {
  const linhas = e.projetos.map(p => ({ id: p.id, rotulo: p.nome, valor: String(e.decisoes.filter(d => d.projeto_id === p.id).length) })).filter(l => l.valor !== '0');
  const soltas = e.decisoes.filter(d => !d.projeto_id || !e.projetos.some(p => p.id === d.projeto_id)).length;
  return soltas ? [...linhas, { id: '', rotulo: 'Sem projeto', valor: String(soltas) }] : linhas;
}

/** Quem da equipe ainda não tem nenhuma nota na memória. */
export function semNota(e: EstadoLab, quem: Quem[]): Linha[] {
  const com = new Set(e.memorias.map(m => m.agente));
  return quem.filter(q => !com.has(q.id)).map(q => ({ id: q.id, rotulo: q.nome, valor: '' }));
}

/** Em que dia do ciclo de 30 cada projeto está. */
export function projetosEmCiclo(e: EstadoLab, hoje: string): Linha[] {
  return e.projetos.map(p => { const d = diaDoCiclo(p.inicio, hoje); return { id: p.id, rotulo: p.nome, valor: `dia ${d} de 30`, parte: d / 30 }; });
}
