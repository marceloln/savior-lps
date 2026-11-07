import { useEffect, useState } from 'react';

export type Conexoes = { banco: boolean; chave: boolean; acesso: boolean; mensagens: number };

/** Pergunta ao Worker o que está ligado, só quando a tela de conexões abre. Na prévia volta null. */
export function useConexoes(ativo: boolean): Conexoes | null {
  const [c, setC] = useState<Conexoes | null>(null);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    fetch('api/conexoes').then(r => r.json()).then((j: Conexoes) => vivo && setC(j)).catch(() => vivo && setC(null));
    return () => { vivo = false; };
  }, [ativo]);
  return c;
}
