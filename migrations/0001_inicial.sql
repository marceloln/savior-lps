-- Esquema inicial da Agência V30. Cliente aparece por setor e situação, nunca pelo nome.
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  setor TEXT NOT NULL,
  situacao TEXT NOT NULL,
  fase INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS missoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agente TEXT NOT NULL,
  titulo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'fila' CHECK (estado IN ('fila', 'fazendo', 'feito')),
  cliente_id TEXT REFERENCES clientes(id),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agente TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('user', 'assistant')),
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mensagens_agente ON mensagens (agente, id);
CREATE INDEX IF NOT EXISTS idx_missoes_agente ON missoes (agente, estado);
