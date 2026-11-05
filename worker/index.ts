// Worker da Agência V30: serve o build estático e responde as rotas /api.
import { montaPedido } from './conversa';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ANTHROPIC_API_KEY?: string;
}

const json = (dados: unknown, status = 200) => Response.json(dados, { status, headers: { 'cache-control': 'no-store' } });

async function conversa(req: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) return json({ erro: 'A chave da API do Claude ainda não foi configurada no Worker.' }, 503);
  let corpo: unknown;
  try { corpo = await req.json(); } catch { return json({ erro: 'Corpo não é JSON.' }, 400); }
  const m = montaPedido(corpo);
  if (!m.ok) return json({ erro: m.erro }, 400);
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(m.pedido),
  });
  if (!r.ok) return json({ erro: 'A API do Claude não respondeu agora. Tente de novo em instantes.' }, 502);
  const dados = await r.json<{ content: { type: string; text?: string }[] }>();
  const texto = dados.content.filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
  const pergunta = m.pedido.messages.at(-1)!.content;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO mensagens (agente, papel, texto) VALUES (?, ?, ?)').bind(m.agente, 'user', pergunta),
    env.DB.prepare('INSERT INTO mensagens (agente, papel, texto) VALUES (?, ?, ?)').bind(m.agente, 'assistant', texto),
  ]);
  return json({ texto });
}

async function historico(agente: string, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT papel, texto, criado_em FROM mensagens WHERE agente = ? ORDER BY id DESC LIMIT 30').bind(agente).all();
  return json({ mensagens: results.reverse() });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/saude') return json({ ok: true });
    if (url.pathname === '/api/conversa' && req.method === 'POST') return conversa(req, env);
    const h = url.pathname.match(/^\/api\/historico\/([a-z]+)$/);
    if (h && req.method === 'GET') return historico(h[1], env);
    if (url.pathname.startsWith('/api/')) return json({ erro: 'Rota não existe.' }, 404);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
