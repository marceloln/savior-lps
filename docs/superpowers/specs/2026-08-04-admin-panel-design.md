# Savior Admin Panel — Spec

**Data:** 2026-08-04
**Aprovado:** Marcelo (via "vai direto")

## Objetivo

Painel administrativo unificado onde a equipe Savior vê leads, agendamentos, candidaturas e métricas num lugar só. Três módulos:

1. **Dashboard** — métricas Google Ads, GA4, Blip, pipeline (substitui análises manuais)
2. **Admin operacional** — gerenciar agendamentos do form /agendar (status, atribuir ambulância)
3. **Leads & Candidaturas** — visualizar todos os leads e candidaturas consolidados

## Arquitetura

### Stack
- **Frontend:** React SPA dentro do Astro (client:only="react")
- **Auth:** Supabase Auth (email/password, sem OAuth)
- **Dados diretos:** Supabase (bookings, hospitals, regions, leads cache)
- **Dados agregados:** stats-api worker existente (Ads, GA4, Blip, Pipedrive)
- **Deploy:** mesmo Cloudflare Pages (savior-lps)
- **Identidade visual:** tokens Savior (navy, green, cream, Inter)

### Rota
- `/admin` — login
- Após login: SPA com navegação interna (Dashboard, Agendamentos, Leads, Candidaturas, Config)

### Fontes de dados

| Módulo | Fonte | Método |
|---|---|---|
| Dashboard KPIs | stats-api worker | GET /stats-data.json |
| Dashboard horário | Google Ads + Blip via stats-api | Mesmo endpoint (extender se necessário) |
| Agendamentos | Supabase `savior_bookings` | Client direto (RLS) |
| Hospitais | Supabase `savior_hospitals` | Client direto |
| Leads Pipedrive | stats-api worker | Novo endpoint /leads |
| Candidaturas | Supabase nova tabela `savior_candidates` | Client direto |

## Módulo 1: Dashboard

### KPIs principais (cards no topo)
- Conversões hoje (parcial) / semana / CPA
- Sessões GA4 hoje / semana
- Tickets Blip hoje / semana
- Agendamentos pendentes (Supabase)

### Gráficos
- Pipeline diário (7 dias): impressões, cliques, conversões
- Distribuição horária Ads × Blip (barras cruzadas)
- Conversões por campanha (donut/bar)

### Dados
- Consumir stats-api worker existente
- Auto-refresh a cada 5 min

## Módulo 2: Agendamentos

### Tabela principal
- Colunas: data/hora, paciente, origem, destino (hospital), tipo ambulância, status, pagamento
- Filtros: status (pendente/confirmado/realizado/cancelado), data, tipo
- Ações: alterar status, atribuir equipe, adicionar observação

### Status workflow
pendente → confirmado → em_rota → realizado
pendente → cancelado

### Detalhe do agendamento
- Modal/drawer com todos os dados do booking
- Histórico de mudanças de status
- Botão WhatsApp direto pro contato

## Módulo 3: Leads

### Tabela de leads (Pipedrive)
- Colunas: data, nome, telefone, origem (página), campanha UTM, pipeline, status deal
- Filtros: pipeline, período, origem
- Link direto pro deal no Pipedrive

### Candidaturas (Trabalhe Conosco)
- Tab separada
- Colunas: data, nome, cargo, estado, email, currículo (link download)
- Status: novo, analisado, entrevista, aprovado, rejeitado

## Módulo 4: Configurações

- Gerenciar hospitais (ativar/desativar, editar dados)
- Gerenciar regiões
- Ver status dos workers

## Auth & Segurança

- Supabase Auth com email/password
- Criar usuário admin inicial: admin@savior.com.br
- RLS em todas as tabelas (authenticated only)
- Página /admin sem SSR (client-only React), dados protegidos por auth + RLS

## Banco de dados (novas tabelas Supabase)

### savior_candidates
- id, created_at, name, whatsapp, email, state (RJ/SP), position, registry, linkedin, cv_url, experience, status (novo/analisado/entrevista/aprovado/rejeitado)

### savior_bookings (já existe, adicionar)
- status (pendente/confirmado/em_rota/realizado/cancelado)
- assigned_team (text)
- status_history (jsonb)
- admin_notes (text)

## UI/UX

- Sidebar fixa com navegação (ícones + labels)
- Header com nome do usuário logado
- Paleta Savior: navy (#0B2540) bg, green (#00B87C) accent, cream (#F4EFE6) cards
- Font: Inter (já carregada no site)
- Responsivo (funciona em tablet da central)
- Loading skeletons nos dados
- Toast notifications pra ações

## Fora de escopo (v1)

- Edição de leads no Pipedrive (read-only, link pro Pipedrive)
- Chat/mensagens Blip dentro do admin
- Relatórios PDF exportáveis
- Multi-tenant / permissões granulares
