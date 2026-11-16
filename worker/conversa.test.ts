import { describe, it, expect } from 'vitest';
import { montaPedido, sistemaDe, LIMITE_SKILLS } from './conversa';
import { EQUIPE } from '../src/lib/equipe';
import { CONTEUDOS } from '../src/lib/catalogo';
import { VINCULOS_BASE, skillsBase } from '../src/lib/skills';
import { perfilDe } from '../src/lib/perfis';

const ids = new Set(EQUIPE.map(e => e.id));
const de = (id: string) => EQUIPE.find(e => e.id === id)!;

describe('conversa', () => {
  it('aceita a conversa com quem está na equipe', () => {
    const r = montaPedido({ agente: 'lia', mensagens: [{ role: 'user', content: 'Por onde começo o diagnóstico?' }] }, ids);
    expect(r).toMatchObject({ ok: true, agente: 'lia' });
    if (r.ok) expect(r.messages).toHaveLength(1);
  });
  it('recusa especialista que não existe', () => {
    expect(montaPedido({ agente: 'ninguem', mensagens: [{ role: 'user', content: 'oi' }] }, ids)).toEqual({ ok: false, erro: 'Especialista desconhecido.' });
  });
  it('aceita especialista criado depois, que só existe no banco', () => {
    expect(montaPedido({ agente: 'gil-abc', mensagens: [{ role: 'user', content: 'oi' }] }, new Set(['gil-abc'])).ok).toBe(true);
  });
  it('recusa conversa que termina em resposta do especialista', () => {
    expect(montaPedido({ agente: 'lia', mensagens: [{ role: 'user', content: 'oi' }, { role: 'assistant', content: 'olá' }] }, ids).ok).toBe(false);
  });
  it('corta histórico longo e texto gigante', () => {
    const msgs = Array.from({ length: 41 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(9000) }));
    const r = montaPedido({ agente: 'rui', mensagens: msgs }, ids);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.messages.length).toBeLessThanOrEqual(20); expect(r.messages[0].content.length).toBe(4000); expect(r.messages[0].role).toBe('user'); }
  });
  it('a instrução nunca deixa inventar cliente', () => {
    expect(sistemaDe(de('bela'))).toContain('Nunca invente');
  });
  it('as skills entram nas instruções com nome e texto', () => {
    const daLia = skillsBase(CONTEUDOS).filter(k => k.para_todos || VINCULOS_BASE.lia.includes(k.id));
    const s = sistemaDe(de('lia'), daLia);
    expect(s).toContain('### Método V30');
    expect(s).toContain('Gravidade, Urgência e Tendência');
    expect(s).toContain('### Pesquisa com usuário');
    expect(sistemaDe({ id: 'gil-abc', nome: 'Gil', papel: 'Pricing', zona: 'dados' })).toContain('Você é Gil, pricing no Lab V30');
  });
  it('quem tem perfil fala com a própria voz: identidade, tom e o que domina entram nas instruções', () => {
    const s = sistemaDe(de('rosa'));
    expect(s).toContain(perfilDe('rosa')!.identidade);
    expect(s).toContain('Como fala.');
    expect(s).toContain('O que domina.');
    expect(sistemaDe({ id: 'gil-abc', nome: 'Gil', papel: 'Pricing', zona: 'dados' })).not.toContain('Seu perfil.');
  });
  it('cada um da equipe de partida recebe todas as suas skills de base inteiras, sem corte pelo teto', () => {
    const base = skillsBase(CONTEUDOS);
    for (const m of EQUIPE) {
      const dele = base.filter(k => k.para_todos || (VINCULOS_BASE[m.id] ?? []).includes(k.id));
      const s = sistemaDe(m, dele);
      for (const k of dele) expect(s, `${m.id}: ${k.id}`).toContain(k.conteudo.slice(-80));
    }
  });
  it('as skills juntas não passam do teto: as últimas ficam de fora inteiras', () => {
    const muitas = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, nome: `Skill ${i + 1}`, conteudo: 'x'.repeat(14000) }));
    const s = sistemaDe(de('lia'), muitas);
    expect(s).toContain('### Skill 1');
    expect(s).not.toContain('### Skill 8');
    expect(s.length).toBeLessThan(sistemaDe(de('lia')).length + LIMITE_SKILLS + 200);
  });
});
