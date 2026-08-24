# Savior Platform — Definitive Design Audit

**Date:** 23/08/2026
**Standard:** Apple/Linear quality bar
**Skills applied:** Impeccable, Design Auditor, UX Writer, Taste, Frontend Design, UI Design Brain
**Pages audited:** 18
**User stories validated:** 22

---

## Executive Summary

A Savior Platform esta num ponto peculiar: a fundacao tecnica (design system, tipografia, tokens OKLCH, layout system) e surpreendentemente forte para um prototipo. Os ossos sao bons. Mas a carne precisa de trabalho.

O produto hoje parece um prototipo bem feito por um engenheiro com bom gosto, nao um produto finalizado por uma equipe de design. A diferenca entre os dois e brutal: e a diferenca entre "funciona bem" e "inspira confianca". Num contexto de emergencia medica, confianca nao e luxo, e requisito.

**Distancia ate world-class:** 35-40% do caminho percorrido. O design system ta la, os dados sao reais, os fluxos funcionam. Falta refino de craft em cada pixel, estados intermediarios, feedback pro usuario, e aquele polish que faz Linear parecer Linear.

**O que mais segura o produto:** Falta de polish nas interacoes. O usuario clica "Salvar" e o panel fecha sem feedback. O usuario olha pro kanban de Leads e nao consegue arrastar. O usuario busca VTR 456 e precisa rolar pela tabela. Cada micro-friccao se acumula. Num turno de 12 horas, isso vira exaustao.

---

## Overall Score: 5.5/10 (Apple standard)

Contexto: Apple nao shipparia 98% do software do mundo. Um 5.5 significa que o esqueleto e solido, a direcao de design e correta, mas a execucao ainda ta longe do nivel de craft que diferencia um bom produto de um produto memoravel. No padrao interno da equipe isso e um 7.8; no padrao Apple/Linear, 5.5.

---

## As 3 coisas que transformariam este produto

### 1. Matar os inline styles e criar um sistema de composicao real

O problema fundamental nao e visual, e arquitetural. Aproximadamente 70% dos estilos estao em `style={{...}}` inline. Isso cria:
- Inconsistencia inevitavel (padding 18 num lugar, 16 no outro, 14 no terceiro)
- Impossibilidade de theming ou responsividade
- Dificuldade de manutenção extrema
- Aspecto de prototipo ao inspecionar o codigo

**Linear tem zero inline styles.** Cada pixel e intencionado e rastreavel. Enquanto a Savior tiver `style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}` espalhado em centenas de lugares, nao vai parecer um produto de $1B.

**Fix:** Extrair os 30-40 patterns mais repetidos em classes CSS. `ws-panel`, `flex-between`, `info-grid`, `stats-row`, `detail-section`, `sidebar-item`.

### 2. Implementar feedback em CADA interacao

Hoje o usuario opera no escuro:
- Clica "Salvar" → panel fecha, zero feedback
- Clica "Despachar" → nada acontece (mock)
- Clica "Assumir conversa" → muda um boolean silenciosamente
- Clica "Excluir" → executa sem confirmacao

**Apple exige:** cada acao tem resposta. Touch → haptic. Click → animation + toast. Error → shake + message. Loading → progress indicator.

**Fix:** Integrar o Toast component ja existente (ta pronto, zero pagina usa). Adicionar confirmacao de exclusao. Adicionar micro-animacoes nos state changes (intervention mode, dispatch, status change).

### 3. Fazer a Central ganhar urgencia visual proporcional a gravidade

Este e um produto de EMERGENCIA MEDICA. A Central deveria ter a tensao visual de um cockpit de aviao, nao de um email client. Hoje os chamados urgentes tem um fundo rosa e um dot pulsante, o que e bom, mas insuficiente.

**O que falta:**
- Sound cue hint (icone de som que sugere audio)
- Timer visual contando segundos sem resposta
- Escala visual progressiva: quanto mais tempo sem atencao, mais urgente o item fica visualmente (nao so cor, mas tamanho/posicao)
- Botao de acao primaria (Despachar/Assumir) como FAB (floating action button) quando um chamado critico esta selecionado

---

## Page-by-page audit

---

### 1. Central (/) — O coracao do produto

**User stories served:** A1, A2, A3, A5, A7
**Current score:** 6/10

**O que funciona:**
- Layout master-detail com inbox + workspace e a escolha correta
- Agrupamento por prioridade (urgente/em_andamento/aguardando/concluido) com colapsar e excelente
- SLA badges com 3 niveis visuais (ok/warn/crit) + route com live dot
- Channel icons por tipo (WhatsApp verde, telefone azul, site cinza)
- Segment toggle Chamados/Bot feed
- Search funcional
- Workspace com tabs funcionais
- Bot timeline e uma feature genuinamente util
- Critical chamados com background vermelho e dot pulsante

**O que falha no Apple test:**

1. **O inbox header e apertado e confuso.** "Central" + badge + live dot + botao Novo tudo numa linha com gap de 9px. O botao "+ Novo" compete visualmente com o titulo. Apple separaria titulo e acoes em linhas distintas ou usaria spacing generoso.

2. **A busca nao tem atalho de teclado visivel.** Um operador usando 12h/dia precisa ver "/" no placeholder ou Cmd+K pro search. Hoje diz "Buscar paciente, numero, origem..." sem hint de shortcut.

3. **O workspace (coluna direita) quando vazio mostra dashboard, mas nao incentiva acao.** O dashboard operacional e informativo mas passivo. Nao diz "Tem 2 chamados urgentes sem atendente. Deseja atribuir?" — so mostra numeros.

4. **O slide-over de novo chamado nao usa o componente `<SlideOver>`.** Usa implementacao inline, perdendo Esc handler e consistencia.

5. **O botao "Selecionar VTR" na secao VTR ATRIBUIDA nao faz nada.** Sem onClick. E uma promessa vazia pro usuario.

6. **Nao tem mini-mapa no workspace.** O operador precisa ver onde o chamado esta sem ir pra pagina Mapa. Uma visualizacao inline de 200x150px resolveria.

7. **O tab "Financeiro" mostra um placeholder de QR code (quadrado cinza com "Placeholder").** Isso destrói a ilusao de produto real. Melhor nao mostrar que mostrar um placeholder obvio.

8. **Chat messages sem separacao visual por dia.** Num chat longo, nao da pra saber onde termina uma conversa do dia anterior.

**Recommended redesign:**
- Separar header: linha 1 = titulo + live dot + count badge. Linha 2 = search (com /) + botao Novo
- Adicionar timer visual nos chamados urgentes (conta segundos desde abertura)
- Workspace vazio deve ter acao sugerida: "2 chamados aguardando atribuicao. Ver fila →"
- Mini-mapa Leaflet inline no workspace quando chamado selecionado tem coordenadas
- Remover placeholder PIX; substituir por "QR code sera gerado apos integracao com Asaas"

**Priority fixes (this sprint):**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Slide-over nao usa `<SlideOver>` component | Migrar para `<SlideOver>` | Consistencia + Esc handler |
| 2 | "Selecionar VTR" sem onClick | Implementar: abre mapa filtrado ou lista de VTRs | Elimina dead-end |
| 3 | Placeholder PIX visivel | Substituir por mensagem "Integracao pendente com gateway" | Elimina AI slop |
| 4 | Search sem keyboard hint | Adicionar "/" no placeholder: "/ Buscar paciente..." | Operador expert pode usar |
| 5 | Toast nao integrado | Cada acao (Assumir, Devolver, Despachar) dispara showToast | Feedback pro usuario |

---

### 2. Mapa (/mapa) — Despacho visual

**User stories served:** A4, A5, E1
**Current score:** 6/10

**O que funciona:**
- Sidebar com tabs Frota/Chamados e o pattern correto
- Painel de despacho a direita com origem/destino (dots vermelho/azul) e VTRs proximas
- VTR markers com tooltips informativos
- Stats badge no topo com contagens
- Filter chips por tipo (UTI/Basica/Moto)

**O que falha no Apple test:**

1. **Hover via JS inline em TODA a sidebar.** `onMouseEnter/Leave` com `e.currentTarget.style.background`. Isso e fragil, lento, e anti-pattern. CSS class `.table-row-click` ja existe e faz exatamente isso.

2. **Filter chips no topo direito usam inline styles com OKLCH hardcoded.** Nao reutilizam `.chip` / `.chip-active`. Inconsistencia gratuita.

3. **Logica de SLA invertida entre Central e Mapa.** Na Central, `sla_minutos > 20` e critico. No Mapa, `sla_minutos <= 5` e critico. Logicas opostas.

4. **O backdrop blur na sidebar nao esta documentado como excecao no DESIGN.md.** Tecnicamente viola as regras do design system.

5. **O botao "Despachar" nas VTRs proximas nao da feedback.** Clicou = nada visivel aconteceu. Deveria: Toast "VTR 340 despachada para chamado #1247" + fechar panel + marcar no mapa.

6. **Search input na sidebar usa inline styles.** Nao usa `.table-search` nem `.inbox-search`.

7. **O painel de despacho nao mostra ETA estimado da VTR ate a origem.** Mostra distancia (~2.3 km) mas nao tempo. "~2.3 km" nao responde a pergunta do operador que e "quantos minutos?".

**Priority fixes:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Hover via JS inline | Migrar para `.table-row-click` CSS class | Performance + consistencia |
| 2 | Filter chips hardcoded | Reutilizar `.chip` / `.chip-active` com variante dark | Consistencia |
| 3 | SLA logica invertida | Extrair helper `slaLevel(minutes)` compartilhado | Correcao funcional |
| 4 | Sem ETA nas VTRs proximas | Calcular ETA estimado: `~${Math.ceil(dist * 3)} min` | Informacao critica |

---

### 3. Frota (/frota) — A pagina mais madura

**User stories served:** Gestor encontrar VTR 456
**Current score:** 7.5/10

**O que funciona:**
- Search por placa/nome funcional
- Filter chips com counts por status e tipo, separador visual
- Paginacao 25/page com "Mostrando X-Y de Z"
- Click abre slide-over de edicao com form completo
- Link "Ver detalhe" no footer

**O que falha no Apple test:**

1. **Click na row abre edicao, nao detalhe.** Modelo mental do usuario: "cliquei numa row, quero ver os detalhes". A edicao deveria ser uma acao secundaria (botao Editar no detalhe).

2. **Nao tem export/download.** Gestor de frota precisa levar dados pra reuniao. Sem CSV ou print view.

3. **Coluna REGIAO mostra "RJ" ou "SP" baseado em latitude (< -23.0).** Isso e uma heuristica fragil que nao leva em conta Niteroi vs SP. Deveria vir do dado, nao de calculo.

4. **A tabela nao tem sort.** Clicar no header de coluna deveria ordenar. Basico em qualquer data table.

**Priority fixes:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Click abre edicao nao detalhe | Click → navega para /frota/[id]. Editar = botao no detalhe | UX correcao |
| 2 | Sem sort nas colunas | Adicionar onClick nos th com state de sort | Operacional |

---

### 4. Frota/[id] — Detalhe rico

**User stories served:** Gestor ver manutencoes, checklists, documentos
**Current score:** 7/10

**O que funciona:**
- Hero com placa em mono 20px, pills de status e tipo
- 5 tabs funcionais com conteudo real
- Timeline de manutencoes com dots coloridos
- Checklist agrupado por categoria, reprovados com fundo vermelho
- Diagrama visual de pneus
- Badge de count na tab Multas

**O que falha:**

1. **KPI "ULT. ABASTECIMENTO" usa fontSize 16 enquanto os outros usam 20.** Quebra o ritmo visual.

2. **O diagrama de pneus usa "FRENTE" e "TRAS" sem acento.** Deveria ser "TRASEIRA" ou "TRÁS".

3. **Tab "Geral" tem dados com inline styles (9px 0 padding por row) que nao reusam `.ws-info-row`.** Inconsistencia interna.

4. **O botao "Nova OS" na tab Manutencoes nao abre nada.** Sem onClick handler.

**Priority fixes:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | KPI fontSize inconsistente | Uniformizar para 20px ou usar `kpi-value` class sem override | Visual consistency |
| 2 | "TRAS" sem acento | Corrigir para "TRASEIRA" | Copy |

---

### 5. Equipe (/equipe) — Boa evolucao

**User stories served:** Gestor ver equipe, filtrar por funcao
**Current score:** 6.5/10

**O que funciona:**
- Filter chips por funcao e regiao com counts
- Status real com 4 opcoes
- Form condicional (CRM/COREN para saude, CNH para motorista)
- Paginacao 25/page

**O que falha:**

1. **Search input usa inline styles.** Background, border, borderRadius, padding todos inline. Deveria usar `.table-search` como na Frota.

2. **funcaoPill usa inline styles no `<span className="pill">`.** `style={{ background: fp.bg, color: fp.color }}`. Isso deveria ser uma classe `.pill-motorista`, `.pill-medico` etc.

3. **Nao tem export nem bulk actions.** Precisaria de pelo menos "Exportar CSV" pra RH.

4. **A coluna CONSELHO mostra em dash ("\u2014") pra nao-medicos.** Poderia esconder a coluna quando filtro = Motorista, ou mostrar CNH no lugar.

**Priority fixes:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Search input inline styles | Usar `.table-search` com icone posicionado via CSS | Consistencia |
| 2 | funcaoPill inline styles | Criar classes `.pill-motorista`, `.pill-medico`, etc. ou usar mapeamento pill-* existente | Consistencia |

---

### 6. Equipe/[id] — Ficha completa

**User stories served:** Gestor ver dados de funcionario
**Current score:** 6.5/10

**O que funciona:**
- KPI cards condicionais por tipo de profissional
- CNH expiring alert com pill vermelha
- Timeline de alocacoes
- Historico de ocorrencias tipadas

**O que falha:**

1. **Botao "Voltar" usa `<button onClick={router.push}>`.** Na Frota/[id] e `<Link>`. Inconsistencia. Link e semanticamente correto e permite abrir em nova aba.

2. **O layout da tab Info e dificil de scanear.** Usa `cols2` com rows manuais, mas sem separacao visual clara entre secoes (dados pessoais vs profissionais vs administrativos).

3. **CNH vencimento mostra data em formato ISO (2027-03-15).** Deveria ser 15/03/2027.

**Priority fixes:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Botao Voltar inconsistente | Usar `<Link href="/equipe">` com ArrowLeft, como na Frota | Consistencia |
| 2 | Data ISO no CNH | Usar funcao fmtDate que ja existe no projeto | Copy |

---

### 7. Leads (/leads) — A pagina que mais evoluiu desde v0.1

**User stories served:** Diretor ver pipeline, comercial gerenciar leads
**Current score:** 7/10

**O que funciona:**
- 3 views: Pipeline (kanban), Base completa (tabela), Aquisicao (charts)
- Pipeline com 4 colunas e date range filter (7/30/90 dias)
- Base completa com search, filtros status/canal, paginacao 50/page
- Aquisicao com bar charts por fonte, canal, tendencia mensal e tabela de campanhas
- KPI strips em cada view
- Slide-over diferenciado entre lead simples e lead enriquecido

**O que falha:**

1. **Labels sem acento por toda parte.** "GESTAO" no breadcrumb, "Sessoes", "Usuarios", "Conversoes", "Conversao", "ATRIBUICAO", "SERVICO", "REGIAO", "ESTAGIO", "HISTORICO", "Pagina", "Proxima", "Tendencia", "medio".

2. **Kanban cards ainda compactos.** Em tela 1440px ta OK com 4 colunas, mas cards poderiam respirar mais. Nome + empresa + canal + valor + tempo tudo em ~200px de largura.

3. **Notas do lead sao read-only** (div visual de input). Se o usuario clicar achando que pode editar, nada acontece. Usar `<textarea>`.

4. **Botao de paginacao da Base usa `.chip` em vez de `.btn btn-outline`.** Chip nao e botao de paginacao semanticamente.

5. **Tab "Aquisicao" sem acentos nos KPIs.** "Sessoes totais", "Usuarios", "Conversoes", "Taxa conversao".

6. **Bar charts sao divs com width calculado.** Funcional mas nao acessivel. Sem aria-label ou tooltip com valor exato.

**Priority fixes:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Acentos faltando em 15+ labels | Corrigir todos: Gestao→Gestão, Sessoes→Sessões, etc. | Copy profissional |
| 2 | Notas read-only | Converter para `<textarea className="form-textarea">` | UX funcional |
| 3 | Paginacao com chip | Usar `btn btn-outline` como na Frota | Consistencia |

---

### 8. Cadastros hub (/cadastros) — Hub limpo

**User stories served:** Navegacao para sub-paginas
**Current score:** 7/10

**O que funciona:**
- 10 cards com icone, count, nome, descricao
- Counts dinamicos via mock data
- Grid 4 colunas

**O que falha:**

1. **Checklists e Orcamentos usam count textual.** `'2 modelos'` e `'5 orçamentos'` em vez de numero puro. O `.hub-card-count` espera mono numerico grande.

2. **Nao tem breadcrumb "GESTAO" visivel.** A hierarquia e clara mas o label no breadcrumb e "GESTÃO" como nas outras paginas de gestao.

**Priority fix:**

| # | Issue | Fix | Impact |
|---|-------|-----|--------|
| 1 | Count textual em 2 cards | Usar numero puro (2, 5) no count e qualificador no desc | Consistencia visual |

---

### 9-10. Fornecedores + Equipamentos

**Score:** 6/10 cada

Seguem o pattern correto (breadcrumb + titulo + tabela + slide-over CRUD). Problemas:
- Equipamentos: "MANUTENCAO" sem acento/cedilha no status pill
- Ambos: sem search (Fornecedores tem, Equipamentos nao)
- Ambos: sem paginacao (ok com poucos itens, vai quebrar com dados reais)

---

### 11. Documentos (/cadastros/documentos) — Bem executado

**Score:** 7/10

Alert banners para vencidos/vencendo sao genuinamente uteis. Tabs de filtro funcionais. Bom trabalho.

---

### 12. Pneus (/cadastros/pneus)

**Score:** 6/10

Funcional mas basico. Filter por VTR funciona. Sem search, sem paginacao.

---

### 13. Almoxarifados (/cadastros/almoxarifados) — A pagina mais fraca

**Score:** 3/10

Tabela read-only com 4 colunas (ID, Nome, Filial, Status). Sem create, sem edit, sem search, sem slide-over, sem acoes. `table-row-click` na row sem onClick handler. E a unica pagina que parece abandonada.

**Fix:** No minimo remover `table-row-click` (cria expectativa sem entregar). Idealmente adicionar slide-over CRUD como as outras paginas de cadastro.

---

### 14. OS (/cadastros/os) — Kanban funcional

**Score:** 6.5/10

**Problemas:**
- Labels sem acento: "Aguardando peca" → "Aguardando peça", "Concluida" → "Concluída"
- Labels de prioridade sem acento: "MEDIA" → "MÉDIA", "CRITICA" → "CRÍTICA"
- Botao "Excluir" no slide-over nao tem confirmacao
- `Descricao` label sem acento

---

### 15. Checklists (/cadastros/checklists) — Alta qualidade

**Score:** 7.5/10

**Destaques:** Modelos expansiveis, tipo badges (bool/foto/numero/texto), execucoes com score %, detalhe com itens agrupados por categoria, reprovados com fundo vermelho.

Poucas issues: falta indicador de "Nenhum modelo" como empty state no tab Modelos quando filtrado.

---

### 16. Orcamentos (/cadastros/orcamentos) — Calculadora interativa

**Score:** 7/10

**Destaques:** Multi-step form, calculadora com slider de desconto, resumo com totais em tempo real, enforcement de minimo de horas.

**Problemas:**
- Sem step indicator (nao sabe que ta no passo 1 de 3)
- Step titles no slide-over header mudam mas nao tem indicador visual
- O resumo verde no detalhe e bonito mas o total final nao ta formatado com decimais consistentes

**Fix:** Adicionar "Passo 1 de 3" no header do slide-over ou 3 dots/progress bar.

---

### 17. Configuracoes (/configuracoes) — Adequado

**Score:** 6/10

Funcional e limpo. Integracoes com botoes Conectar/Reconectar. Usuarios com botao Convidar.

**Problema:** Tooltip do rail diz "Configuracoes" sem acento. Breadcrumb esta correto ("CONFIGURAÇÕES").

---

### 18. Login (/login) — Funcional

**Score:** 6/10

Validacao visual, loading state com spinner, "Esqueci minha senha".

**Problemas:**
- Versao diz "v0.1", deveria ser "v0.2"
- O panel do form tem `background: 'var(--bg)'` que iguala ao fundo da pagina, eliminando o contraste visual do card. Deveria ser `var(--card)`.
- Sem indicacao de que e protótipo/demo (poderia confundir stakeholder)

---

## Cross-cutting issues

### Typography audit

**Positivo:** A hierarquia de 3 fontes (Bricolage display, Hanken body, JetBrains mono) e consistente e bem aplicada em ~90% dos casos.

**Issues:**
- KPI values variam entre 16px, 18px, 20px e 22px sem regra clara. Deveria ser 22px padrao, 18px compact.
- Pills com fontSize 6px e 7px em alguns lugares (Mapa sidebar, dashboard) sao ilegíveis em monitores de baixa resolucao.
- `.label` em 8.5px e muito pequeno para operadores 40+ que trabalham sob fluorescente. Minimo recomendado: 10px.

### Color audit

**Positivo:** Palette OKLCH e excelente. Cores funcionais (green=ativo, amber=atencao, red=critico, blue=aberto, violet=cotacao) sao consistentes.

**Issues:**
- VTR markers no mapa usam hex hardcoded (`#1FD29A`, `#F59E0B`, `#D9534F`) em vez de tokens CSS vars
- Mapa filter chips usam OKLCH inline em vez de tokens
- Mapa stats badge usa OKLCH inline
- `funcaoPill` no Equipe usa vars inline em vez de classes pill-*

### Spacing audit

**O problema principal:** Nao existe spacing scale. Os valores que aparecem no codigo:

- padding: 5px, 6px, 7px, 8px, 9px, 10px, 11px, 12px, 13px, 14px, 16px, 18px, 20px, 24px, 26px, 32px, 40px
- gap: 2px, 3px, 4px, 5px, 6px, 7px, 8px, 9px, 10px, 12px, 14px, 16px, 18px, 20px
- margin: 2px, 3px, 4px, 6px, 8px, 10px, 12px, 14px, 16px, 18px, 20px, 22px, 24px, 32px

Sao 17 valores de padding unicos. Linear usa 4 (4, 8, 12, 16) com multiplos consistentes. O resultado visual e que nenhuma pagina tem ritmo. Cada panel/secao usa spacing levemente diferente.

**Fix:** Definir scale de 4px: `--s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px; --s-8: 32px; --s-10: 40px`. Migrar todos os inline styles pra usar esses tokens.

### Copy audit — TODOS os fixes necessarios

**Rail nav:**
- "Gestao" → "Gestão"
- "Configuracoes" → "Configurações"

**Leads page:**
- Breadcrumb "GESTAO" → "GESTÃO"
- KPI "Tempo medio (dias)" → "Tempo médio (dias)"
- Tab "Aquisicao" → "Aquisição"
- "Proxima" → "Próxima"
- "Pagina X de Y" → "Página X de Y"
- "Sessoes totais" → "Sessões totais"
- "Usuarios" → "Usuários"
- "Conversoes" → "Conversões"
- "Taxa conversao" → "Taxa conversão"
- "Sessoes por fonte" → "Sessões por fonte"
- "Tendencia mensal" → "Tendência mensal"
- Slide-over labels: "ATRIBUICAO" → "ATRIBUIÇÃO", "SERVICO" → "SERVIÇO", "REGIAO" → "REGIÃO", "HISTORICO" → "HISTÓRICO", "ESTAGIO" → "ESTÁGIO"
- Form labels: "Tipo de servico" → "Tipo de serviço", "Regiao" → "Região"

**OS page:**
- Column "Aguardando peca" → "Aguardando peça"
- Column "Concluida" → "Concluída"
- Form label "Descricao" → "Descrição"
- Prioridade "MEDIA" → "MÉDIA", "CRITICA" → "CRÍTICA"
- Page title "Ordens de Servico" → "Ordens de Serviço"

**Equipamentos page:**
- Status "MANUTENCAO" → "MANUTENÇÃO"

**Frota/[id]:**
- Diagrama pneus "TRAS" → "TRASEIRA"

**Login page:**
- Footer "v0.1" → "v0.2"

**Empty states que precisam de acao sugerida:**
- Almoxarifados: sem empty state (tabela vazia nao e tratada)
- Leads Pipeline empty column: "Nenhum lead" → "Nenhum lead neste estágio"
- Mapa sidebar "Nenhum veículo encontrado" → "Nenhum veículo corresponde aos filtros. Tente limpar a busca."

### Interaction audit

**Missing hover states:**
- Mapa sidebar items usam JS inline hover em vez de CSS
- Almoxarifados rows tem `table-row-click` mas sem click handler

**Missing transitions:**
- Dispatch panel do Mapa nao tem entrada/saida animada
- Segment toggle muda estado instantaneamente sem transicao do indicator

**Missing feedback:**
- Zero slide-overs disparam Toast apos salvar
- Zero botoes de excluir tem confirmacao
- "Despachar" no Mapa nao faz nada visivel
- "Assumir conversa" muda boolean silenciosamente

**Missing keyboard:**
- Apenas 2 atalhos (Esc e ?)
- Falta: N para novo chamado, / para buscar, J/K para navegar chamados, D para despachar

---

## Recommended design principles to adopt

1. **"Cada pixel tem proposito."** Se nao e conteudo, acao ou estrutura, remova. Nada decorativo num produto de emergencia.

2. **"Estado visivel, acao acessivel."** O estado de cada entidade (chamado, VTR, lead) deve ser visivel em menos de 1 segundo. A acao primaria deve estar a 1 clique de distancia.

3. **"Feedback em cada toque."** Nenhuma acao do usuario fica sem resposta. Click → Toast. Error → Shake. Loading → Skeleton. Success → Green flash.

4. **"Spacing em multiplos de 4."** Todo spacing no produto usa multiplos de 4px. Sem excecoes. Sem 5px, 7px, 9px, 11px, 13px.

5. **"Inline styles sao divida tecnica."** Se um style aparece mais de 2 vezes, vira classe CSS. Se e unico, documenta o porquê.

6. **"Dados reais, sempre."** Nunca "Placeholder", nunca "--" quando o dado existe. Se o dado nao existe, diz porque ("Integracao pendente") nao "—".

7. **"A urgencia e proporcional ao perigo."** Chamado critico GRITA. Chamado concluido SILENCIA. A interface respira conforme a operacao.

---

## Priority sprint plan

### Esforco 1h (quick wins)

1. Corrigir TODOS os acentos listados na secao Copy audit (~30 strings)
2. Atualizar versao login para v0.2
3. Remover `table-row-click` de Almoxarifados (sem handler)
4. Uniformizar KPI fontSize para 20px em Frota/[id]
5. Corrigir "TRAS" → "TRASEIRA" no diagrama de pneus
6. Hub card counts: "2 modelos" → 2, "5 orçamentos" → 5

### Esforco 4h

7. Integrar Toast em TODOS os slide-overs (Salvar → success, Excluir → error, Criar → success)
8. Migrar Central slide-over para componente `<SlideOver>`
9. Migrar Mapa sidebar hover de JS inline para CSS classes
10. Migrar Mapa filter chips para tokens CSS (`.chip` / `.chip-active` com variante dark)
11. Padronizar Equipe search input → `.table-search`
12. Padronizar botao Voltar em Equipe/[id] → `<Link>` como Frota/[id]
13. Adicionar step indicator no Orcamentos ("Passo 1 de 3")

### Esforco 1 dia

14. Extrair helper `slaLevel(minutes)` e unificar logica entre Central e Mapa
15. Implementar "Selecionar VTR" na Central (abre lista de VTRs proximas)
16. Adicionar dialog de confirmacao em TODOS os botoes de excluir
17. Adicionar Skeleton loading em Central, Frota, Equipe, Leads (componente ja existe)
18. Converter Leads notas para `<textarea>` editavel
19. Adicionar keyboard shortcuts: N (novo), / (buscar), J/K (navegar)

### Esforco 3 dias

20. Definir spacing scale (4px multiplos) e migrar top 50 inline styles para classes CSS
21. Redesign do Almoxarifados: adicionar search, slide-over CRUD, empty state
22. Adicionar sort em colunas de tabela (Frota, Equipe, Leads Base)
23. Adicionar mini-mapa Leaflet inline no workspace da Central
24. Frota: click na row → navega para detalhe (nao abre edicao)
25. Adicionar ETA estimado nas VTRs proximas do Mapa dispatch panel

---

## Veredicto final

O produto tem uma base solida e rara: design system documentado, tokens OKLCH, tipografia de 3 familias bem aplicadas, dados reais de 88 veiculos e 45 funcionarios. A direcao esta correta. O gap nao e de taste, e de craft.

Para chegar ao nivel Apple/Linear, o trabalho agora e de polish obsessivo: matar inline styles, adicionar feedback em cada interacao, aplicar spacing scale rigido, e tratar cada string como se um diretor de hospital fosse ler.

O produto opera num contexto onde cada segundo importa e cada erro pode custar uma vida. O design precisa refletir essa gravidade sem ser pesado. Linear consegue isso com software de project management. A Savior pode conseguir com despacho de ambulancias.
