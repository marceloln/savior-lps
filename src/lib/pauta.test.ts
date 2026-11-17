import { describe, it, expect } from 'vitest';
import { pautaDaReuniao } from './pauta';
import { SEMENTE, type EstadoLab, type Tarefa, type Decisao, type Reuniao } from './dados';

const HOJE = '2026-11-17';
const t = (id: number, agente: string, titulo: string, estado: Tarefa['estado'], prazo: string | null = null, projeto_id = 'p1'): Tarefa =>
  ({ id, agente, titulo, detalhe: '', estado, projeto_id, pedido_id: null, entrega: '', modelo: '', prazo });
const reu = (m: Partial<Reuniao>): Reuniao => ({ id: 1, titulo: 'Ritual', pauta: '', dia: '2026-11-18', hora: '09:30', participantes: [], projeto_id: 'p1', status: 'agendada', ata: '', ...m });
const dec = (id: number, titulo: string, criado_em: string, projeto_id = 'p1'): Decisao => ({ id, titulo, contexto: '', projeto_id, reuniao_id: null, criado_em });

const base = (m: Partial<EstadoLab>): EstadoLab => ({
  ...SEMENTE,
  projetos: [{ id: 'p1', cliente_id: 'c1', nome: 'Piloto da pista', fase: 2, dia: 19, mesa: null, inicio: '2026-10-30' }],
  agentes: [{ id: 'lia', nome: 'Lia' }, { id: 'davi', nome: 'Davi' }, { id: 'rui', nome: 'Rui' }] as EstadoLab['agentes'],
  tarefas: [], decisoes: [], reunioes: [],
  ...m,
});

describe('pauta da reunião', () => {
  it('segue a ordem do ritual e põe o nome de quem responde por cada linha', () => {
    const e = base({
      tarefas: [
        t(1, 'lia', 'Entrevistas com frentistas', 'feito'),
        t(2, 'davi', 'Checklist de turno', 'fazendo', '2026-11-15'),
        t(3, 'rui', 'Roteiro de abordagem', 'fazendo', '2026-11-20'),
        t(4, 'lia', 'Material de treino', 'fila'),
        t(5, 'rui', 'De outro projeto', 'feito', null, 'p2'),
      ],
      decisoes: [dec(1, 'Teste piloto em duas unidades', '2026-11-12 10:00:00'), dec(2, 'Decisão antiga', '2026-10-01 10:00:00')],
      reunioes: [reu({ id: 9, dia: '2026-11-10', status: 'feita' })],
    });
    const p = pautaDaReuniao(e, reu({}), HOJE);
    const linhas = p.split('\n');
    expect(linhas[0]).toBe('1. Onde estamos: Piloto da pista, fase Execução, dia 19 de 30.');
    expect(p).toContain('2. Entregue');
    expect(p).toContain('- Entrevistas com frentistas, Lia');
    expect(p).toContain('3. Travado ou com prazo vencido');
    expect(p).toContain('- Checklist de turno, Davi, venceu em 15/11');
    expect(p).toContain('4. Andando e vence até 24/11');
    expect(p).toContain('- Roteiro de abordagem, Rui, vence em 20/11');
    expect(p).toContain('5. Decidido desde a última reunião, para confirmar');
    expect(p).toContain('- Teste piloto em duas unidades');
    expect(p).not.toContain('Decisão antiga');
    expect(p).not.toContain('De outro projeto');
    expect(linhas.at(-1)).toBe('6. Fecho: o que sai decidido hoje e quem é dono de cada próximo passo.');
    expect(p.indexOf('2. Entregue')).toBeLessThan(p.indexOf('3. Travado'));
  });
  it('pula o bloco vazio, numera em sequência e limita cada bloco a cinco linhas', () => {
    const e = base({ tarefas: Array.from({ length: 8 }, (_, i) => t(i + 1, 'lia', `Entrega ${i + 1}`, 'feito')) });
    const p = pautaDaReuniao(e, reu({}), HOJE);
    expect(p).not.toContain('Travado');
    expect(p).toContain('3. Fecho');
    expect(p.match(/- Entrega/g)).toHaveLength(5);
    expect(p).toContain('- Entrega 8, Lia');
    expect(p).not.toContain('- Entrega 3,');
  });
  it('guarda o assunto de quem marcou e não repete a pauta da equipe ao refazer', () => {
    const e = base({});
    const p = pautaDaReuniao(e, reu({ pauta: 'Fila no caixa e escala da noite' }), HOJE);
    expect(p.split('\n').slice(0, 2)).toEqual(['1. Onde estamos: Piloto da pista, fase Execução, dia 19 de 30.', '2. Assunto de quem marcou: Fila no caixa e escala da noite']);
    expect(pautaDaReuniao(e, reu({ pauta: p }), HOJE)).toBe(p);
  });
  it('sem projeto, monta só a abertura e o fecho', () => {
    expect(pautaDaReuniao(base({}), reu({ projeto_id: null }), HOJE)).toBe('1. Onde estamos: assuntos do lab, sem projeto.\n2. Fecho: o que sai decidido hoje e quem é dono de cada próximo passo.');
  });
});
