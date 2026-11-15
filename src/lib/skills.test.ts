import { describe, it, expect } from 'vitest';
import { EQUIPE } from './equipe';
import { CONVIDADOS, FUNCOES } from './convidados';
import { CONTEUDOS } from './catalogo';
import { REFORCOS, VERSAO_DA_BASE, VINCULOS_BASE, baseQueFalta, conteudoQueMudou, gavetasDeSkills, buscaSkills, skillsBase } from './skills';
import impressoes from './impressoes-v2.json';
import * as V from '../../worker/validacao';

const PARTIDA = ['metodo-v30', 'tom-de-voz-v30', 'diagnostico-gut'];
const BASE = skillsBase(CONTEUDOS);
const REFORCO = REFORCOS.map(r => r.id);
const DO_BANCO = BASE.map(k => k.id).filter(id => id.startsWith('conv-'));
const SECOES = ['Missão', 'Quando entra', 'Regras que não se quebram', 'Como trabalha', 'O que entrega', 'Capacidades avançadas', 'Como comunica', 'O que aprende e guarda', 'Como saber que ficou bom', 'Cuidados'];

describe('skills de base', () => {
  it('não repetem identificador e cabem no limite de uma skill editada pelos sócios', () => {
    expect(new Set(BASE.map(k => k.id)).size).toBe(BASE.length);
    for (const k of BASE) {
      const v = V.novaSkill(k);
      expect(v.ok && v.v.conteudo === k.conteudo && v.v.descricao === k.descricao, k.id).toBe(true);
    }
  });
  it('todo vínculo aponta para alguém da equipe de partida e para uma skill que não vale para todos', () => {
    for (const [agente, lista] of Object.entries(VINCULOS_BASE)) {
      expect(EQUIPE.some(e => e.id === agente), agente).toBe(true);
      for (const k of lista) expect(BASE.find(s => s.id === k)?.para_todos, k).toBe(false);
    }
  });
  it('cada um dos dezessete da equipe de partida tem ao menos uma skill de ofício, e toda skill de ofício tem dono', () => {
    expect(REFORCO.length).toBeGreaterThanOrEqual(28);
    for (const m of EQUIPE) expect((VINCULOS_BASE[m.id] ?? []).some(k => REFORCO.includes(k)), m.id).toBe(true);
    for (const r of REFORCOS) { expect(r.para.length, r.id).toBeGreaterThanOrEqual(1); expect(r.origem.length, r.id).toBeGreaterThanOrEqual(1); }
    expect(VINCULOS_BASE).toMatchObject({ caio: ['descoberta-em-vendas'], bela: expect.arrayContaining(['estrategia-de-proposta', 'resumo-executivo']), rosa: expect.arrayContaining(['pesquisa-com-usuario']), lia: expect.arrayContaining(['diagnostico-gut', 'pesquisa-com-usuario']) });
  });
  it('sem o mapa de conteúdo, a lista vem leve: só as três de partida trazem texto', () => {
    const leves = skillsBase();
    expect(leves.map(k => k.id)).toEqual(BASE.map(k => k.id));
    expect(leves.filter(k => k.conteudo).map(k => k.id)).toEqual(PARTIDA);
  });
});

describe('conteúdo completo', () => {
  const completas = BASE.filter(k => !PARTIDA.includes(k.id));
  it('toda skill de ofício e de convidado tem texto, com as dez seções na ordem', () => {
    for (const k of completas) {
      expect(k.conteudo.length, k.id).toBeGreaterThan(0);
      expect([...k.conteudo.matchAll(/^## (.+)$/gm)].map(m => m[1]), k.id).toEqual(SECOES);
    }
  });
  it('nenhuma ficou rasa: ao menos seiscentas e cinquenta palavras, com capacidades avançadas e passos numerados', () => {
    for (const k of completas) {
      expect(k.conteudo.split(/\s+/).length, k.id).toBeGreaterThanOrEqual(650);
      const parte = (t: string) => k.conteudo.split('## ' + t + '\n')[1].split('\n## ')[0];
      expect(parte('Capacidades avançadas').split('\n').filter(l => l.startsWith('- ')).length, k.id).toBeGreaterThanOrEqual(6);
      expect(parte('Como trabalha').split('\n').filter(l => /^\d+\. /.test(l)).length, k.id).toBeGreaterThanOrEqual(3);
    }
  });
  it('o texto segue a regra da casa: sem travessão, sem aspas, sem emoji e sem número de resultado pronto', () => {
    for (const k of completas) {
      const tudo = [k.nome, k.descricao, k.conteudo].join(' ');
      expect(tudo, k.id).not.toMatch(/[—–"“”‘’'«»`]/);
      expect(tudo, k.id).not.toMatch(/%|por cento/);
      expect(tudo, k.id).not.toMatch(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u);
      expect(tudo, k.id).not.toMatch(/\b(genuinamente|honestamente)\b/i);
    }
  });
  it('o mapa de conteúdo não tem texto sem skill', () => {
    expect(Object.keys(CONTEUDOS).sort()).toEqual(completas.map(k => k.id).sort());
  });
});

describe('semente com versão', () => {
  it('banco vazio recebe todas as skills e todos os vínculos', () => {
    const f = baseQueFalta(0, CONTEUDOS);
    expect(f.skills).toEqual(BASE);
    expect(f.vinculos).toHaveLength(Object.values(VINCULOS_BASE).flat().length);
  });
  it('banco de antes das levas recebe o reforço e o método dos convidados, sem religar o que os sócios podem ter desligado', () => {
    const f = baseQueFalta(1, CONTEUDOS);
    expect(f.skills.map(k => k.id).sort()).toEqual([...REFORCO, ...DO_BANCO].sort());
    expect(f.vinculos).toContainEqual(['rui', 'conducao-de-projeto']);
    expect(f.vinculos.some(([, k]) => k === 'diagnostico-gut')).toBe(false);
  });
  it('banco da leva 2 recebe só o que é novo na leva 3, e a lista de texto a trocar cobre o que ele já tinha', () => {
    const f = baseQueFalta(2, CONTEUDOS), novas = f.skills.map(k => k.id);
    expect(novas.length).toBeGreaterThan(30);
    for (const id of novas) expect(id in impressoes, id).toBe(false);
    expect(novas).toContain('resumo-executivo');
    expect(f.vinculos).toContainEqual(['bela', 'resumo-executivo']);
    expect(f.vinculos.some(([, k]) => k === 'estrategia-de-proposta')).toBe(false);
    const troca = conteudoQueMudou(2, CONTEUDOS);
    expect(troca.map(t => t.skill.id).sort()).toEqual(Object.keys(impressoes).filter(id => !PARTIDA.includes(id)).sort());
    for (const t of troca) { expect(t.skill.conteudo.length, t.skill.id).toBeGreaterThan(t.tamanhoAntigo); expect(t.comecoAntigo.length, t.skill.id).toBeGreaterThan(20); }
  });
  it('banco vazio, banco de antes das levas e banco na versão atual não têm texto a trocar', () => {
    expect(conteudoQueMudou(0, CONTEUDOS)).toEqual([]);
    expect(conteudoQueMudou(1, CONTEUDOS)).toEqual([]);
    expect(conteudoQueMudou(VERSAO_DA_BASE, CONTEUDOS)).toEqual([]);
    expect(baseQueFalta(VERSAO_DA_BASE, CONTEUDOS)).toEqual({ skills: [], vinculos: [] });
  });
});

describe('biblioteca em gavetas', () => {
  it('o método de cada convidado já está na biblioteca, sem dono, para treinar quem os sócios quiserem', () => {
    expect(DO_BANCO).toHaveLength(CONVIDADOS.length);
    expect(BASE).toHaveLength(3 + REFORCO.length + CONVIDADOS.length);
    for (const id of DO_BANCO) expect(Object.values(VINCULOS_BASE).flat(), id).not.toContain(id);
  });
  it('separa em método da casa, ofício da equipe e uma gaveta por função, sem perder nem repetir skill', () => {
    const g = gavetasDeSkills(BASE);
    expect(g.map(x => x.id)).toEqual(['casa', 'equipe', ...FUNCOES.map(f => f.id)]);
    expect(g[0].skills.map(k => k.id)).toEqual(['metodo-v30', 'tom-de-voz-v30']);
    expect(g[1].skills).toHaveLength(1 + REFORCO.length);
    expect(g.find(x => x.id === 'receita')?.skills.map(k => k.nome)).toContain('Estratégia de contas');
    const todas = g.flatMap(x => x.skills.map(k => k.id));
    expect(todas).toHaveLength(BASE.length);
    expect(new Set(todas).size).toBe(BASE.length);
  });
  it('skill criada por um sócio cai no ofício da equipe e gaveta vazia não aparece', () => {
    const nova = { id: 'ata-do-ritual-abc', nome: 'Ata do ritual', descricao: '', conteudo: 'Como registrar a reunião da semana.', para_todos: false };
    expect(gavetasDeSkills([nova]).map(x => x.id)).toEqual(['equipe']);
    expect(gavetasDeSkills([{ ...nova, para_todos: true }]).map(x => x.id)).toEqual(['casa']);
    expect(gavetasDeSkills([])).toEqual([]);
  });
});

describe('buscaSkills', () => {
  it('devolve tudo com a busca vazia ou só com espaço', () => {
    expect(buscaSkills(BASE, '')).toHaveLength(BASE.length);
    expect(buscaSkills(BASE, '   ')).toHaveLength(BASE.length);
  });
  it('acha pelo nome sem ligar para acento e maiúscula', () => {
    const achadas = buscaSkills(BASE, 'PRECIFICACAO');
    expect(achadas.length).toBeGreaterThan(0);
    expect(achadas.some(k => k.id === 'precificacao')).toBe(true);
  });
  it('exige todas as palavras e devolve lista vazia quando nada casa', () => {
    expect(buscaSkills(BASE, 'precificacao zzzqqq')).toHaveLength(0);
  });
});
