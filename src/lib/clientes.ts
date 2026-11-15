import type { Cliente } from './dados';

const limpa = (s: string) => s.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ');

/** Diz se o cliente que está sendo cadastrado já existe. Igual: mesmo setor e mesma situação, e o cadastro não entra.
 *  Mesmo setor: só o setor repete, o que é comum, e a tela apenas avisa. */
export function clienteRepetido(clientes: Pick<Cliente, 'setor' | 'situacao'>[], setor: string, situacao: string): 'igual' | 'mesmo-setor' | null {
  const s = limpa(setor), q = limpa(situacao);
  if (!s) return null;
  const doSetor = clientes.filter(c => limpa(c.setor) === s);
  if (!doSetor.length) return null;
  return q && doSetor.some(c => limpa(c.situacao) === q) ? 'igual' : 'mesmo-setor';
}
