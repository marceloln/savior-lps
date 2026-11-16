// Rádios do Brasil: o Worker busca o catálogo do Radio Browser, normaliza e guarda em cache.
// A tela pede só ao Worker, então não depende de outro servidor responder a cada visita.
import { catalogo, type EstacaoBruta, type RadioAoVivo } from '../src/lib/radios';

/** Espelhos do Radio Browser. Se um cai, o próximo responde. */
export const ESPELHOS = ['https://de1.api.radio-browser.info', 'https://de2.api.radio-browser.info', 'https://fi1.api.radio-browser.info'];
const BUSCA = '/json/stations/search?countrycode=BR&hidebroken=true&is_https=true&order=clickcount&reverse=true&limit=100000';
const HORAS = 12;
let memoria: { em: number; lista: RadioAoVivo[] } | null = null;

/** Busca no primeiro espelho que responder com uma lista. Sem nenhum, devolve nulo. */
export async function buscaCatalogo(busca: typeof fetch = fetch): Promise<RadioAoVivo[] | null> {
  for (const base of ESPELHOS) {
    try {
      const r = await busca(base + BUSCA, { headers: { 'User-Agent': 'LabV30/1.0 (vetor30.com.br)' }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      const j = (await r.json()) as unknown;
      if (Array.isArray(j) && j.length) return catalogo(j as EstacaoBruta[]);
    } catch { /* tenta o próximo */ }
  }
  return null;
}

/** GET /api/radios. Guarda em memória do Worker e no cache da borda por doze horas. Se o catálogo não responde, usa a última lista que deu certo. */
export async function rotaRadios(busca: typeof fetch = fetch, agora = Date.now()): Promise<Response> {
  const fresca = memoria && agora - memoria.em < HORAS * 3600e3;
  if (!fresca) {
    const lista = await buscaCatalogo(busca);
    if (lista?.length) memoria = { em: agora, lista };
  }
  if (!memoria) return Response.json({ erro: 'O catálogo de rádios não respondeu agora. Tente de novo em alguns minutos.' }, { status: 503 });
  return Response.json({ radios: memoria.lista, em: new Date(memoria.em).toISOString() }, { headers: { 'Cache-Control': `public, max-age=${HORAS * 3600}` } });
}

/** Só para o teste: esquece a lista guardada. */
export const esqueceRadios = () => { memoria = null; };
