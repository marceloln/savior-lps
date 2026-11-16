import { describe, expect, it } from 'vitest';
import { catalogo, cidadeDe, filtra, generosDe, normaliza, porEstado, ufDe, type EstacaoBruta } from './radios';

const bruta = (o: Partial<EstacaoBruta>): EstacaoBruta => ({
  stationuuid: 'a', name: 'Rádio Teste', url_resolved: 'https://som.exemplo/ao-vivo', lastcheckok: 1, hls: 0, tags: '', state: '', iso_3166_2: null, ...o,
});

describe('ufDe', () => {
  it('usa o campo padronizado quando ele existe', () => {
    expect(ufDe('qualquer coisa', 'BR-PR')).toBe('PR');
  });
  it('entende o estado escrito de vários jeitos, com e sem acento', () => {
    for (const t of ['São Paulo', 'Sao Paulo (Brazil)', 'São Paulo (SP)', 'Sao Paulo']) expect(ufDe(t), t).toBe('SP');
    expect(ufDe('Paraná(Brazil)')).toBe('PR');
    expect(ufDe('Santa Catarina, SC')).toBe('SC');
    expect(ufDe('Minas Gerais Brasil')).toBe('MG');
  });
  it('não confunde estado que contém o nome de outro', () => {
    expect(ufDe('Mato Grosso do Sul')).toBe('MS');
    expect(ufDe('Mato Grosso')).toBe('MT');
    expect(ufDe('Rio Grande do Norte')).toBe('RN');
    expect(ufDe('Rio Grande do Sul')).toBe('RS');
    expect(ufDe('Rio de Janeiro')).toBe('RJ');
  });
  it('aceita só a sigla, ou a capital no lugar do estado', () => {
    expect(ufDe('RJ')).toBe('RJ');
    expect(ufDe('PR')).toBe('PR');
    expect(ufDe('Porto Alegre ')).toBe('RS');
    expect(ufDe('Recife')).toBe('PE');
    expect(ufDe('Brasília')).toBe('DF');
    expect(ufDe('Fortaleza, Ceará')).toBe('CE');
  });
  it('volta vazio sem pista, e não toma BR por sigla de estado', () => {
    expect(ufDe('')).toBe('');
    expect(ufDe('Brasil')).toBe('');
    expect(ufDe('BR')).toBe('');
  });
});

describe('cidadeDe', () => {
  it('separa a cidade quando o texto traz cidade e estado', () => {
    expect(cidadeDe('Fortaleza, Ceará', 'CE')).toBe('Fortaleza');
    expect(cidadeDe('Porto Alegre ', 'RS')).toBe('Porto Alegre');
  });
  it('não repete o estado nem o país como cidade', () => {
    expect(cidadeDe('São Paulo (SP)', 'SP')).toBe('');
    expect(cidadeDe('Sao Paulo (Brazil)', 'SP')).toBe('');
    expect(cidadeDe('Santa Catarina, SC', 'SC')).toBe('');
  });
});

describe('generosDe', () => {
  it('agrupa etiquetas soltas em gêneros em português', () => {
    expect(generosDe('country,sertanejo')).toEqual(['Sertanejo']);
    expect(generosDe('popular,samba pagode')).toEqual(['Samba e pagode']);
    expect(generosDe('entertainment,journalism,music,sport')).toEqual(['Notícias', 'Esporte']);
  });
  it('rock clássico é rock, não música clássica, e pop rock não conta como pop', () => {
    expect(generosDe('classic rock,hard rock')).toEqual(['Rock']);
    expect(generosDe('pop rock')).toEqual(['Rock']);
    expect(generosDe('classical')).toEqual(['Clássica']);
  });
  it('o nome da rádio também conta quando não há etiqueta', () => {
    expect(normaliza(bruta({ name: 'Rádio MGT Sertanejo', tags: '' }))!.generos).toEqual(['Sertanejo']);
  });
  it('etiqueta vazia ou desconhecida não vira gênero', () => {
    expect(generosDe('')).toEqual([]);
    expect(generosDe('misc,music')).toEqual([]);
  });
});

describe('normaliza e catalogo', () => {
  it('descarta o que o navegador não consegue tocar: http, checagem falhando, HLS e sem nome', () => {
    expect(normaliza(bruta({ url_resolved: 'http://som.exemplo/ao-vivo' }))).toBeNull();
    expect(normaliza(bruta({ lastcheckok: 0 }))).toBeNull();
    expect(normaliza(bruta({ hls: 1 }))).toBeNull();
    expect(normaliza(bruta({ name: '   ' }))).toBeNull();
  });
  it('monta a rádio com UF, gêneros e só endereços seguros de site e logo', () => {
    const r = normaliza(bruta({ name: ' Rádio  JB FM 99.9 ', state: 'Rio de Janeiro', tags: 'adulta,flashback,mpb', homepage: 'http://site.exemplo', favicon: 'https://logo.exemplo/l.png', votes: 3, clickcount: 7 }))!;
    expect(r).toMatchObject({ nome: 'Rádio JB FM 99.9', uf: 'RJ', site: '', logo: 'https://logo.exemplo/l.png', votos: 10 });
    expect(r.generos).toEqual(['MPB', 'Flashback', 'Adulta e romântica']);
  });
  it('ordena das mais ouvidas e tira a repetida pelo mesmo endereço de som', () => {
    const c = catalogo([
      bruta({ stationuuid: '1', name: 'Pouca', votes: 1, url_resolved: 'https://a.exemplo' }),
      bruta({ stationuuid: '2', name: 'Muita', votes: 9, url_resolved: 'https://b.exemplo' }),
      bruta({ stationuuid: '3', name: 'Cópia', votes: 2, url_resolved: 'https://b.exemplo' }),
      bruta({ stationuuid: '4', name: 'Insegura', votes: 99, url_resolved: 'http://c.exemplo' }),
    ]);
    expect(c.map(r => r.nome)).toEqual(['Muita', 'Pouca']);
  });
});

describe('filtra e porEstado', () => {
  const lista = catalogo([
    bruta({ stationuuid: '1', name: 'Sertaneja 106.7', state: 'São Paulo', tags: 'sertanejo', url_resolved: 'https://1.exemplo', votes: 5 }),
    bruta({ stationuuid: '2', name: 'Rádio O Dia', state: 'Rio de Janeiro', tags: 'samba pagode', url_resolved: 'https://2.exemplo', votes: 4 }),
    bruta({ stationuuid: '3', name: 'Litoral FM', state: 'Fortaleza, Ceará', tags: 'forró', url_resolved: 'https://3.exemplo', votes: 3 }),
  ]);
  it('filtro vazio devolve tudo', () => {
    expect(filtra(lista, { uf: '', genero: '', busca: '' })).toHaveLength(3);
  });
  it('filtra por estado, por gênero e pela busca em nome ou cidade, sem acento', () => {
    expect(filtra(lista, { uf: 'RJ', genero: '', busca: '' }).map(r => r.nome)).toEqual(['Rádio O Dia']);
    expect(filtra(lista, { uf: '', genero: 'Sertanejo', busca: '' }).map(r => r.nome)).toEqual(['Sertaneja 106.7']);
    expect(filtra(lista, { uf: '', genero: '', busca: 'fortaleza' }).map(r => r.nome)).toEqual(['Litoral FM']);
    expect(filtra(lista, { uf: '', genero: '', busca: 'radio dia' }).map(r => r.nome)).toEqual(['Rádio O Dia']);
    expect(filtra(lista, { uf: 'SP', genero: 'Samba e pagode', busca: '' })).toEqual([]);
  });
  it('conta por estado e mostra só os estados que têm rádio', () => {
    expect(porEstado(lista)).toEqual([
      { sigla: 'CE', nome: 'Ceará', total: 1 }, { sigla: 'RJ', nome: 'Rio de Janeiro', total: 1 }, { sigla: 'SP', nome: 'São Paulo', total: 1 },
    ]);
  });
});
