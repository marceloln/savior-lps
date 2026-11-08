-- O ciclo de 30 dias passa a andar sozinho: o projeto guarda a data de início e o dia é calculado na leitura.
ALTER TABLE projetos ADD COLUMN inicio TEXT;
UPDATE projetos SET inicio = date('now', '-' || (dia - 1) || ' days') WHERE inicio IS NULL;
