# Savior Platform — Final Audit (v0.3)

**Date:** 24/08/2026
**Context:** After inline styles elimination (770 to 14) and all remaining fixes
**Standard:** Apple/Linear quality bar
**Pages audited:** 18
**CSS classes in globals.css:** ~600 (2495 lines)
**Total `style={{` remaining:** 14 (across 5 files)

---

## Executive Summary

A migracaco de inline styles foi a maior transformacao arquitetural da plataforma ate agora. De 770 ocorrencias para 14 (98.2% de reducao), com ~600 classes CSS em globals.css cobrindo virtualmente todos os patterns visuais. As 14 restantes sao justificaveis: 3 em Leads (bar charts com width calculado dinamicamente), 8 no keyboard-shortcuts modal (componente utilitario), 1 no toast (posicionamento z-index), 1 no slide-over (z-index), e 1 no auth layout (background var).

O que subiu: Consistency (de 6.5 para 8.5 no Apple test), Aesthetic Integrity (de 7.5 para 8.5). A plataforma agora inspeciona bem. O codigo reflete a intencao de design. Um desenvolvedor novo consegue entender o sistema visual lendo globals.css.

O que nao mudou: a logica de SLA entre Central e Mapa continua divergente (slaLevel helper existe em mock-data.ts mas nenhuma pagina o importa). Direct Manipulation continua em 5/10. Nenhuma tabela tem sort. Nenhum kanban permite drag.

**Overall: 7.8/10** (antes: 7.0/10, delta: +0.8)

---

## Verification Checklist

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | 770 inline styles eliminados | **14 restantes** | grep `style={{` across all .tsx = 14 hits. 3 em leads (bar chart width%), 8 em keyboard-shortcuts, 1 toast, 1 slide-over, 1 auth layout |
| 2 | Delete confirmation em Fornecedores, Equipamentos, OS | **OK** | `confirm('Tem certeza que deseja excluir?')` presente nos 3 arquivos |
| 3 | Skeleton loading no layout (Suspense) | **OK** | `SkeletonFallback` com classes `.skeleton-page`, `.skeleton-title`, `.skeleton-body`. Suspense wrapping children em todos os 3 branches (Central, Mapa, content-area) |
| 4 | slaLevel helper compartilhado entre Central e Mapa | **PARCIAL** | Helper `slaLevel()` existe em `lib/mock-data.ts` (<=15=ok, <=25=warn, >25=crit). Porem: Central usa logica inline propria (>20=crit, >15=warn). Mapa usa logica inline propria (<=5=crit, <=15=warn). Nenhuma das duas importa slaLevel(). As logicas continuam divergentes entre si e divergentes do helper |
| 5 | "Taxa de conversao" corrigido | **OK** | Leads page.tsx linha 372: `Taxa de conversão` (com "de") |
| 6 | Leads notas editavel (sem readOnly) | **OK** | `<textarea className="form-textarea" defaultValue={selectedLead.notas} />` sem readOnly |
| 7 | KPI sizing consistente em Equipe/[id] | **OK** | Usa classes `kpi-value-lg` e `kpi-value-sm` (definidas em globals.css como 20px e 14px). Zero fontSize inline |
| 8 | ~200 CSS classes em globals.css | **SUPEROU** | ~600 classes (601 linhas comecando com `.`), 2495 linhas totais. Cobertura massiva de todos os patterns |

### Detalhamento do item 4 (SLA divergente)

| Contexto | Logica | Resultado para 10 min | Resultado para 18 min | Resultado para 22 min |
|----------|--------|----------------------|----------------------|----------------------|
| `slaLevel()` (mock-data.ts) | <=15=ok, <=25=warn, >25=crit | ok | warn | warn |
| Central (page.tsx) | >20=crit, >15=warn, else=ok | ok | warn | crit |
| Mapa (page.tsx) | <=5=crit, <=15=warn, else=ok | ok | ok | ok |

Para um chamado com 22 minutos de espera: Central mostra como CRITICO (correto), Mapa mostra como OK (errado), slaLevel retorna WARN (moderado). Tres respostas diferentes para o mesmo dado.

---

## Scores

| Dimension | v0.1 | v0.2 | v0.3 | Journey |
|-----------|------|------|------|---------|
| **A. UX Flows** | 6.0 | 7.5 | 7.8 | +0.3: Suspense/Skeleton no layout. Confirm dialogs nas exclusoes. VTR picker funcional. Falta sort, drag, keyboard shortcuts alem de Esc |
| **B. UI Consistency** | 5.0 | 7.0 | 8.5 | +1.5: De 770 para 14 inline styles. funcaoPill migrou para classes CSS. Equipe/[id] KPIs uniformizados. Chip-dark, map-stats-badge, vtr-sidebar-row todos via CSS. Maior salto desta versao |
| **C. Visual Hierarchy** | 6.0 | 7.5 | 8.0 | +0.5: KPI sizing agora em 4 tiers (sm/md/lg/xl) via classes. Spacing ainda nao e 4px strict, mas os patterns mais comuns tem classe propria |
| **D. Info Density** | 7.0 | 7.5 | 7.8 | +0.3: Notas do lead editaveis. Sidebar search do mapa via CSS classes. Sem sort em tabelas, sem export CSV |
| **E. Interactions** | 4.0 | 7.0 | 7.3 | +0.3: Skeleton loading integrado no layout via Suspense. Confirm dialog em 3 paginas de delete. Segment toggle com transition CSS. Falta drag, animacao dispatch panel |
| **F. Copy** | 5.0 | 8.5 | 8.5 | +0.0: Taxa de conversao corrigido. Sem regressao. Nao ha novos problemas de copy |
| **G. Data Integrity** | 6.5 | 7.0 | 7.2 | +0.2: slaLevel helper existe mas nao e usado. Logicas divergentes persistem. funcaoPillCls agora usa mapeamento consistente para classes CSS |
| **H. New Features** | 6.0 | 7.5 | 7.5 | +0.0: Nenhuma feature nova nesta rodada. A melhoria foi puramente estrutural/arquitetural |
| **Overall** | **5.5** | **7.0** | **7.8** | **+0.8** |

---

## Apple Test

| Principle | v0.2 | v0.3 | Gap to 10 |
|-----------|------|------|-----------|
| **Clarity** | 8.0 | 8.2 | KPI sizing padronizado. Pills com classes. Labels .label ainda 8.5px (pequenas para campo). Pills 6-7px persistem em pill-xs/pill-6 |
| **Deference** | 7.0 | 8.0 | Interface quase invisivel agora: CSS classes significam que o visual e controlado pelo sistema, nao por decisoes ad-hoc. O codigo "sai do caminho" |
| **Depth** | 7.0 | 7.2 | Slide-overs com animacao. Skeleton como fallback. Falta: dispatch panel sem entrada animada, kanban sem drag, segment toggle sem sliding indicator |
| **Consistency** | 6.5 | 8.5 | MAIOR SALTO. 14 inline styles vs 770. Todos os patterns visuais tem classe. funcaoPill via classes. KPIs uniformizados. Status dots via CSS. Mapa stats via classe. Ainda perde ponto por SLA logica divergente |
| **Direct Manipulation** | 5.0 | 5.0 | Zero mudanca. Nenhum drag-and-drop. Nenhum sort em tabelas. A unica manipulacao direta continua sendo click-to-navigate e click-to-slide-over |
| **Feedback** | 7.5 | 7.8 | Toast em 13 paginas. Confirm em exclusoes. Skeleton no layout. Falta: hover feedback em botoes de slide-over, loading states em acoes (despachar, salvar) |
| **Aesthetic Integrity** | 7.5 | 8.5 | A integridade estetica agora resiste a inspecao. globals.css e o design system executado, nao apenas documentado. OKLCH tokens, 3 familias tipograficas, ~600 classes coerentes |

---

## What's needed for 10/10

### Effort: 1 day

1. **Unificar SLA logic** — Central e Mapa devem importar `slaLevel()` de mock-data.ts. Atualizar a funcao para a semantica correta (<=10=ok, <=20=warn, >20=crit, ou o que a Claudia/Renan definir como correto para a operacao). Uma hora de trabalho, impacto direto em Data Integrity
2. **Keyboard shortcuts modal migrar para CSS** — 8 inline styles no keyboard-shortcuts.tsx podem virar classes (`.shortcut-modal`, `.shortcut-row`, `.shortcut-key`). 30 min
3. **Dispatch panel animacao de entrada** — Adicionar `animation: slide-in-right 0.2s ease-out` ao `.map-dispatch-panel`. 5 min, ja existe o keyframe
4. **Pills minimo 8px** — `.pill-6 { font-size: 6px }` e `.pill-xs { font-size: 7px }` sao ilegíveis. Subir ambos para 8px. 5 min
5. **Labels minimo 10px** — `.label { font-size: 8.5px }` e pequeno demais para operadores em campo. Subir para 10px. Auditar se quebra layouts. 30 min

### Effort: 3 days

6. **Sort em todas as tabelas** — Frota, Equipe, Leads Base, Documentos, Pneus, Fornecedores, Equipamentos. onClick no th com state de sort e icone ChevronUp/Down. ~2h por tabela, 7 tabelas = 14h
7. **Drag-and-drop no kanban** — Leads Pipeline e OS. Implementar com @dnd-kit. Estimativa: 1 dia para os dois, incluindo animacao de drop
8. **Export CSV** — Botao "Exportar" em Frota, Equipe, Leads Base. Gerar CSV client-side via Blob. 2h por pagina
9. **Spacing scale formal** — Definir `--s-1: 4px` a `--s-10: 40px` e migrar os ~50 valores de padding/gap/margin mais usados para tokens. 1 dia

### Effort: 1 week

10. **Keyboard shortcuts completos** — N=novo, /=buscar, J/K=navegar lista, D=despachar, Cmd+K=command palette. Estimativa: 2 dias
11. **Mini-mapa Leaflet inline na Central** — 200x150px no workspace quando chamado selecionado tem coordenadas. Estimativa: 1 dia
12. **Chat date dividers** — Separacao visual entre dias no chat da Central. 4h
13. **Loading states em acoes** — Spinner no botao "Salvar" (500ms delay simulado), "Despachando..." no Mapa. 4h
14. **Hover feedback em slide-over buttons** — Botoes dentro dos slide-overs nao tem estado hover visivel. Adicionar `:hover` com opacity ou background change. 2h
15. **Responsividade basica** — A plataforma nao funciona abaixo de 1280px. Definir breakpoints: 1280 (sidebar collapsa), 1024 (grid vira stack), 768 (nao suportado, mostrar aviso). 3 dias
16. **WCAG 2.1 AA** — Skip links, aria-labels nos icones, focus management nos slide-overs, anuncios de toast via aria-live. 2 dias

### Effort: beyond prototype (production phase)

17. **Conexao Supabase real** — Substituir mock-data.ts por queries. Tabelas: vtrs, chamados, funcionarios, leads, fornecedores, equipamentos, os, documentos, pneus, checklists, orcamentos, almoxarifados. Estimativa: 2 semanas
18. **Autenticacao real** — Supabase Auth com roles (supervisor, operador, gestor, admin). Row Level Security. 1 semana
19. **Real-time na Central** — Supabase Realtime para chamados novos, updates de status, chat messages. 3 dias
20. **Integracoes** — Blip (WhatsApp), SofitView (VTRs), Pipedrive (Leads), Google Maps API (ETAs reais). 2 semanas cada
21. **Sound cues** — Audio notification quando chamado urgente entra ou passa de threshold de SLA. 1 dia
22. **PWA** — Service worker + manifest para uso offline parcial (visualizar frota, equipe). 2 dias
23. **User testing com operadores reais** — 5 sessoes de 30 min com operadores da Central RJ. O feedback deles vale mais que 100 audits de design. 1 semana para preparar + executar + sintetizar

---

## Inline Style Census (Final)

| File | v0.2 | v0.3 | Delta |
|------|------|------|-------|
| Central (/) | 154 | 0 | -154 |
| Frota/[id] | 116 | 0 | -116 |
| Leads | 102 | 3 | -99 |
| Mapa | 77 | 0 | -77 |
| Orcamentos | 74 | 0 | -74 |
| Checklists | 67 | 0 | -67 |
| Equipe/[id] | 38 | 0 | -38 |
| Equipe | 32 | 0 | -32 |
| Frota | 31 | 0 | -31 |
| Pneus | 28 | 0 | -28 |
| Configuracoes | 19 | 0 | -19 |
| Equipamentos | 18 | 0 | -18 |
| Documentos | 15 | 0 | -15 |
| Fornecedores | 14 | 0 | -14 |
| OS | 13 | 0 | -13 |
| Login | 13 | 0 | -13 |
| Almoxarifados | 10 | 0 | -10 |
| keyboard-shortcuts.tsx | — | 8 | (componente utilitario) |
| toast.tsx | — | 1 | (z-index) |
| slide-over.tsx | — | 1 | (z-index) |
| auth/layout.tsx | — | 1 | (background var) |
| **TOTAL** | **770** | **14** | **-756 (98.2%)** |

---

## funcaoPill Migration (verified)

Equipe e Equipe/[id] agora usam `funcaoPillCls` (Record que mapeia funcao para classe CSS como `pill-green`, `pill-blue`, `pill-violet`). Zero inline styles de background/color para pills de funcao.

---

## What Changed This Version (v0.2 to v0.3)

| Area | Before | After |
|------|--------|-------|
| Inline styles | 770 | 14 |
| CSS classes in globals.css | ~200 | ~600 |
| funcaoPill | inline style={{ bg, color }} | funcaoPillCls → pill-* classes |
| Equipe/[id] KPIs | 4 different fontSize values | kpi-value-lg / kpi-value-sm classes |
| Mapa stats badge | 100% inline | .map-stats-badge class |
| Mapa filter chips | OKLCH hardcoded inline | .chip-dark / .chip-dark.on classes |
| Mapa sidebar hover | JS onMouseEnter/Leave | CSS .table-row-click (already v0.2) |
| Skeleton in layout | Not used | Suspense + SkeletonFallback in all routes |
| Delete confirmation | Missing in 3 pages | confirm() in Fornecedores, Equipamentos, OS |
| Leads notas | readOnly | Editable textarea |
| "Taxa conversao" | Missing "de" | "Taxa de conversao" |
| Mapa sidebar search | 7 inline styles | CSS classes |
| VTR sidebar dots | hex hardcoded inline | .vtr-dot-* classes (still hex in CSS, not var()) |

---

## Honest Assessment

A plataforma fez a transicao de "prototipo com boa direcao" para "produto pre-alpha com design system executado". A diferenca e significativa: o codigo agora e mantivel, extensivel e inspecionavel.

O gap de 7.8 para 10 e composto por:
- 30% interatividade avancada (sort, drag, keyboard, command palette)
- 25% polish de producao (responsividade, acessibilidade, loading states)
- 25% dados reais (Supabase, real-time, integracoes)
- 20% craft obsessivo (spacing scale, micro-animacoes, sound cues, user testing)

A plataforma esta pronta para demo com stakeholders e para testes de usabilidade com operadores. O proximo salto real (de 7.8 para 9.0) virA quando dados reais substituirem mock-data e operadores reais derem feedback sobre o fluxo.

O unico issue critico aberto e a divergencia de SLA entre Central e Mapa. Em uma plataforma de emergencia medica, dois operadores olhando o mesmo chamado verem niveis de urgencia diferentes pode ter consequencias reais. Corrigir isso e prioridade 1.
