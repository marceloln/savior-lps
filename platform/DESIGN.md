# DESIGN.md — Savior Platform

Tokens definidos em `app/globals.css` via CSS custom properties. Registro: **product**.

## Estrategia de cor: Light warm gray-blue

Superficie principal e warm gray-blue claro. Navy e usado apenas no rail nav e itens selecionados. Verde e acento funcional (status ativo, acao primaria). Nunca decorativo.

Todas as cores usam OKLCH para consistencia perceptual.

| Token | Valor OKLCH | Papel |
|---|---|---|
| `--bg` | oklch(0.955 0.010 255) | Background principal do app |
| `--card` | oklch(0.992 0.004 255) | Superficie de cards e paineis |
| `--card2` | oklch(0.975 0.007 255) | Superficie alternativa, hover |
| `--ink` | oklch(0.28 0.055 255) | Texto primario |
| `--ink2` | oklch(0.40 0.045 255) | Texto secundario |
| `--muted` | oklch(0.55 0.032 255) | Labels, texto auxiliar |
| `--muted2` | oklch(0.68 0.022 255) | Placeholder, texto discreto |
| `--line` | oklch(0.90 0.012 255) | Bordas, separadores |
| `--line2` | oklch(0.85 0.016 255) | Bordas mais visiveis, hover |
| `--navy` | oklch(0.29 0.058 256) | Rail nav, item selecionado |
| `--navy-deep` | oklch(0.22 0.05 256) | Tooltips, badges de contagem |
| `--green` | oklch(0.68 0.14 168) | Acento primario |
| `--green-d` | oklch(0.55 0.12 168) | Texto sobre fundo verde claro |
| `--green-l` | oklch(0.95 0.045 168) | Fundo de pill/badge verde |
| `--red` | oklch(0.585 0.17 27) | Erro, manutencao, critico |
| `--amber` | oklch(0.62 0.13 65) | Em atendimento, atencao |
| `--blue` | oklch(0.55 0.13 245) | Aberto, em transito |
| `--violet` | oklch(0.55 0.15 288) | Em cotacao |
| `--slate` | oklch(0.55 0.03 255) | Concluido, inativo |

## Status colors (funcionais, nao decorativos)
- Disponivel: green (pill-green)
- Em atendimento: amber (pill-amber)
- Manutencao: red (pill-red)
- Aberto: blue (pill-blue)
- Em cotacao: violet (pill-violet)
- Concluido: slate (pill-slate)
- Cancelado: red (pill-red)

## Tipografia
- **Bricolage Grotesque** (display): titulos de pagina, KPIs grandes, nomes no inbox, h1-h2
- **Hanken Grotesk** (body): todo o resto (labels, paragrafos, tabs, botoes)
- **JetBrains Mono** (mono): placas de veiculo, valores R$, contadores, IDs, labels de KPI, pills

Tamanhos: 8-9px labels mono, 10-11px dados auxiliares, 12.5px corpo, 13-14px titulos de painel, 19-25px titulos de pagina, 22px KPI value.

## Layout
- Rail nav: 58px fixo a esquerda. Navy com icones brancos semi-transparentes. Ativo: fundo verde.
- Content area: padding 20px 26px 40px. Sem max-width (usa o espaco todo).
- Central: 3 colunas (58px rail + 348px inbox + 1fr detail).
- Cards/Panels: bg card, border 1px line, radius 12px. Sem sombra. Flat + bordas.
- KPI cards: padding 13px 15px. Label mono 8.5px + valor display 22px.
- Tabelas: th 8.5px mono uppercase, td 12.5px, padding 11px 16px.

## Componentes
- **Pill**: mono 8px, uppercase, tracking .03em, padding 3px 8px, radius 6px. Fundo claro + texto escuro.
- **KPI Card**: panel com kpi-label (mono uppercase) + kpi-value (display bold).
- **Filter chips**: 11px body 600, padding 5px 10px, radius 8px. Ativo: green-l bg + green-d text.
- **Tab bar**: underline style, 2.5px bottom border. Verde para tab ativa.
- **Buttons**: radius 10px, padding 10px 15px, 700 weight, 12.5px. Hover: brightness(1.04).

## Icones
Lucide React. Stroke width 1.5. Tamanho 20px na nav, 13-14px inline. Cor: oklch(1 0 0 / .5) inativo, green ativo (no rail).

## Motion
- Transicoes: 150ms ease-out para hover
- Live dot: keyframes bl com opacity pulse 1.8s infinite
- Critical dot: keyframes cd com opacity pulse 1s infinite
- Sem animacoes decorativas. Sem bounce/elastic.

## Proibicoes
- Side-stripe borders (border-left colorido)
- Gradient text ou backgrounds
- Sombras (flat design com bordas apenas)
- Glassmorphism / blur decorativo
- Bordas arredondadas > 12px
- Dark theme (operadores trabalham em ambiente claro)
- Tailwind color classes (usar CSS custom properties)
