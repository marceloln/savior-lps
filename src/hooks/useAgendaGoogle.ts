// Reuniões do Google Agenda da V30, lidas pelo Worker. Sem servidor ou sem a autorização do Google, diz o motivo e não quebra a Agenda.
import { useCallback, useEffect, useState } from 'react';
import type { NovaReuniaoMeet, ReuniaoGoogle } from '../lib/agendaGoogle';

export type EstadoGoogle = 'carregando' | 'ligado' | 'desligado' | 'sem-servidor' | 'erro';
const SEM_SERVIDOR = 'Esta é a prévia, sem servidor. Com o lab publicado, as reuniões do Google Agenda aparecem aqui.';

async function pede<T>(rota: string, init?: RequestInit): Promise<{ ok: true; v: T } | { ok: false; erro: string; desligado?: boolean; semServidor?: boolean }> {
  try {
    const r = await fetch('api/google/' + rota, init);
    const d = await r.json().catch(() => null);
    if (d === null) return { ok: false, erro: SEM_SERVIDOR, semServidor: true };
    return r.ok ? { ok: true, v: d as T } : { ok: false, erro: d.erro ?? 'O Google não respondeu.', desligado: !!d.desligado };
  } catch { return { ok: false, erro: SEM_SERVIDOR, semServidor: true }; }
}

export function useAgendaGoogle(ativo = true) {
  const [lista, setLista] = useState<ReuniaoGoogle[]>([]);
  const [estado, setEstado] = useState<EstadoGoogle>('carregando');
  const [recado, setRecado] = useState('');

  const recarrega = useCallback(async () => {
    const r = await pede<{ reunioes: ReuniaoGoogle[] }>('reunioes');
    if (r.ok) { setLista(r.v.reunioes); setEstado('ligado'); setRecado(''); return; }
    setEstado(r.semServidor ? 'sem-servidor' : r.desligado ? 'desligado' : 'erro'); setRecado(r.erro);
  }, []);
  useEffect(() => { if (ativo) recarrega(); }, [ativo, recarrega]);

  /** Marca no Google Agenda, com link do Meet e convite por e-mail. Devolve a reunião criada ou o motivo da recusa. */
  const marca = useCallback(async (n: NovaReuniaoMeet): Promise<{ ok: true; v: ReuniaoGoogle } | { ok: false; erro: string }> => {
    const r = await pede<ReuniaoGoogle>('reunioes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(n) });
    if (!r.ok) return r;
    setLista(l => [...l, r.v].sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)));
    return r;
  }, []);

  /** Texto das Anotações do Gemini presas no evento. */
  const anotacoes = useCallback(async (docId: string) => pede<{ texto: string; cortado: boolean }>(`anotacoes/${encodeURIComponent(docId)}`), []);

  return { lista, estado, recado, recarrega, marca, anotacoes };
}
