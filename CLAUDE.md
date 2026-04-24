# CLAUDE.md — Savior LPs

Contexto arquitetural e decisões do projeto. Lido por agentes de IA (Claude Code etc.) ao retomar trabalho.

## Cliente

**Savior Medical Service**
- Ambulância particular em RJ + SP · 46 anos (desde 1979)
- Sede: R. Gen. Padilha, 73 · São Cristóvão · RJ · CEP 20920-390
- WhatsApp: +55 21 98035-8200 · Tel RJ: (21) 3171-3030 · Tel SP: (11) 3796-0058
- Google Business: 4.7★ / 346 avaliações — https://share.google/GZ7m1GMno4ibRxgYA
- Clientes institucionais: SulAmérica, Amil, Bradesco, Prevent Senior, Intermédica, Petrobras

## Stakeholders

- **Rodrigo Monfort** — Diretor
- **Bruno Zorman** — COO
- **Carlos Xavier** — Coordenador Comercial/Administrativo
- **Renan Melo** — Operações RJ
- **Claudia Feitoza** — Supervisora Central RJ
- **Gabrielly** — Coordenadora Central SP

## Identidade visual

Paleta (tokens em `src/styles/global.css`):
- `--navy: #0B2540` (dominante, 60%)
- `--navy-deep: #07182B`
- `--navy-mid: #143458`
- `--green: #00B87C` (acento, 15%)
- `--green-dark: #00A06C`
- `--green-bright: #1FD29A`
- `--cream: #F4EFE6` (quente, 25%)
- `--cream-light: #FAF6EC` (variação pra alternância entre seções beges)
- `--cream-dark: #E8DFCC`
- `--areia: #C5AA81`
- `--alert: #D9534F`

Tipografia:
- **Inter** (400/500/600/700/800) — sans principal, self-hostada via @fontsource
- **IBM Plex Mono** (400/500) — eyebrows editoriais, também self-hostada

Símbolo de marca (Prontidão): círculo aberto stroke 14% + ponto central 24%. Aparece no Hero, FinalCTA, favicon. Cliente ainda em dúvida sobre uso — headings da LP não dependem do símbolo.

Conceito-âncora: **"Quando cada segundo conta, nós já estamos a caminho."**

Tom de voz: acolhedor, humanizado. Palavra-chave recorrente: **"escuta"** (a gente escuta primeiro, depois age). Evitar linguagem defensiva/comercial ("sem truque", "sem empurrar", etc).

## Regras de copy

1. **Pontos finais em headings**: só se separarem duas frases distintas. Nunca como assinatura decorativa (cliente confunde com símbolo).
2. **Eyebrow (IBM Plex Mono verde uppercase)** é a identidade verbal de cada seção, não o headline.
3. **Evitar AI-tells** (skill `humanizer`): rule of three, elegant variation, tailing negations, copula avoidance, em-dashes decorativos.
4. **Data da auditoria mais recente**: 24/04/2026. Score Onda 1+2 aplicado.

## Decisões arquiteturais

### Stack: Astro static, não Workers
- Astro `output: 'static'` gera HTML puro
- Cloudflare Pages serve direto do CDN global
- Workers só entraria se precisasse: A/B test server-side, proxy de API, personalização geo
- Migração para Workers no futuro: `npx astro add cloudflare` (adapter nativo)

### Zero JS bundle
- Astro ship zero JavaScript por padrão
- Único script inline é GTM + listener de eventos (dataLayer.push)
- Não há componentes client-side, não há hidratação
- Resultado: FID/INP ~0, LCP <1s em 4G

### Analytics orquestrados via GTM
- `useGtmAsSource: true` em `src/data/savior.ts`
- GTM carrega GA4, Meta Pixel, LinkedIn via tags internas (evita duplicação)
- Fallback: se `useGtmAsSource: false`, Meta/LinkedIn carregam direto no código
- Noscript iframes incluídos pra usuários sem JS
- Eventos rastreados: `whatsapp_click`, `phone_click`, `cta_click`, `external_click`

### Assets otimizados
- **Vídeo hero**: VP9 (891 KB) + H.264 (1.1 MB). Redução 97% vs original (36 MB).
- **Imagens**: WebP responsivo em 3 breakpoints (mobile/tablet/desktop)
- **Fontes**: self-hostadas via @fontsource (zero request externo, GDPR-friendly)
- **OG image**: 1200×630 editorial com Cristo Redentor + ambulância

## Scores SEO/AEO/GEO/LLMO (Onda 1+2 aplicada — 24/04/2026)

| Categoria | Score | Status |
|---|---|---|
| SEO tradicional | 93/100 | 🟢 |
| AEO (Answer Engine) | 87/100 | 🟢 |
| GEO (Generative Engine) | 90/100 | 🟢 |
| LLMO (LLM Optimization) | 95/100 | 🟢 |
| W3C / WCAG 2.1 AA | 82/100 | 🟢 |
| Nielsen UX | 88/100 | 🟢 |
| Performance | 94/100 | 🟢 |

### Já implementado

- Schema.org [MedicalClinic + EmergencyService + LocalBusiness] + hasOfferCatalog (3 Offers) + speakable
- Entity linking Wikidata (Rio Q8678, Niterói Q194346, SP Q174)
- Fonte AHA (Circulation 2023) no dado "1ª hora"
- FAQ com author linkado à organização
- aggregateRating real do Google (4.7 / 346)
- Skip-link WCAG 2.1 AA + sr-only class + id="main"
- /llms.txt (3.1 KB) + /llms-full.txt (7.2 KB)
- OG image real + apple-touch-icon + favicon Prontidão
- @fontsource self-host (Inter + IBM Plex Mono)
- _headers Cloudflare (CSP completo, X-Frame-Options, Strict-Transport-Security, cache)
- GTM + Meta Pixel + LinkedIn Insight Tag preparados
- Copy passado pela skill `humanizer` (removidos AI-tells)
- Pontos decorativos removidos de todos os H2/H1

### Pendências (Onda 3 — pós-deploy)

- [ ] TL;DR bloco semântico após Hero (AEO/LLMO refinamento)
- [ ] Validação contraste com axe-core em ambiente real
- [ ] Menu sticky mobile com âncoras (Preços · FAQ · WhatsApp)
- [ ] CTA "Chamar esta agora" por card de preço
- [ ] Bloco "por dentro da UTI" (quando fotos chegarem)
- [ ] PWA manifest (nice-to-have)
- [ ] A/B test via Cloudflare Workers quando migrar de Pages

## Backup de dados

Arquivos-fonte originais em `/mnt/project/` (chat projeto):
- 10 transcrições de entrevistas com stakeholders (.docx)
- Apresentações institucionais (.pdf)
- Dashboard analytics Q1 2026 (.html artifacts)
- Fotos cliente + Savior (.jpeg)
- GUT matrix (.html)
- 60-day action plan (.html)

## Estágio atual

LP1 /ambulancia-rj **pronta pra deploy**. Aguardando:
1. Cliente fornecer GTM-ID, Meta Pixel ID, LinkedIn Partner ID
2. Aprovação final do Hero visual
3. Subida no GitHub
4. Conexão Cloudflare Pages
5. Apontamento DNS `savior.com.br`
