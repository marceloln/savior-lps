import { describe, it, expect } from 'vitest';
import { EQUIPE } from './equipe';
import { CONVIDADOS, FUNCOES } from './convidados';
import { SKILLS_BASE, VERSAO_DA_BASE, VINCULOS_BASE, baseQueFalta, gavetasDeSkills } from './skills';
import * as V from '../../worker/validacao';

const PARTIDA = ['metodo-v30', 'tom-de-voz-v30', 'diagnostico-gut'];
const REFORCO = SKILLS_BASE.map(k => k.id).filter(id => !PARTIDA.includes(id) && !id.startsWith('conv-'));
const DO_BANCO = SKILLS_BASE.map(k => k.id).filter(id => id.startsWith('conv-'));

describe('skills de base', () => {
  it('não repetem identificador e cabem no limite de uma skill editada pelos sócios', () => {
    expect(new Set(SKILLS_BASE.map(k => k.id)).size).toBe(SKILLS_BASE.length);
    for (const k of SKILLS_BASE) {
      const v = V.novaSkill(k);
      expect(v.ok && v.v.conteudo === k.conteudo && v.v.descricao === k.descricao, k.id).toBe(true);
    }
  });
  it('todo vínculo aponta para alguém da equipe de partida e para uma skill que não vale para todos', () => {
    for (const [agente, lista] of Object.entries(VINCULOS_BASE)) {
      expect(EQUIPE.some(e => e.id === agente), agente).toBe(true);
      for (const k of lista) expect(SKILLS_BASE.find(s => s.id === k)?.para_todos, k).toBe(false);
    }
  });
  it('o reforço são dezoito skills e cada um dos dezessete da equipe de partida ganha ao menos uma', () => {
    expect(REFORCO).toHaveLength(18);
    for (const m of EQUIPE) expect((VINCULOS_BASE[m.id] ?? []).some(k => REFORCO.includes(k)), m.id).toBe(true);
    // toda skill de reforço tem dono: nenhuma fica solta na biblioteca
    for (const k of REFORCO) expect(Object.values(VINCULOS_BASE).flat(), k).toContain(k);
    expect(VINCULOS_BASE).toMatchObject({ caio: ['descoberta-em-vendas'], bela: ['estrategia-de-proposta'], rosa: ['pesquisa-com-usuario'], otto: ['precificacao', 'caso-de-negocio'] });
  });
  it('o reforço segue a regra da casa: sem travessão, sem aspas e sem número de resultado pronto', () => {
    for (const k of SKILLS_BASE.filter(s => REFORCO.includes(s.id))) {
      const tudo = [k.nome, k.descricao, k.conteudo].join(' ');
      expect(tudo, k.id).not.toMatch(/[—–"“”']/);
      expect(tudo, k.id).not.toMatch(/\d\s?%/);
    }
  });
});

describe('semente com versão', () => {
  it('banco vazio recebe todas as skills e todos os vínculos', () => {
    const f = baseQueFalta(0);
    expect(f.skills).toEqual(SKILLS_BASE);
    expect(f.vinculos).toHaveLength(Object.values(VINCULOS_BASE).flat().length);
  });
  it('banco de antes das levas recebe o reforço e o método dos convidados, sem religar o que os sócios podem ter desligado', () => {
    const f = baseQueFalta(1);
    expect(f.skills.map(k => k.id).sort()).toEqual([...REFORCO, ...DO_BANCO].sort());
    expect(f.vinculos).toHaveLength(18);
    expect(f.vinculos).toContainEqual(['rui', 'conducao-de-projeto']);
    expect(f.vinculos.some(([, k]) => k === 'diagnostico-gut')).toBe(false);
  });
  it('banco na versão atual não recebe nada', () => {
    expect(baseQueFalta(VERSAO_DA_BASE)).toEqual({ skills: [], vinculos: [] });
  });
});

describe('biblioteca em gavetas', () => {
  it('o método de cada convidado já está na biblioteca, sem dono, para treinar quem os sócios quiserem', () => {
    expect(DO_BANCO).toHaveLength(CONVIDADOS.length);
    expect(SKILLS_BASE).toHaveLength(3 + 18 + 37);
    for (const id of DO_BANCO) expect(Object.values(VINCULOS_BASE).flat(), id).not.toContain(id);
  });
  it('separa em método da casa, ofício da equipe e uma gaveta por função, sem perder nem repetir skill', () => {
    const g = gavetasDeSkills(SKILLS_BASE);
    expect(g.map(x => x.id)).toEqual(['casa', 'equipe', ...FUNCOES.map(f => f.id)]);
    expect(g[0].skills.map(k => k.id)).toEqual(['metodo-v30', 'tom-de-voz-v30']);
    expect(g[1].skills).toHaveLength(19);
    expect(g.find(x => x.id === 'receita')?.skills.map(k => k.nome)).toContain('Estratégia de contas');
    const todas = g.flatMap(x => x.skills.map(k => k.id));
    expect(todas).toHaveLength(SKILLS_BASE.length);
    expect(new Set(todas).size).toBe(SKILLS_BASE.length);
  });
  it('skill criada por um sócio cai no ofício da equipe e gaveta vazia não aparece', () => {
    const nova = { id: 'ata-do-ritual-abc', nome: 'Ata do ritual', descricao: '', conteudo: 'Como registrar a reunião da semana.', para_todos: false };
    expect(gavetasDeSkills([nova]).map(x => x.id)).toEqual(['equipe']);
    expect(gavetasDeSkills([{ ...nova, para_todos: true }]).map(x => x.id)).toEqual(['casa']);
    expect(gavetasDeSkills([])).toEqual([]);
  });
});
