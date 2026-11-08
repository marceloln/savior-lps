import { describe, it, expect } from 'vitest';
import { diaDoCiclo, semente, somaDias } from './dados';
import { EQUIPE } from './equipe';

const HOJE = '2026-11-06';
const s = semente(HOJE);
const ids = new Set(EQUIPE.map(e => e.id));

describe('ciclo de 30 dias', () => {
  it('o dia de início é o dia 1 e o ciclo para no 30', () => {
    expect(diaDoCiclo(HOJE, HOJE)).toBe(1);
    expect(diaDoCiclo(somaDias(HOJE, -17), HOJE)).toBe(18);
    expect(diaDoCiclo(somaDias(HOJE, -90), HOJE)).toBe(30);
    expect(diaDoCiclo(somaDias(HOJE, 3), HOJE)).toBe(1);
  });
});

describe('história de exemplo', () => {
  it('reuniões caem em dia útil em qualquer dia da semana em que o banco for semeado', () => {
    for (let k = 0; k < 7; k++) {
      const h = somaDias(HOJE, k);
      for (const r of semente(h).reunioes) {
        const w = new Date(r.dia + 'T12:00:00Z').getUTCDay();
        if (r.dia !== h) expect(w !== 0 && w !== 6, `${h} ${r.titulo} ${r.dia}`).toBe(true);
      }
    }
  });
  it('toda missão tem dono da equipe e projeto existente', () => {
    for (const t of s.tarefas) {
      expect(ids.has(t.agente), t.agente).toBe(true);
      if (t.projeto_id) expect(s.projetos.some(p => p.id === t.projeto_id), t.projeto_id).toBe(true);
    }
  });
  it('nenhuma missão aberta repetida para a mesma pessoa', () => {
    const abertas = s.tarefas.filter(t => t.estado !== 'feito').map(t => t.agente + t.titulo.toLowerCase());
    expect(new Set(abertas).size).toBe(abertas.length);
  });
  it('reunião feita está no passado com ata e reunião marcada está no futuro sem ata', () => {
    for (const r of s.reunioes) {
      if (r.status === 'feita') { expect(r.dia <= HOJE).toBe(true); expect(r.ata.length).toBeGreaterThan(0); }
      else { expect(r.dia > HOJE).toBe(true); expect(r.ata).toBe(''); }
      for (const p of r.participantes) expect(ids.has(p), p).toBe(true);
    }
  });
  it('toda decisão aponta para uma reunião feita do mesmo projeto', () => {
    for (const d of s.decisoes) {
      const r = s.reunioes.find(x => x.id === d.reuniao_id);
      expect(r?.status).toBe('feita');
      expect(r?.projeto_id).toBe(d.projeto_id);
    }
  });
  it('projeto e cliente contam a mesma fase e o kickoff cai no dia de início', () => {
    for (const p of s.projetos) {
      expect(s.clientes.find(c => c.id === p.cliente_id)?.fase).toBe(p.fase);
      expect(s.reunioes.some(r => r.projeto_id === p.id && r.dia === p.inicio)).toBe(true);
    }
  });
  it('cliente aparece só por setor e situação', () => {
    for (const c of s.clientes) expect(Object.keys(c).sort()).toEqual(['fase', 'id', 'setor', 'situacao']);
  });
  it('memória e instrução só de quem é da equipe', () => {
    for (const m of s.memorias) expect(ids.has(m.agente)).toBe(true);
    for (const a of Object.keys(s.instrucoes)) expect(ids.has(a)).toBe(true);
  });
});
