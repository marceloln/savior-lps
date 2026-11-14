import { useState } from 'react';

/** Apagar em dois toques, sem caixa de diálogo do navegador. */
export function Apagar({ oque, apaga, verbo = 'Apagar' }: { oque: string; apaga: () => void; verbo?: string }) {
  const [certo, setCerto] = useState(false);
  if (!certo) return <button type="button" className="leve mini" onClick={() => setCerto(true)} aria-label={`${verbo} ${oque}`}>{verbo}</button>;
  return <span className="confirma">{verbo} de vez?<button type="button" className="perigo mini" onClick={apaga}>{verbo}</button><button type="button" className="leve mini" onClick={() => setCerto(false)}>Manter</button></span>;
}
