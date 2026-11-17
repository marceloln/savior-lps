// Rádios do Brasil para a Rádio V30. Vêm do Radio Browser, base aberta e comunitária de rádios na internet.
// O Worker busca, passa por normaliza() e guarda em cache. A tela só filtra o que recebeu.

export type RadioAoVivo = {
  id: string; nome: string; uf: string; cidade: string; generos: string[];
  url: string; site: string; logo: string; codec: string; kbps: number; votos: number;
};

/** O que o Radio Browser devolve, só com os campos que o lab usa. */
export type EstacaoBruta = {
  stationuuid: string; name: string; url_resolved: string; homepage?: string; favicon?: string;
  tags?: string; state?: string; iso_3166_2?: string | null; codec?: string; bitrate?: number;
  votes?: number; clickcount?: number; lastcheckok?: number; hls?: number;
};

export const UFS: [sigla: string, nome: string, capital: string][] = [
  ['AC', 'Acre', 'Rio Branco'], ['AL', 'Alagoas', 'Maceió'], ['AP', 'Amapá', 'Macapá'], ['AM', 'Amazonas', 'Manaus'],
  ['BA', 'Bahia', 'Salvador'], ['CE', 'Ceará', 'Fortaleza'], ['DF', 'Distrito Federal', 'Brasília'], ['ES', 'Espírito Santo', 'Vitória'],
  ['GO', 'Goiás', 'Goiânia'], ['MA', 'Maranhão', 'São Luís'], ['MT', 'Mato Grosso', 'Cuiabá'], ['MS', 'Mato Grosso do Sul', 'Campo Grande'],
  ['MG', 'Minas Gerais', 'Belo Horizonte'], ['PA', 'Pará', 'Belém'], ['PB', 'Paraíba', 'João Pessoa'], ['PR', 'Paraná', 'Curitiba'],
  ['PE', 'Pernambuco', 'Recife'], ['PI', 'Piauí', 'Teresina'], ['RJ', 'Rio de Janeiro', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte', 'Natal'],
  ['RS', 'Rio Grande do Sul', 'Porto Alegre'], ['RO', 'Rondônia', 'Porto Velho'], ['RR', 'Roraima', 'Boa Vista'], ['SC', 'Santa Catarina', 'Florianópolis'],
  ['SP', 'São Paulo', 'São Paulo'], ['SE', 'Sergipe', 'Aracaju'], ['TO', 'Tocantins', 'Palmas'],
];

const plano = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
// nome mais longo primeiro, para Mato Grosso do Sul não cair em Mato Grosso, nem Rio Grande do Norte em Rio de Janeiro
const POR_NOME = [...UFS].sort((a, b) => b[1].length - a[1].length);

/** UF de uma rádio. O campo padronizado vem quase sempre vazio; o texto livre vem de vários jeitos:
 *  Sao Paulo (Brazil), São Paulo (SP), Santa Catarina, SC, só a sigla, ou a capital no lugar do estado. Sem pista, volta vazio. */
export function ufDe(estado = '', iso: string | null = ''): string {
  const m = /^BR-([A-Z]{2})$/.exec(iso ?? '');
  if (m && UFS.some(u => u[0] === m[1])) return m[1];
  const t = plano(estado);
  if (!t) return '';
  for (const [sigla, nome] of POR_NOME) if (t.includes(plano(nome))) return sigla;
  const siglas = estado.toUpperCase().match(/\b[A-Z]{2}\b/g) ?? [];
  for (const s of siglas) if (s !== 'BR' && UFS.some(u => u[0] === s)) return s;
  for (const [sigla, , capital] of UFS) if (t.includes(plano(capital))) return sigla;
  return '';
}

/** A cidade, quando o texto livre traz uma além do estado, como Fortaleza, Ceará. */
export function cidadeDe(estado = '', uf: string): string {
  const u = UFS.find(x => x[0] === uf);
  const partes = estado.split(/[,(\-/]/).map(p => p.replace(/\)/g, '').trim()).filter(Boolean);
  const sobra = partes.filter(p => {
    const q = plano(p);
    return q.length > 2 && !['brasil', 'brazil'].includes(q) && (!u || (q !== plano(u[1]) && q !== plano(u[0])));
  });
  return sobra[0] ?? (u && plano(estado) === plano(u[2]) && u[2] !== u[1] ? u[2] : '');
}

/** Gêneros em português, cada um com as etiquetas que o representam. A ordem é a dos botões de filtro. */
export const GENEROS: [nome: string, etiquetas: string[]][] = [
  ['Sertanejo', ['sertanej', 'country', 'moda de viola', 'caipira', 'gauch']],
  ['MPB', ['mpb', 'musica popular brasileira', 'brazilian music', 'bossa']],
  ['Samba e pagode', ['samba', 'pagode']],
  ['Forró e nordeste', ['forro', 'piseiro', 'arrocha', 'xote', 'baiao', 'axe', 'brega']],
  ['Pop', ['pop', 'hits', 'top 40', 'chr', 'jovem']],
  ['Rock', ['rock', 'metal', 'punk', 'grunge']],
  ['Flashback', ['flashback', 'classic hits', 'oldies', '70', '80', '90', 'anos ']],
  ['Adulta e romântica', ['adult', 'adulta', 'romant', 'soft', 'easy listening', 'love']],
  ['Notícias', ['news', 'noticia', 'jornalism', 'journalism', 'talk', 'informa', 'cbn', 'band news', 'bandnews']],
  ['Esporte', ['sport', 'esporte', 'futebol', 'soccer']],
  ['Gospel', ['gospel', 'crista', 'catolic', 'evangel', 'christian', 'religi', 'louvor']],
  ['Eletrônica', ['electronic', 'eletronic', 'dance', 'house', 'techno', 'trance', 'edm', 'eurodance']],
  ['Funk e rap', ['funk', 'rap', 'hip hop', 'hip-hop', 'trap', 'r&b', 'soul']],
  ['Jazz e blues', ['jazz', 'blues', 'lounge']],
  ['Clássica', ['classic', 'classica', 'erudit', 'orquestra', 'opera']],
];

/** Os gêneros de uma rádio a partir das etiquetas livres. Rock clássico conta como rock, e não como clássica; pop rock conta como rock. */
export function generosDe(tags = ''): string[] {
  const ts = tags.split(',').map(plano).filter(Boolean);
  return GENEROS.filter(([nome, chaves]) => ts.some(t => {
    if (nome === 'Clássica' && /rock|hit|oldie/.test(t)) return false;
    // popular é rádio popular, não música pop
    if (nome === 'Pop' && /rock|popular/.test(t)) return false;
    return chaves.some(c => t.includes(c));
  })).map(([nome]) => nome);
}

/** Uma rádio que o navegador consegue tocar: endereço seguro, checagem recente funcionando e sem HLS. Fora isso, volta nulo. */
export function normaliza(e: EstacaoBruta): RadioAoVivo | null {
  const url = (e.url_resolved ?? '').trim();
  if (!url.startsWith('https://') || e.lastcheckok !== 1 || e.hls === 1 || !e.stationuuid) return null;
  const nome = (e.name ?? '').replace(/\s+/g, ' ').trim();
  if (!nome) return null;
  const uf = ufDe(e.state ?? '', e.iso_3166_2 ?? '');
  const seguro = (u?: string) => (u && u.startsWith('https://') ? u : '');
  return {
    id: e.stationuuid, nome, uf, cidade: cidadeDe(e.state ?? '', uf), generos: generosDe(`${e.tags ?? ''},${nome}`),
    url, site: seguro(e.homepage), logo: seguro(e.favicon), codec: e.codec ?? '', kbps: e.bitrate ?? 0, votos: (e.votes ?? 0) + (e.clickcount ?? 0),
  };
}

/** Normaliza o catálogo inteiro, tira as repetidas pelo mesmo endereço de som e ordena das mais ouvidas para as menos. */
export function catalogo(brutas: EstacaoBruta[]): RadioAoVivo[] {
  const vistas = new Set<string>(), sai: RadioAoVivo[] = [];
  for (const r of brutas.map(normaliza).filter((r): r is RadioAoVivo => !!r).sort((a, b) => b.votos - a.votos)) {
    if (vistas.has(r.url)) continue;
    vistas.add(r.url); sai.push(r);
  }
  return sai;
}

export type Filtro = { uf: string; genero: string; busca: string };

/** As rádios que passam no filtro. Estado e gênero vazios valem todos. A busca olha nome e cidade, sem ligar para acento. */
export function filtra(lista: RadioAoVivo[], f: Filtro): RadioAoVivo[] {
  const palavras = plano(f.busca).split(' ').filter(Boolean);
  return lista.filter(r => (!f.uf || r.uf === f.uf) && (!f.genero || r.generos.includes(f.genero))
    && palavras.every(p => plano(`${r.nome} ${r.cidade} ${r.uf}`).includes(p)));
}

/** Quantas rádios cada estado tem, para o seletor mostrar só os que têm alguma. */
export function porEstado(lista: RadioAoVivo[]): { sigla: string; nome: string; total: number }[] {
  return UFS.map(([sigla, nome]) => ({ sigla, nome, total: lista.filter(r => r.uf === sigla).length })).filter(x => x.total > 0);
}
