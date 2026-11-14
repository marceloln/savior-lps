// Worker da Agência V30: serve o build estático e responde as rotas /api.
import { montaPedido } from './conversa';
import { equipe, json, rotaDados, type Env } from './api';
import { fala, reserva, rotaNucleo } from './nucleo';
import { portaria } from './acesso';
import type { Agente } from '../src/lib/equipe';

export type { Env };
type EnvWorker = Env & { ASSETS: Fetcher };

async function conversa(req: Request, env: Env, todos: Agente[], ids: Set<string>): Promise<Response> {
  let corpo: unknown;
  try { corpo = await req.json(); } catch { return json({ erro: 'Corpo não é JSON.' }, 400); }
  const m = montaPedido(corpo, ids);
  if (!m.ok) return json({ erro: m.erro }, 400);
  if (!(await reserva(env.DB, 'conversa'))) return json({ erro: 'Muitas perguntas em pouco tempo. Espere alguns minutos e tente de novo.' }, 429);
  const r = await fala(env, todos.find(a => a.id === m.agente)!, m.messages, 1024);
  if (!r.ok) return json({ erro: r.erro }, r.status);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO mensagens (agente, papel, texto) VALUES (?, ?, ?)').bind(m.agente, 'user', m.messages.at(-1)!.content),
    env.DB.prepare('INSERT INTO mensagens (agente, papel, texto) VALUES (?, ?, ?)').bind(m.agente, 'assistant', r.texto),
  ]);
  return json({ texto: r.texto });
}

async function historico(agente: string, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT papel, texto, criado_em FROM mensagens WHERE agente = ? ORDER BY id DESC LIMIT 30').bind(agente).all();
  return json({ mensagens: results.reverse() });
}

export default {
  async fetch(req: Request, env: EnvWorker): Promise<Response> {
    try { return await atende(req, env); }
    catch (e) {
      console.error('erro na rota', new URL(req.url).pathname, e);
      return json({ erro: 'O servidor do lab teve um problema. Tente de novo.' }, 500);
    }
  },
} satisfies ExportedHandler<EnvWorker>;

async function atende(req: Request, env: EnvWorker): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === '/api/saude') return json({ ok: true });
  if (url.pathname.startsWith('/api/')) {
    const recusa = await portaria(req, env.ACESSO_EQUIPE, env.ACESSO_AUD);
    if (recusa) return json({ erro: recusa.erro }, recusa.status);
  }
  if (url.pathname.startsWith('/api/')) {
    const { todos, ids } = await equipe(env.DB);
    if (url.pathname === '/api/conversa' && req.method === 'POST') return conversa(req, env, todos, ids);
    const h = url.pathname.match(/^\/api\/historico\/([a-z0-9-]+)$/);
    if (h && req.method === 'GET') return historico(h[1], env);
    return (await rotaDados(req, env, url.pathname, ids)) ?? (await rotaNucleo(req, env, url.pathname, todos, ids)) ?? json({ erro: 'Rota não existe.' }, 404);
  }
  return env.ASSETS.fetch(req);
}
