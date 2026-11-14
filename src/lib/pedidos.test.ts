import { describe, it, expect } from 'vitest';
import { documentoDoPedido, nomeDoArquivo, paraVoce, MODELOS_DE_PEDIDO } from './pedidos';
import { SEMENTE, type EstadoLab, type Pedido } from './dados';

const ped = (m: Partial<Pedido>): Pedido => ({ id: 1, texto: 'Plano de 30 dias', projeto_id: null, estado: 'entregue', sintese: '## Resposta', criado_em: '2026-11-14 12:00:00', ...m });
const AGORA = Date.UTC(2026, 10, 14, 15);

describe('pedidos', () => {
  it('para você: pedido parado vem primeiro, depois resposta recente e reunião de hoje', () => {
    const e: EstadoLab = { ...SEMENTE,
      pedidos: [ped({ id: 3 }), ped({ id: 2, estado: 'andando', sintese: '' }), ped({ id: 1, criado_em: '2026-11-01 09:00:00' })],
      reunioes: [{ id: 9, titulo: 'Ritual', pauta: '', dia: '2026-11-14', hora: '16:00', participantes: [], projeto_id: null, status: 'agendada', ata: '' },
        { id: 8, titulo: 'Kickoff', pauta: '', dia: '2026-11-15', hora: '10:00', participantes: [], projeto_id: null, status: 'agendada', ata: '' }] };
    expect(paraVoce(e, '2026-11-14', AGORA).map(x => x.tipo)).toEqual(['parado', 'resposta', 'reuniao']);
    expect(paraVoce(e, '2026-11-14', AGORA).at(-1)).toMatchObject({ reuniao: 9, texto: '16:00 Ritual' });
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
