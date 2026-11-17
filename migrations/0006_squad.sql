-- Squad do convidado: projeto para o qual ele foi chamado. Vazio é o lab todo. Vale até o fim do ciclo do projeto.
ALTER TABLE agentes ADD COLUMN projeto_id TEXT;
