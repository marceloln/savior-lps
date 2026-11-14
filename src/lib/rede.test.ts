import { describe, expect, it } from 'vitest';
import { recadoDeErro } from './rede';

describe('recadoDeErro', () => {
  it('rede fora vira frase em português', () => {
    expect(recadoDeErro(new TypeError('Failed to fetch'))).toBe('Sem conexão com o servidor do lab. Tente de novo.');
  });
  it('erro do servidor mantém a frase que veio', () => {
    expect(recadoDeErro(new Error('Missão não encontrada.'))).toBe('Missão não encontrada.');
  });
  it('erro sem texto cai na frase padrão', () => {
    expect(recadoDeErro(null)).toBe('O servidor do lab não respondeu.');
  });
});
