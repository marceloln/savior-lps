import { useEffect, useState } from 'react';

/** Quem está logado, pelo login da equipe. Sem servidor ou sem login ligado, fica null. */
export function useEu(): string | null {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch('api/eu').then(r => (r.ok ? r.json() : null)).then((d: { email?: string | null } | null) => { if (vivo && typeof d?.email === 'string') setEmail(d.email); }).catch(() => { /* prévia sem servidor */ });
    return () => { vivo = false; };
  }, []);
  return email;
}
