// Contas das ferramentas de acompanhamento: quadro geral, linha do tempo dos ciclos e calendário do mês. Sem tela.
import { FASES, somaDias, type EstadoLab, type Estado, type Reuniao, type Tarefa } from './dados';

export const COLUNAS_DO_QUADRO: { id: Estado; nome: string }[] = [{ id: 'fila', nome: 'Na fila' }, { id: 'fazendo', nome: 'Fazendo' }, { id: 'feito', nome: 'Feito' }];

/** Missões por estado, de todos os projetos ou de um só. Em 'lab' entram as que não têm projeto. */
export function quadro(e: EstadoLab, projeto: string | null | 'lab' = null): Record<Estado, Tarefa[]> {
  const cabe = (t: Tarefa) => projeto === null || (projeto === 'lab' ? !t.projeto_id : t.projeto_id === projeto);
  const de = (s: Estado) => e.tarefas.filter(t => t.estado === s && cabe(t));
  return { fila: de('fila'), fazendo: de('fazendo'), feito: de('feito') };
}

/** Ritmo de referência do ciclo de 30 dias: em que dias cada fase costuma correr. A fase real é a que o projeto marca. */
export const RITMO_DO_CICLO = [{ fase: 0, de: 1, ate: 7 }, { fase: 1, de: 8, ate: 14 }, { fase: 2, de: 15, ate: 26 }, { fase: 3, de: 27, ate: 30 }] as const;

const dias = (a: string, b: string) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);

export type LinhaProjeto = {
  id: string; nome: string; fase: string; inicio: string; fim: string;
  /** Posição do primeiro dia do ciclo dentro da janela, a partir de zero. */
  desloca: number;
  /** Dia do ciclo em que estamos, de 1 a 30. Zero se ainda não começou e 31 se já acabou. */
  dia: number;
  feitas: number; total: number;
  reunioes: { id: number; titulo: string; desloca: number; feita: boolean }[];
};
export type LinhaDoTempo = { de: string; dias: number; hoje: number; semanas: { desloca: number; rotulo: string }[]; projetos: LinhaProjeto[] };

/** Todos os projetos numa janela só, do primeiro início ao último fim de ciclo, com hoje e as reuniões de cada um. */
export function linhaDoTempo(e: EstadoLab, hoje: string): LinhaDoTempo {
  const comData = e.projetos.filter(p => p.inicio);
  if (!comData.length) return { de: hoje, dias: 30, hoje: 0, semanas: [], projetos: [] };
  const de = comData.map(p => p.inicio).sort()[0];
  const fimGeral = comData.map(p => somaDias(p.inicio, 29)).sort().at(-1)!;
  const total = dias(de, fimGeral) + 1;
  const semanas = Array.from({ length: Math.ceil(total / 7) }, (_, i) => {
    const d = new Date(somaDias(de, i * 7) + 'T12:00:00Z');
    return { desloca: i * 7, rotulo: d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' }) };
  });
  const projetos = comData.map(p => {
    const dele = e.tarefas.filter(t => t.projeto_id === p.id), n = dias(p.inicio, hoje) + 1;
    return {
      id: p.id, nome: p.nome, fase: FASES[p.fase] ?? FASES[0], inicio: p.inicio, fim: somaDias(p.inicio, 29), desloca: dias(de, p.inicio),
      dia: n < 1 ? 0 : n > 30 ? 31 : n, feitas: dele.filter(t => t.estado === 'feito').length, total: dele.length,
      reunioes: e.reunioes.filter(r => r.projeto_id === p.id).map(r => ({ id: r.id, titulo: r.titulo, desloca: dias(de, r.dia), feita: r.status === 'feita' })).filter(r => r.desloca >= 0 && r.desloca < total),
    };
  });
  return { de, dias: total, hoje: dias(de, hoje), semanas, projetos };
}

export type DiaDoMes = { data: string; dia: number; noMes: boolean; hoje: boolean; reunioes: Reuniao[]; marcos: string[] };

/** As semanas de um mês, de domingo a sábado, com as reuniões e o começo e o fim de ciclo de cada projeto. mes vai de 0 a 11. */
export function mesDoCalendario(e: EstadoLab, ano: number, mes: number, hoje: string): DiaDoMes[][] {
  const primeiro = new Date(Date.UTC(ano, mes, 1, 12)), inicio = somaDias(primeiro.toISOString().slice(0, 10), -primeiro.getUTCDay());
  const ultimo = new Date(Date.UTC(ano, mes + 1, 0, 12)), n = Math.ceil((primeiro.getUTCDay() + ultimo.getUTCDate()) / 7);
  return Array.from({ length: n }, (_, s) => Array.from({ length: 7 }, (_, d) => {
    const data = somaDias(inicio, s * 7 + d);
    const marcos = e.projetos.flatMap(p => !p.inicio ? [] : p.inicio === data ? [`Começa ${p.nome}`] : somaDias(p.inicio, 29) === data ? [`Fecha ${p.nome}`] : []);
    return { data, dia: Number(data.slice(8)), noMes: Number(data.slice(5, 7)) === mes + 1, hoje: data === hoje,
      reunioes: e.reunioes.filter(r => r.dia === data).sort((a, b) => a.hora.localeCompare(b.hora)), marcos };
  }));
}

/** Qual ferramenta cada tela do lab mostra. As chaves são as telas que a cena do Blender exporta. */
export const TELA_DA_FERRAMENTA: Record<string, 'quadro' | 'linha' | 'calendario'> = { trafego: 'quadro', dados: 'linha', reuniao: 'calendario' };

export type ResumoDasTelas = {
  quadro: { fila: number; fazendo: number; feito: number };
  /** Cada projeto como fração da janela: onde o ciclo começa, quanto dura e quanto já andou. */
  linha: { hoje: number; projetos: { de: number; dura: number; andou: number }[] };
  /** O mês de hoje, semana a semana: 0 dia comum, 1 dia com reunião, 2 hoje, -1 fora do mês. */
  calendario: number[][];
};

/** O mínimo que as miniaturas das telas precisam, sem texto: só contagem e posição. */
export function resumoDasTelas(e: EstadoLab, hoje: string): ResumoDasTelas {
  const q = quadro(e), l = linhaDoTempo(e, hoje);
  const mes = mesDoCalendario(e, Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)) - 1, hoje);
  return {
    quadro: { fila: q.fila.length, fazendo: q.fazendo.length, feito: q.feito.length },
    linha: { hoje: Math.min(1, Math.max(0, (l.hoje + 0.5) / l.dias)), projetos: l.projetos.map(p => ({ de: p.desloca / l.dias, dura: 30 / l.dias, andou: Math.min(30, Math.max(0, p.dia)) / 30 })) },
    calendario: mes.map(s => s.map(d => (!d.noMes ? -1 : d.hoje ? 2 : d.reunioes.length ? 1 : 0))),
  };
}
