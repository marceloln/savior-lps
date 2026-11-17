// Google Agenda e Drive da conta da V30. Uma autorização só, guardada em segredo no Worker:
// ID e segredo do cliente OAuth e o token de renovação gerado uma vez pela conta que organiza as reuniões.
// O lab lê e cria eventos com Meet e lê o texto das Anotações do Gemini presas no evento.
import { deEvento, eventoNovo, FUSO } from '../src/lib/agendaGoogle';
import { json, ruim, corpo } from './api';
import * as V from './validacao';

export type ChavesGoogle = { GOOGLE_OAUTH_ID?: string; GOOGLE_OAUTH_SEGREDO?: string; GOOGLE_OAUTH_RENOVACAO?: string; AGENDA_GOOGLE?: string };
type Buscar = (url: string, init?: RequestInit) => Promise<Response>;

export const googleLigado = (env: ChavesGoogle) => Boolean(env.GOOGLE_OAUTH_ID && env.GOOGLE_OAUTH_SEGREDO && env.GOOGLE_OAUTH_RENOVACAO);

/** Permissões que a autorização pede. O lab cria eventos e só lê os arquivos do Drive. */
export const ESCOPOS = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/drive.readonly'];

const MAX_ANOTACOES = 60000;
// o token de acesso vale uma hora. Fica guardado enquanto o Worker está de pé, e sai um minuto antes de vencer
let guardado: { token: string; ate: number; de: string } | null = null;
export const esqueceToken = () => { guardado = null; };

class ErroGoogle extends Error { constructor(public status: number, msg: string) { super(msg); } }

async function token(env: ChavesGoogle, buscar: Buscar, agora: number): Promise<string> {
  if (guardado && guardado.de === env.GOOGLE_OAUTH_RENOVACAO && guardado.ate > agora) return guardado.token;
  const r = await buscar('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_OAUTH_ID!, client_secret: env.GOOGLE_OAUTH_SEGREDO!, refresh_token: env.GOOGLE_OAUTH_RENOVACAO!, grant_type: 'refresh_token' }).toString(),
  });
  const d = (await r.json().catch(() => null)) as { access_token?: string; expires_in?: number } | null;
  if (!r.ok || !d?.access_token) throw new ErroGoogle(401, 'O Google recusou a autorização do lab. Refaça a autorização da conta da V30, como está em Conexões.');
  guardado = { token: d.access_token, ate: agora + ((d.expires_in ?? 3600) - 60) * 1000, de: env.GOOGLE_OAUTH_RENOVACAO! };
  return guardado.token;
}

async function chamaGoogle(env: ChavesGoogle, buscar: Buscar, agora: number, url: string, init: RequestInit = {}): Promise<Response> {
  const t = await token(env, buscar, agora);
  const r = await buscar(url, { ...init, headers: { ...(init.headers as Record<string, string> | undefined), authorization: `Bearer ${t}` } });
  if (r.ok) return r;
  if (r.status === 401) esqueceToken();
  if (r.status === 401 || r.status === 403) throw new ErroGoogle(502, 'O Google recusou o pedido. Confira se a conta autorizada tem acesso a esta agenda e a este arquivo.');
  if (r.status === 404) throw new ErroGoogle(404, 'O Google não achou isso na conta ligada ao lab.');
  throw new ErroGoogle(502, 'O Google não respondeu. Tente de novo em instantes.');
}

/** Soma dias a uma data AAAA-MM-DD. */
const somaDias = (dia: string, n: number) => { const d = new Date(dia + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** Rotas /api/google. Sem a autorização guardada, responde que o Google Agenda ainda não está ligado. */
export async function rotaGoogle(req: Request, env: ChavesGoogle, caminho: string, buscar: Buscar = fetch, agora = Date.now()): Promise<Response | null> {
  if (!caminho.startsWith('/api/google/')) return null;
  // ainda não ligado é um estado normal do lab, não um erro: responde 200 e a tela mostra o caminho para ligar
  if (!googleLigado(env)) return json({ erro: 'O Google Agenda ainda não está ligado ao lab. O passo a passo está em Conexões.', desligado: true });
  const agenda = encodeURIComponent(env.AGENDA_GOOGLE || 'primary');
  const base = `https://www.googleapis.com/calendar/v3/calendars/${agenda}/events`;
  try {
    if (caminho === '/api/google/reunioes' && req.method === 'GET') {
      // da semana passada, onde ficam as anotações para organizar, até três semanas para a frente
      const q = new URL(req.url).searchParams, hoje = V.hojeBrasil(agora);
      const de = V.dataReal(q.get('de')) ? q.get('de')! : somaDias(hoje, -7), ate = V.dataReal(q.get('ate')) ? q.get('ate')! : somaDias(hoje, 21);
      if (ate < de) return ruim('O fim vem antes do começo.');
      const p = new URLSearchParams({ singleEvents: 'true', orderBy: 'startTime', maxResults: '100', timeZone: FUSO, timeMin: `${de}T00:00:00-03:00`, timeMax: `${somaDias(ate, 1)}T00:00:00-03:00` });
      const d = (await (await chamaGoogle(env, buscar, agora, `${base}?${p}`)).json()) as { items?: unknown[] };
      return json({ reunioes: (d.items ?? []).map(deEvento).filter(Boolean) });
    }
    if (caminho === '/api/google/reunioes' && req.method === 'POST') {
      const v = V.novaReuniaoMeet(await corpo(req)); if (!v.ok) return ruim(v.erro);
      const r = await chamaGoogle(env, buscar, agora, `${base}?conferenceDataVersion=1&sendUpdates=all`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(eventoNovo(v.v, crypto.randomUUID())),
      });
      return json(deEvento(await r.json()), 201);
    }
    // pauta preparada pela equipe vai para a descrição do evento. Sem aviso por e-mail: o convite já foi
    const ev = caminho.match(/^\/api\/google\/reunioes\/([\w-]{5,200})$/);
    if (ev && req.method === 'PATCH') {
      const o = (await corpo(req)) as { pauta?: unknown };
      const pauta = typeof o?.pauta === 'string' ? o.pauta.trim().slice(0, V.MAX_PAUTA) : '';
      if (!pauta) return ruim('A pauta está vazia.');
      const r = await chamaGoogle(env, buscar, agora, `${base}/${ev[1]}?sendUpdates=none`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ description: pauta }),
      });
      return json(deEvento(await r.json()));
    }
    const x = caminho.match(/^\/api\/google\/anotacoes\/([\w-]{10,200})$/);
    if (x && req.method === 'GET') {
      const r = await chamaGoogle(env, buscar, agora, `https://www.googleapis.com/drive/v3/files/${x[1]}/export?mimeType=text%2Fplain`);
      const texto = (await r.text()).replace(/^﻿/, '').trim();
      return json({ texto: texto.slice(0, MAX_ANOTACOES), cortado: texto.length > MAX_ANOTACOES });
    }
    return json({ erro: 'Rota não existe.' }, 404);
  } catch (e) {
    if (e instanceof ErroGoogle) return ruim(e.message, e.status);
    throw e;
  }
}
