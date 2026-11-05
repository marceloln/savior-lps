-- Memória do lab: projetos, tarefas por projeto, reuniões, decisões, instruções e notas por especialista.
CREATE TABLE IF NOT EXISTS projetos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id),
  nome TEXT NOT NULL,
  fase INTEGER NOT NULL DEFAULT 0 CHECK (fase BETWEEN 0 AND 3),
  dia INTEGER NOT NULL DEFAULT 1 CHECK (dia BETWEEN 1 AND 30),
  mesa TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE missoes ADD COLUMN projeto_id TEXT REFERENCES projetos(id);
ALTER TABLE missoes ADD COLUMN detalhe TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS reunioes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  pauta TEXT NOT NULL DEFAULT '',
  dia TEXT NOT NULL,
  hora TEXT NOT NULL,
  participantes TEXT NOT NULL DEFAULT '[]',
  projeto_id TEXT REFERENCES projetos(id),
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'feita')),
  ata TEXT NOT NULL DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS decisoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  contexto TEXT NOT NULL DEFAULT '',
  projeto_id TEXT REFERENCES projetos(id),
  reuniao_id INTEGER REFERENCES reunioes(id),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS instrucoes (
  agente TEXT PRIMARY KEY,
  texto TEXT NOT NULL,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agente TEXT NOT NULL,
  texto TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'conversa')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_missoes_projeto ON missoes (projeto_id, estado);
CREATE INDEX IF NOT EXISTS idx_memorias_agente ON memorias (agente, id);
