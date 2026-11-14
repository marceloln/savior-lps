// Rotas do núcleo multiagente: equipe, skills, modelo de IA, execução de missão e pedido ao lab.
import type { Cliente, Projeto, Tarefa } from '../src/lib/dados';
import { ORQUESTRADOR, type Agente } from '../src/lib/equipe';
import { contextoDe, corpo, json, modeloPadraoDe, ruim, skillsDe, TAREFA, type Env } from './api';
import { sistemaDe, type Mensagem } from './conversa';
import { chamaIA, type Resposta } from './ia';
import { lePlano, promptExecucao, promptPlano, promptSintese, validaMissoes } from './orquestra';
import * as V from './validacao';

/** Toda chamada a modelo custa dinheiro: no máximo 60 a cada 10 minutos para o lab inteiro. */
export const LIMITE_USO = 60;

/** Reserva uma vaga de uso numa instrução só, para pedidos simultâneos não passarem do limite juntos. */
export async function reserva(db: D1Database, tipo: string): Promise<boolean> {
  const r = await db.prepare(`INSERT INTO uso (tipo) SELECT ? WHERE (SELECT COUNT(*) FROM uso WHERE criado_em > datetime('now', '-10 minutes')) < ? RETURNING id`)
    .bind(tipo, LIMITE_USO).first<{ id: number }>();
  return !!r;
}
const cheio = () => ruim('Muitos pedidos aos modelos em pouco tempo. Espere alguns minutos e tente de novo.', 429);

/** Um especialista fala: junta instruções de base, skills, contexto vivo e chama o modelo dele. */
export async function fala(env: Env, a: Agente, messages: Mensagem[], max: number, extra = ''): Promise<Resposta & { modelo: string }> {
  const [skills, contexto, padrao] = await Promise.all([skillsDe(env.DB, a.id), contextoDe(env.DB, a.id), modeloPadraoDe(env.DB)]);
  const modelo = env.IA_SIMULADA === '1' ? 'simulado:teste' : a.modelo || padrao;
  const system = [sistemaDe(a, skills), contexto, extra].filter(Boolean).join('\n\n');
  return { ...(await chamaIA(env, { modelo, system, messages, max })), modelo };
}

const PAPEL_ORQUESTRA = 'Você recebe os pedidos dos sócios, divide em missões para a equipe e, no fim, junta as entregas numa resposta só.';

export async function rotaNucleo(req: Request, env: Env, caminho: string, todos: Agente[], ids: V.Ids): Promise<Response | null> {
  const db = env.DB, m = req.method;
  const quem = (id: string) => todos.find(a => a.id === id && a.ativo);

  // ---------- equipe ----------
  if (caminho === '/api/agentes' && m === 'POST') {
    const v = V.novoAgente(await corpo(req)); if (!v.ok) return ruim(v.erro);
    if (todos.some(a => a.ativo && a.nome.toLowerCase() === v.v.nome.toLowerCase())) return ruim('Já existe alguém com esse nome no lab.', 409);
    const id = `${V.slug(v.v.nome)}-${Date.now().toString(36)}`;
    await db.prepare('INSERT INTO agentes (id, nome, papel, zona, aparencia, modelo) VALUES (?, ?, ?, ?, ?, ?)').bind(id, v.v.nome, v.v.papel, v.v.zona, v.v.aparencia, v.v.modelo).run();
    return json({ id, ...v.v, base: false, ativo: true }, 201);
  }
  let x = caminho.match(/^\/api\/agentes\/([a-z0-9-]+)$/);
  if (x && m === 'PATCH') {
    const v = V.mudancaAgente(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const a = todos.find(t => t.id === x![1]);
    if (!a) return ruim('Especialista não encontrado.', 404);
    if (v.v.ativo === 0) {
      if (a.base) return ruim('Quem é da equipe de partida não pode ser desligado.');
      const aberta = await db.prepare("SELECT 1 FROM missoes WHERE agente = ? AND estado != 'feito'").bind(a.id).first();
      if (aberta) return ruim('Passe as missões abertas dele para outra pessoa antes de desligar.', 409);
    }
    const campos = Object.keys(v.v);
    await db.prepare(`UPDATE agentes SET ${campos.map(c => c + ' = ?').join(', ')} WHERE id = ?`).bind(...Object.values(v.v), a.id).run();
    return json({ ok: true });
  }
  x = caminho.match(/^\/api\/agentes\/([a-z0-9-]+)\/skills$/);
  if (x && m === 'PUT') {
    if (!ids.has(x[1])) return ruim('Especialista não encontrado.', 404);
    const v = V.listaDeSkills(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const { results } = await db.prepare('SELECT id FROM skills WHERE para_todos = 0').all<{ id: string }>();
    const validas = v.v.filter(k => results.some(r => r.id === k));
    await db.batch([
      db.prepare('DELETE FROM agente_skills WHERE agente = ?').bind(x[1]),
      ...validas.map(k => db.prepare('INSERT INTO agente_skills (agente, skill) VALUES (?, ?)').bind(x![1], k)),
    ]);
    return json({ skills: validas });
  }

  // ---------- skills ----------
  if (caminho === '/api/skills' && m === 'POST') {
    const c = await corpo(req), v = V.novaSkill(c); if (!v.ok) return ruim(v.erro);
    const para = (c as { agente?: unknown } | null)?.agente;
    if (para !== undefined && (typeof para !== 'string' || !ids.has(para))) return ruim('Especialista desconhecido.');
    const id = `${V.slug(v.v.nome)}-${Date.now().toString(36)}`;
    await db.batch([
      db.prepare('INSERT INTO skills (id, nome, descricao, conteudo, para_todos) VALUES (?, ?, ?, ?, ?)').bind(id, v.v.nome, v.v.descricao, v.v.conteudo, v.v.para_todos),
      ...(typeof para === 'string' && !v.v.para_todos ? [db.prepare('INSERT INTO agente_skills (agente, skill) VALUES (?, ?)').bind(para, id)] : []),
    ]);
    return json({ id, nome: v.v.nome, descricao: v.v.descricao, conteudo: v.v.conteudo, para_todos: !!v.v.para_todos }, 201);
  }
  x = caminho.match(/^\/api\/skills\/([a-z0-9-]+)$/);
  if (x && m === 'PATCH') {
    const v = V.mudancaSkill(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const campos = Object.keys(v.v);
    const r = await db.prepare(`UPDATE skills SET ${campos.map(c => c + ' = ?').join(', ')} WHERE id = ? RETURNING id`).bind(...Object.values(v.v), x[1]).first();
    return r ? json({ ok: true }) : ruim('Skill não encontrada.', 404);
  }
  if (x && m === 'DELETE') {
    const [, r] = await db.batch([db.prepare('DELETE FROM agente_skills WHERE skill = ?').bind(x[1]), db.prepare('DELETE FROM skills WHERE id = ?').bind(x[1])]);
    return r.meta.changes ? json({ ok: true }) : ruim('Skill não encontrada.', 404);
  }

  // ---------- modelo padrão ----------
  if (caminho === '/api/config/modelo' && m === 'PUT') {
    const v = V.modeloPadrao(await corpo(req)); if (!v.ok) return ruim(v.erro);
    await db.prepare("INSERT INTO config (chave, valor) VALUES ('modelo_padrao', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor").bind(v.v).run();
    return json({ modelo: v.v });
  }

  // ---------- executar uma missão ----------
  x = caminho.match(/^\/api\/tarefas\/(\d+)\/executar$/);
  if (x && m === 'POST') {
    const t = await db.prepare(`SELECT ${TAREFA} FROM missoes WHERE id = ?`).bind(Number(x[1])).first<Tarefa>();
    if (!t) return ruim('Missão não encontrada.', 404);
    const a = quem(t.agente);
    if (!a) return ruim('Quem tinha essa missão não está mais no lab. Passe para outra pessoa.', 409);
    const pedeAjuste = V.ajuste(await corpo(req));
    if (!(await reserva(db, 'execucao'))) return cheio();
    const [proj, ped, ant] = await Promise.all([
      t.projeto_id ? db.prepare('SELECT p.id, p.cliente_id, p.nome, p.fase, p.dia, p.mesa, p.inicio, c.setor, c.situacao FROM projetos p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = ?').bind(t.projeto_id).first<Projeto & Pick<Cliente, 'setor' | 'situacao'>>() : null,
      t.pedido_id ? db.prepare('SELECT texto FROM pedidos WHERE id = ?').bind(t.pedido_id).first<{ texto: string }>() : null,
      t.pedido_id ? db.prepare("SELECT agente, titulo, entrega FROM missoes WHERE pedido_id = ? AND id != ? AND entrega != '' ORDER BY id LIMIT 4").bind(t.pedido_id, t.id).all<Pick<Tarefa, 'agente' | 'titulo' | 'entrega'>>() : null,
    ]);
    // enquanto o modelo escreve, a missão aparece como em andamento; se der errado, volta ao que era
    await db.prepare("UPDATE missoes SET estado = 'fazendo' WHERE id = ?").bind(t.id).run();
    const volta = () => db.prepare('UPDATE missoes SET estado = ? WHERE id = ?').bind(t.estado, t.id).run();
    let r: Awaited<ReturnType<typeof fala>>;
    try {
      r = await fala(env, a, [{ role: 'user', content: promptExecucao({
        titulo: t.titulo, detalhe: t.detalhe, pedido: ped?.texto,
        projeto: proj, cliente: proj ? { id: proj.cliente_id, setor: proj.setor, situacao: proj.situacao, fase: proj.fase } : null,
        anteriores: (ant?.results ?? []).map(o => { const c = todos.find(z => z.id === o.agente); return { nome: c?.nome ?? 'Colega', papel: c?.papel ?? 'especialista', titulo: o.titulo, entrega: o.entrega }; }),
        versaoAnterior: t.entrega, ajuste: pedeAjuste,
      }) }], 3000);
    } catch (e) { await volta(); throw e; }
    if (!r.ok) { await volta(); return ruim(r.erro, r.status); }
    const feita = await db.prepare(`UPDATE missoes SET estado = 'feito', entrega = ?, modelo = ? WHERE id = ? RETURNING ${TAREFA}`).bind(r.texto, r.modelo, t.id).first();
    return json(feita);
  }

  // ---------- pedido ao lab ----------
  if (caminho === '/api/pedidos/plano' && m === 'POST') {
    const v = V.textoDoPedido(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const orq = quem(ORQUESTRADOR); if (!orq) return ruim('A orquestração não está na equipe.', 503);
    const proj = v.v.projeto_id ? await db.prepare('SELECT p.id, p.cliente_id, p.nome, p.fase, p.dia, p.mesa, p.inicio, c.setor, c.situacao FROM projetos p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = ?').bind(v.v.projeto_id).first<Projeto & Pick<Cliente, 'setor' | 'situacao'>>() : null;
    if (v.v.projeto_id && !proj) return ruim('Esse projeto não existe.');
    if (!(await reserva(db, 'plano'))) return cheio();
    const { results } = await db.prepare("SELECT agente, COUNT(*) AS n FROM missoes WHERE estado != 'feito' GROUP BY agente").all<{ agente: string; n: number }>();
    const time = todos.filter(a => a.ativo && a.id !== ORQUESTRADOR).map(a => ({ ...a, abertas: results.find(r => r.agente === a.id)?.n ?? 0 }));
    const r = await fala(env, orq, [{ role: 'user', content: promptPlano(v.v.texto, time, proj, proj ? { id: proj.cliente_id, setor: proj.setor, situacao: proj.situacao, fase: proj.fase } : null) }], 1500, PAPEL_ORQUESTRA);
    if (!r.ok) return ruim(r.erro, r.status);
    const plano = lePlano(r.texto, new Set(time.map(a => a.id)));
    return plano.ok ? json({ missoes: plano.missoes }) : ruim(plano.erro, 502);
  }
  if (caminho === '/api/pedidos' && m === 'POST') {
    const c = await corpo(req), v = V.textoDoPedido(c); if (!v.ok) return ruim(v.erro);
    const lista = (c as { missoes?: unknown } | null)?.missoes;
    const missoes = Array.isArray(lista) ? validaMissoes(lista, ids) : [];
    if (!missoes.length) return ruim('O pedido precisa de ao menos uma missão para alguém da equipe.');
    if (v.v.projeto_id && !(await db.prepare('SELECT 1 FROM projetos WHERE id = ?').bind(v.v.projeto_id).first())) return ruim('Esse projeto não existe.');
    const ped = await db.prepare('INSERT INTO pedidos (texto, projeto_id) VALUES (?, ?) RETURNING id, texto, projeto_id, estado, sintese, criado_em').bind(v.v.texto, v.v.projeto_id).first<{ id: number }>();
    const criadas = await db.batch(missoes.map(t => db.prepare(`INSERT INTO missoes (agente, titulo, detalhe, projeto_id, pedido_id) VALUES (?, ?, ?, ?, ?) RETURNING ${TAREFA}`).bind(t.agente, t.titulo, t.detalhe, v.v.projeto_id, ped!.id)));
    return json({ pedido: ped, missoes: criadas.map(r => r.results[0]) }, 201);
  }
  x = caminho.match(/^\/api\/pedidos\/(\d+)\/sintese$/);
  if (x && m === 'POST') {
    const ped = await db.prepare('SELECT id, texto FROM pedidos WHERE id = ?').bind(Number(x[1])).first<{ id: number; texto: string }>();
    if (!ped) return ruim('Pedido não encontrado.', 404);
    const orq = quem(ORQUESTRADOR); if (!orq) return ruim('A orquestração não está na equipe.', 503);
    const { results } = await db.prepare('SELECT agente, titulo, entrega FROM missoes WHERE pedido_id = ? ORDER BY id').bind(ped.id).all<Pick<Tarefa, 'agente' | 'titulo' | 'entrega'>>();
    const prontas = results.filter(t => t.entrega);
    if (!prontas.length) return ruim('Ainda não há nenhuma entrega para juntar.', 409);
    if (prontas.length < results.length) return ruim('Ainda há missão deste pedido sem entrega.', 409);
    if (!(await reserva(db, 'sintese'))) return cheio();
    const r = await fala(env, orq, [{ role: 'user', content: promptSintese(ped.texto, prontas.map(t => { const a = todos.find(z => z.id === t.agente); return { nome: a?.nome ?? 'Colega', papel: a?.papel ?? 'especialista', titulo: t.titulo, entrega: t.entrega }; })) }], 3000, PAPEL_ORQUESTRA);
    if (!r.ok) return ruim(r.erro, r.status);
    const feito = await db.prepare("UPDATE pedidos SET sintese = ?, estado = 'entregue' WHERE id = ? RETURNING id, texto, projeto_id, estado, sintese, criado_em").bind(r.texto, ped.id).first();
    return json(feito);
  }
  x = caminho.match(/^\/api\/pedidos\/(\d+)$/);
  if (x && m === 'DELETE') {
    const [, , r] = await db.batch([
      db.prepare("DELETE FROM missoes WHERE pedido_id = ? AND entrega = ''").bind(Number(x[1])),
      db.prepare('UPDATE missoes SET pedido_id = NULL WHERE pedido_id = ?').bind(Number(x[1])),
      db.prepare('DELETE FROM pedidos WHERE id = ?').bind(Number(x[1])),
    ]);
    return r.meta.changes ? json({ ok: true }) : ruim('Pedido não encontrado.', 404);
  }
  return null;
}
