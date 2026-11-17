// Reunião do Google Agenda vista pelo lab. O Google Agenda é o lugar oficial das reuniões com gente de verdade:
// o lab lê os eventos, cria evento com Meet e acha o documento das Anotações do Gemini preso no evento.

/** Reunião do Google Agenda, só com o que o lab mostra. */
export type ReuniaoGoogle = {
  id: string; titulo: string; dia: string; hora: string; fim: string;
  meet: string | null;
  /** Identificador do documento das anotações no Drive, quando o evento tem um preso. */
  anotacoes: string | null; anotacoesUrl: string | null;
  convidados: string[];
  /** Projeto do lab, quando o evento foi marcado pelo lab. */
  projeto: string | null;
  /** Descrição do evento, onde mora a pauta. */
  pauta: string;
};

/** O que o lab manda para marcar uma reunião no Meet. */
export type NovaReuniaoMeet = { titulo: string; pauta: string; dia: string; hora: string; duracao: number; convidados: string[]; projeto_id: string | null };

export const FUSO = 'America/Sao_Paulo';

type Evento = {
  id?: unknown; status?: unknown; summary?: unknown; description?: unknown;
  start?: { dateTime?: unknown }; end?: { dateTime?: unknown };
  attendees?: { email?: unknown; resource?: unknown }[];
  hangoutLink?: unknown;
  conferenceData?: { entryPoints?: { entryPointType?: unknown; uri?: unknown }[] };
  attachments?: { title?: unknown; fileUrl?: unknown }[];
  extendedProperties?: { private?: Record<string, unknown> };
};

const texto = (x: unknown) => (typeof x === 'string' ? x : '');

/** Identificador de um documento do Google Docs a partir do link. Outros arquivos do Drive ficam de fora. */
export function docIdDe(url: unknown): string | null {
  return texto(url).match(/docs\.google\.com\/document\/d\/([\w-]+)/)?.[1] ?? null;
}

/** Evento do Google Agenda vira reunião do lab. Cancelado, de dia inteiro ou sem hora volta null. */
export function deEvento(bruto: unknown): ReuniaoGoogle | null {
  const e = (bruto ?? null) as Evento | null;
  if (!e || e.status === 'cancelled') return null;
  const ini = texto(e.start?.dateTime), fim = texto(e.end?.dateTime);
  if (!ini || !fim) return null;
  const video = e.conferenceData?.entryPoints?.find(p => p.entryPointType === 'video');
  const anexos = (e.attachments ?? []).filter(a => docIdDe(a.fileUrl));
  // o documento do Gemini tem nome fixo. Sem ele, vale o primeiro documento do Google preso no evento
  const nota = anexos.find(a => /gemini/i.test(texto(a.title))) ?? anexos[0];
  const projeto = texto(e.extendedProperties?.private?.lab_projeto);
  return {
    id: texto(e.id), titulo: texto(e.summary).trim() || 'Sem título',
    dia: ini.slice(0, 10), hora: ini.slice(11, 16), fim: fim.slice(11, 16),
    meet: texto(video?.uri) || texto(e.hangoutLink) || null,
    anotacoes: nota ? docIdDe(nota.fileUrl) : null, anotacoesUrl: nota ? texto(nota.fileUrl) : null,
    convidados: (e.attendees ?? []).filter(a => !a.resource).map(a => texto(a.email)).filter(Boolean),
    projeto: projeto || null,
    pauta: texto(e.description).trim(),
  };
}

/** Dia e hora do fim, somando a duração. A conta é feita sem fuso, para não andar com o horário de verão. */
export function fimDe(dia: string, hora: string, minutos: number): string {
  const d = new Date(`${dia}T${hora}:00Z`);
  d.setUTCMinutes(d.getUTCMinutes() + minutos);
  return d.toISOString().slice(0, 19);
}

/** Corpo do evento novo para a API do Google Agenda. O requestId evita duas salas de Meet se o pedido repetir. */
export function eventoNovo(r: NovaReuniaoMeet, requestId: string) {
  return {
    summary: r.titulo,
    description: r.pauta,
    start: { dateTime: `${r.dia}T${r.hora}:00`, timeZone: FUSO },
    end: { dateTime: fimDe(r.dia, r.hora, r.duracao), timeZone: FUSO },
    attendees: r.convidados.map(email => ({ email })),
    conferenceData: { createRequest: { requestId, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    ...(r.projeto_id ? { extendedProperties: { private: { lab_projeto: r.projeto_id } } } : {}),
  };
}

const minutos = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Reuniões de hoje que ainda não acabaram, pela hora de início. agora vem em HH:MM, no horário do sócio. */
export function aindaHoje(lista: ReuniaoGoogle[], hoje: string, agora: string): ReuniaoGoogle[] {
  return lista.filter(r => r.dia === hoje && minutos(r.fim) > minutos(agora)).sort((a, b) => a.hora.localeCompare(b.hora));
}

/** Reuniões de hoje que começam dentro da janela, com os minutos que faltam. A que já começou fica de fora. */
export function comecaLogo(lista: ReuniaoGoogle[], hoje: string, agora: string, janela = 30): { r: ReuniaoGoogle; faltam: number }[] {
  return lista.filter(r => r.dia === hoje).map(r => ({ r, faltam: minutos(r.hora) - minutos(agora) })).filter(x => x.faltam > 0 && x.faltam <= janela);
}

/** Hora local em HH:MM, para comparar com a hora das reuniões. */
export const horaLocal = (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
