# Savior Platform — Protótipo 3 Dias

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional prototype of the Savior operational platform in 3 days to demonstrate to Rodrigo that the R$300/month infrastructure investment is worth it. Must show: login, dashboard shell, vehicle panel with real-ish data, chamados list, and map with VTR positions.

**Architecture:** Next.js 15 App Router inside `savior-lps/platform/`. Supabase for auth + database. Mock data seeded for demo. No TDD for prototype speed — tests come in production phase.

**Tech Stack:** Next.js 15, TypeScript 5, Tailwind CSS 4, Supabase (Auth + RLS), Leaflet (map), Lucide React (icons)

**Supabase project:** `vaoolcqccxvxvacyepen.supabase.co` (existing)

**Verification:** `cd platform && npm run build` (type check + build), `npm run dev` (localhost:3000)

**Base plan reference:** `docs/superpowers/plans/2026-08-19-savior-platform-foundation.md` — Tasks 1-8 of Sprint 0 contain all the detailed code. This prototype plan references that code and adds demo-specific tasks.

---

## File Structure

### From base plan (Sprint 0, Tasks 1-5):
All files from Tasks 1-5 of the base plan. See that document for exact code.

### Prototype-specific additions:

| File | Responsibility |
|------|---------------|
| `platform/lib/mock-data.ts` | Mock VTRs, chamados, condutores for demo |
| `platform/app/(dashboard)/frota/page.tsx` | Fleet list (vehicles grid) |
| `platform/app/(dashboard)/frota/[id]/page.tsx` | Vehicle detail panel (the star of the demo) |
| `platform/app/(dashboard)/chamados/page.tsx` | Chamados list with status badges |
| `platform/app/(dashboard)/chamados/[id]/page.tsx` | Chamado detail with timeline |
| `platform/app/(dashboard)/mapa/page.tsx` | Leaflet map with VTR markers |
| `platform/components/frota/vtr-card.tsx` | Vehicle card component |
| `platform/components/frota/vtr-detail-tabs.tsx` | Tabs: info, manutenção, checklist, pneus |
| `platform/components/chamados/chamado-card.tsx` | Chamado list item |
| `platform/components/chamados/chamado-timeline.tsx` | Status timeline |
| `platform/components/mapa/mapa-leaflet.tsx` | Client-side Leaflet map |

---

## Task 1: Project scaffold (from base plan Tasks 1-2)

Execute Tasks 1 and 2 from `2026-08-19-savior-platform-foundation.md` exactly as written:
- package.json, next.config.ts, tsconfig.json, .gitignore, .env.local.example
- Tailwind config with OKLCH tokens, postcss, globals.css with fonts
- `npm install && npm run build` to verify

**Commit:** `feat: scaffold Next.js platform project with Tailwind tokens`

---

## Task 2: Supabase schema — core tables (from base plan Task 3)

Run migrations 001-009 and 013 from the base plan in Supabase SQL Editor:
- 001_operador, 002_roles_auth, 003_pagador, 004_prestador
- 005_vtr, 006_condutor, 007_equipe, 008_chamado
- 009_documento
- 013_seed_savior (seed Savior as operator #1)

Skip 010 (checklist), 011 (ficha_medica), 012 (mensagem) for prototype.

**Verification:** Tables visible in Supabase dashboard, RLS policies active.

---

## Task 3: Supabase client + auth helpers (from base plan Tasks 4-5)

Execute Tasks 4 and 5 from the base plan:
- `lib/supabase/client.ts` (browser client)
- `lib/supabase/server.ts` (server client with cookies)
- `lib/supabase/middleware.ts` (auth helper)
- `middleware.ts` (Next.js auth guard)
- `types/database.ts` and `types/enums.ts`
- Login page at `app/(auth)/login/page.tsx`

Create a test user in Supabase dashboard: `marcelo@savior.com.br` with role `admin`.

**Commit:** `feat: Supabase auth + login page`

---

## Task 4: Layout shell — rail nav + header (from base plan Tasks 6-7)

Execute Tasks 6 and 7 from the base plan:
- `components/layout/rail-nav.tsx` — collapsible rail with icons
- `components/layout/header.tsx` — top bar with user info
- `components/layout/user-menu.tsx` — dropdown
- `app/(dashboard)/layout.tsx` — dashboard layout
- `app/(auth)/layout.tsx` — auth layout (centered)

Nav items: Dashboard, Chamados, Frota, Mapa, Configurações

**Commit:** `feat: dashboard layout shell with rail nav`

---

## Task 5: Mock data + seed

**Files:**
- Create: `platform/lib/mock-data.ts`

- [ ] **Step 1: Create mock data file with realistic Savior data**

```typescript
// platform/lib/mock-data.ts
// Mock data for prototype demo — will be replaced by Supabase queries

export const mockVtrs = [
  { id: '1', placa: 'LSJ-4F60', tipo: 'uti' as const, status: 'disponivel' as const, modelo: 'Renault Master 2.3', ano: 2024, km_atual: 45200, latitude: -22.9068, longitude: -43.1729, equipe: 'Dr. Silva + Enf. Santos + Mot. Oliveira' },
  { id: '2', placa: 'RIO-2A35', tipo: 'basica' as const, status: 'em_atendimento' as const, modelo: 'Mercedes Sprinter 415', ano: 2023, km_atual: 67800, latitude: -22.9519, longitude: -43.2106, equipe: 'Enf. Costa + Mot. Pereira' },
  { id: '3', placa: 'KQZ-8B12', tipo: 'uti' as const, status: 'manutencao' as const, modelo: 'Renault Master 2.3', ano: 2025, km_atual: 12300, latitude: -22.8965, longitude: -43.1797, equipe: null },
  { id: '4', placa: 'TTZ-4H46', tipo: 'basica' as const, status: 'disponivel' as const, modelo: 'Renault Master 2.3', ano: 2025, km_atual: 68000, latitude: -22.9352, longitude: -43.1762, equipe: 'Tec. Almeida + Mot. Souza' },
  { id: '5', placa: 'TUH-3A27', tipo: 'uti' as const, status: 'em_atendimento' as const, modelo: 'Renault Master 2.3', ano: 2025, km_atual: 51000, latitude: -23.5505, longitude: -46.6333, equipe: 'Dr. Lima + Enf. Rocha + Mot. Ferreira' },
  { id: '6', placa: 'QRP-5D88', tipo: 'basica' as const, status: 'disponivel' as const, modelo: 'Mercedes Sprinter 415', ano: 2022, km_atual: 98500, latitude: -22.9110, longitude: -43.2095, equipe: 'Enf. Martins + Mot. Barbosa' },
  { id: '7', placa: 'LMN-7G33', tipo: 'neonatal' as const, status: 'disponivel' as const, modelo: 'Renault Master 2.3', ano: 2024, km_atual: 32100, latitude: -22.9035, longitude: -43.1756, equipe: 'Dr. Mendes + Enf. Cardoso + Mot. Ribeiro' },
  { id: '8', placa: 'XYZ-1C99', tipo: 'uti' as const, status: 'inativa' as const, modelo: 'Fiat Ducato', ano: 2020, km_atual: 145000, latitude: -22.8965, longitude: -43.1797, equipe: null },
];

export const mockChamados = [
  { id: '1', numero: 4521, status: 'em_transito' as const, servico: 'uti' as const, canal: 'whatsapp' as const, paciente_nome: 'Maria da Silva', solicitante_nome: 'João Silva (filho)', origem: 'R. Voluntários da Pátria, 190 — Botafogo', destino: 'Hospital Copa D\'Or — Copacabana', vtr_placa: 'LSJ-4F60', valor_cotado: 1800, created_at: '2026-08-21T10:15:00Z', eta_minutos: 12 },
  { id: '2', numero: 4520, status: 'aprovado' as const, servico: 'basica' as const, canal: 'telefone' as const, paciente_nome: 'Carlos Mendes', solicitante_nome: 'SulAmérica Saúde', origem: 'Hospital Samaritano — Botafogo', destino: 'Clínica São Lucas — Tijuca', vtr_placa: null, valor_cotado: 950, created_at: '2026-08-21T09:45:00Z', eta_minutos: null },
  { id: '3', numero: 4519, status: 'concluido' as const, servico: 'uti' as const, canal: 'whatsapp' as const, paciente_nome: 'Ana Beatriz Lopes', solicitante_nome: 'Prevent Senior', origem: 'R. das Laranjeiras, 488 — Laranjeiras', destino: 'Hospital Barra D\'Or — Barra', vtr_placa: 'RIO-2A35', valor_cotado: 2200, created_at: '2026-08-21T08:30:00Z', eta_minutos: null },
  { id: '4', numero: 4518, status: 'aberto' as const, servico: 'basica' as const, canal: 'site' as const, paciente_nome: 'Roberto Farias', solicitante_nome: 'Roberto Farias', origem: 'Av. Brasil, 4365 — Manguinhos', destino: 'A definir', vtr_placa: null, valor_cotado: null, created_at: '2026-08-21T10:32:00Z', eta_minutos: null },
  { id: '5', numero: 4517, status: 'cancelado' as const, servico: 'remocao' as const, canal: 'whatsapp' as const, paciente_nome: 'Lucia Tavares', solicitante_nome: 'Amil', origem: 'Hospital Municipal Salgado Filho — Méier', destino: 'Hospital Vitória — Barra', vtr_placa: null, valor_cotado: 1500, created_at: '2026-08-21T07:20:00Z', eta_minutos: null },
  { id: '6', numero: 4516, status: 'concluido' as const, servico: 'basica' as const, canal: 'telefone' as const, paciente_nome: 'Pedro Augusto', solicitante_nome: 'Bradesco Saúde', origem: 'R. São Clemente, 226 — Botafogo', destino: 'Hospital Adventista Silvestre — Cosme Velho', vtr_placa: 'QRP-5D88', valor_cotado: 750, created_at: '2026-08-20T22:15:00Z', eta_minutos: null },
];

export const mockManutencoes = [
  { id: '1', vtr_id: '3', tipo: 'corretiva', descricao: 'Retífica de motor completo', status: 'em_andamento', prioridade: 'alta', fornecedor: 'Sol Nascente Auto', valor: 8300, created_at: '2026-08-15T10:00:00Z' },
  { id: '2', vtr_id: '1', tipo: 'preventiva', descricao: 'Troca de óleo + filtros (revisão 45K)', status: 'agendada', prioridade: 'media', fornecedor: 'Oficina Central Savior', valor: 650, created_at: '2026-08-20T14:00:00Z' },
  { id: '3', vtr_id: '8', tipo: 'corretiva', descricao: 'Substituição do câmbio automático', status: 'aguardando_peca', prioridade: 'alta', fornecedor: 'Navarro Transmissões', valor: 12500, created_at: '2026-08-10T08:00:00Z' },
];

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  disponivel: { bg: 'bg-green/10', text: 'text-green', label: 'Disponível' },
  em_atendimento: { bg: 'bg-amber/10', text: 'text-amber', label: 'Em atendimento' },
  manutencao: { bg: 'bg-alert/10', text: 'text-alert', label: 'Manutenção' },
  inativa: { bg: 'bg-cream-dark/30', text: 'text-navy-soft', label: 'Inativa' },
  aberto: { bg: 'bg-green-bright/10', text: 'text-green', label: 'Aberto' },
  em_cotacao: { bg: 'bg-amber/10', text: 'text-amber', label: 'Em cotação' },
  aprovado: { bg: 'bg-green/10', text: 'text-green-dark', label: 'Aprovado' },
  despacho: { bg: 'bg-amber/10', text: 'text-amber', label: 'Despacho' },
  em_transito: { bg: 'bg-green-bright/10', text: 'text-green-bright', label: 'Em trânsito' },
  no_local: { bg: 'bg-green/10', text: 'text-green', label: 'No local' },
  em_transporte: { bg: 'bg-amber/10', text: 'text-amber', label: 'Em transporte' },
  concluido: { bg: 'bg-navy-soft/10', text: 'text-navy-soft', label: 'Concluído' },
  cancelado: { bg: 'bg-alert/10', text: 'text-alert', label: 'Cancelado' },
};
```

**Commit:** `feat: add mock data for prototype demo`

---

## Task 6: Frota — vehicle list + detail panel

**Files:**
- Create: `platform/app/(dashboard)/frota/page.tsx`
- Create: `platform/app/(dashboard)/frota/[id]/page.tsx`
- Create: `platform/components/frota/vtr-card.tsx`

- [ ] **Step 1: Create VTR card component** — shows placa, tipo, status badge, modelo, km, equipe
- [ ] **Step 2: Create frota list page** — grid of VTR cards with status filter chips (Todas, Disponível, Em atendimento, Manutenção)
- [ ] **Step 3: Create VTR detail page** — hero card with vehicle info + tabs (Informações, Manutenções, Checklist, Documentos). Manutenções tab shows the mockManutencoes data in a timeline. Checklist and Documentos show "Em breve" placeholder.
- [ ] **Step 4: Link cards to detail page** — clicking a VTR card navigates to `/frota/[id]`

**Commit:** `feat: frota list + vehicle detail panel`

---

## Task 7: Chamados — list + detail

**Files:**
- Create: `platform/app/(dashboard)/chamados/page.tsx`
- Create: `platform/app/(dashboard)/chamados/[id]/page.tsx`
- Create: `platform/components/chamados/chamado-card.tsx`

- [ ] **Step 1: Create chamado card** — shows número, status badge, paciente, origem→destino, VTR, valor, time ago
- [ ] **Step 2: Create chamados list page** — cards sorted by created_at desc, with status filter tabs (Todos, Abertos, Em andamento, Concluídos)
- [ ] **Step 3: Create chamado detail page** — full info with status timeline (vertical dots), patient info, addresses, VTR assigned, valor
- [ ] **Step 4: Link cards to detail** — clicking navigates to `/chamados/[id]`

**Commit:** `feat: chamados list + detail with timeline`

---

## Task 8: Mapa — Leaflet with VTR positions

**Files:**
- Create: `platform/components/mapa/mapa-leaflet.tsx`
- Create: `platform/app/(dashboard)/mapa/page.tsx`

- [ ] **Step 1: Install leaflet** — `npm install leaflet react-leaflet @types/leaflet`
- [ ] **Step 2: Create MapaLeaflet client component** — `'use client'`, dynamic import with ssr:false, shows Rio de Janeiro centered (-22.9068, -43.1729), zoom 12. VTR markers with custom ambulance icon colored by status. Popup shows placa + tipo + status + equipe.
- [ ] **Step 3: Create mapa page** — full height map with VTR count overlay. Filter buttons: Todas, UTI, Básica, Neonatal.
- [ ] **Step 4: Add Leaflet CSS** — import in globals.css or via link tag

**Commit:** `feat: mapa with VTR positions on Leaflet`

---

## Task 9: Dashboard home — KPIs overview

**Files:**
- Create: `platform/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create dashboard page** with KPI cards:
  - Chamados hoje: 6 (from mock)
  - VTRs disponíveis: 4/8
  - Em atendimento: 2
  - Tempo médio de resposta: 14 min
- [ ] **Step 2: Add recent chamados list** — last 5 chamados below KPIs
- [ ] **Step 3: Add fleet status mini** — horizontal bar showing disponível/em_atendimento/manutenção/inativa counts

**Commit:** `feat: dashboard home with KPIs and recent activity`

---

## Task 10: Polish + demo prep

- [ ] **Step 1: Verify all pages render** — dev server, click through every route
- [ ] **Step 2: Fix any Tailwind/layout issues** — responsive check
- [ ] **Step 3: Add loading states** — skeleton cards or spinners where needed
- [ ] **Step 4: Final commit and build test**

```bash
cd platform && npm run build
```

**Commit:** `chore: polish prototype for demo`

---

## Execution Order

| Day | Tasks | Deliverable |
|-----|-------|------------|
| 1 (21/08) | 1, 2, 3, 4, 5 | Login + shell + mock data |
| 2 (22/08) | 6, 7 | Frota + Chamados |
| 3 (23/08) | 8, 9, 10 | Mapa + Dashboard + Polish |
