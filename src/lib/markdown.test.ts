import { describe, it, expect } from 'vitest';
import { leMarkdown, trechos } from './markdown';
import { SEMENTE } from './dados';

describe('markdown das entregas', () => {
  it('lê título, parágrafo, listas e negrito', () => {
    const b = leMarkdown('## Pauta\n\nDura **40 minutos** e segue\na mesma ordem.\n\n1. Um\n2. Dois\n\n- A\n- B\n  continua\n\n### Fim');
    expect(b.map(x => x.t)).toEqual(['titulo', 'texto', 'lista', 'lista', 'titulo']);
    expect(b[1]).toEqual({ t: 'texto', x: [{ x: 'Dura ' }, { x: '40 minutos', forte: true }, { x: ' e segue a mesma ordem.' }] });
    expect(b[2]).toMatchObject({ ordenada: true, itens: [[{ x: 'Um' }], [{ x: 'Dois' }]] });
    expect(b[3].t === 'lista' && b[3].itens[1].map(t => t.x).join('')).toBe('B continua');
    expect(b[4]).toMatchObject({ nivel: 3 });
  });
  it('lê tabela, como a matriz GUT', () => {
    const b = leMarkdown('| Dor | G | U | T |\n|---|---|---|---|\n| Turno | 4 | 5 | **3** |\n| Loja | 2 | 2 | 2 |\n\nFim.');
    expect(b[0].t).toBe('tabela');
    if (b[0].t === 'tabela') { expect(b[0].cabeca).toHaveLength(4); expect(b[0].linhas).toHaveLength(2); expect(b[0].linhas[0][3]).toEqual([{ x: '3', forte: true }]); }
    expect(b[1].t).toBe('texto');
  });
  it('não deixa passar marcação nem HTML como estrutura', () => {
    expect(trechos('use `código` e *ênfase* aqui')).toEqual([{ x: 'use código e ênfase aqui' }]);
    const b = leMarkdown('<script>alert(1)</script>\n```\ncercado\n```');
    expect(b).toEqual([{ t: 'texto', x: [{ x: '<script>alert(1)</script>' }] }, { t: 'texto', x: [{ x: 'cercado' }] }]);
  });
  it('as entregas de exemplo viram blocos com título e próximo passo', () => {
    for (const t of SEMENTE.tarefas.filter(x => x.entrega)) {
      const b = leMarkdown(t.entrega);
      expect(b[0].t).toBe('titulo');
      expect(b.some(x => x.t === 'titulo' && x.x[0].x === 'Próximo passo')).toBe(true);
    }
  });
});
