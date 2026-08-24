# Savior Platform — Design Audit Report

**Date:** 23/08/2026
**Auditor:** Claude (skills: impeccable, design-auditor, ux-writing, taste, ui-design-brain)
**Version:** Prototype v0.1
**Scope:** All pages, components, and CSS in `/platform`

---

## Executive Summary

O prototipo esta em nivel surpreendentemente alto para uma v0.1. O design system (DESIGN.md + globals.css) foi bem pensado, com tokens OKLCH consistentes, tipografia em tres niveis, e regras claras. A Central e a pagina de Frota sao as mais maduras. Os maiores gaps estao em (1) ausencia de estados de erro, loading e vazios acionaveis, (2) a Central nao ser a "Central de Supervisao" prometida no spec mas sim um feed do bot, e (3) inconsistencias pontuais de spacing e copy que quebram a ilusao de produto acabado.

---

## Scores

| Dimension | Score | Status |
|-----------|-------|--------|
| UX (user flows) | 6/10 | 🟡 |
| UI consistency | 7/10 | 🟢 |
| Visual hierarchy | 8/10 | 🟢 |
| Information density | 7/10 | 🟢 |
| Interactions | 5/10 | 🟡 |
| Copy & microcopy | 5/10 | 🟡 |
| **Overall** | **6.3/10** | 🟡 |

---

## Strengths

1. **Design system completo e documentado.** DESIGN.md e globals.css estao em sincronia quase perfeita. Tokens OKLCH, pills, KPI cards, tabs, buttons, todos definidos e usados. Isso e raro numa v0.1.

2. **Tipografia em tres familias funciona.** Bricolage Grotesque para display, Hanken Grotesk para corpo, JetBrains Mono para dados. A hierarquia visual e imediata e o uso de mono para placas/valores/IDs e correto e consistente.

3. **Rail nav e preciso.** 58px, navy, icones brancos semi-transparentes, tooltip no hover, badge de notificacao, separacao Operacao/Gestao, avatar no bottom. Segue todas as specs do DESIGN.md.

4. **88 veiculos reais no mock.** Dados de producao (placas, modelos, coordenadas reais RJ/SP) dao credibilidade ao prototipo e permitem testar densidade real.

5. **Pill system e consistente.** 8px mono, uppercase, tracking .03em, fundo claro + texto escuro. Usado em todas as paginas sem variacao.

6. **Central com bot timeline e chat integrado.** O conceito de supervisao do bot com escalada para atendente humano e bem executado. O composer so aparece em modo intervencao, os quick replies existem.

7. **Slide-over pattern e solido.** 480px, sticky header/footer, animacao slide-in, backdrop. Usado em Leads, Fornecedores, Equipamentos, Pneus, Documentos, OS de forma consistente.

8. **Mapa dark tile (CARTO) com CircleMarker.** Boa escolha, dots coloridos por status sao legíveis, sidebar colapsavel.

---

## Critical Issues

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| 1 | Central (/) | A pagina Central nao e a "Central de Atendimento" do spec (A1+A2+A3). E um feed de eventos do bot, sem inbox de chamados, sem fila de espera, sem SLA timer. O supervisor nao consegue ver "lista de chamados priorizada com status, tempo de espera, canal" como descrito em A1. | Redesenhar como 3-col: inbox de chamados (agrupados por status/prioridade) + detail workspace + chat/timeline. O feed do bot pode ser um painel secundario. | Atendente/Supervisora |
| 2 | Central (/) | Nao ha como criar um novo chamado. Nenhum botao "Novo chamado", nenhum formulario de qualificacao (A3). Um atendente recebendo ligacao nao tem o que fazer. | Adicionar botao "+ Novo chamado" no header do inbox, abrindo slide-over com formulario de qualificacao (tipo, origem, destino, paciente, canal, prioridade). | Atendente |
| 3 | Central (/) | Nao ha integracao visual com o Mapa. O spec pede "selecionar chamado no mapa e ver VTRs disponiveis para despacho" (A4). Atendente precisa abrir outra aba para ver o mapa. | Na Central, ao selecionar chamado, mostrar mini-mapa com origem/destino + VTRs proximas. Ou permitir abrir o Mapa ja filtrado para aquele chamado. | Atendente |
| 4 | Mapa (/mapa) | Mapa nao mostra chamados. So mostra VTRs. O spec pede que o mapa seja a tela de despacho (A4+A5): selecionar chamado, ver VTRs proximas, clicar para despachar. | Adicionar camada de chamados ativos no mapa (markers diferentes). Ao clicar chamado, mostrar painel lateral com dados + lista de VTRs ordenadas por distancia + botao "Despachar". | Atendente |
| 5 | Todas | Zero estados de loading. Nenhum skeleton, nenhum spinner. Quando conectar ao Supabase, o usuario vera tela em branco por 1-3s. | Adicionar skeleton screens para cada panel/tabela. Definir loading states no design system. | Todos |

---

## High Priority Issues

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| 6 | Central (/) | `gridTemplateColumns: '58px 380px 1fr'` hardcoded no page.tsx conflita com o layout do dashboard. A Central renderiza dentro do layout que ja tem `<RailNav />`, mas o page.tsx reserva 58px para o rail que ja existe, criando 58px de espaco vazio duplicado. | Remover a coluna 58px do grid da Central. O `<div />` placeholder esta la, mas o rail ja e renderizado pelo layout. Resultado: rail sobrepoe ou cria gap. Testar renderizacao real. | Todos |
| 7 | Central (/) | As tabs "Detalhes / Historico / Financeiro" no workspace nao fazem nada. Sao `<span>` sem onClick. O usuario clica e nada acontece. | Implementar como `<button>` com state. Mesmo que o conteudo seja placeholder, o clique deve mudar a tab ativa. | Atendente |
| 8 | Central (/) | Estado vazio (nenhum chamado selecionado) mostra dashboard "75% resolucao automatica" com dados hardcoded. Nao e util para o atendente que precisa trabalhar. | Estado vazio deveria mostrar resumo operacional real: chamados em fila, tempo medio de espera, VTRs disponiveis, alertas. Nao so uma metrica de vanidade. | Atendente/Supervisora |
| 9 | Frota (/frota) | Tabela sem paginacao. 88 veiculos renderizados de uma vez. Com filtros ativos ainda e ok, mas sem filtro sao 88 rows. | Adicionar paginacao (25/page) ou virtual scrolling. Adicionar contagem de resultados no header da tabela. | Gestor de frota |
| 10 | Frota (/frota) | Tabela nao tem search. So chips de filtro. Gestor que quer achar "VTR 456" ou placa "RIO2I18" precisa rolar a lista. | Adicionar input de busca (placa ou nome) antes da tabela, consistente com Equipe e Mapa. | Gestor de frota |
| 11 | Equipe (/equipe) | Todos os funcionarios mostram pill "Ativo" hardcoded. Nao existe status real. Se um funcionario estiver de ferias, afastado, ou desligado, nao aparece. | Adicionar campo `status` no mock data com opcoes: Ativo, Ferias, Afastado, Desligado. Usar pills corretas. | Diretor |
| 12 | Leads (/leads) | Kanban com 6 colunas em tela 1fr. Com 6 colunas, cada uma fica com ~190px em tela 1200px. Cards ficam apertados. Em telas menores, ilegivel. | Reduzir para 4-5 colunas visiveis com scroll horizontal. Ou agrupar "Convertido" e "Perdido" num bloco inferior. | Diretor |
| 13 | Login (/login) | Input de email e senha usam inline styles com `onFocus`/`onBlur` para simular `:focus`. Nao usam a classe `.form-input` definida no design system. Border-radius e 10px (spec diz 8px). Background e `var(--card)` (spec diz `var(--bg)`). | Usar `.form-input` do globals.css. Isso corrige radius, bg, e focus behavior de uma vez. | Todos |
| 14 | Mapa (/mapa) | Popup do Leaflet usa cores hardcoded (#fee, #e8f5e9, #c62828 etc) ao inves dos tokens do design system. Inconsistente com o resto da UI. | Usar CSS custom properties dentro do popup. O popup do Leaflet aceita HTML styled. | Atendente |

---

## Medium Priority Issues

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| 15 | Central (/) | `feed-item.intervention` usa `border-left: 3px solid var(--red)`. DESIGN.md proibe "side-stripe borders (border-left colorido)". | Substituir por `box-shadow: inset 0 0 0 1px` ou background mais forte, como ja feito em `.qi.crit`. | Todos |
| 16 | Frota/[id] | Tab "Geral" mostra info de identificacao e operacao em 2 colunas. A coluna "Documentos" mostra apenas 1 link (CRLV). Sem upload, sem listagem, sem vencimento. | Linkar com a pagina /cadastros/documentos filtrada para essa VTR. Ou mostrar lista compacta de docs vinculados. | Gestor de frota |
| 17 | Todas as tabelas | Hover de table row usa inline JS (`onMouseEnter/Leave` com `style.background`). Devia usar CSS class `.table-row-click:hover` que ja existe em globals.css. | Remover handlers JS de hover, usar apenas a classe CSS. Mais limpo e performante. | Devs |
| 18 | Cadastros (/cadastros) | Hub card mostra "97 veiculos" e "45 funcionarios" hardcoded nos counts. Nao usa `mockVtrs.length` ou `mockEmployees.length`. | Importar dados reais e computar counts. Ou pelo menos sincronizar os numeros. "97" no hub vs 88 veiculos reais no mock. | Diretor |
| 19 | Equipe/[id] | Tab "Informacoes" usa `.cols2` (grid 1fr 1fr) com linhas de dados. Mas cada bloco de 2 campos tem borderBottom manual com inline styles. Poderia ser uma tabela ou lista de definicao. | Extrair para um componente `<DetailGrid>` reutilizavel ou usar o pattern de key-value pairs como em /frota/[id] (Identificacao panel). | Devs |
| 20 | Copy global | Acentuacao ausente em toda a UI. "Intervencao" em vez de "Intervencao", "Manutencao", "Historico", etc. Tudo sem acento. Parece draft, nao produto. | Adicionar acentos em todos os labels, tabs, breadcrumbs, pills, e page titles. PT-BR formal exige acentuacao correta. | Todos |

---

## Low Priority Issues

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| 21 | Central (/) | KPI strip no feed header usa `fontSize: '7.5px'` para labels e `fontSize: '18px'` para valores. DESIGN.md especifica 8.5px para kpi-label e 22px para kpi-value. | Alinhar com os tokens definidos, ou documentar variante "compact KPI" no DESIGN.md. | Devs |
| 22 | Mapa (/mapa) | Stats overlay usa `backdropFilter: 'blur(8px)'`. DESIGN.md proibe "Glassmorphism / blur decorativo". O blur aqui e funcional (legibilidade sobre mapa), mas vale documentar a excecao. | Adicionar nota no DESIGN.md: "blur permitido em overlays sobre mapa para legibilidade". | Devs |
| 23 | Mapa (/mapa) | Filter chips no mapa usam inline styles com cores OKLCH hardcoded, nao os tokens do design system (`.chip` / `.chip-active`). | Adaptar o chip component para suportar variante "dark" (sobre fundo escuro do mapa). | Devs |
| 24 | Todas | Nenhum tooltip ou hint em icones de acao. Botoes como "Assumir conversa", "Devolver ao bot", "Aprovar despacho" sao claros, mas icones soltos no timeline nao tem tooltip. | Adicionar `title` attribute ou tooltip component nos icones interativos. | Atendente |
| 25 | Configuracoes | Pagina e read-only. Nenhum campo editavel. Nenhum botao de acao (salvar, editar, desconectar integracao, convidar usuario). Sente-se como pagina de exibicao. | Adicionar acoes minimas: botao "Desconectar/Reconectar" nas integracoes, "Convidar" nos usuarios. Mesmo sem funcionalidade, mostrar a intencao. | Diretor |
| 26 | Leads (/leads) | KPI "Pipeline (negociando)" mostra valor sem formatacao correta de moeda (R$ 52.000 vs R$ 52.000,00). | Usar `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })` como feito em outros lugares. | Diretor |
| 27 | Todas | Nenhum keyboard shortcut. Plataforma operacional usada 8-12h/dia deveria ter pelo menos: `N` para novo chamado, `/` para buscar, `Esc` para fechar slide-over. | Adicionar keyboard shortcuts basicos. O slide-over ja deveria fechar com Esc (nao implementado). | Atendente |
| 28 | Mapa (/mapa) | Sidebar do mapa nao mostra status label. So tem um dot colorido. O usuario precisa inferir que verde = disponivel. | Adicionar pill de status como na tabela de Frota, ou pelo menos tooltip no dot. | Atendente |

---

## Page-by-Page Notes

### Central (/)

A pagina mais importante da plataforma, e a que tem mais gaps.

**O que funciona:**
- Feed de atividade do bot e bem pensado: timestamp, icone, descricao, detail, botao "Assumir"
- Intervention highlight (fundo vermelho) e efetivo
- Selected state (navy bg, texto branco) e claro
- Chat WhatsApp com bot messages vs client messages bem diferenciados
- Bot action timeline com dots done/current/failed
- Composer com quick replies so aparece no modo intervencao (correto)
- ETA display com color coding (green <10min, amber <20min, red >20min)

**O que falta:**
- Nao e a Central de Atendimento do spec. E uma Central de Supervisao do Bot. Sao coisas diferentes.
- Sem inbox de chamados real (grouped by status)
- Sem fila de espera / SLA timers
- Sem formulario de novo chamado / qualificacao
- Sem mini-mapa no detalhe
- Tabs do workspace sao decorativas (Detalhes/Historico/Financeiro)
- Pagamento mostra status mas nao tem acao (cobrar, marcar como pago)
- Botao "Aprovar despacho" nao faz nada e nao fica claro quando deve ser usado

**Bug potencial:** O grid `58px 380px 1fr` reserva espaco para o rail, mas o dashboard layout ja renderiza `<RailNav />` como fixed. A primeira coluna do grid e um `<div />` vazio. Isso funciona porque o rail e position:fixed e o div vazio ocupa o espaco. Mas e fragil. Se o rail mudar de tamanho, quebra.

### Mapa (/mapa)

**O que funciona:**
- Dark tile (CARTO) e legivel e nao compete com os markers
- CircleMarker com cor por status e efetivo
- Sidebar colapsavel com search e lista de veiculos
- Filter chips funcionais

**O que falta:**
- Sem camada de chamados (apenas VTRs)
- Sem despacho (spec A4+A5)
- Sem clustering para zoom out (88 markers podem sobrepor)
- Popup do Leaflet usa cores hardcoded, fora do design system
- Ao clicar numa VTR na sidebar, nada acontece (nao centra no mapa, nao abre detalhe)
- Sem rota (origem -> destino) visualizada
- Zoom controls removidos (`zoomControl={false}`) sem alternativa de UI

### Frota (/frota + /frota/[id])

A pagina mais madura apos a Central.

**O que funciona:**
- Breadcrumb + page title pattern consistente
- Chip filters com contagem
- Separador visual entre grupos de filtro (tipo vs status)
- Tabela com pill de tipo e status
- Click para detalhe funciona
- Detalhe com tabs reais (Geral, Manutencoes, Checklist, Pneus, Multas)
- Timeline de manutencoes com dots coloridos
- Checklist agrupado por categoria com highlight vermelho em reprovados
- Diagrama de pneus (posicoes no veiculo)
- KPI cards no hero do detalhe

**O que falta:**
- Sem search na lista
- Sem paginacao
- Coluna "Regiao" e inferida por latitude, sem label (so "RJ" ou "SP")
- KPI "ULT. ABASTECIMENTO" usa fontSize 16px (inconsistente com os outros 20px)
- Botao "Nova OS" na tab Manutencoes nao abre slide-over (nao implementado)
- Tab Multas nao tem acoes (contestar, pagar)

### Equipe (/equipe + /equipe/[id])

**O que funciona:**
- Search funcional
- Tabela com funcao pill colorida
- Detalhe com tabs (Info, Alocacoes, Historico)
- Timeline de alocacoes reutiliza bot-timeline pattern
- Historico com ocorrencias tipadas (checklist, multa, elogio, falta)
- CNH expiring alert (pill + texto vermelho)

**O que falta:**
- Status hardcoded "Ativo" para todos
- Sem filter chips (por funcao, por regiao)
- Tab Informacoes e read-only, sem botao editar
- Sem foto do funcionario (avatar seria util)
- "Voltar" e um `btn btn-outline` na pagina de detalhe mas e `<Link>` na Frota (inconsistente)

### Cadastros (hub + sub-pages)

**O que funciona:**
- Hub com grid de cards, cada um com icone, count, nome, descricao
- Sub-pages (Fornecedores, Equipamentos, Documentos, Pneus, OS) todas seguem o mesmo pattern: header com breadcrumb + titulo + botao novo, tabela ou kanban, slide-over para CRUD
- Documentos tem alert banners para vencidos/vencendo (excelente)
- Equipamentos agrupados por categoria
- Pneus com diagrama de posicoes quando filtrado por VTR
- OS em kanban (4 colunas)

**O que falta:**
- Counts no hub sao hardcoded e nao batem com os mocks (97 veiculos vs 88 reais)
- Almoxarifados e a pagina mais vazia: sem slide-over, sem create, sem actions
- Slide-over de Fornecedores nao tem confirmacao de exclusao (btn-red "Excluir" sem dialog)
- Nenhum slide-over tem validacao de formulario
- Nenhum toast/snackbar de confirmacao apos salvar
- Back button (ChevronLeft) nao tem label visivel, so icone

### Leads (/leads)

**O que funciona:**
- Kanban com 6 estagios
- Cards com nome, empresa, canal pill, valor, tempo
- KPI strip (total, pipeline value, conversao, perdidos)
- Slide-over com detail view e create form separados
- Select de estagio no detail permite mover o lead

**O que falta:**
- 6 colunas e demais para tela padrao (cramped)
- Sem drag-and-drop (esperado num prototipo, mas deveria ter visual hint)
- Cards nao tem visual de "draggable" (cursor pointer, sem grip icon)
- Valor no KPI nao tem formatacao de moeda completa
- Sem filtro por canal, regiao, ou servico
- Notas sao read-only no detail (visual de input, mas e uma div)

### Login (/login)

**O que funciona:**
- Centralizado, limpo, logo Prontidao com SVG
- Versao no footer (v0.1)
- Focus behavior simulado (green border)

**O que falta:**
- Inputs nao usam `.form-input` do design system
- Sem "Esqueci minha senha"
- Sem indicador de loading no submit
- Sem validacao visual
- Border-radius 10px (spec 8px)
- Background do input e `var(--card)` (spec e `var(--bg)`)

### Configuracoes (/configuracoes)

**O que funciona:**
- Layout single-column com max-width 680px (boa escolha para settings)
- Panels para Operador, Integracoes, Usuarios
- Status dot + pill para integracoes

**O que falta:**
- 100% read-only, sem acoes
- Sem breadcrumb (inconsistente com outras paginas)
- Sem link para editar dados do operador
- Sem botao "Convidar usuario"
- Sem secao de notificacoes/alertas

---

## Audit Dimension Details

### A. UX Audit

**Atendente/Supervisora: 5/10**
- Nao consegue criar novo chamado
- Nao consegue ver fila de espera com SLA
- Nao consegue despachar ambulancia pelo mapa
- O fluxo principal (receber chamado -> qualificar -> despachar -> acompanhar) nao esta completo
- O bot supervision flow funciona (ver timeline, assumir conversa, responder)

**Gestor de frota: 7/10**
- Consegue ver toda a frota, filtrar por status/tipo
- Consegue ver detalhe com manutencoes, checklist, pneus, multas
- Falta busca na lista e paginacao
- Fluxo de criar OS nao funciona completamente

**Diretor: 6/10**
- Consegue ver KPIs na Central (superficiais)
- Consegue ver pipeline de leads
- Falta dashboard consolidado (receita, custos, performance)
- Configuracoes nao tem acoes

### B. UI Consistency: 7/10
- Pills: consistentes em 95% dos casos. Unica variacao: funcaoPill em Equipe usa inline styles ao inves de classes pill-*
- Cards/Panels: todos usam `.panel` com border 1px line, radius 12px. Consistente
- Tabelas: th 8.5px mono uppercase, td 12.5px, border-top line. Consistente
- Buttons: btn-green, btn-outline, btn-red. Consistente
- Forms: form-input/select/textarea. Consistente exceto Login
- Page headers: breadcrumb + page-title. Consistente exceto Configuracoes
- Problema: hover de table rows e feito em JS em alguns lugares e CSS em outros

### C. Visual Hierarchy: 8/10
- Type scale funciona bem: display (25px) -> panel-title (14px) -> body (12.5px) -> label (8.5px)
- Mono usado corretamente para dados (placas, valores, IDs, timestamps)
- Display usado corretamente para headings e KPI values
- Contraste ink sobre bg e suficiente
- Muted2 sobre card pode ser low-contrast em labels 8.5px (testar com WCAG)
- Nenhuma pagina tem elementos competindo por atencao

### D. Information Density: 7/10
- Tabelas sao densas o suficiente para 88 veiculos (11px padding, 12.5px body)
- KPI cards sao compactos (13px 15px padding)
- Central feed e scannable (timestamp + icon + desc + assumir)
- Kanban cards poderiam ser mais compactos (muito padding interno)
- Paginas de cadastro usam bem o espaco, sem whitespace excessivo
- Detalhe de VTR com 3 colunas e denso mas legivel

### E. Interactions: 5/10
- Hover states existem em rail, chips, table rows, cards
- Transicoes sao 150ms ease-out (conforme spec)
- Nao ha feedback apos acoes (salvar, excluir, assumir)
- Tabs do workspace na Central nao funcionam
- Slide-over nao fecha com Esc
- Nao ha keyboard shortcuts
- Nao ha drag-and-drop visual hint no kanban
- Sidebar do mapa nao interage com markers
- Live dot e crit-dot pulsam corretamente

### F. Copy & Microcopy: 5/10
- Labels sao claros mas sem acentos (draft quality)
- Empty states sao genericos: "Nenhuma manutencao registrada", "Sem conversa vinculada" (sem acao sugerida)
- Buttons sao action-oriented: "Salvar", "Cancelar", "Assumir", "Nova OS" (bom)
- Sem error states considerados em nenhum formulario
- Sem tooltips em icones
- Status labels sao claros: "Disponivel", "Em atendimento", "Manutencao"
- "Intervencoes" sem acento e sem cedilha da impressao de prototipo em ingles traduzido
- "Concluidos" sem acento
- Quick replies sao uteis: "Confirmar chegada", "Enviar cotacao", "Atualizar ETA"

---

## Recommended Action Plan

### Sprint 1: Core Flows (5 dias)

1. **Redesenhar Central como Central de Atendimento real** (#1, #2, #3)
   - Inbox de chamados com agrupamento por status (Aberto, Em cotacao, Aprovado, Em transito)
   - Formulario de novo chamado (slide-over)
   - Mini-mapa no detail workspace

2. **Adicionar camada de chamados no Mapa + despacho** (#4)
   - Markers de chamados (icone diferente de VTRs)
   - Painel de despacho: selecionar chamado -> listar VTRs proximas -> botao despachar

3. **Corrigir grid da Central** (#6)
   - Remover coluna fantasma de 58px

### Sprint 2: Polish & States (3 dias)

4. **Adicionar loading skeletons** (#5)
   - Skeleton para tabelas, KPI cards, feed items, kanban

5. **Corrigir todos os acentos** (#20)
   - Buscar e substituir em todos os arquivos: Manutencao -> Manutenção, etc.

6. **Implementar tabs da Central** (#7)
   - Detalhes, Historico, Financeiro com state

7. **Corrigir Login para usar form-input** (#13)

8. **Remover border-left em feed-item.intervention** (#15)

### Sprint 3: Consistency & Interactions (2 dias)

9. **Unificar hover pattern** (#17)
   - Remover todos os onMouseEnter/Leave JS, usar CSS classes

10. **Adicionar search na Frota** (#10)

11. **Fixar counts do hub de Cadastros** (#18)

12. **Adicionar Esc handler no slide-over** (#27)

13. **Corrigir cores hardcoded no popup do mapa** (#14)

14. **Adicionar keyboard shortcuts basicos** (#27)

### Sprint 4: Copy & Empty States (1 dia)

15. **Melhorar empty states** (#8)
    - Cada empty state deve sugerir proxima acao
    - "Nenhuma manutencao registrada" -> "Nenhuma manutencao registrada. Criar nova OS?"

16. **Adicionar confirmacao de exclusao** (dialog antes de excluir)

17. **Adicionar toast/snackbar de confirmacao apos salvar**

18. **Adicionar acoes em Configuracoes** (#25)
