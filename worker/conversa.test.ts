import { describe, it, expect } from 'vitest';
import { montaPedido, sistemaDe } from './conversa';
import { EQUIPE } from '../src/lib/equipe';
import { SKILLS_BASE } from '../src/lib/skills';

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
    const s = sistemaDe(de('lia'), SKILLS_BASE);
    expect(s).toContain('### Método V30');
    expect(s).toContain('Gravidade, Urgência e Tendência');
    expect(sistemaDe({ id: 'gil-abc', nome: 'Gil', papel: 'Pricing', zona: 'dados' })).toContain('Você é Gil, pricing no Lab V30');
  });
});
