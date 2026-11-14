// Rotas de dados do lab sobre o D1. Cada rota valida, grava e devolve o registro como ficou.
import { diaDoCiclo, missoesIniciais, semente, type EstadoLab, type Skill } from '../src/lib/dados';
import { agentesBase, type Agente } from '../src/lib/equipe';
import { MODELO_PADRAO } from '../src/lib/modelos';
import { SKILLS_BASE, VINCULOS_BASE } from '../src/lib/skills';
import * as V from './validacao';
import { provedoresLigados, type Chaves } from './ia';

export type Env = Chaves & { DB: D1Database; ACESSO_EQUIPE?: string; ACESSO_AUD?: string };
export const TAREFA = 'id, agente, titulo, detalhe, estado, projeto_id, pedido_id, entrega, modelo';
export const json = (dados: unknown, status = 200) => Response.json(dados, { status, headers: { 'cache-control': 'no-store' } });
export const ruim = (erro: string, status = 400) => json({ erro }, status);
export async function corpo(req: Request): Promise<unknown> { try { return await req.json(); } catch { return null; } }
const existe = async (db: D1Database, tabela: 'projetos' | 'reunioes', id: string | number) => !!(await db.prepare(`SELECT 1 FROM ${tabela} WHERE id = ?`).bind(id).first());

/** Grava a história de exemplo se o banco estiver vazio. Roda na primeira leitura. */
/** Equipe de partida e skills de base. Roda uma vez, quando a tabela de especialistas está vazia. */
export async function semeiaNucleo(db: D1Database) {
  const tem = await db.prepare('SELECT COUNT(*) AS n FROM agentes').first<{ n: number }>();
  if (tem && tem.n > 0) return;
  const st: D1PreparedStatement[] = [];
  for (const a of agentesBase()) st.push(db.prepare('INSERT OR IGNORE INTO agentes (id, nome, papel, zona, aparencia, base) VALUES (?, ?, ?, ?, ?, 1)').bind(a.id, a.nome, a.papel, a.zona, a.aparencia));
  for (const k of SKILLS_BASE) st.push(db.prepare('INSERT OR IGNORE INTO skills (id, nome, descricao, conteudo, para_todos) VALUES (?, ?, ?, ?, ?)').bind(k.id, k.nome, k.descricao, k.conteudo, k.para_todos ? 1 : 0));
  for (const [agente, lista] of Object.entries(VINCULOS_BASE)) for (const k of lista) st.push(db.prepare('INSERT OR IGNORE INTO agente_skills (agente, skill) VALUES (?, ?)').bind(agente, k));
  await db.batch(st);
}

/** Quem está na equipe. O conjunto de ids só tem quem está ativo. */
export async function equipe(db: D1Database): Promise<{ todos: Agente[]; ids: Set<string> }> {
  await semeiaNucleo(db);
  const { results } = await db.prepare('SELECT id, nome, papel, zona, aparencia, modelo, base, ativo FROM agentes ORDER BY base DESC, criado_em, rowid').all<Omit<Agente, 'base' | 'ativo'> & { base: number; ativo: number }>();
  const todos = results.map(a => ({ ...a, base: !!a.base, ativo: !!a.ativo }));
  return { todos, ids: new Set(todos.filter(a => a.ativo).map(a => a.id)) };
}

/** Skills que entram nas instruções de um especialista: as que valem para todos e as dele. */
export async function skillsDe(db: D1Database, agente: string): Promise<Skill[]> {
  const { results } = await db.prepare('SELECT id, nome, descricao, conteudo, para_todos FROM skills WHERE para_todos = 1 OR id IN (SELECT skill FROM agente_skills WHERE agente = ?) ORDER BY para_todos DESC, criado_em, rowid').bind(agente).all<Omit<Skill, 'para_todos'> & { para_todos: number }>();
  return results.map(k => ({ ...k, para_todos: !!k.para_todos }));
}

export async function modeloPadraoDe(db: D1Database): Promise<string> {
  const r = await db.prepare("SELECT valor FROM config WHERE chave = 'modelo_padrao'").first<{ valor: string }>();
  return r?.valor || MODELO_PADRAO;
}

export async function semeia(db: D1Database) {
  await semeiaNucleo(db);
  const tem = await db.prepare('SELECT COUNT(*) AS n FROM clientes').first<{ n: number }>();
  if (tem && tem.n > 0) return;
  const s = semente(V.hojeBrasil()), st: D1PreparedStatement[] = [];
  for (const c of s.clientes) st.push(db.prepare('INSERT INTO clientes (id, setor, situacao, fase) VALUES (?, ?, ?, ?)').bind(c.id, c.setor, c.situacao, c.fase));
  for (const p of s.projetos) st.push(db.prepare('INSERT INTO projetos (id, cliente_id, nome, fase, dia, mesa, inicio) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(p.id, p.cliente_id, p.nome, p.fase, p.dia, p.mesa, p.inicio));
  for (const p of s.pedidos) st.push(db.prepare('INSERT INTO pedidos (id, texto, projeto_id, estado, sintese, criado_em) VALUES (?, ?, ?, ?, ?, ?)').bind(p.id, p.texto, p.projeto_id, p.estado, p.sintese, p.criado_em));
  for (const t of s.tarefas) st.push(db.prepare('INSERT INTO missoes (agente, titulo, detalhe, estado, projeto_id, pedido_id, entrega, modelo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(t.agente, t.titulo, t.detalhe, t.estado, t.projeto_id, t.pedido_id, t.entrega, t.modelo));
  for (const [agente, texto] of Object.entries(s.instrucoes)) st.push(db.prepare('INSERT OR REPLACE INTO instrucoes (agente, texto) VALUES (?, ?)').bind(agente, texto));
  for (const m of [...s.memorias].reverse()) st.push(db.prepare('INSERT INTO memorias (agente, texto, origem, criado_em) VALUES (?, ?, ?, ?)').bind(m.agente, m.texto, m.origem, m.criado_em));
  // banco vazio: as reuniões recebem id 1, 2, 3... e cada decisão já aponta para a reunião de onde saiu
  s.reunioes.forEach((r, i) => {
    st.push(db.prepare('INSERT INTO reunioes (id, titulo, pauta, dia, hora, participantes, projeto_id, status, ata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(i + 1, r.titulo, r.pauta, r.dia, r.hora, JSON.stringify(r.participantes), r.projeto_id, r.status, r.ata));
    if (r.decisao) st.push(db.prepare('INSERT INTO decisoes (titulo, contexto, projeto_id, reuniao_id, criado_em) VALUES (?, ?, ?, ?, ?)')
      .bind(r.decisao.titulo, r.decisao.contexto, r.projeto_id, i + 1, r.dia + ' 18:00:00'));
  });
  // um batch só é uma transação: ou semeia tudo ou nada. Se outra leitura semeou junto, esta perde a corrida e segue.
  try { await db.batch(st); } catch (e) {
    const outra = await db.prepare('SELECT COUNT(*) AS n FROM clientes').first<{ n: number }>();
    if (!outra?.n) throw e;
  }
}

export async function lerEstado(db: D1Database): Promise<EstadoLab> {
  await semeia(db);
  const [cl, pr, ta, re, de, ins, me, co, sk, vi, pe] = await db.batch([
    db.prepare('SELECT id, setor, situacao, fase FROM clientes ORDER BY criado_em'),
    db.prepare('SELECT id, cliente_id, nome, fase, dia, mesa, inicio FROM projetos ORDER BY criado_em'),
    db.prepare(`SELECT ${TAREFA} FROM missoes ORDER BY id`),
    db.prepare('SELECT id, titulo, pauta, dia, hora, participantes, projeto_id, status, ata FROM reunioes ORDER BY dia, hora'),
    db.prepare('SELECT id, titulo, contexto, projeto_id, reuniao_id, criado_em FROM decisoes ORDER BY id DESC'),
    db.prepare('SELECT agente, texto FROM instrucoes'),
    db.prepare('SELECT id, agente, texto, origem, criado_em FROM memorias ORDER BY id DESC'),
    db.prepare("SELECT COUNT(*) AS n FROM mensagens WHERE papel = 'assistant'"),
    db.prepare('SELECT id, nome, descricao, conteudo, para_todos FROM skills ORDER BY para_todos DESC, criado_em, rowid'),
    db.prepare('SELECT agente, skill FROM agente_skills'),
    db.prepare('SELECT id, texto, projeto_id, estado, sintese, criado_em FROM pedidos ORDER BY id DESC LIMIT 40'),
  ]);
  const vinculos: Record<string, string[]> = {};
  for (const v of vi.results as { agente: string; skill: string }[]) (vinculos[v.agente] ??= []).push(v.skill);
  return {
    clientes: cl.results as EstadoLab['clientes'],
    projetos: (pr.results as EstadoLab['projetos']).map(p => ({ ...p, dia: p.inicio ? diaDoCiclo(p.inicio, V.hojeBrasil()) : p.dia })),
    tarefas: ta.results as EstadoLab['tarefas'],
    reunioes: (re.results as (Omit<EstadoLab['reunioes'][number], 'participantes'> & { participantes: string })[]).map(r => ({ ...r, participantes: JSON.parse(r.participantes) })),
    decisoes: de.results as EstadoLab['decisoes'],
    instrucoes: Object.fromEntries((ins.results as { agente: string; texto: string }[]).map(i => [i.agente, i.texto])),
    memorias: me.results as EstadoLab['memorias'],
    conversas: (co.results[0] as { n: number }).n,
    agentes: (await equipe(db)).todos,
    skills: (sk.results as (Omit<Skill, 'para_todos'> & { para_todos: number })[]).map(k => ({ ...k, para_todos: !!k.para_todos })),
    vinculos,
    pedidos: pe.results as EstadoLab['pedidos'],
    modeloPadrao: await modeloPadraoDe(db),
  };
}

/** Contexto que entra na conversa de um especialista: instrução, memória e tarefas abertas. */
export async function contextoDe(db: D1Database, agente: string): Promise<string> {
  const [ins, mem, tar] = await db.batch([
    db.prepare('SELECT texto FROM instrucoes WHERE agente = ?').bind(agente),
    db.prepare('SELECT texto FROM memorias WHERE agente = ? ORDER BY id DESC LIMIT 12').bind(agente),
    db.prepare("SELECT m.titulo, m.estado, p.nome AS projeto FROM missoes m LEFT JOIN projetos p ON p.id = m.projeto_id WHERE m.agente = ? AND m.estado != 'feito' ORDER BY m.id LIMIT 12").bind(agente),
  ]);
  const partes: string[] = [];
  const i = (ins.results[0] as { texto?: string } | undefined)?.texto;
  if (i) partes.push('Instruções da equipe para você: ' + i);
  const m = mem.results as { texto: string }[];
  if (m.length) partes.push('O que você já sabe, anotado em conversas anteriores:\n' + m.map(x => '- ' + x.texto).join('\n'));
  const t = tar.results as { titulo: string; estado: string; projeto: string | null }[];
  if (t.length) partes.push('Suas tarefas abertas:\n' + t.map(x => `- ${x.titulo} (${x.estado === 'fazendo' ? 'em andamento' : 'na fila'}${x.projeto ? ', ' + x.projeto : ''})`).join('\n'));
  return partes.join('\n\n');
}

export async function rotaDados(req: Request, env: Env, caminho: string, ids: V.Ids): Promise<Response | null> {
  const db = env.DB, m = req.method;
  if (caminho === '/api/estado' && m === 'GET') return json(await lerEstado(db));
  if (caminho === '/api/conexoes' && m === 'GET') {
    const n = await db.prepare('SELECT COUNT(*) AS n FROM mensagens').first<{ n: number }>().catch(() => null);
    const ligados = provedoresLigados(env);
    return json({ banco: n !== null, chave: Object.values(ligados).some(Boolean), provedores: ligados, acesso: Boolean(env.ACESSO_EQUIPE && env.ACESSO_AUD), mensagens: n?.n ?? 0 });
  }
  if (caminho === '/api/clientes' && m === 'POST') {
    const v = V.novoCliente(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const id = `${V.slug(v.v.setor)}-${Date.now().toString(36)}`;
    const r = await db.prepare('INSERT INTO clientes (id, setor, situacao) VALUES (?, ?, ?) RETURNING id, setor, situacao, fase').bind(id, v.v.setor, v.v.situacao).first();
    return json(r, 201);
  }
  if (caminho === '/api/projetos' && m === 'POST') {
    const v = V.novoProjeto(await corpo(req)); if (!v.ok) return ruim(v.erro);
    if (!(await db.prepare('SELECT 1 FROM clientes WHERE id = ?').bind(v.v.cliente_id).first())) return ruim('Esse cliente não existe.');
    const id = `${V.slug(v.v.nome)}-${Date.now().toString(36)}`, inicio = V.hojeBrasil();
    const [pr, ...ms] = await db.batch([
      db.prepare('INSERT INTO projetos (id, cliente_id, nome, fase, dia, mesa, inicio) VALUES (?, ?, ?, 0, 1, NULL, ?) RETURNING id, cliente_id, nome, fase, dia, mesa, inicio').bind(id, v.v.cliente_id, v.v.nome, inicio),
      ...missoesIniciais(v.v.nome).map(t => db.prepare(`INSERT INTO missoes (agente, titulo, projeto_id) VALUES (?, ?, ?) RETURNING ${TAREFA}`).bind(t.agente, t.titulo, id)),
    ]);
    await db.prepare('UPDATE clientes SET fase = 0 WHERE id = ?').bind(v.v.cliente_id).run();
    return json({ projeto: pr.results[0], missoes: ms.map(x => x.results[0]) }, 201);
  }
  if (caminho === '/api/tarefas' && m === 'POST') {
    const v = V.novaTarefa(await corpo(req), ids); if (!v.ok) return ruim(v.erro);
    if (v.v.projeto_id && !(await db.prepare('SELECT 1 FROM projetos WHERE id = ?').bind(v.v.projeto_id).first())) return ruim('Esse projeto não existe.');
    const igual = await db.prepare("SELECT 1 FROM missoes WHERE agente = ? AND estado != 'feito' AND lower(trim(titulo)) = lower(?)").bind(v.v.agente, v.v.titulo).first();
    if (igual) return ruim('Essa missão já está aberta com essa pessoa.', 409);
    const r = await db.prepare(`INSERT INTO missoes (agente, titulo, detalhe, projeto_id) VALUES (?, ?, ?, ?) RETURNING ${TAREFA}`).bind(v.v.agente, v.v.titulo, v.v.detalhe, v.v.projeto_id).first();
    return json(r, 201);
  }
  let x = caminho.match(/^\/api\/tarefas\/(\d+)$/);
  if (x && m === 'PATCH') {
    const v = V.mudancaTarefa(await corpo(req), ids); if (!v.ok) return ruim(v.erro);
    const campos = Object.keys(v.v), valores = Object.values(v.v);
    const r = await db.prepare(`UPDATE missoes SET ${campos.map(c => c + ' = ?').join(', ')} WHERE id = ? RETURNING ${TAREFA}`).bind(...valores, Number(x[1])).first();
    return r ? json(r) : ruim('Missão não encontrada.', 404);
  }
  if (x && m === 'DELETE') {
    const r = await db.prepare('DELETE FROM missoes WHERE id = ?').bind(Number(x[1])).run();
    return r.meta.changes ? json({ ok: true }) : ruim('Missão não encontrada.', 404);
  }
  if (caminho === '/api/reunioes' && m === 'POST') {
    const v = V.novaReuniao(await corpo(req), ids); if (!v.ok) return ruim(v.erro);
    if (v.v.projeto_id && !(await existe(db, 'projetos', v.v.projeto_id))) return ruim('Esse projeto não existe.');
    const r = await db.prepare('INSERT INTO reunioes (titulo, pauta, dia, hora, participantes, projeto_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING id').bind(v.v.titulo, v.v.pauta, v.v.dia, v.v.hora, JSON.stringify(v.v.participantes), v.v.projeto_id).first<{ id: number }>();
    return json({ id: r!.id, ...v.v, status: 'agendada', ata: '' }, 201);
  }
  x = caminho.match(/^\/api\/projetos\/([a-z0-9-]+)$/);
  if (x && m === 'PATCH') {
    const v = V.mudancaProjeto(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const p = await db.prepare('UPDATE projetos SET fase = ? WHERE id = ? RETURNING cliente_id').bind(v.v.fase, x[1]).first<{ cliente_id: string }>();
    if (!p) return ruim('Projeto não encontrado.', 404);
    await db.prepare('UPDATE clientes SET fase = ? WHERE id = ?').bind(v.v.fase, p.cliente_id).run();
    return json({ ok: true });
  }
  x = caminho.match(/^\/api\/reunioes\/(\d+)$/);
  if (x && m === 'PATCH') {
    const v = V.mudancaReuniao(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const campos = Object.keys(v.v);
    const r = await db.prepare(`UPDATE reunioes SET ${campos.map(c => c + ' = ?').join(', ')} WHERE id = ? AND status = 'agendada' RETURNING id`).bind(...Object.values(v.v), Number(x[1])).first();
    return r ? json({ ok: true }) : ruim('Só dá para remarcar reunião que ainda não aconteceu.', 404);
  }
  if (x && m === 'DELETE') {
    const [, r] = await db.batch([
      db.prepare('UPDATE decisoes SET reuniao_id = NULL WHERE reuniao_id = ?').bind(Number(x[1])),
      db.prepare('DELETE FROM reunioes WHERE id = ?').bind(Number(x[1])),
    ]);
    return r.meta.changes ? json({ ok: true }) : ruim('Reunião não encontrada.', 404);
  }
  x = caminho.match(/^\/api\/decisoes\/(\d+)$/);
  if (x && m === 'PATCH') {
    const v = V.mudancaDecisao(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const campos = Object.keys(v.v);
    const r = await db.prepare(`UPDATE decisoes SET ${campos.map(c => c + ' = ?').join(', ')} WHERE id = ? RETURNING id`).bind(...Object.values(v.v), Number(x[1])).first();
    return r ? json({ ok: true }) : ruim('Decisão não encontrada.', 404);
  }
  if (x && m === 'DELETE') {
    const r = await db.prepare('DELETE FROM decisoes WHERE id = ?').bind(Number(x[1])).run();
    return r.meta.changes ? json({ ok: true }) : ruim('Decisão não encontrada.', 404);
  }
  x = caminho.match(/^\/api\/reunioes\/(\d+)\/ata$/);
  if (x && m === 'PUT') {
    const v = V.ata(await corpo(req)); if (!v.ok) return ruim(v.erro);
    const reu = await db.prepare('SELECT dia FROM reunioes WHERE id = ?').bind(Number(x[1])).first<{ dia: string }>();
    if (!reu) return ruim('Reunião não encontrada.', 404);
    if (reu.dia > V.hojeBrasil()) return ruim('A ata só abre no dia da reunião.');
    const r = await db.prepare("UPDATE reunioes SET ata = ?, status = 'feita' WHERE id = ? RETURNING id").bind(v.v.ata, Number(x[1])).first();
    return r ? json({ ok: true }) : ruim('Reunião não encontrada.', 404);
  }
  if (caminho === '/api/decisoes' && m === 'POST') {
    const v = V.novaDecisao(await corpo(req)); if (!v.ok) return ruim(v.erro);
    if (v.v.projeto_id && !(await existe(db, 'projetos', v.v.projeto_id))) return ruim('Esse projeto não existe.');
    if (v.v.reuniao_id !== null && !(await existe(db, 'reunioes', v.v.reuniao_id))) return ruim('Essa reunião não existe.');
    const r = await db.prepare('INSERT INTO decisoes (titulo, contexto, projeto_id, reuniao_id) VALUES (?, ?, ?, ?) RETURNING id, titulo, contexto, projeto_id, reuniao_id, criado_em').bind(v.v.titulo, v.v.contexto, v.v.projeto_id, v.v.reuniao_id).first();
    return json(r, 201);
  }
  x = caminho.match(/^\/api\/instrucoes\/([a-z0-9-]+)$/);
  if (x && m === 'PUT') {
    const v = V.instrucao(x[1], await corpo(req), ids); if (!v.ok) return ruim(v.erro);
    if (!v.v.texto) await db.prepare('DELETE FROM instrucoes WHERE agente = ?').bind(v.v.agente).run();
    else await db.prepare("INSERT INTO instrucoes (agente, texto) VALUES (?, ?) ON CONFLICT(agente) DO UPDATE SET texto = excluded.texto, atualizado_em = datetime('now')").bind(v.v.agente, v.v.texto).run();
    return json({ ok: true });
  }
  if (caminho === '/api/memorias' && m === 'POST') {
    const v = V.novaMemoria(await corpo(req), ids); if (!v.ok) return ruim(v.erro);
    const r = await db.prepare('INSERT INTO memorias (agente, texto, origem) VALUES (?, ?, ?) RETURNING id, agente, texto, origem, criado_em').bind(v.v.agente, v.v.texto, v.v.origem).first();
    return json(r, 201);
  }
  x = caminho.match(/^\/api\/memorias\/(\d+)$/);
  if (x && m === 'DELETE') {
    const r = await db.prepare('DELETE FROM memorias WHERE id = ?').bind(Number(x[1])).run();
    return r.meta.changes ? json({ ok: true }) : ruim('Nota não encontrada.', 404);
  }
  return null;
}
