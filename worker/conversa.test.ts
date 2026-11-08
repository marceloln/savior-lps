import { describe, it, expect } from 'vitest';
import { montaPedido, sistemaDe } from './conversa';

describe('conversa', () => {
  it('monta o pedido com o papel do especialista', () => {
    const r = montaPedido({ agente: 'lia', mensagens: [{ role: 'user', content: 'Por onde começo o diagnóstico?' }] });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.pedido.system).toContain('Lia'); expect(r.pedido.messages).toHaveLength(1); }
  });
  it('recusa especialista que não existe', () => {
    expect(montaPedido({ agente: 'ninguem', mensagens: [{ role: 'user', content: 'oi' }] })).toEqual({ ok: false, erro: 'Especialista desconhecido.' });
  });
  it('recusa conversa que termina em resposta do especialista', () => {
    const r = montaPedido({ agente: 'lia', mensagens: [{ role: 'user', content: 'oi' }, { role: 'assistant', content: 'olá' }] });
    expect(r.ok).toBe(false);
  });
  it('corta histórico longo e texto gigante', () => {
    const msgs = Array.from({ length: 41 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(9000) }));
    const r = montaPedido({ agente: 'rui', mensagens: msgs });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.pedido.messages.length).toBeLessThanOrEqual(20); expect(r.pedido.messages[0].content.length).toBe(4000); expect(r.pedido.messages[0].role).toBe('user'); }
  });
  it('a instrução nunca deixa inventar cliente', () => {
    expect(sistemaDe('bela')).toContain('Nunca invente');
  });
});
