import { describe, it, expect } from 'vitest';
import { aindaHoje, comecaLogo, deEvento, docIdDe, eventoNovo, fimDe } from './agendaGoogle';

// formato que o Google Agenda devolve, com os campos que o lab usa
const evento = {
  id: 'abc_20261119T203000Z', status: 'confirmed', summary: 'Status do piloto',
  start: { dateTime: '2026-11-19T17:30:00-03:00' }, end: { dateTime: '2026-11-19T18:00:00-03:00' },
  attendees: [{ email: 'socio@vetor30.com.br' }, { email: 'gerente@cliente.com.br' }, { email: 'sala@resource.calendar.google.com', resource: true }],
  conferenceData: { entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/awv-kzvi-tem' }] },
  attachments: [
    { title: 'Apresentação', fileUrl: 'https://drive.google.com/file/d/1xyz/view' },
    { title: 'Anotações do Gemini', fileUrl: 'https://docs.google.com/document/d/1lBTGut-cHQo_ZTxiOE/edit?usp=meet_tnfm_calendar' },
  ],
  extendedProperties: { private: { lab_projeto: 'piloto-pista' } },
};

describe('reunião do Google Agenda', () => {
  it('vira reunião do lab com dia, hora, Meet, anotações e convidados', () => {
    expect(deEvento(evento)).toEqual({
      id: 'abc_20261119T203000Z', titulo: 'Status do piloto', dia: '2026-11-19', hora: '17:30', fim: '18:00',
      meet: 'https://meet.google.com/awv-kzvi-tem', anotacoes: '1lBTGut-cHQo_ZTxiOE',
      anotacoesUrl: 'https://docs.google.com/document/d/1lBTGut-cHQo_ZTxiOE/edit?usp=meet_tnfm_calendar',
      convidados: ['socio@vetor30.com.br', 'gerente@cliente.com.br'], projeto: 'piloto-pista',
    });
  });
  it('aceita o link do Meet no campo antigo e evento sem título', () => {
    const r = deEvento({ id: 'x', start: { dateTime: '2026-11-20T09:00:00-03:00' }, end: { dateTime: '2026-11-20T10:00:00-03:00' }, hangoutLink: 'https://meet.google.com/aaa-bbbb-ccc' });
    expect(r).toMatchObject({ titulo: 'Sem título', meet: 'https://meet.google.com/aaa-bbbb-ccc', anotacoes: null, convidados: [], projeto: null });
  });
  it('sem anotação do Gemini, usa outro documento do Google preso no evento', () => {
    expect(deEvento({ ...evento, attachments: [{ title: 'Pauta', fileUrl: 'https://docs.google.com/document/d/9pauta/edit' }] })?.anotacoes).toBe('9pauta');
  });
  it('ignora evento cancelado, de dia inteiro ou sem hora', () => {
    expect(deEvento({ ...evento, status: 'cancelled' })).toBeNull();
    expect(deEvento({ id: 'f', summary: 'Feriado', start: { date: '2026-11-20' }, end: { date: '2026-11-21' } })).toBeNull();
    expect(deEvento(null)).toBeNull();
  });
  it('acha o documento em links do Docs e recusa o resto', () => {
    expect(docIdDe('https://docs.google.com/document/d/1abc-_D/edit')).toBe('1abc-_D');
    expect(docIdDe('https://drive.google.com/file/d/1abc/view')).toBeNull();
    expect(docIdDe(undefined)).toBeNull();
  });
});

describe('evento novo', () => {
  it('o fim passa da meia-noite sem se perder', () => {
    expect(fimDe('2026-11-24', '23:30', 60)).toBe('2026-11-25T00:30:00');
    expect(fimDe('2026-12-31', '10:00', 50)).toBe('2026-12-31T10:50:00');
  });
  it('pede o Meet, marca o projeto e convida todos', () => {
    const e = eventoNovo({ titulo: 'Ritual semanal', pauta: 'Fila da pista', dia: '2026-11-24', hora: '23:30', duracao: 60, convidados: ['gerente@cliente.com.br', 'kim@vetor30.com.br'], projeto_id: 'p1' }, 'pedido-1');
    expect(e).toMatchObject({
      summary: 'Ritual semanal', description: 'Fila da pista',
      start: { dateTime: '2026-11-24T23:30:00', timeZone: 'America/Sao_Paulo' }, end: { dateTime: '2026-11-25T00:30:00', timeZone: 'America/Sao_Paulo' },
      attendees: [{ email: 'gerente@cliente.com.br' }, { email: 'kim@vetor30.com.br' }],
      conferenceData: { createRequest: { requestId: 'pedido-1', conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      extendedProperties: { private: { lab_projeto: 'p1' } },
    });
  });
  it('sem projeto, não marca nada no evento', () => {
    expect(eventoNovo({ titulo: 'x', pauta: '', dia: '2026-11-24', hora: '10:00', duracao: 30, convidados: [], projeto_id: null }, 'r').extendedProperties).toBeUndefined();
  });
});

describe('reuniões do dia', () => {
  const r = (id: string, dia: string, hora: string, fim: string) => ({ id, titulo: id, dia, hora, fim, meet: 'https://meet.google.com/' + id, anotacoes: null, anotacoesUrl: null, convidados: [], projeto: null });
  const lista = [r('ontem', '2026-11-16', '10:00', '11:00'), r('cedo', '2026-11-17', '08:00', '09:00'), r('agora', '2026-11-17', '10:00', '11:00'), r('tarde', '2026-11-17', '14:00', '15:00')];
  it('ainda hoje: as de hoje que não acabaram, em ordem de hora', () => {
    expect(aindaHoje(lista, '2026-11-17', '10:30').map(x => x.id)).toEqual(['agora', 'tarde']);
    expect(aindaHoje(lista, '2026-11-17', '15:00')).toEqual([]);
  });
  it('começa logo: só as que começam dentro da janela, com os minutos que faltam', () => {
    expect(comecaLogo(lista, '2026-11-17', '13:40')).toEqual([{ r: lista[3], faltam: 20 }]);
    expect(comecaLogo(lista, '2026-11-17', '13:20')).toEqual([]);
    expect(comecaLogo(lista, '2026-11-17', '14:00')).toEqual([]);
  });
});
