# Savior LPs

Landing pages da **Savior Medical Service** — ambulância particular no RJ e SP, 46 anos de operação desde 1979.

Stack: **Astro 5 (static)** + **Cloudflare Pages**. Zero JS runtime — apenas GTM inline.

- **LP1** (produção): `/ambulancia-rj`
- LP2+ (roadmap): `/ambulancia-sp`, `/eventos`, `/corporativo`, `/plano-familiar`

## Scripts

```bash
npm install        # primeira vez
npm run dev        # local em http://localhost:4321
npm run build      # build em ./dist
npm run preview    # preview do build
```

## Estrutura

```
savior-lps/
├── public/                 # servido como-está
│   ├── _headers            # Cloudflare CSP + cache
│   ├── _redirects          # / → /ambulancia-rj
│   ├── favicon.svg, apple-touch-icon.png, og-savior.jpg
│   ├── robots.txt, llms.txt, llms-full.txt
│   ├── img/                # WebP otimizado
│   └── video/              # hero-loop.mp4 + webm
├── src/
│   ├── data/savior.ts      # contatos, métricas, analytics
│   ├── styles/global.css   # design tokens
│   ├── layouts/Base.astro  # head + schema + GTM + Meta + LinkedIn
│   ├── components/         # 15 componentes scoped
│   └── pages/
│       ├── index.astro           # 301 redirect
│       └── ambulancia-rj.astro   # LP principal
├── astro.config.mjs, package.json, tsconfig.json
```

## Antes do deploy — configurar IDs reais

Edite `src/data/savior.ts`:

```ts
export const ANALYTICS = {
  gtm: 'GTM-XXXXXXX',              // substituir GTM-PLACEHOLDER
  ga4: 'G-XXXXXXXXXX',             // opcional (pode vir via GTM)
  metaPixel: '123456789012345',    // ID numérico Events Manager
  linkedInPartnerId: '1234567',    // Partner ID Campaign Manager
  useGtmAsSource: true,            // true = GTM orquestra tudo
};
```

Também atualize `GTM-PLACEHOLDER`, `META_PIXEL_PLACEHOLDER` e `LINKEDIN_PARTNER_PLACEHOLDER` nos noscript fallbacks em `src/layouts/Base.astro` (3 ocorrências no body).

## Deploy

Automático via **Cloudflare Pages**:
- Push em `main` → deploy produção
- Push em outra branch → preview URL único
- Build: `npm run build`
- Output: `dist`

Ver `CLAUDE.md` pra histórico e decisões.
