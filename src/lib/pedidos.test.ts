import { describe, it, expect } from 'vitest';
import { autoresDoPedido, documentoDoPedido, nomeDoArquivo, paraVoce, MODELOS_DE_PEDIDO } from './pedidos';
import type { Tarefa } from './dados';
import { SEMENTE, type EstadoLab, type Pedido } from './dados';

const ped = (m: Partial<Pedido>): Pedido => ({ id: 1, texto: 'Plano de 30 dias', projeto_id: null, estado: 'entregue', sintese: '## Resposta', criado_em: '2026-11-14 12:00:00', ...m });
const AGORA = Date.UTC(2026, 10, 14, 15);

describe('pedidos', () => {
  it('na véspera, lembra da reunião de projeto que ainda não tem pauta, no lab e no Google', () => {
    const r = (id: number, dia: string, pauta = '', projeto_id: string | null = 'p1') => ({ id, titulo: 'Ritual ' + id, pauta, dia, hora: '10:00', participantes: [], projeto_id, status: 'agendada' as const, ata: '' });
    const e: EstadoLab = { ...SEMENTE, pedidos: [], reunioes: [r(1, '2026-11-15'), r(2, '2026-11-15', '1. Onde estamos'), r(3, '2026-11-15', '', null), r(4, '2026-11-16')] };
    const g = [{ id: 'g1', titulo: 'Status', dia: '2026-11-15', hora: '09:00', fim: '09:30', meet: null, anotacoes: null, anotacoesUrl: null, convidados: [], projeto: 'p1', pauta: '' }];
    const a = paraVoce(e, '2026-11-14', AGORA, null, g, '08:00');
    expect(a.filter(x => x.tipo === 'pauta')).toEqual([
      { tipo: 'pauta', reuniao: 'g1', texto: 'Amanhã 09:00 Status' },
      { tipo: 'pauta', reuniao: 1, texto: 'Amanhã 10:00 Ritual 1' },
    ]);
  });
  it('autores do pedido: quem entregou, uma vez cada, na ordem e sem quem orquestra', () => {
    const t = (id: number, agente: string, pedido_id: number | null, entrega = 'feito') => ({ id, agente, pedido_id, entrega } as Tarefa);
    const tarefas = [t(1, 'lia', 7), t(2, 'davi', 7), t(3, 'lia', 7), t(4, 'duda', 7), t(5, 'rui', 8), t(6, 'max', 7, '')];
    expect(autoresDoPedido(tarefas, 7, 'duda')).toEqual(['lia', 'davi']);
    expect(autoresDoPedido(tarefas, 9, 'duda')).toEqual([]);
  });
  it('para você: reunião de hoje vem primeiro, depois pedido parado e resposta recente', () => {
    const e: EstadoLab = { ...SEMENTE,
      pedidos: [ped({ id: 3 }), ped({ id: 2, estado: 'andando', sintese: '' }), ped({ id: 1, criado_em: '2026-11-01 09:00:00' })],
      reunioes: [{ id: 9, titulo: 'Ritual', pauta: '', dia: '2026-11-14', hora: '16:00', participantes: [], projeto_id: null, status: 'agendada', ata: '' },
        { id: 8, titulo: 'Kickoff', pauta: '', dia: '2026-11-15', hora: '10:00', participantes: [], projeto_id: null, status: 'agendada', ata: '' }] };
    expect(paraVoce(e, '2026-11-14', AGORA).map(x => x.tipo)).toEqual(['reuniao', 'parado', 'resposta']);
    expect(paraVoce(e, '2026-11-14', AGORA)[0]).toMatchObject({ reuniao: 9, texto: '16:00 Ritual' });
  });
  it('para você: reunião do Google de hoje entra na ordem da hora, e a que já acabou some', () => {
    const g = (id: string, hora: string, fim: string) => ({ id, titulo: id, dia: '2026-11-14', hora, fim, meet: 'https://meet.google.com/' + id, anotacoes: null, anotacoesUrl: null, convidados: [], projeto: null, pauta: '' });
    const e: EstadoLab = { ...SEMENTE, pedidos: [], reunioes: [{ id: 9, titulo: 'Ritual', pauta: '', dia: '2026-11-14', hora: '16:00', participantes: [], projeto_id: null, status: 'agendada', ata: '' }] };
    const l = paraVoce(e, '2026-11-14', AGORA, null, [g('cedo', '08:00', '09:00'), g('status', '11:00', '11:30')], '10:00');
    expect(l).toEqual([{ tipo: 'meet', id: 'status', texto: '11:00 status', url: 'https://meet.google.com/status' }, { tipo: 'reuniao', reuniao: 9, texto: '16:00 Ritual' }]);
  });
  it('para você: o pedido que está andando agora não aparece como parado', () => {
    const e: EstadoLab = { ...SEMENTE, reunioes: [], pedidos: [ped({ id: 2, estado: 'andando', sintese: '' })] };
    expect(paraVoce(e, '2026-11-14', AGORA, 2)).toEqual([]);
  });
  it('documento do pedido junta a resposta e cada entrega com quem escreveu', () => {
    const d = documentoDoPedido(ped({}), [{ nome: 'Lia', papel: 'Analista de diagnóstico', titulo: 'Roteiro de campo', entrega: '## Roteiro\nPerguntas.' }]);
    expect(d.startsWith('# Plano de 30 dias\n\n## Resposta')).toBe(true);
    expect(d).toContain('## Lia, analista de diagnóstico\nMissão: Roteiro de campo\n\n## Roteiro');
  });
  it('nome do arquivo sai sem acento, curto e nunca vazio', () => {
    expect(nomeDoArquivo('Pauta do ritual: distribuição & operação!')).toBe('pauta-do-ritual-distribuicao-operacao.md');
    expect(nomeDoArquivo('???')).toBe('pedido.md');
  });
  it('todo modelo de pedido tem texto que passa do mínimo do formulário', () => {
    for (const m of MODELOS_DE_PEDIDO) expect(m.texto.length).toBeGreaterThan(40);
  });
});
