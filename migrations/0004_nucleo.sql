-- Núcleo multiagente: especialistas no banco, skills, pedidos ao lab, entrega por missão e limite de uso.
CREATE TABLE IF NOT EXISTS agentes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  papel TEXT NOT NULL,
  zona TEXT NOT NULL,
  aparencia TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT '',
  base INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  conteudo TEXT NOT NULL,
  para_todos INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS agente_skills (
  agente TEXT NOT NULL,
  skill TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (agente, skill)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  texto TEXT NOT NULL,
  projeto_id TEXT REFERENCES projetos(id),
  estado TEXT NOT NULL DEFAULT 'andando' CHECK (estado IN ('andando', 'entregue')),
  sintese TEXT NOT NULL DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE missoes ADD COLUMN pedido_id INTEGER REFERENCES pedidos(id);
ALTER TABLE missoes ADD COLUMN entrega TEXT NOT NULL DEFAULT '';
ALTER TABLE missoes ADD COLUMN modelo TEXT NOT NULL DEFAULT '';
-- Preenchido enquanto um modelo escreve a entrega. Impede duas execuções da mesma missão ao mesmo tempo.
ALTER TABLE missoes ADD COLUMN executando_desde TEXT;

CREATE TABLE IF NOT EXISTS config (chave TEXT PRIMARY KEY, valor TEXT NOT NULL);

-- Cada chamada a um modelo de IA reserva uma linha aqui. É o que segura o gasto.
CREATE TABLE IF NOT EXISTS uso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_uso_quando ON uso (criado_em);
CREATE INDEX IF NOT EXISTS idx_missoes_pedido ON missoes (pedido_id);
