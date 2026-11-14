import { describe, it, expect } from 'vitest';
import * as V from './validacao';
import { EQUIPE } from '../src/lib/equipe';

const ids = new Set(EQUIPE.map(e => e.id));

describe('validação da API', () => {
  it('missão precisa de dono e título', () => {
    expect(V.novaTarefa({ titulo: 'x' }, ids)).toEqual({ ok: false, erro: 'Escolha quem faz a missão.' });
    expect(V.novaTarefa({ agente: 'rui', titulo: '   ' }, ids).ok).toBe(false);
    expect(V.novaTarefa({ agente: 'rui', titulo: ' Agenda ', projeto_id: '' }, ids)).toEqual({ ok: true, v: { agente: 'rui', titulo: 'Agenda', detalhe: '', projeto_id: null } });
  });
  it('mudança de tarefa só aceita campos conhecidos e valores válidos', () => {
    expect(V.mudancaTarefa({ estado: 'feito' }, ids)).toEqual({ ok: true, v: { estado: 'feito' } });
    expect(V.mudancaTarefa({ estado: 'arquivado' }, ids).ok).toBe(false);
    expect(V.mudancaTarefa({ id: 3, 'estado = 1; DROP TABLE missoes; --': 'x' }, ids)).toEqual({ ok: false, erro: 'Nada para mudar.' });
  });
  it('reunião valida data, hora e participantes', () => {
    const base = { titulo: 'Ritual', dia: '2026-11-10', hora: '09:30', participantes: ['rui', 'rui', 'fantasma'] };
    const r = V.novaReuniao(base, ids);
    expect(r.ok && r.v.participantes).toEqual(['rui']);
    expect(V.novaReuniao({ ...base, hora: '25:00' }, ids).ok).toBe(false);
    expect(V.novaReuniao({ ...base, participantes: ['fantasma'] }, ids).ok).toBe(false);
  });
  it('memória e instrução', () => {
    expect(V.novaMemoria({ agente: 'lia', texto: 'Falar com o atendente antes', origem: 'conversa' }, ids)).toMatchObject({ ok: true, v: { origem: 'conversa' } });
    expect(V.novaMemoria({ agente: 'lia', texto: '' }, ids).ok).toBe(false);
    expect(V.instrucao('lia', { texto: '' }, ids)).toEqual({ ok: true, v: { agente: 'lia', texto: '' } });
    expect(V.instrucao('ninguem', { texto: 'x' }, ids).ok).toBe(false);
    expect(V.instrucao('lia', null, ids).ok).toBe(false);
    expect(V.instrucao('lia', { outro: 1 }, ids).ok).toBe(false);
  });
  it('data só passa se existir no calendário', () => {
    expect(V.dataReal('2026-11-30')).toBe(true);
    expect(V.dataReal('2028-02-29')).toBe(true);
    expect(V.dataReal('2026-13-45')).toBe(false);
    expect(V.dataReal('2026-02-30')).toBe(false);
    expect(V.novaReuniao({ titulo: 'Ritual', dia: '2026-02-30', hora: '10:00', participantes: ['rui'] }, ids).ok).toBe(false);
  });

  it('hoje no horário de Brasília vira o dia só depois da meia-noite local', () => {
    expect(V.hojeBrasil(Date.parse('2026-11-07T02:00:00Z'))).toBe('2026-11-06');
    expect(V.hojeBrasil(Date.parse('2026-11-07T03:30:00Z'))).toBe('2026-11-07');
  });
  it('cliente entra por setor e situação e projeto precisa de cliente e nome', () => {
    expect(V.slug('Rede de Postos no Interior!')).toBe('rede-de-postos-no-interior');
    expect(V.slug('Ação e Conveniência')).toBe('acao-e-conveniencia');
    expect(V.novoCliente({ setor: 'Rede de postos', situacao: 'Turno sem padrão' }).ok).toBe(true);
    expect(V.novoCliente({ setor: 'x', situacao: 'Turno sem padrão' }).ok).toBe(false);
    expect(V.novoProjeto({ cliente_id: 'postos', nome: 'Piloto' }).ok).toBe(true);
    expect(V.novoProjeto({ nome: 'Piloto' }).ok).toBe(false);
  });
  it('remarcar reunião e editar decisão validam o que muda', () => {
    expect(V.mudancaReuniao({ dia: '2026-12-01', hora: '09:00' }).ok).toBe(true);
    expect(V.mudancaReuniao({ dia: '2026-02-30' }).ok).toBe(false);
    expect(V.mudancaReuniao({}).ok).toBe(false);
    expect(V.mudancaDecisao({ titulo: '  ' }).ok).toBe(false);
    expect(V.mudancaDecisao({ contexto: 'Porque sim' })).toEqual({ ok: true, v: { contexto: 'Porque sim' } });
  });
  it('especialista novo precisa de nome, papel, sala, aparência e modelo válido', () => {
    const base = { nome: 'Gil', papel: 'Pricing', zona: 'dados', aparencia: 'vera' };
    expect(V.novoAgente(base)).toEqual({ ok: true, v: { ...base, modelo: '' } });
    expect(V.novoAgente({ ...base, zona: 'porao' }).ok).toBe(false);
    expect(V.novoAgente({ ...base, aparencia: 'dragao' }).ok).toBe(false);
    expect(V.novoAgente({ ...base, modelo: 'openai:gpt-6-astra' }).ok).toBe(true);
    expect(V.novoAgente({ ...base, modelo: 'qualquer coisa' }).ok).toBe(false);
    expect(V.novoAgente({ ...base, modelo: 'simulado:teste' }).ok).toBe(false);
  });
  it('mudança de especialista só aceita campos conhecidos', () => {
    expect(V.mudancaAgente({ modelo: '' })).toEqual({ ok: true, v: { modelo: '' } });
    expect(V.mudancaAgente({ ativo: false })).toEqual({ ok: true, v: { ativo: 0 } });
    expect(V.mudancaAgente({ 'base = 1; --': 1 }).ok).toBe(false);
  });
  it('skill precisa de nome e de texto que ensine algo', () => {
    expect(V.novaSkill({ nome: 'Pauta', conteudo: 'curto' }).ok).toBe(false);
    expect(V.novaSkill({ nome: 'Pauta de segunda', conteudo: 'Quarenta minutos, sempre na mesma ordem.', para_todos: true })).toMatchObject({ ok: true, v: { para_todos: 1 } });
    expect(V.listaDeSkills({ skills: ['a', 'a', 'b'] })).toEqual({ ok: true, v: ['a', 'b'] });
    expect(V.listaDeSkills({ skills: [1] }).ok).toBe(false);
  });
  it('pedido ao lab precisa dizer o que quer', () => {
    expect(V.textoDoPedido({ texto: 'oi' }).ok).toBe(false);
    expect(V.textoDoPedido({ texto: 'Monta uma pauta para segunda', projeto_id: '' })).toEqual({ ok: true, v: { texto: 'Monta uma pauta para segunda', projeto_id: null } });
    expect(V.modeloPadrao({ modelo: 'google:gemini-4-argon' })).toEqual({ ok: true, v: 'google:gemini-4-argon' });
    expect(V.modeloPadrao({ modelo: '' }).ok).toBe(false);
  });
});
