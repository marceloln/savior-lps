import { useState } from 'react';
import { useEstado } from '../hooks/useEstado';
import { useEquipe } from '../hooks/useEquipe';
import type { Tarefa } from '../lib/dados';
import { Apagar } from './Apagar';

/** Edita uma missão aberta no próprio lugar: título, o que entregar e quem faz. Também apaga. */
export function EditaMissao({ t, aoFechar }: { t: Tarefa; aoFechar: () => void }) {
  const { mudaTarefa, apagaTarefa } = useEstado();
  const { equipe, nome } = useEquipe();
  const [f, setF] = useState({ titulo: t.titulo, detalhe: t.detalhe, agente: t.agente });
  const [gravando, setGravando] = useState(false);
  const salva = async () => {
    const m: Partial<Pick<Tarefa, 'titulo' | 'detalhe' | 'agente'>> = {};
    if (f.titulo.trim() !== t.titulo) m.titulo = f.titulo.trim();
    if (f.detalhe.trim() !== t.detalhe) m.detalhe = f.detalhe.trim();
    if (f.agente !== t.agente) m.agente = f.agente;
    if (!Object.keys(m).length) { aoFechar(); return; }
    setGravando(true);
    const ok = await mudaTarefa(t.id, m);
    setGravando(false);
    if (ok) aoFechar();
  };
  return (
    <form className="edita-missao" onSubmit={e => { e.preventDefault(); if (f.titulo.trim() && !gravando) salva(); }}>
      <label>Missão<input autoFocus value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} maxLength={200} /></label>
      <label>O que entregar<textarea rows={2} value={f.detalhe} onChange={e => setF({ ...f, detalhe: e.target.value })} maxLength={2000} placeholder="Opcional. O formato e o que não pode faltar" /></label>
      <label>Quem faz<select value={f.agente} onChange={e => setF({ ...f, agente: e.target.value })}>
        {!equipe.some(m => m.id === t.agente) && <option value={t.agente}>{nome(t.agente)}</option>}
        {equipe.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </select></label>
      <div className="linha">
        <button className="primario mini" type="submit" disabled={!f.titulo.trim() || gravando}>Salvar</button>
        <button type="button" className="leve mini" onClick={aoFechar}>Desistir</button>
        <Apagar oque={t.titulo} apaga={() => apagaTarefa(t.id)} />
      </div>
    </form>
  );
}
