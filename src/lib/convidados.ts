// Banco de convidados: especialistas que não estão na equipe de partida e que um sócio chama quando o projeto pede.
// O texto mora em convidados.json. O método de cada um foi reescrito a partir do repositório aberto agency-agents (MIT). Crédito em docs/convidados.md.
import dados from './convidados.json';
import type { EstadoLab, Skill } from './dados';
import type { Agente } from './equipe';

export type Convidado = {
  id: string; nome: string; papel: string; zona: string;
  /** Em que frente do banco a pessoa aparece. */
  funcao: string;
  /** Bonecos que combinam com a pessoa, em ordem de preferência. */
  aparencias: string[];
  /** Em que situação vale chamar. Uma linha, para o cartão do banco. */
  chamar: string;
  frase: string; manias: string[];
  /** Arquivos do agency-agents que serviram de ponto de partida. */
  origem: string[];
  skill: { nome: string; descricao: string; conteudo: string[] };
};

export const CONVIDADOS = dados as Convidado[];

/** As frentes do banco, na ordem em que aparecem na tela. */
export const FUNCOES: { id: string; nome: string }[] = [
  { id: 'pessoas', nome: 'Pessoas e cultura' }, { id: 'operacao', nome: 'Operação e rede' },
  { id: 'receita', nome: 'Vendas e receita' }, { id: 'marketing', nome: 'Marketing e conteúdo' },
  { id: 'dados', nome: 'Dados e finanças' }, { id: 'risco', nome: 'Risco e conformidade' },
  { id: 'produto', nome: 'Produto e tecnologia' }, { id: 'estrategia', nome: 'Estratégia e gestão' },
];

const PREFIXO = 'conv-';
/** O convidado vira especialista e skill com o mesmo identificador, sempre igual, para voltar ao lab com o que já aprendeu. */
export const idDoConvidado = (c: Convidado) => PREFIXO + c.id;
export const convidadoDe = (agente: string): Convidado | null => CONVIDADOS.find(c => PREFIXO + c.id === agente) ?? null;
export const skillDoConvidado = (c: Convidado): Skill => ({ id: idDoConvidado(c), nome: c.skill.nome, descricao: c.skill.descricao, conteudo: c.skill.conteudo.join('\n'), para_todos: false });

/** Quem está no banco agora: os convidados que não estão ativos na equipe. */
export const noBanco = (agentes: Agente[]): Convidado[] => CONVIDADOS.filter(c => !agentes.some(a => a.ativo && a.id === idDoConvidado(c)));

/** O banco de agora separado por função. Função em que todo mundo já foi chamado não aparece. */
export function bancoPorFuncao(agentes: Agente[]): { id: string; nome: string; gente: Convidado[] }[] {
  const banco = noBanco(agentes);
  return FUNCOES.map(f => ({ ...f, gente: banco.filter(c => c.funcao === f.id) })).filter(f => f.gente.length > 0);
}

/** O boneco do convidado: o primeiro da preferência dele que ninguém ativo usa. Com todos ocupados, repete o primeiro. */
export function bonecoLivre(c: Convidado, agentes: Agente[]): string {
  const emUso = new Set(agentes.filter(a => a.ativo).map(a => a.aparencia));
  return c.aparencias.find(a => !emUso.has(a)) ?? c.aparencias[0];
}

export type Chamada = { ok: true; agente: Agente; skill: Skill } | { ok: false; erro: string; status: number };

/** Decide a chamada: devolve o especialista como ele entra no lab, ou o motivo de não entrar. */
export function chamada(id: string, agentes: Agente[]): Chamada {
  const c = CONVIDADOS.find(x => x.id === id);
  if (!c) return { ok: false, erro: 'Esse convidado não está no banco.', status: 404 };
  const aid = idDoConvidado(c), antes = agentes.find(a => a.id === aid);
  if (antes?.ativo) return { ok: false, erro: `${antes.nome} já está no lab.`, status: 409 };
  // quem volta mantém o nome, o papel, a sala e o modelo que os sócios ajustaram da outra vez
  const nome = antes?.nome ?? c.nome;
  if (agentes.some(a => a.ativo && a.id !== aid && a.nome.toLowerCase() === nome.toLowerCase())) return { ok: false, erro: 'Já existe alguém com esse nome no lab.', status: 409 };
  const agente: Agente = { id: aid, nome, papel: antes?.papel ?? c.papel, zona: antes?.zona ?? c.zona, aparencia: bonecoLivre(c, agentes), modelo: antes?.modelo ?? '', base: false, ativo: true };
  return { ok: true, agente, skill: skillDoConvidado(c) };
}

/** O estado do lab depois que o convidado entra: ele na equipe, a skill na biblioteca e os dois ligados. */
export function entraNoLab(e: EstadoLab, a: Agente, k: Skill): EstadoLab {
  return {
    ...e,
    agentes: e.agentes.some(x => x.id === a.id) ? e.agentes.map(x => (x.id === a.id ? a : x)) : [...e.agentes, a],
    skills: e.skills.some(x => x.id === k.id) ? e.skills.map(x => (x.id === k.id ? k : x)) : [...e.skills, k],
    vinculos: { ...e.vinculos, [a.id]: [...new Set([...(e.vinculos[a.id] ?? []), k.id])] },
  };
}
