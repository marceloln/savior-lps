import { describe, it, expect } from 'vitest';
import { paraApi, textoDeErro } from './conversa';
import { sistemaDe } from '../../worker/conversa';
import { EQUIPE } from './equipe';

describe('conversa no navegador', () => {
  it('tira avisos de erro e começa por quem pergunta', () => {
    expect(paraApi([
      { papel: 'assistant', texto: 'Oi, eu sou a Clara.' },
      { papel: 'user', texto: 'Postos' },
      { papel: 'assistant', texto: 'Sem conexão', erro: true },
      { papel: 'user', texto: 'Rede com 12 lojas' },
    ])).toEqual([{ role: 'user', content: 'Postos' }, { role: 'user', content: 'Rede com 12 lojas' }]);
  });
  it('erro de rede avisa que o texto ficou no campo', () => {
    expect(textoDeErro(null, null)).toContain('continua no campo');
  });
  it('usa a mensagem do servidor quando ela existe', () => {
    expect(textoDeErro(503, { erro: 'Falta a chave.' })).toBe('Falta a chave.');
  });
  it('a Clara recebe a instrução de briefing e os outros não', () => {
    expect(sistemaDe(EQUIPE.find(e => e.id === 'clara')!)).toContain('uma pergunta por vez');
    expect(sistemaDe(EQUIPE.find(e => e.id === 'lia')!)).not.toContain('uma pergunta por vez');
  });
});
