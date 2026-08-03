# Spec: 14 Páginas Geolocalizadas — Savior Medical Service

**Data:** 2026-08-03
**Autor:** Marcelo + Claude
**Status:** Aprovado
**Projeto:** savior-lps (Astro + Cloudflare Pages)

## Objetivo

Criar 14 landing pages geográficas para capturar tráfego orgânico local, reduzir dependência de Google Ads, e converter buscas por ambulância em regiões e bairros específicos do Rio de Janeiro e arredores.

## Regras fundamentais

1. **Anti-doorway:** cada página tem 4 elementos únicos: (1) tempo de chegada real, (2) lista de hospitais pesquisada, (3) particularidade operacional local, (4) FAQ com perguntas específicas. Se virar texto genérico duplicado, não publicar.
2. **Copy rule (Rodrigo):** nunca "ambulância disponível em X", sempre "base de atendimento em X"
3. **Menu:** páginas NÃO aparecem no menu do site, mas usam o menu oficial (StickyHeader.astro)
4. **Sitemap:** páginas DEVEM aparecer no sitemap
5. **Preços padronizados:** "Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. Pix com 5% de desconto, cartão em até 3x."
6. **Fonts:** @fontsource (self-hosted), zero Google Fonts CDN
7. **Schema:** coordenadas geo reais por região, não genéricas

## 14 Páginas — Mapa completo

| # | Página | URL | Fase |
|---|--------|-----|------|
| Z1 | Copacabana | /ambulancia-rj/copacabana | 1 |
| Z2 | Zona Sul | /ambulancia-rj/zona-sul | 1 |
| Z3 | Barra e Recreio | /ambulancia-rj/barra-recreio | 1 |
| Z4 | Zona Oeste | /ambulancia-rj/zona-oeste | 2 |
| Z5 | Zona Norte | /ambulancia-rj/zona-norte | 2 |
| Z6 | Niterói e São Gonçalo | /ambulancia-rj/niteroi | 1 |
| Z7 | Região Oceânica e Maricá | /ambulancia-rj/regiao-oceanica | 2 |
| Z8 | Região Serrana | /ambulancia-rj/regiao-serrana | 2 |
| Z9 | Baixada Fluminense | /ambulancia-rj/baixada-fluminense | 3 |
| Z10 | Centro | /ambulancia-rj/centro | 3 |
| Z11 | Interestadual RJ↔SP | /remocao-interestadual | 1 |
| Z12 | Intermunicipal | /ambulancia-rj/intermunicipal | 2 |
| Z13 | Búzios | /ambulancia-rj/buzios | 2 |
| Z14 | Angra dos Reis | /ambulancia-rj/angra-dos-reis | 2 |

## Arquitetura técnica

### Rotas Astro

```
src/pages/ambulancia-rj/
├── copacabana.astro
├── zona-sul.astro
├── barra-recreio.astro
├── zona-oeste.astro
├── zona-norte.astro
├── niteroi.astro
├── regiao-oceanica.astro
├── regiao-serrana.astro
├── baixada-fluminense.astro
├── centro.astro
├── intermunicipal.astro
├── buzios.astro
├── angra-dos-reis.astro
src/pages/
├── remocao-interestadual.astro
```

### Data Layer: `src/data/geo-regions.ts`

Arquivo centralizado com todas as 14 regiões. Interface:

```typescript
interface GeoHospital {
  name: string;
  initials: string;
  network: string;          // 'Rede D'Or', 'SUS', 'Particular', etc.
  detail: string;           // endereço + especialidade
  tag: string;              // label do badge
  color: { bg: string; text: string };
  address?: string;
  specialty?: string;
  emergency24h?: boolean;
}

interface GeoTempo {
  region: string;
  time: string;             // '20–25 min' or 'Imediato'
  route: string;
  highlight?: boolean;
}

interface GeoService {
  icon: string;             // emoji or SVG ref
  title: string;
  desc: string;
}

interface GeoReview {
  name: string;
  text: string;
  source: string;           // 'Google' or 'Blip'
  rating?: number;
}

interface GeoRegion {
  id: string;
  name: string;
  slug: string;
  phase: 1 | 2 | 3;
  seo: {
    title: string;          // ≤60 chars
    description: string;    // ≤155 chars
    h1: string;
    canonical: string;
    keywords: string[];
  };
  hero: {
    eyebrow: string;
    h1: string;
    h1Highlight: string;
    subhead: string;
    waCampaign: string;
  };
  tempos: GeoTempo[];
  hospitals: GeoHospital[];
  services: GeoService[];
  feature: {
    label: string;
    h2: string;
    h2Highlight: string;
    paragraphs: string[];
    callout?: { title: string; body: string };
    stats: Array<{ value: string; desc: string }>;
  };
  socialProof: {
    reviews: GeoReview[];
  };
  faq: Array<{ q: string; a: string }>;
  nearbyRegions: Array<{
    name: string;
    slug: string;
    highlight: string;
  }>;
  schema: {
    geo: { lat: number; lng: number };
    areaServed: Array<{ name: string }>;
  };
}
```

### Novos Componentes (6)

1. **GeoHero.astro** — Hero sem vídeo, gradient navy, breadcrumb, stats bar, CTAs
   - Props: region (GeoRegion), contact
   - Breadcrumb: Home > Ambulância RJ > [Região]

2. **TempoGrid.astro** — Grid de cards com tempo por sub-região
   - Props: tempos (GeoTempo[])
   - Card highlight (navy bg) para menor tempo
   - Disclaimer: "Tempos médios, não garantidos..."

3. **HospitalGrid.astro** — Grid de hospitais com iniciais coloridas
   - Props: hospitals (GeoHospital[])
   - Iniciais com cor do grupo/rede
   - Tags: rede, SUS, particular, especializado
   - Nota: "Também removemos pacientes de X para qualquer outra região"

4. **ServicesGeo.astro** — Serviços com ênfase adaptada à região
   - Props: services (GeoService[]), regionName
   - Grid 2x2: Emergência, Programada, Transferência, Eventos/B2B
   - Ênfase varia: Baixada=preço, Serrana=programada, Centro=B2B

5. **FeatureBlock.astro** — "Por que X é diferente"
   - Props: feature (from GeoRegion)
   - Layout: texto + stat cards (2 colunas desktop)
   - Callout box opcional (ex: "Conexão com Copacabana")

6. **NearbyRegions.astro** — Cross-link entre regiões
   - Props: regions (nearbyRegions[])
   - 2-3 cards com nome, highlight, link
   - Texto: "Atendemos toda a região. Veja também:"

### Componentes reutilizados (sem mudança)

- FAQ.astro (aceita items[], titleHtml)
- Footer.astro (links padrão, sem geo pages no nav principal)
- StickyHeader.astro (menu oficial)
- FloatingWhatsApp.astro (mobile)
- Base.astro (SEO, schema, geo meta, analytics)
- CTAInline.astro (entre blocos)

### Template padrão (10 blocos)

```
Base.astro
├── StickyHeader
├── main#main
│   ├── 1. GeoHero
│   ├── 2. TempoGrid
│   ├── 3. HospitalGrid
│   ├── 4. ServicesGeo         ← NOVO
│   ├── 5. FeatureBlock
│   ├── 6. Social Proof local  ← NOVO
│   ├── CTAInline (medium)
│   ├── 7. FAQ + Schema FAQPage
│   ├── 8. NearbyRegions       ← NOVO
│   └── CTA Final
├── FloatingWhatsApp
└── Footer
```

## Pesquisa de hospitais

Cada região requer pesquisa real de hospitais e clínicas incluindo:
- Nome completo oficial
- Grupo/rede (Rede D'Or, Américas, SUS, etc.)
- Endereço
- Especialidade principal
- Se tem emergência 24h
- Cores da marca (para iniciais)

## Búzios (Z13) — Especificidades

- URL: /ambulancia-rj/buzios
- Perfil: turismo de alto poder aquisitivo, pousadas, resorts
- Particularidade: distância (~180km), foco em remoção programada e emergência turística
- Hospitais locais limitados, remoção para Macaé, Cabo Frio ou direto para Rio
- Cross-sell: cobertura de eventos privados (casamentos, festas)
- Sazonalidade: verão e feriados prolongados

## Angra dos Reis (Z14) — Especificidades

- URL: /ambulancia-rj/angra-dos-reis
- Perfil: ilhas (Ilha Grande), condomínios de luxo, marinas
- Particularidade: acesso marítimo (lancha → ambulância no porto), BR-101/Rio-Santos
- Hospitais locais básicos, remoção para Volta Redonda ou Rio
- Cross-sell: cobertura de eventos em ilhas/resorts
- Sazonalidade: réveillon, carnaval, feriados

## Analytics

- Evento GA4: `whatsapp_click` com parâmetro `region` (valor = id da região)
- UTM Ads: `?utm_source=google&utm_medium=cpc&utm_campaign=geo-{region}`
- Cada página tem conversion label próprio no Google Ads

## GMB (Google Meu Negócio)

- Copacabana e Barra: avaliar criação de perfil GMB se ambulância PA Unimed opera de fato como ponto de atendimento
- Angra e Búzios: NÃO criar GMB sem presença física. Adicionar como áreas de serviço no perfil principal
- Zona Norte (São Cristóvão): perfil principal já existente

## Fases de publicação

- **Fase 1 (semanas 1-2):** Copa, Zona Sul, Barra, Niterói, Interestadual (5 páginas)
- **Fase 2 (semanas 3-4):** Zona Oeste, Zona Norte, Oceânica, Serrana, Intermunicipal, Búzios, Angra (7 páginas)
- **Fase 3 (semana 5):** Baixada, Centro (2 páginas)

## Ordem de execução

1. Infraestrutura: geo-regions.ts + 6 componentes + sitemap config
2. Pesquisa hospitais: dados reais por região (paralelo)
3. Fase 1: 5 páginas completas
4. Fase 2: 7 páginas
5. Fase 3: 2 páginas
6. Analytics: evento region, Search Console, grupos Ads
