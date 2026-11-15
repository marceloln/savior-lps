import { describe, it, expect } from 'vitest';
import { MODELOS_DE_BRIEFING, PULADO, clienteDoBriefing, falasDoBriefing, modeloDe, pedeExemplo, pedidoDoBriefing, proximoPasso, resumoDoBriefing } from './briefing';

const diag = modeloDe('diagnostico')!;

describe('briefing guiado', () => {
  it('todo modelo tem roteiro com ids únicos, direcionamento em cada passo e termina no prazo opcional', () => {
    for (const m of MODELOS_DE_BRIEFING) {
      expect(new Set(m.passos.map(p => p.id)).size).toBe(m.passos.length);
      for (const p of m.passos) expect(p.guia.length).toBeGreaterThan(20);
      expect(m.passos.at(-1)).toMatchObject({ id: 'prazo', opcional: true });
    }
  });
  it('a conversa começa pela abertura e pela primeira pergunta, e anda uma pergunta por resposta', () => {
    expect(falasDoBriefing(diag, {}).map(f => f.de)).toEqual(['clara', 'clara']);
    const f = falasDoBriefing(diag, { setor: 'Rede de postos' });
    expect(f.map(x => x.de)).toEqual(['clara', 'clara', 'eu', 'clara']);
    expect(f.at(-1)!.texto).toBe('Anotado. O que está acontecendo lá hoje?');
    expect(proximoPasso(diag, { setor: 'Rede de postos' })).toBe(1);
  });
  it('com tudo respondido a Clara fecha, e a pergunta pulada aparece como pulada', () => {
    const r = Object.fromEntries(diag.passos.map(p => [p.id, p.opcional ? PULADO : 'Resposta de teste aqui']));
    const f = falasDoBriefing(diag, r);
    expect(proximoPasso(diag, r)).toBe(diag.passos.length);
    expect(f.at(-1)!.texto).toContain('Fechamos o briefing');
    expect(f.at(-2)!.texto).toBe('Prefiro pular essa.');
    expect(resumoDoBriefing(diag, r)).toContain('- **Prazo:** não informado');
  });
  it('resposta curta em pergunta aberta pede exemplo; opção pronta e pergunta opcional não pedem', () => {
    const [setor, situacao] = diag.passos, prazo = diag.passos.at(-1)!;
    expect(pedeExemplo(situacao, 'Está ruim')).toBe(true);
    expect(pedeExemplo(situacao, 'Cada turno atende de um jeito')).toBe(false);
    expect(pedeExemplo(setor, 'Postos')).toBe(false);
    expect(pedeExemplo(prazo, 'Não')).toBe(false);
  });
  it('o pedido leva a instrução do modelo e só o que foi respondido, dentro do limite', () => {
    const p = pedidoDoBriefing(diag, { setor: 'Rede de postos', situacao: 'x'.repeat(5000), prazo: PULADO });
    expect(p.startsWith('Montar o roteiro de diagnóstico')).toBe(true);
    expect(p).toContain('Setor: Rede de postos');
    expect(p).not.toContain('Prazo');
    expect(p.length).toBe(4000);
  });
  it('cliente sai do briefing só quando há setor e situação', () => {
    expect(clienteDoBriefing({ setor: 'Rede de postos', situacao: ' Turno da noite sem padrão ' })).toEqual({ setor: 'Rede de postos', situacao: 'Turno da noite sem padrão' });
    expect(clienteDoBriefing({ setor: 'Rede de postos' })).toBeNull();
  });
});
