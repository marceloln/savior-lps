import { describe, it, expect } from 'vitest';
import * as V from './validacao';

describe('validação da API', () => {
  it('tarefa precisa de dono e título', () => {
    expect(V.novaTarefa({ titulo: 'x' })).toEqual({ ok: false, erro: 'Escolha quem faz a tarefa.' });
    expect(V.novaTarefa({ agente: 'rui', titulo: '   ' }).ok).toBe(false);
    expect(V.novaTarefa({ agente: 'rui', titulo: ' Agenda ', projeto_id: '' })).toEqual({ ok: true, v: { agente: 'rui', titulo: 'Agenda', detalhe: '', projeto_id: null } });
  });
  it('mudança de tarefa só aceita campos conhecidos e valores válidos', () => {
    expect(V.mudancaTarefa({ estado: 'feito' })).toEqual({ ok: true, v: { estado: 'feito' } });
    expect(V.mudancaTarefa({ estado: 'arquivado' }).ok).toBe(false);
    expect(V.mudancaTarefa({ id: 3, 'estado = 1; DROP TABLE missoes; --': 'x' })).toEqual({ ok: false, erro: 'Nada para mudar.' });
  });
  it('reunião valida data, hora e participantes', () => {
    const base = { titulo: 'Ritual', dia: '2026-11-10', hora: '09:30', participantes: ['rui', 'rui', 'fantasma'] };
    const r = V.novaReuniao(base);
    expect(r.ok && r.v.participantes).toEqual(['rui']);
    expect(V.novaReuniao({ ...base, hora: '25:00' }).ok).toBe(false);
    expect(V.novaReuniao({ ...base, participantes: ['fantasma'] }).ok).toBe(false);
  });
  it('memória e instrução', () => {
    expect(V.novaMemoria({ agente: 'lia', texto: 'Falar com o atendente antes', origem: 'conversa' })).toMatchObject({ ok: true, v: { origem: 'conversa' } });
    expect(V.novaMemoria({ agente: 'lia', texto: '' }).ok).toBe(false);
    expect(V.instrucao('lia', { texto: '' })).toEqual({ ok: true, v: { agente: 'lia', texto: '' } });
    expect(V.instrucao('ninguem', { texto: 'x' }).ok).toBe(false);
  });
});
