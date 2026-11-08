import { useEffect, useState } from 'react';
import type { DadosLab } from '../lib/lab';
import type { AtlasGente } from '../components/MapaPixi';

/** Carrega o que o Blender exportou: geometria do lab e o atlas das pessoas. */
export function useLab() {
  const [dados, setDados] = useState<{ lab: DadosLab; gente: AtlasGente } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([fetch('assets/lab.json').then(r => r.json()), fetch('assets/gente8.json').then(r => r.json())])
      .then(([lab, gente]) => setDados({ lab, gente }))
      .catch(() => setErro('Não consegui carregar o laboratório. Recarregue a página.'));
  }, []);
  return { ...dados, erro };
}
