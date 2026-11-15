// Guarda do sistema visual: o que a auditoria de 15 de novembro arrumou não volta sem alguém perceber.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

const pasta = new URL('../estilo/', import.meta.url);
const arquivos = readdirSync(pasta).filter(f => f.endsWith('.css'));
const le = (f: string) => readFileSync(new URL(f, pasta), 'utf8');
const semTokens = arquivos.filter(f => f !== 'tokens.css').map(f => [f, le(f)] as const);
const tokens = le('tokens.css');

describe('sistema visual', () => {
  it('todo arquivo de estilo está importado, com os degraus primeiro e o padrão por último', () => {
    const ordem = [...readFileSync(new URL('../estilo.css', import.meta.url), 'utf8').matchAll(/@import '\.\/estilo\/([a-z]+\.css)'/g)].map(m => m[1]);
    expect([...ordem].sort()).toEqual([...arquivos].sort());
    expect(ordem[0]).toBe('tokens.css');
    expect(ordem.at(-1)).toBe('padrao.css');
  });
  it('cor de cartão, borda de cartão e as cores com significado só existem como degrau', () => {
    for (const [f, t] of semTokens) {
      expect(t.match(/#FFFBF0|rgba\(59,\s*47,\s*37,\s*\.25\)/g) ?? [], f).toEqual([]);
      expect(t.match(/#3E6B2A|#8A3122|#75552A|#256B5C|#B5462D|#FFF7EA|#A63F29|#C9603F/gi) ?? [], f).toEqual([]);
      expect(t.match(/rgba\(59,\s*47,\s*37,\s*\.(08|12)\)|rgba\(255,\s*250,\s*235,\s*\.5\)/g) ?? [], f).toEqual([]);
    }
    for (const nome of ['--sucesso', '--erro', '--aviso', '--info', '--cartao', '--cartao-borda', '--borda-forte', '--borda-campo']) expect(tokens, nome).toContain(nome + ':');
  });
  it('espaço interno, margem e vão seguem a grade de 4, fora o que é ajuste de um ou dois pixels', () => {
    const fora: string[] = [];
    for (const [f, t] of semTokens) for (const m of t.matchAll(/(?<![\w-])((?:padding|margin)(?:-(?:top|right|bottom|left|inline|block))?|gap|row-gap|column-gap)\s*:\s*([^;}]+)/g))
      for (const x of m[2].matchAll(/(?<![\w.#(])(-?\d+(?:\.\d+)?)px\b/g)) { const n = Math.abs(Number(x[1])); if (n % 4 !== 0 && n > 2) fora.push(`${f}: ${m[0].slice(0, 60)}`); }
    // exceções conhecidas: o recuo do botão de fechar do livro, a margem da folha, a régua do calendário e o marcador das manias
    expect(fora.length, fora.join('\n')).toBeLessThanOrEqual(5);
  });
  it('o corpo usa a letra da marca e o título segue em Alegreya', () => {
    expect(tokens).toMatch(/--corpo:'Roboto'/);
    expect(tokens).toMatch(/--titulo:'Alegreya'/);
    const pagina = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(pagina).toContain('family=Roboto:wght@400;500;700');
    expect(pagina).not.toContain('Alegreya+Sans');
  });
  it('nenhuma animação usa transition all, ease-in, entrada de escala zero ou duração escrita acima de 300 ms fora de laço', () => {
    for (const [f, t] of semTokens) {
      expect(t, f).not.toMatch(/transition:\s*all/);
      expect(t, f).not.toMatch(/\bease-in\b(?!-out)/);
      expect(t, f).not.toMatch(/scale\(0\)/);
      for (const m of t.matchAll(/transition:[^;}]*/g)) expect(m[0], f).not.toMatch(/(?<![\w-])(\.[4-9]\d*|[1-9]\d*(\.\d+)?)s\b/);
    }
  });
  it('movimento de mouse fica dentro do bloco de quem tem mouse, e todo arquivo com animação trata movimento reduzido', () => {
    for (const [f, t] of semTokens) {
      if (/animation:|@keyframes/.test(t) && !['base.css', 'nucleo.css'].includes(f)) expect(t, f).toContain('prefers-reduced-motion');
    }
    expect(le('padrao.css')).toMatch(/@media \(hover:hover\) and \(pointer:fine\)\{[^@]*:hover/);
  });
});
