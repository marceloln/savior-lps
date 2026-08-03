# Geo Landing Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 14 geo-targeted landing pages for Savior Medical Service to capture organic local search traffic and reduce Google Ads dependency.

**Architecture:** Data-driven Astro pages using a centralized `geo-regions.ts` data file + 6 new reusable components. Each page renders the same 10-block template with region-specific data. Pages live under `/ambulancia-rj/[region]` (except `/remocao-interestadual`). Pages appear in sitemap but NOT in site navigation menu.

**Tech Stack:** Astro 5.1 (static output), Cloudflare Pages, TypeScript, @fontsource (Inter + IBM Plex Mono), Schema.org JSON-LD

**Spec:** `docs/superpowers/specs/2026-08-03-geo-landing-pages-design.md`

---

## File Structure

### New files to create:

| File | Responsibility |
|------|---------------|
| `src/data/geo-regions.ts` | Centralized data for all 14 regions (types + data) |
| `src/components/GeoHero.astro` | Hero block: breadcrumb, H1, stats, CTAs, gradient |
| `src/components/TempoGrid.astro` | Response time cards grid |
| `src/components/HospitalGrid.astro` | Hospital/clinic cards with colored initials |
| `src/components/ServicesGeo.astro` | Regional services emphasis grid |
| `src/components/FeatureBlock.astro` | "Why X is different" section + stat cards |
| `src/components/NearbyRegions.astro` | Cross-link cards to nearby geo pages |
| `src/components/SocialProofGeo.astro` | Local Google reviews section |
| `src/pages/ambulancia-rj/copacabana.astro` | Z1 page |
| `src/pages/ambulancia-rj/zona-sul.astro` | Z2 page |
| `src/pages/ambulancia-rj/barra-recreio.astro` | Z3 page |
| `src/pages/ambulancia-rj/zona-oeste.astro` | Z4 page |
| `src/pages/ambulancia-rj/zona-norte.astro` | Z5 page |
| `src/pages/ambulancia-rj/niteroi.astro` | Z6 page |
| `src/pages/ambulancia-rj/regiao-oceanica.astro` | Z7 page |
| `src/pages/ambulancia-rj/regiao-serrana.astro` | Z8 page |
| `src/pages/ambulancia-rj/baixada-fluminense.astro` | Z9 page |
| `src/pages/ambulancia-rj/centro.astro` | Z10 page |
| `src/pages/remocao-interestadual.astro` | Z11 page |
| `src/pages/ambulancia-rj/intermunicipal.astro` | Z12 page |
| `src/pages/ambulancia-rj/buzios.astro` | Z13 page |
| `src/pages/ambulancia-rj/angra-dos-reis.astro` | Z14 page |

### Files to modify:

| File | Change |
|------|--------|
| `astro.config.mjs` | Update sitemap filter to include geo pages |
| `src/data/savior.ts` | Add geo page URLs to any navigation constants if needed |

---

## Task 1: Data Layer — Types & First 5 Regions

**Files:**
- Create: `src/data/geo-regions.ts`

- [ ] **Step 1: Create geo-regions.ts with TypeScript interfaces**

Define all interfaces: `GeoHospital`, `GeoTempo`, `GeoService`, `GeoReview`, `GeoNearbyRegion`, `GeoRegion`. Export them.

Key interface fields:
```typescript
export interface GeoHospital {
  name: string;
  initials: string;
  network: string;
  detail: string;
  tag: string;
  color: { bg: string; text: string };
  emergency24h?: boolean;
}

export interface GeoTempo {
  region: string;
  time: string;
  route: string;
  highlight?: boolean;
}

export interface GeoService {
  title: string;
  desc: string;
  emphasis?: boolean;
}

export interface GeoReview {
  name: string;
  text: string;
  source: string;
  rating?: number;
}

export interface GeoNearbyRegion {
  name: string;
  slug: string;
  highlight: string;
}

export interface GeoRegion {
  id: string;
  name: string;
  slug: string;
  phase: 1 | 2 | 3;
  seo: {
    title: string;
    description: string;
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
    waMessage: string;
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
  nearbyRegions: GeoNearbyRegion[];
  schema: {
    geo: { lat: number; lng: number };
    areaServed: Array<{ name: string }>;
  };
}
```

- [ ] **Step 2: Add Copacabana (Z1) data**

Complete data from the planning doc. Hospitals researched:
- Hospital Copa D'Or (Rede D'Or, emergência 24h)
- Copa Star (Rede D'Or, cardiologia)
- Hospital São Lucas Copacabana (particular, fígado/rim/pâncreas)
- Casa de Saúde São José (Rede Santa Catarina, Humaitá)
- Hospital Federal de Ipanema (SUS)
- Hospital Quali Ipanema (particular, 62 leitos)
- Clínica São Vicente da Gávea (Rede D'Or)

SEO: title "Ambulância Particular Copacabana | UTI 24h | Remoções Copa D'Or | Savior"
Geo: lat -22.9711, lng -43.1822
waCampaign: "geo-copacabana"

- [ ] **Step 3: Add Zona Sul (Z2) data**

Hospitals: Samaritano Botafogo, Pró-Cardíaco, Santa Lúcia, Adventista Silvestre, Clínica São Vicente Gávea, Casa de Saúde São José, Perinatal Laranjeiras, Hospital Federal da Lagoa, Hospital Federal de Ipanema, Hospital Quali Ipanema, Hospital Ipanema Care, Hospital Rio Laranjeiras, Hospital Casa Rio Botafogo, Hospital Municipal Rocha Maia, Hospital Glória D'Or, COT Flamengo
Geo: lat -22.9519, lng -43.1857

- [ ] **Step 4: Add Barra e Recreio (Z3) data**

Hospitals: Hospital Barra D'Or, Americas Medical City, Hospital Vitória, Rio Mar Barra, Perinatal Barra, Samaritano Barra, Hospital Lourenço Jorge (SUS), Oncologia D'Or Barra, Barra Day Hospital
Geo: lat -23.0003, lng -43.3651

- [ ] **Step 5: Add Niterói (Z6) data**

Hospitals: CHN (quaternário, transplantes), Niterói D'Or, Hospital Icaraí, São Lucas Niterói, Hospital do Ingá, Hospital de Clínicas Alameda. São Gonçalo: HCSG, Intermédica São Gonçalo, Hospital Leste Fluminense (Unimed), Hospital do Coração de São Gonçalo
Geo: lat -22.8833, lng -43.1036

- [ ] **Step 6: Add Interestadual (Z11) data**

Special structure: no single geo point, different URL pattern (/remocao-interestadual).
Hospitals: "any hospital RJ ↔ any hospital SP". Support hospitals on route: Resende, Volta Redonda, Taubaté, São José dos Campos.
waCampaign: "geo-interestadual"

- [ ] **Step 7: Export helper function**

```typescript
export function getRegion(id: string): GeoRegion {
  const region = GEO_REGIONS.find(r => r.id === id);
  if (!region) throw new Error(`Region ${id} not found`);
  return region;
}

export function getRegionsByPhase(phase: 1 | 2 | 3): GeoRegion[] {
  return GEO_REGIONS.filter(r => r.phase === phase);
}
```

- [ ] **Step 8: Verify build**

Run: `cd /Users/marcelomacbook/Projetos/savior-lps && npm run build`
Expected: Build succeeds (data file imported but not yet used by pages)

- [ ] **Step 9: Commit**

```bash
git add src/data/geo-regions.ts
git commit -m "feat(geo): add data layer with types and first 5 regions (Copa, ZSul, Barra, Niterói, Interestadual)"
```

---

## Task 2: GeoHero Component

**Files:**
- Create: `src/components/GeoHero.astro`
- Reference: `src/components/Hero.astro` (existing, for style patterns)

- [ ] **Step 1: Create GeoHero.astro**

Props interface:
```typescript
interface Props {
  region: import('../data/geo-regions').GeoRegion;
  contact?: typeof import('../data/savior').CONTACT_RJ;
}
```

Structure:
- Breadcrumb: Home > Ambulância RJ > [Region Name] (with BreadcrumbList schema)
- Eyebrow (IBM Plex Mono, green, uppercase)
- H1 with `<em>` highlight for h1Highlight text
- Subhead (rgba white 70%)
- Two CTAs: WhatsApp (green) + Phone (outline)
- Stats bar: 3 cards (4.7★ rating, 46 anos, 24h)
- Background: linear-gradient navy-deep → navy → navy-mid
- No video (unlike main Hero), gradient only
- Min-height: 80vh on desktop, auto on mobile

Style notes:
- Follow existing Hero.astro CSS patterns (clamp() sizing, same color tokens)
- Mobile: stack CTAs vertically, hide breadcrumb path (show only region name)
- Breadcrumb uses schema BreadcrumbList markup

- [ ] **Step 2: Verify component renders**

Create a temporary test page or add to an existing page to verify it renders correctly.

Run: `npm run dev` and check http://localhost:4321

- [ ] **Step 3: Commit**

```bash
git add src/components/GeoHero.astro
git commit -m "feat(geo): add GeoHero component with breadcrumb, stats bar, CTAs"
```

---

## Task 3: TempoGrid Component

**Files:**
- Create: `src/components/TempoGrid.astro`

- [ ] **Step 1: Create TempoGrid.astro**

Props:
```typescript
interface Props {
  tempos: import('../data/geo-regions').GeoTempo[];
}
```

Structure:
- Section with eyebrow "Tempo de chegada"
- H2: "De onde saímos e quanto tempo leva" (with <em>)
- Description paragraph about base location
- Grid: auto-fit, minmax(220px, 1fr), gap 2px, border-radius 10px, overflow hidden
- Each card: white bg, border-left 3px green, region name (bold), time (large green), route (small gray)
- Highlight card: navy bg, green-bright border, white text
- Disclaimer: italic, small, gray

CSS from reference HTML (savior-geo-zona-sul_1.html .tempo-card styles).

- [ ] **Step 2: Verify and commit**

```bash
git add src/components/TempoGrid.astro
git commit -m "feat(geo): add TempoGrid component for response time cards"
```

---

## Task 4: HospitalGrid Component

**Files:**
- Create: `src/components/HospitalGrid.astro`

- [ ] **Step 1: Create HospitalGrid.astro**

Props:
```typescript
interface Props {
  hospitals: import('../data/geo-regions').GeoHospital[];
  regionName: string;
}
```

Structure:
- Section with white background
- Eyebrow "Hospitais e clínicas"
- H2: "Remoções de e para estas unidades" (with <em>)
- Description paragraph
- Grid: auto-fit, minmax(260px, 1fr), gap 2px, border-radius 10px, overflow hidden
- Each card: white bg, flex row, initials circle (56px, colored bg), name (bold 14px), detail (gray 12px), tag badge (mono 10px, green bg)
- Footer note: "Também removemos pacientes de [regionName] para qualquer outra região"
- Hover effect on cards (cream bg)

Initials color comes from `hospital.color.bg` and `hospital.color.text`.

- [ ] **Step 2: Verify and commit**

```bash
git add src/components/HospitalGrid.astro
git commit -m "feat(geo): add HospitalGrid component with colored initials and tags"
```

---

## Task 5: ServicesGeo Component

**Files:**
- Create: `src/components/ServicesGeo.astro`

- [ ] **Step 1: Create ServicesGeo.astro**

Props:
```typescript
interface Props {
  services: import('../data/geo-regions').GeoService[];
  regionName: string;
}
```

Structure:
- Section with cream-light bg
- Eyebrow "Nossos serviços"
- H2: "O que fazemos em [regionName]" (with <em>)
- Grid 2x2 (desktop), 1 col (mobile)
- Each card: white bg, padding 24px, title (bold), desc (gray), optional emphasis border-left green
- Standard services: Emergência 24h, Remoção programada, Transferência inter-hospitalar, Cobertura de eventos
- Emphasis varies by region (data-driven)

- [ ] **Step 2: Verify and commit**

```bash
git add src/components/ServicesGeo.astro
git commit -m "feat(geo): add ServicesGeo component for regional services grid"
```

---

## Task 6: FeatureBlock Component

**Files:**
- Create: `src/components/FeatureBlock.astro`

- [ ] **Step 1: Create FeatureBlock.astro**

Props:
```typescript
interface Props {
  feature: import('../data/geo-regions').GeoRegion['feature'];
}
```

Structure:
- Full-width navy section
- Inner: max-width 1200px, 2-column grid (text + stats)
- Left column: label (mono green), H2 with <em>, paragraphs (white 70%), optional callout box
- Right column: stack of stat cards (navy-lighter bg, green-bright numbers)
- Callout: green border, green bg 8%, mono title, body text
- Mobile: single column, stats below text

CSS matches reference HTML .feature-block styles exactly.

- [ ] **Step 2: Verify and commit**

```bash
git add src/components/FeatureBlock.astro
git commit -m "feat(geo): add FeatureBlock component for regional differentiator"
```

---

## Task 7: SocialProofGeo + NearbyRegions Components

**Files:**
- Create: `src/components/SocialProofGeo.astro`
- Create: `src/components/NearbyRegions.astro`

- [ ] **Step 1: Create SocialProofGeo.astro**

Props:
```typescript
interface Props {
  reviews: import('../data/geo-regions').GeoReview[];
  regionName: string;
}
```

Structure:
- Section cream bg
- Eyebrow "O que dizem nossos pacientes"
- H2: "Avaliações de quem precisou em [regionName]"
- Cards: white bg, quote text, name, source badge (Google 4.7★), rating stars
- If no reviews: render a fallback with the aggregateRating from GOOGLE_BUSINESS (4.7★ / 346 avaliações) and a generic "Veja todas as avaliações no Google" link
- Max 3 reviews per page

- [ ] **Step 2: Create NearbyRegions.astro**

Props:
```typescript
interface Props {
  regions: import('../data/geo-regions').GeoNearbyRegion[];
}
```

Structure:
- Section cream-light bg
- Eyebrow "Regiões próximas"
- H2: "Atendemos toda a região. Veja também:"
- Horizontal cards (2-3): name, highlight text, arrow link
- Cards link to /ambulancia-rj/[slug]
- Simple design: white bg, border-left green, hover cream-dark

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/SocialProofGeo.astro src/components/NearbyRegions.astro
git commit -m "feat(geo): add SocialProofGeo and NearbyRegions components"
```

---

## Task 8: CTA Final Geo Component (reuse pattern)

No new component needed. Reuse the CTA Final pattern from reference HTML inline in each page. It's simple enough:

```astro
<section class="cta-final">
  <h2>Manda mensagem. <em>Nós já estamos a caminho.</em></h2>
  <p>Central 24 horas. Atendemos em menos de 1 minuto, todos os dias do ano.</p>
  <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
    <a href={waUrl} class="btn btn-green">Chamar no WhatsApp</a>
    <a href={phoneUrl} class="btn btn-outline">{phoneDisplay}</a>
  </div>
</section>
```

This will be included directly in each page template. No separate component needed (YAGNI).

---

## Task 9: First Geo Page — Copacabana (Z1)

**Files:**
- Create: `src/pages/ambulancia-rj/copacabana.astro`

- [ ] **Step 1: Create the page file**

Import all components + Base layout + geo data:

```astro
---
import Base from '../../layouts/Base.astro';
import StickyHeader from '../../components/StickyHeader.astro';
import GeoHero from '../../components/GeoHero.astro';
import TempoGrid from '../../components/TempoGrid.astro';
import HospitalGrid from '../../components/HospitalGrid.astro';
import ServicesGeo from '../../components/ServicesGeo.astro';
import FeatureBlock from '../../components/FeatureBlock.astro';
import SocialProofGeo from '../../components/SocialProofGeo.astro';
import FAQ from '../../components/FAQ.astro';
import NearbyRegions from '../../components/NearbyRegions.astro';
import CTAInline from '../../components/CTAInline.astro';
import FloatingWhatsApp from '../../components/FloatingWhatsApp.astro';
import Footer from '../../components/Footer.astro';
import { getRegion } from '../../data/geo-regions';
import { CONTACT_RJ, GOOGLE_BUSINESS, whatsappUrl } from '../../data/savior';

const region = getRegion('copacabana');

// Schema JSON-LD: EmergencyService + FAQPage + BreadcrumbList
const schemaEmergency = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  "name": `Savior Medical Service — ${region.name}`,
  "description": region.seo.description,
  "url": region.seo.canonical,
  "telephone": "+552131713030",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "R. Gen. Padilha, 73",
    "addressLocality": "Rio de Janeiro",
    "addressRegion": "RJ",
    "postalCode": "20920-390",
    "addressCountry": "BR"
  },
  "geo": { "@type": "GeoCoordinates", ...region.schema.geo },
  "areaServed": region.schema.areaServed.map(a => ({ "@type": "Place", "name": a.name })),
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00", "closes": "23:59"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": GOOGLE_BUSINESS.rating,
    "reviewCount": GOOGLE_BUSINESS.reviewCount
  }
});

const schemaFaq = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": region.faq.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
});

const schemaBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.savior.com.br/" },
    { "@type": "ListItem", "position": 2, "name": "Ambulância RJ", "item": "https://www.savior.com.br/ambulancia-rj" },
    { "@type": "ListItem", "position": 3, "name": region.name, "item": region.seo.canonical }
  ]
});

const allSchemas = `${schemaEmergency}\n</script>\n<script type="application/ld+json">\n${schemaFaq}\n</script>\n<script type="application/ld+json">\n${schemaBreadcrumb}`;
---

<Base
  title={region.seo.title}
  description={region.seo.description}
  canonical={region.seo.canonical}
  schema={allSchemas}
  geoRegion="BR-RJ"
  geoPlacename={region.name}
  geoPosition={`${region.schema.geo.lat};${region.schema.geo.lng}`}
  icbm={`${region.schema.geo.lat}, ${region.schema.geo.lng}`}
>
  <StickyHeader waCampaign={region.hero.waCampaign} />

  <main id="main">
    <GeoHero region={region} />
    <TempoGrid tempos={region.tempos} />
    <HospitalGrid hospitals={region.hospitals} regionName={region.name} />
    <ServicesGeo services={region.services} regionName={region.name} />
    <FeatureBlock feature={region.feature} />
    <SocialProofGeo reviews={region.socialProof.reviews} regionName={region.name} />

    <CTAInline
      variant="medium"
      text="Precisa de ambulância em Copacabana agora?"
      cta="Chamar no WhatsApp"
      waCampaign={region.hero.waCampaign}
      location="geo-mid"
    />

    <FAQ
      items={region.faq}
      titleHtml={`Dúvidas sobre ambulância <em>em ${region.name}</em>`}
      eyebrow="Perguntas frequentes"
    />

    <NearbyRegions regions={region.nearbyRegions} />

    <!-- CTA Final -->
    <section class="cta-final">
      <h2>Manda mensagem. <em>Nós já estamos a caminho.</em></h2>
      <p>Central 24 horas. Atendemos em menos de 1 minuto, todos os dias do ano.</p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <a href={whatsappUrl(CONTACT_RJ.whatsapp, region.hero.waCampaign, region.hero.waMessage, 'cta-final')} class="btn btn-green" data-whatsapp data-location="cta-final">Chamar no WhatsApp</a>
        <a href={`tel:${CONTACT_RJ.phoneHref}`} class="btn btn-outline" data-phone>{CONTACT_RJ.phone}</a>
      </div>
    </section>
  </main>

  <FloatingWhatsApp waCampaign={region.hero.waCampaign} />
  <Footer />
</Base>

<!-- Inline style for CTA Final (same as reference) -->
<style>
.cta-final {
  background: var(--navy);
  background-image: linear-gradient(135deg, var(--navy-deep) 0%, var(--navy-mid) 100%);
  color: var(--white, #FAFAF8);
  text-align: center;
  padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px);
}
.cta-final h2 {
  font-size: clamp(24px, 4vw, 40px);
  font-weight: 800; letter-spacing: -0.03em;
  margin-bottom: 12px;
}
.cta-final h2 em { font-style: normal; color: var(--green-bright); }
.cta-final p {
  font-size: 16px; color: rgba(255,255,255,.6);
  margin-bottom: 32px;
}
.cta-final .btn { font-size: 16px; padding: 16px 36px; }
</style>
```

- [ ] **Step 2: Build and verify**

Run: `cd /Users/marcelomacbook/Projetos/savior-lps && npm run build`
Expected: Build succeeds, `dist/ambulancia-rj/copacabana.html` exists

Run: `npm run dev` → visit http://localhost:4321/ambulancia-rj/copacabana
Expected: Full page renders with all 10 blocks

- [ ] **Step 3: Verify Schema.org**

Check the generated HTML for 3 JSON-LD blocks: EmergencyService, FAQPage, BreadcrumbList.
Verify geo coordinates are Copacabana-specific (-22.9711, -43.1822), not generic.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ambulancia-rj/copacabana.astro
git commit -m "feat(geo): add Copacabana landing page (Z1, Phase 1)"
```

---

## Task 10: Remaining Phase 1 Pages (Z2, Z3, Z6, Z11)

**Files:**
- Create: `src/pages/ambulancia-rj/zona-sul.astro`
- Create: `src/pages/ambulancia-rj/barra-recreio.astro`
- Create: `src/pages/ambulancia-rj/niteroi.astro`
- Create: `src/pages/remocao-interestadual.astro`

- [ ] **Step 1: Create zona-sul.astro**

Same template as copacabana.astro but with `getRegion('zona-sul')`.
Key differences:
- CTAInline text: "Precisa de ambulância na Zona Sul agora?"
- BreadcrumbList: position 3 = "Zona Sul"
- No Unimed PA callout in feature block

- [ ] **Step 2: Create barra-recreio.astro**

Same template with `getRegion('barra-recreio')`.
Key differences:
- Extra block: cross-sell Eventos (link to /eventos-rj) after FeatureBlock
- CTAInline text: "Precisa de ambulância na Barra agora?"

- [ ] **Step 3: Create niteroi.astro**

Same template with `getRegion('niteroi')`.
Key differences:
- CTAInline text: "Precisa de ambulância em Niterói agora?"

- [ ] **Step 4: Create remocao-interestadual.astro**

Special page — different URL structure (not under /ambulancia-rj/).
Uses `getRegion('interestadual')`.
Key differences:
- URL: /remocao-interestadual (top-level)
- Breadcrumb: Home > Remoção Interestadual (no "Ambulância RJ" middle)
- CTA text: "Pedir orçamento" (not "Chamar")
- Shows both RJ and SP phone numbers
- TempoGrid replaced with a step-by-step logistics section (4 numbered steps)
- No NearbyRegions (this page is national scope)

- [ ] **Step 5: Build all pages**

Run: `npm run build`
Expected: 5 new HTML files in dist/

Run: `npm run dev` → visit each page URL
Expected: All pages render correctly with unique content per region

- [ ] **Step 6: Commit**

```bash
git add src/pages/ambulancia-rj/zona-sul.astro src/pages/ambulancia-rj/barra-recreio.astro src/pages/ambulancia-rj/niteroi.astro src/pages/remocao-interestadual.astro
git commit -m "feat(geo): add Phase 1 pages (Zona Sul, Barra, Niterói, Interestadual)"
```

---

## Task 11: Data Layer — Phase 2 Regions (Z4, Z5, Z7, Z8, Z12, Z13, Z14)

**Files:**
- Modify: `src/data/geo-regions.ts`

- [ ] **Step 1: Research hospitals for each region**

Use web search to verify hospital names, networks, addresses, specialties for:
- Zona Oeste: Rios D'Or, HCJ, Oeste D'Or, Bangu 24h, São Lourenço, Di Camp, Memorial Santa Cruz
- Zona Norte: Quinta D'Or, Badim, São Vicente de Paulo, Evangélico, Albert Sabin, Norte D'Or, Salgado Filho
- Região Oceânica: UPA Oceânica, Conde Modesto Leal (Maricá), São Gonçalo D'Or
- Região Serrana: Santa Teresa Petrópolis, Unimed Petrópolis, HCTCO, Beneficência Portuguesa, Unimed Nova Friburgo
- Intermunicipal: hospitals across multiple RJ cities (Paraty, Angra, Campos, Macaé, Cabo Frio, Volta Redonda)
- Búzios: Hospital Municipal de Armação dos Búzios, UPA Búzios, hospitals in Cabo Frio/Macaé as transfer destinations
- Angra dos Reis: Hospital da Japuíba, Hospital Hugo Miranda, Hospital Codrato de Vilhena, UPA Praia Brava

- [ ] **Step 2: Add all 7 regions to geo-regions.ts**

Each region needs: id, name, slug, phase, seo, hero, tempos, hospitals, services, feature, socialProof, faq, nearbyRegions, schema.

Búzios specifics:
- slug: 'buzios'
- seo.h1: "Ambulância em Búzios: atendimento de emergência e remoção para o Rio"
- feature: turismo, casamentos, réveillon, distância de hospitais complexos
- Geo: lat -22.7469, lng -41.8817
- nearbyRegions: ['regiao-oceanica', 'intermunicipal']

Angra specifics:
- slug: 'angra-dos-reis'
- seo.h1: "Ambulância em Angra dos Reis e Ilha Grande: remoção com UTI móvel"
- feature: acesso marítimo (Ilha Grande), condomínios de luxo, marinas, BR-101
- Geo: lat -23.0067, lng -44.3181
- nearbyRegions: ['intermunicipal', 'regiao-serrana']

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/data/geo-regions.ts
git commit -m "feat(geo): add Phase 2 region data (ZOeste, ZNorte, Oceânica, Serrana, Intermunicipal, Búzios, Angra)"
```

---

## Task 12: Phase 2 Pages (7 pages)

**Files:**
- Create: `src/pages/ambulancia-rj/zona-oeste.astro`
- Create: `src/pages/ambulancia-rj/zona-norte.astro`
- Create: `src/pages/ambulancia-rj/regiao-oceanica.astro`
- Create: `src/pages/ambulancia-rj/regiao-serrana.astro`
- Create: `src/pages/ambulancia-rj/intermunicipal.astro`
- Create: `src/pages/ambulancia-rj/buzios.astro`
- Create: `src/pages/ambulancia-rj/angra-dos-reis.astro`

- [ ] **Step 1: Create all 7 page files**

Each follows the Copacabana template pattern with `getRegion(id)`.

Special variations:
- **Zona Norte (Z5):** Hero emphasizes "nossa base fica aqui" — smallest response times
- **Serrana (Z8):** CTA says "Pedir orçamento" (not "Chamar"), focus on programmed transport
- **Intermunicipal (Z12):** covers Paraty, Angra, Campos, Búzios, Região dos Lagos, Volta Redonda, Barra Mansa, Resende, Macaé
- **Búzios (Z13):** seasonal callout for summer/holidays, cross-sell events (casamentos)
- **Angra (Z14):** maritime access callout for Ilha Grande, luxury condo focus

- [ ] **Step 2: Build all pages**

Run: `npm run build`
Expected: 7 new HTML files in dist/ambulancia-rj/

- [ ] **Step 3: Commit**

```bash
git add src/pages/ambulancia-rj/zona-oeste.astro src/pages/ambulancia-rj/zona-norte.astro src/pages/ambulancia-rj/regiao-oceanica.astro src/pages/ambulancia-rj/regiao-serrana.astro src/pages/ambulancia-rj/intermunicipal.astro src/pages/ambulancia-rj/buzios.astro src/pages/ambulancia-rj/angra-dos-reis.astro
git commit -m "feat(geo): add Phase 2 pages (ZOeste, ZNorte, Oceânica, Serrana, Intermunicipal, Búzios, Angra)"
```

---

## Task 13: Data Layer — Phase 3 Regions (Z9, Z10)

**Files:**
- Modify: `src/data/geo-regions.ts`

- [ ] **Step 1: Add Baixada (Z9) and Centro (Z10) data**

Baixada hospitals: Caxias D'Or, Mário Lioni, Santa Branca, Prontonil, Terezinha de Jesus, HG Nova Iguaçu
Centro hospitals: Quinta D'Or, Glória D'Or, Espanhol, Carmo, Real Hospital Português, Souza Aguiar

Centro special: hybrid B2C + B2B page with cross-link to /corporativo

- [ ] **Step 2: Build and commit**

```bash
git add src/data/geo-regions.ts
git commit -m "feat(geo): add Phase 3 region data (Baixada, Centro)"
```

---

## Task 14: Phase 3 Pages (2 pages)

**Files:**
- Create: `src/pages/ambulancia-rj/baixada-fluminense.astro`
- Create: `src/pages/ambulancia-rj/centro.astro`

- [ ] **Step 1: Create both pages**

Centro (Z10) special: add an extra B2B cross-sell block after FeatureBlock, linking to /corporativo.

- [ ] **Step 2: Build and commit**

```bash
git add src/pages/ambulancia-rj/baixada-fluminense.astro src/pages/ambulancia-rj/centro.astro
git commit -m "feat(geo): add Phase 3 pages (Baixada, Centro)"
```

---

## Task 15: Sitemap Configuration

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update sitemap filter**

The current filter excludes `/preview`, `/estatisticas`, and `/eventos`. Geo pages should NOT be filtered — they must appear in the sitemap.

Verify the current filter doesn't accidentally exclude `/ambulancia-rj/` subpages. The filter:
```javascript
filter: (page) =>
  !page.includes('/preview') &&
  !page.includes('/estatisticas') &&
  !page.endsWith('/eventos/') &&
  !page.endsWith('/eventos'),
```

This should already include geo pages since they match none of the exclusion patterns. Verify by checking the generated sitemap after build.

- [ ] **Step 2: Build and verify sitemap**

Run: `npm run build`
Check: `dist/sitemap-0.xml` should contain all 14 geo page URLs

- [ ] **Step 3: Commit if changes needed**

```bash
git add astro.config.mjs
git commit -m "chore: verify sitemap includes geo pages"
```

---

## Task 16: Analytics — Region Parameter

**Files:**
- Modify: `src/components/GeoHero.astro` (add data-region attribute)
- Modify: `src/layouts/Base.astro` (add region to dataLayer if present)

- [ ] **Step 1: Add region tracking**

In GeoHero, add `data-region={region.id}` to the main element.

In Base.astro, if a `geoRegionId` prop is passed, push it to dataLayer:
```javascript
window.dataLayer.push({
  'event': 'geo_page_view',
  'geo_region': geoRegionId
});
```

Existing `whatsapp_click` events should inherit the region from the page context.

- [ ] **Step 2: Update all geo pages to pass geoRegionId**

Add `geoRegionId={region.id}` to the Base component in each geo page.

- [ ] **Step 3: Build and commit**

```bash
git add src/components/GeoHero.astro src/layouts/Base.astro
git commit -m "feat(analytics): add region parameter to dataLayer for geo pages"
```

---

## Task 17: Final QA — Build, Links, Schema

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: 0 errors, all 14 geo HTML files generated

- [ ] **Step 2: Verify internal links**

Check that:
- All NearbyRegions links resolve to existing pages
- Breadcrumb links work
- Footer links work
- Cross-sell links (/eventos-rj, /corporativo) work
- WhatsApp URLs include correct utm_campaign per region

- [ ] **Step 3: Verify Schema.org**

For each page, verify:
- EmergencyService schema has region-specific geo coordinates
- FAQPage schema has 4 questions
- BreadcrumbList has correct hierarchy
- areaServed lists correct neighborhoods/cities

- [ ] **Step 4: Lighthouse audit on dev server**

Run: `npm run dev`
Check 2-3 representative pages in Chrome DevTools Lighthouse:
- Performance ≥ 90
- SEO ≥ 90
- Accessibility ≥ 80
- Best Practices ≥ 90

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(geo): complete 14 geo landing pages — Phase 1, 2, 3"
```

---

## Summary

| Task | Description | Files |
|------|------------|-------|
| 1 | Data layer (types + 5 regions) | geo-regions.ts |
| 2 | GeoHero component | GeoHero.astro |
| 3 | TempoGrid component | TempoGrid.astro |
| 4 | HospitalGrid component | HospitalGrid.astro |
| 5 | ServicesGeo component | ServicesGeo.astro |
| 6 | FeatureBlock component | FeatureBlock.astro |
| 7 | SocialProofGeo + NearbyRegions | 2 components |
| 8 | CTA Final (inline, no component) | — |
| 9 | Copacabana page (Z1) | copacabana.astro |
| 10 | Phase 1 remaining (Z2, Z3, Z6, Z11) | 4 pages |
| 11 | Data layer Phase 2 (7 regions) | geo-regions.ts |
| 12 | Phase 2 pages (7 pages) | 7 pages |
| 13 | Data layer Phase 3 (2 regions) | geo-regions.ts |
| 14 | Phase 3 pages (2 pages) | 2 pages |
| 15 | Sitemap config | astro.config.mjs |
| 16 | Analytics region param | GeoHero + Base |
| 17 | Final QA | all files |
