-- Prazo da missão: dia da entrega, opcional. Missão sem prazo continua como antes.
ALTER TABLE missoes ADD COLUMN prazo TEXT;
