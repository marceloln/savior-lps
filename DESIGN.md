# DESIGN.md — Savior LPs

Tokens vivem em `src/styles/global.css`. Este arquivo resume as decisões pra agentes de design.

## Cores (60/15/25)
| Token | Valor | Papel |
|---|---|---|
| `--navy` | #0B2540 | Dominante (60%): heros, seções escuras |
| `--navy-deep` | #07182B | Fundos profundos, CTA final |
| `--navy-mid` | #143458 | Texto de apoio em claro |
| `--green` | #00B87C | Acento (15%): CTAs, ícones, destaques |
| `--green-dark` | #00A06C | Hover, botões de e-mail |
| `--green-bright` | #1FD29A | Em fundo escuro (contraste) |
| `--cream` | #F4EFE6 | Quente (25%): seções de leitura |
| `--cream-light` | #FAF6EC | Alternância entre seções beges |
| `--cream-dark` | #E8DFCC | Bordas, inputs |
| `--areia` | #C5AA81 | Detalhes editoriais raros |
| `--alert` | #D9534F | Erros e avisos |

Estratégia: Committed no navy. Nunca #000/#fff puros.

## Tipografia
- **Inter** (400/500/600/700/800) self-hostada: tudo
- **IBM Plex Mono** (400/500): APENAS eyebrows (uppercase, verde, tracking largo) — é a identidade verbal das seções
- Headings: escala com clamp(), ratio ≥1.25, weight 700/800
- Corpo: 65-75ch máx, line-height 1.6+

## Componentes canônicos
`Hero`, `StickyHeader`, `FAQ`, `Footer`, `FleetBand` (faixa de foto full-width entre blocos), `FinalCTA` com `.atend-layout` (foto atendente + texto). Botões: `.btn.btn-primary` (verde), `.btn-secondary`, variantes `.on-dark`.

## Ícones
SVG inline stroke (stroke-width 2, currentColor, 20-24px). Monocromáticos: verde em fundo claro, green-bright em escuro. Nunca emoji como ícone de UI, nunca ícone grande decorativo acima de heading.

## Imagens
Só fotos REAIS da Savior (frota, equipe, atendentes, eventos) em `/public/img/`. WebP responsivo 3 breakpoints. Nada de stock. Alt text descritivo com local.

## Motion
IntersectionObserver + classe `--visible`, transform/opacity apenas, ease-out. Sem bounce.

## Proibições do projeto
- border-left/right colorido como acento (side-stripe)
- Gradiente em texto, glassmorphism, hero-metric SaaS
- Pontos finais decorativos em headings
- Em dashes na copy
- Mencionar tempo de chegada (14min) ou idade da frota
