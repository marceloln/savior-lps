// Leitor pequeno de markdown para as entregas dos especialistas. Devolve blocos prontos para desenhar, sem HTML cru.
export type Trecho = { x: string; forte?: boolean };
export type Bloco =
  | { t: 'titulo'; nivel: 2 | 3; x: Trecho[] }
  | { t: 'texto'; x: Trecho[] }
  | { t: 'lista'; ordenada: boolean; itens: Trecho[][] }
  | { t: 'tabela'; cabeca: Trecho[][]; linhas: Trecho[][][] };

/** Separa o negrito do resto. Asterisco solto e crase somem, o texto fica. */
export function trechos(s: string): Trecho[] {
  return s.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(p => (/^\*\*[^*]+\*\*$/.test(p) ? { x: p.slice(2, -2), forte: true } : { x: p.replace(/`/g, '').replace(/(^|\s)\*(\S[^*]*\S|\S)\*(?=\s|[.,;:!?]|$)/g, '$1$2') }));
}

const celulas = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => trechos(c.trim()));
const ehTabela = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const ehRegua = (l: string) => /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && l.includes('-');

export function leMarkdown(texto: string): Bloco[] {
  const blocos: Bloco[] = [], linhas = texto.replace(/\r/g, '').split('\n');
  let par: string[] = [];
  const fecha = () => { if (par.length) { blocos.push({ t: 'texto', x: trechos(par.join(' ')) }); par = []; } };
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i], m = /^(#{1,6})\s+(.*)$/.exec(l), item = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/.exec(l);
    if (!l.trim() || /^\s*(```|---+\s*$)/.test(l)) { fecha(); continue; }
    if (m) { fecha(); blocos.push({ t: 'titulo', nivel: m[1].length <= 2 ? 2 : 3, x: trechos(m[2].replace(/\s*#+\s*$/, '')) }); continue; }
    if (item) {
      fecha();
      const ordenada = item[1] !== undefined, ult = blocos.at(-1);
      if (ult?.t === 'lista' && ult.ordenada === ordenada) ult.itens.push(trechos(item[2])); else blocos.push({ t: 'lista', ordenada, itens: [trechos(item[2])] });
      continue;
    }
    if (ehTabela(l) && linhas[i + 1] !== undefined && ehRegua(linhas[i + 1])) {
      fecha();
      const t: Bloco = { t: 'tabela', cabeca: celulas(l), linhas: [] };
      for (i += 2; i < linhas.length && ehTabela(linhas[i]); i++) t.linhas.push(celulas(linhas[i]));
      i--; blocos.push(t); continue;
    }
    // linha recuada logo depois de um item continua o item
    const ult = blocos.at(-1);
    if (/^\s{2,}\S/.test(l) && !par.length && ult?.t === 'lista') { ult.itens.at(-1)!.push(...trechos(' ' + l.trim())); continue; }
    par.push(l.trim());
  }
  fecha();
  return blocos;
}
