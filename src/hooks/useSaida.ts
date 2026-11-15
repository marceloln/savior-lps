import { useCallback, useState } from 'react';

/** Segura na tela o que acabou de fechar até a animação de saída terminar. */
export function useSaida<T>(atual: T | null) {
  const [ultimo, setUltimo] = useState<T | null>(atual);
  if (atual !== null && atual !== ultimo) setUltimo(atual);
  const saiu = useCallback(() => setUltimo(null), []);
  return { mostrado: atual ?? ultimo, saindo: atual === null && ultimo !== null, saiu };
}
