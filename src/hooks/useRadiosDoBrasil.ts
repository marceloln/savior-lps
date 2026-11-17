import { useEffect, useState } from 'react';
import type { RadioAoVivo } from '../lib/radios';

type Situacao = { lista: RadioAoVivo[]; carregando: boolean; erro: string | null };
let guardada: RadioAoVivo[] | null = null;
const SEM_SERVIDOR = 'As rádios do Brasil precisam do servidor do lab. Nesta prévia, só as estações da casa tocam.';

/** O catálogo de rádios do Brasil, pedido ao Worker uma vez por visita. Não depende do banco do lab, só do servidor estar no ar. */
export function useRadiosDoBrasil(ligado: boolean): Situacao {
  const [s, setS] = useState<Situacao>({ lista: guardada ?? [], carregando: !guardada, erro: null });
  useEffect(() => {
    if (!ligado || guardada) return;
    let aqui = true;
    fetch('/api/radios').then(async r => {
      const tipo = r.headers.get('content-type') ?? '';
      // sem Worker, quem responde é o servidor de arquivos, com a página em vez de dados
      if (!tipo.includes('json')) throw new Error(SEM_SERVIDOR);
      const j = (await r.json()) as { radios?: RadioAoVivo[]; erro?: string };
      if (!r.ok || !j.radios) throw new Error(j.erro ?? 'O catálogo de rádios não respondeu. Tente de novo em alguns minutos.');
      guardada = j.radios;
      if (aqui) setS({ lista: j.radios, carregando: false, erro: null });
    }).catch((e: Error) => { if (aqui) setS({ lista: [], carregando: false, erro: e instanceof TypeError ? SEM_SERVIDOR : e.message }); });
    return () => { aqui = false; };
  }, [ligado]);
  return s;
}
