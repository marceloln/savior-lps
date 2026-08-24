# Savior Platform — Design Audit v2

**Date:** 23/08/2026
**Version:** Prototype v0.2 (18 pages)
**Auditor:** Claude (impeccable, design-auditor, ux-writing, taste, ui-design-brain)

---

## Executive Summary

A v0.2 representa um salto real sobre a v0.1. Os 5 issues criticos do primeiro audit foram endereçados: a Central agora tem inbox de chamados com agrupamento por prioridade, formulario de novo chamado via slide-over, o Mapa mostra chamados com painel de despacho, e componentes reutilizaveis (SlideOver, FormField, Toast, Skeleton, KeyboardShortcuts) foram extraidos. As novas paginas (Checklists, Orcamentos, equipe com CRM/COREN) adicionam profundidade real ao prototipo. O score geral subiu de 6.3 para 7.8, com ganhos em todas as dimensoes. Os gaps remanescentes sao principalmente de copy (acentos ausentes em varios pontos), densidade de informacao no kanban de Leads, e algumas inconsistencias de pattern entre paginas novas e antigas.

---

## Scores

| Dimension | v0.1 | v0.2 | Delta | Status |
|-----------|------|------|-------|--------|
| UX flows | 6/10 | 8/10 | +2 | Bom |
| UI consistency | 7/10 | 8/10 | +1 | Bom |
| Visual hierarchy | 8/10 | 8.5/10 | +0.5 | Bom |
| Information density | 7/10 | 7.5/10 | +0.5 | Bom |
| Interactions & states | 5/10 | 7.5/10 | +2.5 | Bom |
| Copy & microcopy | 5/10 | 7/10 | +2 | Aceitavel |
| Data integrity | N/A | 8/10 | novo | Bom |
| New features | N/A | 8/10 | novo | Bom |
| **Overall** | **6.3/10** | **7.8/10** | **+1.5** | **Bom** |

---

## Issues resolved since v0.1

| # v0.1 | Issue | Status v0.2 |
|---------|-------|-------------|
| 1 | Central nao era Central de Atendimento, so feed do bot | RESOLVIDO. Inbox com chamados agrupados por prioridade (urgente/em_andamento/aguardando/concluido), segment toggle Chamados/Bot feed |
| 2 | Nao havia como criar novo chamado | RESOLVIDO. Botao "+ Novo" abre slide-over com form completo (canal, paciente, servico, origem, destino, obs) |
| 3 | Sem integracao visual com o Mapa | PARCIAL. O Mapa agora mostra chamados na sidebar e painel de despacho, mas a Central ainda nao tem mini-mapa |
| 4 | Mapa nao mostrava chamados | RESOLVIDO. Tab Chamados na sidebar, markers de chamado no mapa, painel de despacho com VTRs proximas e botao Despachar |
| 5 | Zero estados de loading | RESOLVIDO. Componente Skeleton criado. CSS skeleton-pulse definido. Porem nenhuma pagina usa o Skeleton component ainda |
| 6 | Grid 58px fantasma na Central | RESOLVIDO. Central usa `central-grid` com `grid-template-columns: 348px 1fr`, sem coluna fantasma |
| 7 | Tabs do workspace nao funcionavam | RESOLVIDO. Tabs Atendimento/Historico/Financeiro sao `<button>` com state. Todas 3 renderizam conteudo real |
| 8 | Estado vazio (dashboard) nao era util | RESOLVIDO. Dashboard mostra KPI cards reais (chamados hoje, em andamento, tempo medio, bot automatico) + chamados recentes + frota disponivel com counts corretos |
| 9 | Frota sem paginacao | RESOLVIDO. `PAGE_SIZE = 25`, pagination com "Mostrando X-Y de Z", botoes Anterior/Proximo |
| 10 | Frota sem search | RESOLVIDO. Input `table-search` busca por placa ou nome VTR |
| 11 | Equipe status hardcoded "Ativo" | RESOLVIDO. Tipo `FuncionarioStatus` com 4 opcoes (ativo/ferias/afastado/desligado), pills corretas na tabela |
| 13 | Login inputs nao usavam form-input | RESOLVIDO. Login agora usa `className="form-input"`, validacao visual com mensagens de erro, loading state com spinner, "Esqueci minha senha" |
| 15 | border-left em feed-item.intervention | RESOLVIDO. CSS usa `box-shadow: inset 0 0 0 1px` e `color-mix` background, sem border-left |
| 17 | Hover via JS em table rows | PARCIAL. Frota e Checklists usam `className="table-row-click"`. Mapa sidebar ainda usa `onMouseEnter/Leave` |
| 18 | Counts do hub hardcoded | RESOLVIDO. Cadastros hub importa mock data real e usa `.length` para counts dinamicos |
| 20 | Acentos ausentes | PARCIAL. Muitos labels agora tem acentos corretos (Manutenção, Histórico, etc), mas varios ficaram sem (ver issues novos) |
| 25 | Configuracoes read-only | RESOLVIDO. Integracoes tem botoes Conectar/Reconectar. Usuarios tem botao Convidar |
| 27 | Slide-over nao fechava com Esc | RESOLVIDO. SlideOver component tem `useEffect` com handler de `keydown` Escape. KeyboardShortcuts component despacha `close-slide-over` custom event |

---

## New issues found

### Critical

Nenhum issue critico. Todos os fluxos primarios sao completaveis.

### High

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| H1 | Leads (/leads) | Kanban com 6 colunas em `grid-template-columns: repeat(6, 1fr)`. Em tela 1440px, cada coluna tem ~200px. Cards com nome+empresa+canal+valor ficam apertados. Em 1280px, ilegivel. | Considerar 4 colunas visiveis com scroll horizontal. Ou agrupar Convertido+Perdido em linha inferior. | Diretor, Comercial |
| H2 | Leads (/leads) | KPI "Conversao" sem acento. "GESTAO" no breadcrumb sem acento. "REGIAO", "SERVICO", "ESTAGIO", "NOTAS" nos labels sem acento. | Corrigir para Conversão, GESTÃO, REGIÃO, SERVIÇO, ESTÁGIO, NOTAS. | Todos |
| H3 | Mapa (/mapa) | Sidebar VTR list hover ainda usa `onMouseEnter/Leave` com inline styles ao inves de CSS class. Tab Chamados tambem. | Migrar para `className="table-row-click"` ou criar classe `.sidebar-item-hover`. | Devs |
| H4 | Mapa (/mapa) | Filter chips no topo direito usam inline styles com OKLCH hardcoded, nao tokens do design system. | Reutilizar `.chip` / `.chip-active` com variante dark-overlay. | Devs |
| H5 | Todas | Skeleton component existe mas nenhuma pagina o utiliza. Quando conectar ao Supabase, usuario vera tela branca. | Adicionar loading state com Skeleton em pelo menos: Central, Frota, Equipe, Leads. | Todos |
| H6 | Orcamentos (/cadastros/orcamentos) | Formulario multi-step (3 passos) nao tem indicador de progresso. Usuario nao sabe em qual step esta nem quantos faltam. | Adicionar step indicator (3 dots ou "Passo 1 de 3") no header do slide-over. | Comercial |

### Medium

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| M1 | Rail nav | Tooltip "Configuracoes" sem acento. Label "Gestao" sem acento. | Corrigir para "Configurações" e "Gestão". | Todos |
| M2 | Equipe (/equipe) | Search input usa inline styles (background, border, borderRadius, padding) ao inves de `.table-search` ou `.inbox-search`. Inconsistente com Frota e Checklists que usam `.table-search`. | Usar `.table-search` como na Frota. | Devs |
| M3 | Equipe/[id] | Botao "Voltar" e `<button onClick={router.push}>` com `className="btn btn-outline"`. Na Frota/[id], e `<Link>` com inline styles. Inconsistente. | Padronizar: usar `<Link>` com inline styles tipo Frota/[id] (ArrowLeft + "Voltar para X"). | Devs |
| M4 | Central (/) | Slide-over de novo chamado ainda usa inline import direto (`<div className="slide-over">`) ao inves do componente `<SlideOver>` reutilizavel. | Migrar para `<SlideOver>` component. Garante Esc handler, backdrop, e consistencia. | Devs |
| M5 | OS (/cadastros/os) | Label "Aguardando peca" e "Concluida" sem acento nos columns. | Corrigir para "Aguardando peça" e "Concluída". | Todos |
| M6 | Equipamentos (/cadastros/equipamentos) | Status pill "MANUTENCAO" sem acento e cedilha. | Corrigir para "MANUTENÇÃO". | Todos |
| M7 | Cadastros hub (/cadastros) | Cards de Checklists e Orcamentos tem count como string ("2 modelos", "5 orçamentos") ao inves de numero puro como os outros cards. `hub-card-count` espera mono numerico. | Padronizar: mostrar numero (2, 5) no count, e usar o desc para o qualificador. Ou aceitar variante textual e documentar. | Devs |
| M8 | Frota/[id] | KPI "ULT. ABASTECIMENTO" usa fontSize 16 enquanto os outros 3 KPI values usam fontSize 20. Inconsistencia visual. | Usar 20px uniforme, ou formatar a data com mono menor. | Gestor de frota |
| M9 | Leads (/leads) | Notas no detail sao read-only (div com visual de input). Se o usuario clicar achando que pode editar, nada acontece. | Converter para `<textarea className="form-textarea">` com `defaultValue`. | Comercial |
| M10 | Login (/login) | Versao no footer diz "v0.1", deveria ser "v0.2". | Atualizar para v0.2. | Todos |

### Low

| # | Page | Issue | Fix | Persona |
|---|------|-------|-----|---------|
| L1 | Mapa (/mapa) | Stats overlay usa `backdropFilter: 'blur(8px)'`. DESIGN.md proibe blur decorativo. O uso aqui e funcional (sobre mapa), mas nao esta documentado como excecao. | Documentar no DESIGN.md: "blur permitido em overlays sobre mapa para legibilidade". | Devs |
| L2 | Mapa (/mapa) | SLA display na sidebar de chamados tem logica invertida: `slaOk = chamado.sla_minutos > 15` (mais de 15 min de espera e "ok"?). Na Central, >20 e critico e >15 e warning. Logica inconsistente. | Unificar a logica de SLA entre Central e Mapa. Extrair para helper compartilhado. | Devs |
| L3 | Equipe/[id] | Tab Informacoes reusa `.cols2` com `borderBottom` inline por row. Funciona, mas nao reutiliza o pattern `ws-info-row` da Central. | Considerar extrair componente `<InfoGrid>` reutilizavel. | Devs |
| L4 | KeyboardShortcuts | Apenas 2 atalhos (Esc e ?). Plataforma operacional usada 8-12h/dia deveria ter pelo menos: N para novo chamado, / para buscar. | Adicionar mais atalhos progressivamente. O framework ja esta la. | Atendente |
| L5 | Toast | ToastProvider existe e funciona, mas nenhum slide-over dispara toast apos "Salvar". O usuario clica Salvar e o panel fecha sem feedback. | Adicionar `showToast('Salvo com sucesso')` no handler de salvar de cada slide-over. | Todos |
| L6 | Leads (/leads) | `btn-red` no footer do slide-over de detalhe nao tem confirmacao de exclusao. Clique direto potencialmente destrutivo. | Adicionar dialog de confirmacao ou estado intermediario "Tem certeza?". | Comercial |
| L7 | Central (/) | Botao "Selecionar VTR" no painel de VTR atribuida nao faz nada. Sem onClick handler. | Implementar acao (abrir mapa filtrado, ou lista de VTRs proximas). | Atendente |
| L8 | Frota (/frota) | Click na row da tabela abre slide-over de edicao, nao navega para detalhe. O link "Ver detalhe" fica escondido dentro do slide-over. Confuso para quem quer ver historico de manutencoes. | Considerar: click abre detalhe (navegacao), botao "Editar" no detalhe abre slide-over. | Gestor de frota |

---

## Page-by-page notes

### 1. Central (/) — 8.5/10

A pagina que mais evoluiu. De um feed de bot para uma Central de Atendimento real.

**Acertos:**
- Inbox com 4 grupos priorizados (urgente/em_andamento/aguardando/concluido), colapsaveis
- Segment toggle Chamados/Bot feed permite ver ambas perspectivas
- Search funcional por paciente, numero, solicitante, origem
- Chamados criticos com background vermelho e dot pulsante
- SLA badges com 3 niveis visuais (ok/warn/crit) + route com live dot
- Channel icon por tipo (WhatsApp verde, telefone azul, site cinza, email violeta, manual amber)
- Workspace com 3 tabs funcionais (Atendimento, Historico, Financeiro)
- Tab Financeiro com QR code placeholder para PIX
- Botao Assumir conversa / Devolver ao bot funcional
- Composer com quick replies so aparece em modo intervencao
- Novo chamado via slide-over com form completo
- Dashboard (empty state) com KPIs reais + chamados recentes + frota disponivel
- Contagem de VTRs por status (disponivel/atendimento/manutencao) com mini-cards coloridos

**Gaps:**
- Slide-over de novo chamado nao usa componente `<SlideOver>` (M4)
- Botao "Selecionar VTR" sem acao (L7)
- Sem mini-mapa no workspace (issue v0.1 #3 parcialmente resolvido)

### 2. Mapa (/mapa) — 8/10

Evolucao significativa com despacho funcional.

**Acertos:**
- Sidebar com tabs Frota/Chamados
- Tab Chamados mostra todos os chamados ativos com status pill, SLA badge, origem/destino
- Clicar em chamado abre painel de despacho a direita
- Painel de despacho mostra info do paciente, trajeto (origem/destino com dots vermelho/azul), VTRs proximas ordenadas por distancia
- Botao "Despachar" em cada VTR proxima
- VTR markers com tooltips mostrando info completa
- Clicar em VTR na sidebar centra no mapa (pan) e seleciona
- Stats badge no topo com contagens em tempo real
- Filter chips por tipo (UTI/Basica/Moto) no topo direito

**Gaps:**
- Hover via JS inline (H3)
- Filter chips com styles hardcoded (H4)
- Logica SLA invertida (L2)
- Backdrop blur nao documentado (L1)

### 3. Frota (/frota) — 9/10

A pagina mais madura. Search + pagination + slide-over + detalhe.

**Acertos:**
- Search por placa/nome com `table-search`
- Filter chips com counts por status e tipo, separador visual
- Contagem de resultados dinamica
- Paginacao 25/page com "Mostrando X-Y de Z"
- Click abre slide-over de edicao com form completo (nome, placa, tipo, status, modelo, versao, chassi, renavam, ano, km, regiao)
- Link "Ver detalhe" no footer do slide-over
- Botao "Novo veiculo"

**Gap menor:**
- Click na tabela abre edicao, nao detalhe. Confuso (L8)

### 4. Frota/[id] — 8.5/10

Detalhe rico com 5 tabs reais.

**Acertos:**
- Hero com placa em mono 20px, pills de status e tipo
- 4 KPI cards (KM, Multas, Manutencoes abertas, Ult. abastecimento)
- Tab Geral: paineis Identificacao e Operacao com dados reais do SofitView
- Tab Manutencoes: timeline vertical com dots coloridos por status, botao Nova OS
- Tab Checklist: agrupado por categoria, itens reprovados com fundo vermelho e observacao
- Tab Pneus: diagrama visual de posicoes + tabela
- Tab Multas: tabela com data, codigo, descricao, valor, status, motorista
- Badge de count na tab Multas, dot vermelho na tab Checklist quando ha reprovados

**Gap:**
- KPI "ULT. ABASTECIMENTO" fontSize inconsistente (M8)

### 5. Equipe (/equipe) — 8/10

Grande evolucao com filtros, status reais, e CRM/COREN.

**Acertos:**
- Search por nome
- Filter chips por funcao (com counts) e por regiao
- Status real com 4 opcoes (ativo/ferias/afastado/desligado) e pills corretas
- Tabela com coluna Conselho (CRM/COREN para profissionais de saude)
- Slide-over com formulario condicional: mostra CRM/COREN/UF/especialidade para medicos/enfermeiros, CNH para motoristas
- Paginacao 25/page
- Link "Ver ficha completa" no footer do slide-over

**Gaps:**
- Search input usa inline styles (M2)
- funcaoPill usa inline styles ao inves de classes pill-* (consistente com v0.1, nao regrediu)

### 6. Equipe/[id] — 8/10

Ficha completa com tabs e info condicional por funcao.

**Acertos:**
- KPI cards condicionais: CRM/COREN para saude, CNH para motorista
- CNH expiring alert com pill vermelha "VENCE EM BREVE"
- Tab Info adapta campos por tipo de profissional (saude vs nao-saude)
- Tab Alocacoes com timeline vertical reutilizando `.bot-timeline`
- Tab Historico com ocorrencias tipadas (checklist, multa, atendimento, falta, elogio)

**Gaps:**
- Botao Voltar inconsistente com Frota/[id] (M3)

### 7. Leads (/leads) — 6.5/10

A pagina que menos evoluiu proporcionalmente.

**Acertos:**
- 4 KPI cards (total, pipeline, conversao, perdidos)
- Kanban com 6 estagios e cards com nome/empresa/canal/valor/tempo
- Slide-over com detail view e create form separados
- Select de estagio no detail permite mover lead
- Botao Excluir no footer
- Create form usa `<FormField>` e `form-input/select/textarea` consistentes

**Gaps:**
- 6 colunas muito apertadas (H1, issue remanescente da v0.1)
- Acentos ausentes em varios labels (H2)
- Notas read-only (M9)
- Sem filtro por canal, regiao, ou servico
- Sem drag-and-drop hint visual

### 8. Cadastros hub (/cadastros) — 8.5/10

Hub limpo com 10 cards, counts dinamicos.

**Acertos:**
- 10 cards com icone, count, nome, descricao
- Counts agora vem de mock data real (.length)
- Dois novos cards: Checklists e Orcamentos
- Grid 4 colunas responsivo

**Gap:**
- Checklists e Orcamentos usam count textual ao inves de numerico (M7)

### 9. Fornecedores (/cadastros/fornecedores) — 7.5/10

Pattern consistente. Search + tabela + slide-over CRUD.

### 10. Equipamentos (/cadastros/equipamentos) — 7.5/10

Agrupado por categoria com filter por VTR. Status pill "MANUTENCAO" sem acento (M6).

### 11. Documentos (/cadastros/documentos) — 8/10

Alert banners para vencidos/vencendo. Tabs de filtro. Muito bem executado para gestao documental.

### 12. Pneus (/cadastros/pneus) — 7.5/10

Filter por VTR, tabela com dimensao e vida. Consistente com o pattern.

### 13. Almoxarifados (/cadastros/almoxarifados) — 5/10

A pagina mais simples. Tabela read-only sem create/edit/actions. Sem slide-over. Sem search.

### 14. OS (/cadastros/os) — 7.5/10

Kanban 4 colunas com cards clicaveis. Slide-over de create/edit. Labels sem acento (M5).

### 15. Checklists (/cadastros/checklists) — 8.5/10 (NOVA)

Pagina nova de alta qualidade.

**Acertos:**
- Tabs Modelos/Execucoes
- Modelos como cards expansiveis com itens agrupados por categoria
- Cada item mostra tipo (bool/foto/numero/texto) como pill colorida + obrigatorio badge
- Tab Execucoes com tabela: data, VTR, motorista, resultado (pill), itens aprovados/total, duracao
- Filtros por VTR, resultado, search por motorista
- Slide-over de detalhe com score (%), stats (aprovados/reprovados/duracao), itens agrupados com check/X
- Itens reprovados com background vermelho e observacao

### 16. Orcamentos (/cadastros/orcamentos) — 8/10 (NOVA)

Pagina nova com calculadora interativa.

**Acertos:**
- Tabela com cliente, evento, data, itens (resumo), valor total, status, criado em
- Slide-over de detalhe com servicos, subtotais, desconto, total final em display grande
- Create multi-step (3 passos: Cliente, Evento, Servicos)
- Calculadora no step 3: tipo servico, quantidade, horas (minimo 4), desconto slider 0-20%, valor/hora exibido, subtotal calculado
- Adicionar/remover servicos
- Resumo com total sem desconto, desconto aplicado, total final em display 28px
- Botoes "Salvar rascunho" e "Enviar orcamento" no ultimo step

**Gap:**
- Sem step indicator (H6)

### 17. Configuracoes (/configuracoes) — 7.5/10

**Acertos novos vs v0.1:**
- Integracoes tem botoes Conectar/Reconectar
- Usuarios tem botao Convidar
- Breadcrumb adicionado

### 18. Login (/login) — 8/10

**Acertos novos vs v0.1:**
- Usa `className="form-input"` do design system
- Validacao visual com mensagens de erro
- Loading state com spinner SVG animado
- "Esqueci minha senha" link
- Versao no footer (ainda diz v0.1, M10)

---

## Dimension details

### A. UX Flows (per persona)

**Atendente/Supervisora: 8/10**
- Pode ver chamados na Central com prioridade, status, SLA: SIM
- Pode criar novo chamado via "+ Novo": SIM
- Pode despachar VTR pelo Mapa com painel de despacho: SIM
- Pode observar bot no feed e assumir conversa: SIM
- Pode buscar chamado por paciente/numero: SIM
- Falta: mini-mapa na Central, botao "Selecionar VTR" sem acao

**Gestor de frota: 9/10**
- Pode buscar veiculo por placa: SIM (search na Frota)
- Pode ver status de manutencao: SIM (tab Manutencoes no detalhe)
- Pode criar OS: SIM (pagina /cadastros/os com kanban + slide-over)
- Pode checar checklists: SIM (pagina /cadastros/checklists com modelos + execucoes)
- Pode gerenciar pneus: SIM (pagina /cadastros/pneus + diagrama no detalhe VTR)
- Fluxo completo de gestao de frota funciona end-to-end

**Diretor (Rodrigo): 7.5/10**
- Pode ver KPIs operacionais: SIM (Central dashboard)
- Pode ver pipeline de leads: SIM (kanban, um pouco apertado)
- Pode ver info financeira: SIM (orcamentos com calculadora)
- Pode ver status da equipe: SIM (com filtros e status reais)
- Falta: dashboard consolidado dedicado (receita, custos, tendencias)

**Comercial: 8/10**
- Pode gerenciar leads: SIM (kanban + CRUD)
- Pode criar orcamento de evento: SIM (calculadora multi-step)
- Pode acompanhar fontes de lead: PARCIAL (canal pill nos cards, mas sem tab de aquisicao ou filtro por canal)

### B. UI Consistency — 8/10

- **Pills:** Consistentes. 95% usam `.pill` + `.pill-{color}`. Excecao: funcaoPill em Equipe usa inline styles (nao regrediu, ja era assim).
- **Panels/Cards:** Todos usam `.panel` + `.panel-header` + `.panel-body`. Consistente.
- **Tables:** th/td com classes `.th`/`.td`. Consistente em 16 de 18 paginas.
- **Forms:** Todas as novas paginas usam `<FormField>` + `form-input` / `form-select` / `form-textarea`. Login agora tambem usa. Consistente.
- **Buttons:** `btn btn-green`, `btn btn-outline`, `btn-sm btn-sm-green`, `btn-red`. Consistente.
- **Page headers:** breadcrumb + page-title em todas as paginas (inclusive Configuracoes, que antes nao tinha).
- **Slide-over:** Componente `<SlideOver>` reutilizado em 8 paginas. Excecao: Central usa implementacao inline (M4).
- **Table hover:** Frota, Checklists, Orcamentos usam `.table-row-click`. Mapa sidebar ainda usa JS inline (H3).

### C. Visual Hierarchy & Typography — 8.5/10

- Display font (Bricolage) usado corretamente em: page-title, kpi-value, chamado names, VTR names, panel-title
- Mono (JetBrains) usado corretamente em: placas, valores BRL, IDs, timestamps, counts, SLA badges, breadcrumbs
- Body (Hanken) para todo o resto: labels de tab, paragrafos, botoes
- Type scale segue spec: 8.5px labels mono -> 12.5px body -> 14px panel titles -> 22px KPIs -> 25px page titles
- Excecoes documentadas: KPI compact (18px), Orcamento total display (28px)
- Hierarquia clara: nenhuma pagina tem elementos competindo por atencao

### D. Information Density — 7.5/10

- Tabelas compactas para 88 veiculos e 57 funcionarios com paginacao 25/page
- KPI cards compact (13px 15px padding)
- Central inbox scannable com agrupamento colapsavel
- Kanban de Leads continua apertado com 6 colunas (H1)
- Orcamentos tabela comporta bem 5 itens mock, mas sem paginacao se crescer
- Checklists execucoes tabela limpa e densa

### E. Interactions & States — 7.5/10

- Slide-over fecha com Esc: SIM (via componente + keyboard shortcuts)
- Keyboard shortcuts help (?): SIM
- Hover states em rail, chips, table rows, cards: SIM
- Transicoes 150ms ease-out: SIM
- Loading state no Login: SIM
- Skeleton component disponivel: SIM (mas nao utilizado nas paginas)
- Toast component disponivel: SIM (mas nao disparado por nenhum slide-over save)
- Segment toggle animado: SIM
- Colapsavel em grupos da Central: SIM
- Expandible em checklist modelos: SIM
- Filter chips interativos com contagem: SIM
- Slide-over nao tem drag-to-close (ok para desktop)

### F. Copy & Microcopy — 7/10

**Melhorias:**
- Muitos labels agora com acentos corretos: "Manutenções", "Histórico", "Serviço", "Veículo", "Disponível"
- Empty states melhorados: "Nenhum veículo encontrado", "Nenhum chamado ativo", "Nenhuma execução encontrada"
- Botoes action-oriented: "Criar chamado", "Despachar", "Novo funcionário", "Salvar rascunho", "Enviar orçamento"
- Quick replies uteis: "Confirmar chegada", "Enviar cotação", "Atualizar ETA"

**Gaps remanescentes:**
- Rail nav: "Gestao" e "Configuracoes" sem acento
- Leads: "Conversao", "GESTAO", "REGIAO", "SERVICO", "ESTAGIO" sem acentos
- OS: "Aguardando peca", "Concluida" sem acentos
- Equipamentos: "MANUTENCAO" sem acento e cedilha
- Login footer: "v0.1" desatualizado
- Empty states poderiam sugerir acao: "Nenhum lead" -> "Nenhum lead neste estágio. Arraste um card ou clique + Novo lead."

### G. Data Integrity — 8/10

- Hub counts batem com mock data (.length): SIM
- VTR stats (disponivel/em_atendimento/manutencao) calculados do array real: SIM
- Central KPIs calculados dos chamados reais: SIM
- Leads pipeline value somado dos leads negociando reais: SIM
- Orcamentos calculadora respeita minimo de horas e max desconto 20%: SIM
- Placas e nomes reais do SofitView: SIM
- Dados de funcionarios com CPF, CRM, CNH realistas: SIM
- Checklists execucoes com score correto (aprovados/total): SIM
- SLA logica inconsistente entre Central e Mapa (L2)

### H. New Features Quality — 8/10

**Checklists:** Excelente. Modelos + execucoes, expandiveis, detail com score, itens agrupados por categoria com aprovado/reprovado visual. Score: 9/10.

**Orcamentos:** Muito bom. Calculadora interativa multi-step, desconto slider, totais em tempo real, detail view com breakdown. Falta step indicator (H6). Score: 8/10.

**Equipe CRM/COREN:** Bem implementado. Form condicional por funcao, labels corretos (CRM vs COREN), UF do conselho. Ficha completa com especialidade. Score: 8.5/10.

**Frota search + pagination:** Solido. 25/page, contagem de resultados, reset de page ao filtrar. Score: 9/10.

**Toast:** Componente pronto e funcional, mas sem uso real. Score: 6/10 (pela falta de integracao).

**Keyboard shortcuts:** Framework funcionando (Esc fecha panels, ? mostra help). Apenas 2 atalhos. Score: 7/10.

---

## Recommended next sprint

### Sprint 1: Polish & Copy (2 dias)

1. **Corrigir todos os acentos remanescentes** (H2, M1, M5, M6)
   - Busca global por strings sem acento
   - Rail nav, Leads labels, OS columns, Equipamentos status

2. **Integrar Toast nos slide-overs** (L5)
   - Cada "Salvar" dispara `showToast('Salvo com sucesso')`
   - Cada "Excluir" dispara `showToast('Removido', 'error')`

3. **Atualizar versao para v0.2** (M10)

4. **Migrar Central slide-over para `<SlideOver>` component** (M4)

### Sprint 2: Density & Interactions (2 dias)

5. **Adicionar Skeleton loading nas paginas principais** (H5)
   - Central: skeleton para inbox + workspace
   - Frota: skeleton para tabela
   - Equipe: skeleton para tabela
   - Leads: skeleton para kanban

6. **Refatorar Leads kanban** (H1)
   - 4 colunas com scroll horizontal
   - Ou: mostrar Convertido/Perdido em linha abaixo

7. **Adicionar step indicator no Orcamentos** (H6)
   - 3 dots ou "Passo 1 de 3" no header

8. **Migrar hover JS para CSS no Mapa** (H3, H4)

### Sprint 3: Consistency (1 dia)

9. **Padronizar Equipe search input** (M2) -> usar `.table-search`

10. **Padronizar botao Voltar** (M3) -> usar `<Link>` como Frota/[id]

11. **Padronizar hub card counts** (M7) -> numeros puros

12. **Corrigir logica SLA entre Central e Mapa** (L2) -> extrair helper

### Sprint 4: Depth (2 dias)

13. **Adicionar confirmacao de exclusao nos slide-overs** (L6)

14. **Implementar "Selecionar VTR" na Central** (L7)

15. **Adicionar mais keyboard shortcuts** (L4): N para novo, / para buscar

16. **Melhorar empty states com acao sugerida** (especialmente Almoxarifados)

17. **Converter Leads notas para textarea editavel** (M9)
