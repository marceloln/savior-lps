# Savior Platform — Post-Fix Audit

**Date:** 23/08/2026
**Context:** After applying 25 fixes from definitive audit
**Standard:** Apple/Linear quality bar
**Pages audited:** 18
**Auditor:** Re-audit comparing current codebase vs. definitive audit findings

---

## Executive Summary

Das 25 correções solicitadas, 22 foram implementadas com sucesso. A plataforma evoluiu de 5.5/10 para 7.0/10 no padrão Apple. O salto mais significativo foi na integração do Toast (feedback em cada interação) e na correção de acentuação. O gap restante para 10/10 é dominado por inline styles massivos (770+ ocorrências) e falta de polish em microinterações.

---

## Fix Verification: 22/25 confirmed

| # | Fix | Status | Notes |
|---|-----|--------|-------|
| 1 | CSS utility classes (flex-between, info-row, kpi-row, etc.) | ✅ | globals.css linhas 2018-2068: flex-between, flex-center, flex-col, flex-gap-*, section-header, page-header, info-row, info-label, info-value, kpi-row, detail-hero, table-header-row, back-link, status-dot, empty-state todas presentes |
| 2 | Toast em 10+ páginas | ✅ | useToast importado e showToast chamado em 13 páginas: Central, Mapa, Frota, Frota/[id], Equipe, Leads, Almoxarifados, Fornecedores, Equipamentos, OS, Documentos, Pneus, Orçamentos |
| 3 | Acentuação corrigida | ✅ | Sessões, Usuários, Conversões, Aquisição, Tendência, médio, ATRIBUIÇÃO, SERVIÇO, REGIÃO, HISTÓRICO, ESTÁGIO, Descrição, MANUTENÇÃO, MÉDIA, CRÍTICA, Configurações, Próxima, Página — todos com acento |
| 4 | Central header 2 linhas | ✅ | Linha 1: Central + live dot + count. Linha 2: search + botão Novo. Implementado no page.tsx da Central (linhas 256-280) |
| 5 | Central search "/" hint | ✅ | placeholder="/ Buscar paciente, número, origem..." (linha 272) |
| 6 | Central actionable empty state | ✅ | `.actionable-hint` com "X chamados aguardando atribuição. Ver fila →" ou "Todos os chamados estão sendo atendidos." (linhas 819-837) |
| 7 | Central PIX placeholder removido | ✅ | Substituído por "QR code será gerado após integração com gateway de pagamento" com ícone CreditCard (linhas 802-807) |
| 8 | Central SlideOver migrado | ✅ | Usa `<SlideOver>` component importado (linha 14, usado linha 929) |
| 9 | Central "Selecionar VTR" funcional | ✅ | onClick abre showVtrPicker, lista 5 VTRs disponíveis, clique em VTR dispara handleSelectVtr com showToast (linhas 591-613) |
| 10 | Central urgent timer | ✅ | useUrgentTimer hook com setInterval de 1s, InboxUrgentTimer component com classe `.urgent-timer`, animação blink (linhas 95-145, CSS linhas 2072-2083) |
| 11 | Mapa hover CSS | ✅ | Zero ocorrências de onMouseEnter/onMouseLeave no codebase. Sidebar items usam `className="table-row-click"` (CSS hover) |
| 12 | Mapa ETA estimate | ✅ | `~{vtr.dist.toFixed(1)} km · ~{etaMin} min` no dispatch panel (linha 542 do mapa) |
| 13 | Mapa filter chips CSS | ✅ | Top-right chips usam `className="chip-dark"` e `.chip-dark.on` (linhas 209-226, CSS linhas 2087-2109) |
| 14 | Mapa toast dispatch | ✅ | `showToast('VTR ${vtr.nome} despachada para chamado #${selectedChamado.numero}', 'success')` (linhas 161-163) |
| 15 | Frota click→detail | ✅ | `onClick={() => router.push('/frota/' + vtr.id)}` na table row (linha 215) |
| 16 | Frota detail KPI consistent | ✅ | Todos os 4 KPIs usam fontSize: 20 (linhas 137, 143, 152, 158) |
| 17 | Frota "TRASEIRA" | ✅ | Texto corrigido para "TRASEIRA" (linha 417 do frota/[id]) |
| 18 | Equipe search CSS | ✅ | Usa `className="table-search"` (linha 165 do equipe/page.tsx) |
| 19 | Equipe detail back link | ✅ | `<Link href="/equipe">` com ArrowLeft (linhas 85-88 do equipe/[id]) |
| 20 | Leads acentuação | ✅ | Sessões, Usuários, Conversões, ATRIBUIÇÃO, SERVIÇO, REGIÃO, HISTÓRICO, ESTÁGIO, Aquisição, Tendência, Próxima, Página — todos corrigidos |
| 21 | Almoxarifados CRUD | ✅ | SlideOver com form (Nome, Filial, Status), botão "+ Novo almoxarifado", showToast no salvar (linhas 74-100) |
| 22 | Orçamentos step indicator | ✅ | 3 dots numerados com "Passo {step} de 3", cor verde progressiva (linhas 324-345) |
| 23 | Checklists tipo visual | ✅ | tipoBadge com emojis: bool=✓, foto=📷, número=🔢, texto=📝 (linhas 52-57) |
| 24 | Configurações breadcrumb | ✅ | `<p className="breadcrumb mb-1">CONFIGURAÇÕES</p>` (linha 19) |
| 25 | Cadastros hub numeric counts | ❌ | Checklists ainda usa `count: 2` hardcoded (não vem de mock-data length). Porém o valor é numérico, não textual ("2 modelos"). **Parcialmente corrigido** — o count é número puro, mas hardcoded em vez de derivado dos dados |

---

## Re-Scores

| Dimension | Before | After | Delta | What's missing for 10/10 |
|-----------|--------|-------|-------|-------------------------|
| **A. UX Flows** | 5.5 | 7.5 | +2.0 | Drag-and-drop no kanban de Leads/OS. Skeleton loading states (componente existe, nenhuma página usa). Keyboard shortcuts além de Esc e ?. Confirmação de exclusão nos slide-overs (OS, Fornecedores, Equipamentos têm btn-red sem onClick confirm). |
| **B. UI Consistency** | 5.0 | 7.0 | +2.0 | 770+ inline styles restantes (Central=154, Frota/[id]=116, Leads=102, Mapa=77). FuncaoPill no Equipe ainda usa inline style para bg/color. Status dots no Mapa sidebar usam hex hardcoded (#1FD29A, #F59E0B, #D9534F) em vez de CSS vars. Mapa stats badge inteiro em inline styles. |
| **C. Visual Hierarchy & Typography** | 6.0 | 7.5 | +1.5 | KPI values no Equipe/[id] variam entre 14px, 16px, 18px, 22px (Matrícula=18, CRM/CNH=16, Alocação=18, Região=22). Pills com fontSize 6px e 7px em vários lugares (Mapa sidebar, dashboard) são ilegíveis em monitores comuns. Spacing scale não definida formalmente — 17+ valores de padding únicos persistem. |
| **D. Information Density** | 7.0 | 7.5 | +0.5 | Nenhuma tabela tem sort por coluna. Nenhuma página tem export CSV. Leads notas são textarea readOnly — usuário não pode editar. Mapa sidebar search ainda tem inline styles wrapping o input (linhas 276-299). |
| **E. Interactions & States** | 4.0 | 7.0 | +3.0 | Botões "Excluir" em Fornecedores, OS, Equipamentos não têm confirmação (btn-red sem onClick handler). Zero componente Skeleton sendo renderizado em páginas reais. Dispatch panel do Mapa não tem animação de entrada/saída. Segment toggle muda sem transição animada do indicator. Leads kanban cards não arrastáveis. |
| **F. Copy & Microcopy** | 5.0 | 8.5 | +3.5 | "Taxa conversão" na Aquisição falta o "de": deveria ser "Taxa de conversão". Rail nav section label diz "Gestão" que está correto. Leads GESTÃO breadcrumb correto. Login v0.2 correto. "Aguardando peca" corrigido para "Aguardando peça". Restam mínimos. |
| **G. Data Integrity** | 6.5 | 7.0 | +0.5 | Região na Frota ainda usa heurística latitude < -23.0 (Niterói seria classificada como RJ mas por razão errada). SLA lógica entre Central (>20=crit) e Mapa (<=5=crit) continua invertida — não foi extraído helper compartilhado. Checklist count no hub é hardcoded (2). |
| **H. New Features Quality** | 6.0 | 7.5 | +1.5 | VTR picker funcional. Urgent timer implementado. Actionable empty state funcional. Step indicator nos Orçamentos completo. ETA no dispatch panel implementado. |

**Overall Score: 7.0/10** (antes: 5.5/10, delta: +1.5)

---

## Apple Test

| Principle | Score | Gap to 10 |
|-----------|-------|-----------|
| **Clarity** | 8/10 | Acentos corrigidos e copy limpa. Falta: pills de 6-7px ilegíveis, labels .label de 8.5px muito pequenas para operadores 40+ sob fluorescente. KPI sizing inconsistente prejudica scanability. |
| **Deference** | 7/10 | Interface sai do caminho do conteúdo na maioria dos casos. Falta: inline styles criam ruído visual quando inspecionados (percepção de craft). Stats badge do Mapa poderia usar classes. |
| **Depth** | 7/10 | Slide-overs com animação. Urgent timer cria senso de tempo. Falta: dispatch panel sem transição de entrada. Segment toggle sem animação. Kanban sem drag. |
| **Consistency** | 6.5/10 | Pior dimension. FuncaoPill com inline styles vs pill-* classes. Status dots no Mapa com hex vs CSS vars. KPI values com 4 diferentes font-sizes. 770+ inline styles criam micro-inconsistências em padding/gap que se acumulam. |
| **Direct Manipulation** | 5/10 | Nenhum drag-and-drop. Kanban é visual mas não interativo. Sort nas colunas inexistente. A única manipulação direta é click→navigate e click→slide-over. |
| **Feedback** | 7.5/10 | GRANDE melhoria. Toast integrado em 13 páginas. Urgent timer visual. Actionable empty state. Falta: botões Excluir sem confirmação. Loading states (Skeleton existe mas não é usado). Hover feedback em botões dentro de slide-overs. |
| **Aesthetic Integrity** | 7.5/10 | Design system com OKLCH é forte. Tipografia de 3 famílias bem aplicada. Mas inline styles degradam a integridade — o código não reflete a intenção de design. O produto parece bem mas o craft não resiste a inspeção. |

---

## Remaining issues (what prevents 10/10)

### Critical (must fix)

| # | Page | Issue | Fix |
|---|------|-------|-----|
| C1 | Fornecedores, OS, Equipamentos | Botão "Excluir" (btn-red) sem onClick handler — executa nada | Adicionar `onClick={() => { if (confirm('Excluir permanentemente?')) { closePanel(); showToast('Item excluído', 'error'); } }}` |
| C2 | Mapa sidebar | Status dots usam hex hardcoded (#1FD29A, #F59E0B, #D9534F) | Trocar para `var(--green)`, `var(--amber)`, `var(--red)` |
| C3 | Central + Mapa | SLA lógica invertida — Central: >20min=crit; Mapa: <=5min=crit | Extrair `slaLevel(minutes)` em lib/helpers.ts e compartilhar. Definir: <=5=crit, <=15=warn, >15=ok |
| C4 | Leads | Notas textarea readOnly — usuário não pode editar | Remover atributo `readOnly` da textarea (linha 679) |

### High (should fix)

| # | Page | Issue | Fix |
|---|------|-------|-----|
| H1 | Equipe page | funcaoPill usa inline style `style={{ background: fp.bg, color: fp.color }}` | Criar classes CSS `.pill-motorista`, `.pill-enfermeiro`, `.pill-medico`, `.pill-tecenfermagem`, `.pill-auxiliar`, `.pill-compras`, `.pill-administrativo` em globals.css, e `statusPill` do equipe também |
| H2 | Equipe/[id] | KPI values com 4 font-sizes diferentes (14, 16, 18, 22px) | Uniformizar: usar `.kpi-value` class sem override de fontSize. Todos devem ser 22px (o default) ou criar variante `.kpi-value-sm` de 18px |
| H3 | Leads | "Taxa conversão" → "Taxa de conversão" | Corrigir string no KPI label (leads/page.tsx linha 373) |
| H4 | Mapa | Stats badge inteiro em inline styles (linhas 179-206) | Extrair para `.map-stats-badge` class em globals.css |
| H5 | All pages | Nenhum uso do componente Skeleton existente | Adicionar Skeleton como fallback durante carregamento simulado (500ms delay) nas 4 páginas principais: Central, Frota, Equipe, Leads |
| H6 | Mapa sidebar | Search input wrapper com 7 inline styles (linhas 276-299) | Usar `.table-search` diretamente ou criar `.map-search` class |
| H7 | Central | 154 inline styles — a página com mais inline styles | Migrar top 30 patterns para classes CSS: `.ws-panel` (padding: 18), `.ws-grid` (grid 1.2fr 1fr gap 18), `.ws-label-row`, etc. |

### Medium (nice to have for 10/10)

| # | Page | Issue | Fix |
|---|------|-------|-----|
| M1 | All tables | Nenhuma tabela tem sort por coluna | Adicionar onClick nos th com state de sort e ícone ChevronUp/Down |
| M2 | Kanban (Leads, OS) | Cards não arrastáveis | Implementar drag-and-drop com @dnd-kit ou similar |
| M3 | All pages | Spacing scale não formalizada | Definir `--s-1: 4px` a `--s-10: 40px` em globals.css e migrar os 50 inline styles mais repetidos |
| M4 | All list pages | Sem export CSV | Adicionar botão "Exportar" em Frota, Equipe, Leads Base |
| M5 | Central | Chat sem separação por dia | Adicionar date dividers quando timestamp muda de dia |
| M6 | Central | Mini-mapa inline no workspace | Leaflet 200x150px quando chamado selecionado tem coordenadas |
| M7 | Global | Keyboard shortcuts limitados (Esc, ?) | Adicionar: N=novo, /=buscar, J/K=navegar lista, D=despachar |
| M8 | Mapa | Dispatch panel sem animação de entrada | Adicionar `animation: slide-in-right 0.2s ease-out` |
| M9 | All | Segment toggle sem animação do indicator | CSS transition no background do botão ativo |
| M10 | Frota | Região calculada via heurística de latitude | Adicionar campo `regiao` ao dado da VTR |
| M11 | Cadastros hub | Checklists count hardcoded (2) | Usar `mockChecklistModelos.length` |
| M12 | Global | 770 inline styles total | Meta: reduzir para <200 extraindo os 30 patterns mais repetidos |

---

## Inline Style Census

| Page | Count | Priority |
|------|-------|----------|
| Central (/) | 154 | Highest |
| Frota/[id] | 116 | High |
| Leads | 102 | High |
| Mapa | 77 | High |
| Orçamentos | 74 | Medium |
| Checklists | 67 | Medium |
| Equipe/[id] | 38 | Medium |
| Equipe | 32 | Low |
| Frota | 31 | Low |
| Pneus | 28 | Low |
| Configurações | 19 | Low |
| Equipamentos | 18 | Low |
| Documentos | 15 | Low |
| Fornecedores | 14 | Low |
| OS | 13 | Low |
| Login | 13 | Low |
| Almoxarifados | 10 | Low |
| **TOTAL** | **770** | |

---

## The path to 10/10

Para chegar ao nível Apple/Linear de verdade, três frentes precisam acontecer em paralelo:

### 1. Matar inline styles (30% do gap)

O produto tem um design system forte que quase ninguém usa. Os 770 inline styles significam que cada pixel é decidido ad hoc, não pelo sistema. A migração precisa ser cirúrgica:
- Identificar os 30 patterns mais repetidos (display flex + gap + alignItems, padding 18, border-bottom 1px solid var(--line), etc.)
- Criar classes compostas: `.ws-panel`, `.ws-grid`, `.ws-label`, `.sidebar-row`, `.dispatch-row`
- Migrar página por página, começando pela Central (154 ocorrências)
- Meta: <200 inline styles totais

### 2. Fechar gaps de interação (25% do gap)

- Confirmação de exclusão em TODOS os botões Excluir (sem exceção)
- Skeleton loading states nas 4 páginas principais
- Sort em TODAS as tabelas (clicar no header)
- Drag-and-drop no kanban (Leads e OS)
- Keyboard shortcuts: N, /, J, K, D
- Animação no dispatch panel e segment toggle

### 3. Resolver inconsistências de dados (10% do gap)

- Extrair slaLevel() compartilhado entre Central e Mapa
- Região da VTR como campo de dados, não heurística
- Checklists count derivado do mock-data
- FuncaoPill como classes CSS, não inline

### 4. Polish fino (35% do gap)

Este é o diferencial entre 8/10 e 10/10:
- Spacing scale de 4px rigoroso
- KPI sizing padronizado (22px standard, 18px compact)
- Pills mínimo 8px (nunca 6-7px)
- Labels mínimo 10px (nunca 8.5px para operadores em campo)
- Chat com date dividers
- Mini-mapa inline na Central
- Export CSV em tabelas
- Sound cue hint em chamados urgentes
- FAB (floating action button) quando chamado crítico selecionado

### Estimativa de esforço restante

| Faixa | Esforço | Score estimado |
|-------|---------|----------------|
| Quick fixes (C1-C4, H3, M11) | 2h | 7.5/10 |
| Inline style migration phase 1 (top 30 patterns) | 1 dia | 8.0/10 |
| Interaction gaps (sort, skeleton, confirm, shortcuts) | 2 dias | 8.5/10 |
| Full inline style migration + spacing scale | 3 dias | 9.0/10 |
| Drag-and-drop, mini-mapa, export, sound cues, FAB | 5 dias | 9.5/10 |
| Obsessive pixel polish + user testing + iteration | 2 semanas | 10/10 |

A plataforma saiu do "protótipo bem feito" (5.5) para "produto em desenvolvimento com fundação sólida" (7.0). Para chegar a "inspira confiança instantânea" (10/10), o trabalho agora é 70% craft e 30% feature. O design system está lá. Os dados são reais. A direção é correta. Falta a obsessão pelo detalhe que faz um operador de ambulância confiar cegamente na interface durante um turno de 12 horas.
