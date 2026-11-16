import { describe, it, expect } from 'vitest';
import { SEMENTE } from './dados';
import { APARENCIAS, EQUIPE, agentesBase, type Agente } from './equipe';
import { ZONAS } from './lab';
import { CONVIDADOS, FUNCOES, bancoPorFuncao, bonecoLivre, chamada, convidadoDe, entraNoLab, idDoConvidado, noBanco, skillDoConvidado } from './convidados';
import { CONTEUDOS } from './catalogo';
import { EQUIPE as FIXOS } from './equipe';
import { partesDoPerfil, perfilDe, textoDoPerfil } from './perfis';
import * as V from '../../worker/validacao';

const base = agentesBase();
const SEM_DONO = APARENCIAS.filter(a => !EQUIPE.some(e => e.id === a));
const ativo = (id: string, m: Partial<Agente> = {}): Agente => {
  const r = chamada(id, base); if (!r.ok) throw new Error(r.erro);
  return { ...r.agente, ...m };
};

describe('catálogo de convidados', () => {
  it('tem sessenta e oito, com identificador e nome que não se repetem nem batem com a equipe de partida', () => {
    expect(CONVIDADOS).toHaveLength(68);
    expect(new Set(CONVIDADOS.map(c => c.id)).size).toBe(68);
    const nomes = [...EQUIPE.map(e => e.nome), ...CONVIDADOS.map(c => c.nome)].map(n => n.toLowerCase());
    expect(new Set(nomes).size).toBe(nomes.length);
    const papeis = CONVIDADOS.map(c => c.papel);
    expect(new Set(papeis).size).toBe(papeis.length);
  });
  it('cada um está numa das oito funções e nenhuma função tem menos de três pessoas', () => {
    expect(FUNCOES).toHaveLength(8);
    for (const c of CONVIDADOS) expect(FUNCOES.some(f => f.id === c.funcao), c.id).toBe(true);
    for (const f of FUNCOES) expect(CONVIDADOS.filter(c => c.funcao === f.id).length, f.id).toBeGreaterThanOrEqual(3);
  });
  it('cada um passa na mesma validação de um especialista e de uma skill criados pelos sócios', () => {
    for (const c of CONVIDADOS) {
      expect(c.id, c.id).toMatch(/^[a-z0-9-]+$/);
      expect(ZONAS.some(z => z.id === c.zona), c.id).toBe(true);
      for (const a of c.aparencias) expect(SEM_DONO, c.id).toContain(a);
      const a = V.novoAgente({ nome: c.nome, papel: c.papel, zona: c.zona, aparencia: c.aparencias[0] });
      expect(a.ok, c.id).toBe(true);
      const k = skillDoConvidado(c, CONTEUDOS[idDoConvidado(c)]), v = V.novaSkill(k);
      expect(v.ok && v.v.conteudo === k.conteudo && v.v.descricao === k.descricao, c.id).toBe(true);
    }
  });
  it('cada um diz quando chamar, tem frase, manias, origem, perfil e um método com texto completo', () => {
    for (const c of CONVIDADOS) {
      expect(c.chamar.length, c.id).toBeGreaterThan(20);
      expect(c.frase.length, c.id).toBeGreaterThan(10);
      expect(c.manias.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.origem.length, c.id).toBeGreaterThanOrEqual(1);
      expect(c.chamar.startsWith('Quando'), c.id).toBe(true);
      expect(c.perfil.identidade.length, c.id).toBeGreaterThan(120);
      expect(c.perfil.tom.length, c.id).toBeGreaterThanOrEqual(4);
      expect(c.perfil.aprende.length, c.id).toBeGreaterThanOrEqual(3);
      expect(CONTEUDOS[idDoConvidado(c)]?.length ?? 0, c.id).toBeGreaterThan(3000);
    }
  });
  it('o texto segue a regra da casa: sem travessão, sem aspas e sem número de resultado pronto', () => {
    for (const c of CONVIDADOS) {
      const tudo = [c.nome, c.papel, c.chamar, c.frase, ...c.manias, c.skill.nome, c.skill.descricao, c.perfil.identidade, ...c.perfil.tom, ...c.perfil.aprende].join(' ');
      expect(tudo, c.id).not.toMatch(/[—–"“”']/);
      expect(tudo, c.id).not.toMatch(/\d\s?%/);
    }
  });
});

describe('chamar um convidado', () => {
  it('entra como especialista que não é de partida, ativo, com boneco sem dono e a skill dele', () => {
    const r = chamada('mudanca', base, CONTEUDOS);
    expect(r.ok).toBe(true); if (!r.ok) return;
    expect(r.agente).toMatchObject({ id: 'conv-mudanca', nome: 'Helena', zona: 'planejamento', aparencia: 'vera', base: false, ativo: true, modelo: '' });
    expect(r.skill).toMatchObject({ id: 'conv-mudanca', nome: 'Gestão da mudança', para_todos: false });
    expect(r.skill.conteudo.split('\n').length).toBeGreaterThan(10);
  });
  it('recusa quem não existe e quem já está no lab', () => {
    expect(chamada('ninguem', base)).toMatchObject({ ok: false, status: 404 });
    expect(chamada('mudanca', [...base, ativo('mudanca')])).toMatchObject({ ok: false, status: 409, erro: 'Helena já está no lab.' });
  });
  it('recusa quando outra pessoa ativa já usa o nome', () => {
    const xara: Agente = { id: 'x', nome: 'helena', papel: 'Outra', zona: 'dados', aparencia: 'sol', modelo: '', base: false, ativo: true };
    expect(chamada('mudanca', [...base, xara])).toMatchObject({ ok: false, status: 409 });
    expect(chamada('mudanca', [...base, { ...xara, ativo: false }]).ok).toBe(true);
  });
  it('quem volta mantém o que os sócios ajustaram e pega um boneco livre', () => {
    const saiu = ativo('mudanca', { ativo: false, nome: 'Helena Prado', papel: 'Adoção', zona: 'cx', modelo: 'anthropic:claude-sonnet-5-5' });
    const ocupa = ativo('experimentos');   // Inês prefere o mesmo boneco de Helena
    expect(ocupa.aparencia).toBe('vera');
    const r = chamada('mudanca', [...base, saiu, ocupa]);
    expect(r.ok && r.agente).toMatchObject({ nome: 'Helena Prado', papel: 'Adoção', zona: 'cx', modelo: 'anthropic:claude-sonnet-5-5', aparencia: 'iris', ativo: true });
  });
  it('o boneco é o primeiro livre da preferência e, com todos ocupados, repete o primeiro', () => {
    const c = CONVIDADOS.find(x => x.id === 'mudanca')!;
    const usa = (aparencia: string, on = true): Agente => ({ id: 'u-' + aparencia, nome: aparencia, papel: 'p', zona: 'dados', aparencia, modelo: '', base: false, ativo: on });
    expect(bonecoLivre(c, base)).toBe('vera');
    expect(bonecoLivre(c, [...base, usa('vera')])).toBe('iris');
    expect(bonecoLivre(c, [...base, usa('vera', false)])).toBe('vera');
    expect(bonecoLivre(c, [...base, usa('vera'), usa('iris'), usa('sol')])).toBe('vera');
  });
  it('três mulheres e três homens cabem no lab ao mesmo tempo sem boneco repetido', () => {
    let equipe = base;
    for (const id of ['mudanca', 'psicologia', 'treinamento', 'recrutamento', 'suprimentos', 'comportamento']) equipe = [...equipe, (chamada(id, equipe) as { agente: Agente }).agente];
    const bonecos = equipe.filter(a => !a.base).map(a => a.aparencia);
    expect(new Set(bonecos).size).toBe(6);
  });
});

describe('banco e estado do lab', () => {
  it('o banco mostra só quem não está ativo', () => {
    expect(noBanco(base)).toHaveLength(CONVIDADOS.length);
    expect(noBanco([...base, ativo('mudanca')]).map(c => c.id)).not.toContain('mudanca');
    expect(noBanco([...base, ativo('mudanca', { ativo: false })])).toHaveLength(CONVIDADOS.length);
  });
  it('separa o banco por função, na ordem da tela, e some com a função em que todos já foram chamados', () => {
    const tudo = bancoPorFuncao(base);
    expect(tudo.map(f => f.id)).toEqual(FUNCOES.map(f => f.id));
    expect(tudo.flatMap(f => f.gente)).toHaveLength(CONVIDADOS.length);
    expect(tudo[0]).toMatchObject({ id: 'pessoas', nome: 'Pessoas e cultura' });
    const semEstrategia = [...base, ...CONVIDADOS.filter(c => c.funcao === 'estrategia').map(c => ativo(c.id))];
    expect(bancoPorFuncao(semEstrategia).map(f => f.id)).not.toContain('estrategia');
  });
  it('reconhece convidado pelo identificador do especialista', () => {
    expect(convidadoDe('conv-etnografia')?.nome).toBe('Joana');
    expect(convidadoDe('lia')).toBeNull();
    expect(convidadoDe('conv-nada')).toBeNull();
    expect(idDoConvidado(CONVIDADOS[0])).toBe('conv-mudanca');
  });
  it('ao entrar, põe a pessoa na equipe e liga à skill que já está na biblioteca, sem duplicar', () => {
    const r = chamada('realidade', SEMENTE.agentes); if (!r.ok) throw new Error(r.erro);
    expect(SEMENTE.skills.some(k => k.id === 'conv-realidade')).toBe(true);
    const um = entraNoLab(SEMENTE, r.agente, r.skill);
    expect(um.agentes).toHaveLength(SEMENTE.agentes.length + 1);
    expect(um.skills).toHaveLength(SEMENTE.skills.length);
    expect(um.vinculos['conv-realidade']).toEqual(['conv-realidade']);
    const editada = { ...r.skill, conteudo: 'Texto que um sócio reescreveu depois, do jeito dele.' };
    const dois = entraNoLab(um, { ...r.agente, aparencia: 'otavio' }, editada);
    expect(dois.agentes).toHaveLength(um.agentes.length);
    expect(dois.agentes.find(a => a.id === 'conv-realidade')?.aparencia).toBe('otavio');
    expect(dois.skills.filter(k => k.id === 'conv-realidade')).toEqual([editada]);
    expect(dois.vinculos['conv-realidade']).toEqual(['conv-realidade']);
    expect(SEMENTE.vinculos['conv-realidade']).toBeUndefined();
  });
  it('se os sócios apagaram a skill da biblioteca, o convidado traz o método de volta', () => {
    const r = chamada('realidade', SEMENTE.agentes); if (!r.ok) throw new Error(r.erro);
    const sem = { ...SEMENTE, skills: SEMENTE.skills.filter(k => k.id !== 'conv-realidade') };
    expect(entraNoLab(sem, r.agente, r.skill).skills.at(-1)?.id).toBe('conv-realidade');
  });
});

describe('perfil do especialista', () => {
  it('os dezessete da equipe fixa têm perfil com identidade, tom, competências, regras e o que guardam', () => {
    for (const m of FIXOS) {
      const p = perfilDe(m.id);
      expect(p, m.id).not.toBeNull();
      expect(p!.identidade.length, m.id).toBeGreaterThan(200);
      expect(p!.tom.length, m.id).toBeGreaterThanOrEqual(5);
      expect(p!.competencias?.length ?? 0, m.id).toBeGreaterThanOrEqual(8);
      expect(p!.regras?.length ?? 0, m.id).toBeGreaterThanOrEqual(4);
      expect(textoDoPerfil(p!), m.id).not.toMatch(/[—–"“”‘’'«»`%]/);
    }
  });
  it('convidado tem perfil, e quem os sócios criaram não tem', () => {
    expect(perfilDe('conv-mudanca')?.identidade.length).toBeGreaterThan(120);
    expect(perfilDe('especialista-novo-abc')).toBeNull();
  });
  it('o texto que vai para o modelo traz a identidade e cada parte com título, sem parte vazia', () => {
    const p = perfilDe('rosa')!, t = textoDoPerfil(p);
    expect(t.startsWith(p.identidade)).toBe(true);
    expect(partesDoPerfil(p).map(x => x.titulo)).toEqual(['Como fala', 'O que domina', 'O que não quebra', 'O que guarda de um projeto para o outro']);
    expect(partesDoPerfil(perfilDe('conv-mudanca')!).map(x => x.titulo)).toEqual(['Como fala', 'O que guarda de um projeto para o outro']);
    for (const x of partesDoPerfil(p)) expect(t).toContain(x.titulo + '.');
  });
});
