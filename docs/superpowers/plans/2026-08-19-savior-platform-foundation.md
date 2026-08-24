# Savior Platform Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the technical foundation of the Savior operational platform inside `/platform` — a Next.js App Router application with Supabase multi-operator schema, role-based auth, and the base layout shell. This replaces the current Blip + Pipedrive + spreadsheet stack.

**Architecture:** Standalone Next.js 15 app in `savior-lps/platform/` sharing the same git repo but fully independent from the Astro LP site. Uses the existing Supabase project (`vaoolcqccxvxvacyepen.supabase.co`) with new tables. Multi-operator from day one via `operador_id` foreign key + RLS on every table.

**Tech Stack:** Next.js 15 (App Router), TypeScript 5, Tailwind CSS 4, Framer Motion, Supabase (Auth + RLS + Storage + Realtime), Leaflet + OSRM (Sprint 3), Vitest + Testing Library

**Design System:** Bricolage Grotesque (display) + Hanken Grotesk (body) + JetBrains Mono (numbers). Colors in OKLCH: Navy oklch(0.29 0.058 256), Green oklch(0.68 0.14 168), Cream #F4EFE6. No Inter. No gradient text. No glow neon.

**Supabase project:** `vaoolcqccxvxvacyepen.supabase.co` (same as LP admin panel)

**Verification:** `cd platform && npm run test` (Vitest), `npm run build` (type check + build), `npm run dev` (manual smoke test on localhost:3000)

---

## File Structure

### New files to create (Sprint 0):

| File | Responsibility |
|------|---------------|
| `platform/package.json` | Next.js project manifest |
| `platform/next.config.ts` | Next.js config |
| `platform/tsconfig.json` | TypeScript config |
| `platform/tailwind.config.ts` | Tailwind with Savior platform tokens (OKLCH) |
| `platform/postcss.config.js` | PostCSS for Tailwind |
| `platform/app/globals.css` | Tailwind directives + font imports + CSS variables |
| `platform/app/layout.tsx` | Root layout (fonts, metadata) |
| `platform/app/(auth)/login/page.tsx` | Login page |
| `platform/app/(auth)/layout.tsx` | Auth layout (centered, no sidebar) |
| `platform/app/(dashboard)/layout.tsx` | Dashboard layout (rail nav + main) |
| `platform/app/(dashboard)/page.tsx` | Dashboard home (redirect to chamados) |
| `platform/app/(dashboard)/chamados/page.tsx` | Placeholder chamados list |
| `platform/app/(dashboard)/atendimento/page.tsx` | Placeholder atendimento |
| `platform/app/(dashboard)/mapa/page.tsx` | Placeholder mapa |
| `platform/app/(dashboard)/configuracoes/page.tsx` | Placeholder config |
| `platform/components/ui/button.tsx` | Button component |
| `platform/components/ui/input.tsx` | Input component |
| `platform/components/ui/badge.tsx` | Badge/status component |
| `platform/components/ui/card.tsx` | Card component |
| `platform/components/layout/rail-nav.tsx` | Rail navigation (icons + labels) |
| `platform/components/layout/header.tsx` | Top header bar |
| `platform/components/layout/user-menu.tsx` | User dropdown menu |
| `platform/lib/supabase/client.ts` | Browser Supabase client |
| `platform/lib/supabase/server.ts` | Server-side Supabase client (cookies) |
| `platform/lib/supabase/middleware.ts` | Auth middleware helper |
| `platform/middleware.ts` | Next.js middleware (auth guard) |
| `platform/types/database.ts` | Supabase generated types |
| `platform/types/enums.ts` | Shared enums (roles, status, etc.) |
| `platform/.env.local.example` | Environment variables template |
| `platform/.gitignore` | Next.js gitignore |
| `platform/vitest.config.ts` | Vitest config |
| `platform/__tests__/setup.ts` | Test setup file |

### SQL migrations (run in Supabase dashboard or via CLI):

| Migration | Responsibility |
|-----------|---------------|
| `001_operador.sql` | `operador` table + RLS |
| `002_roles_auth.sql` | `usuario_perfil` table linking auth.users to operador + role |
| `003_pagador.sql` | `pagador` table + RLS |
| `004_prestador.sql` | `prestador` table + RLS |
| `005_vtr.sql` | `vtr` table + RLS |
| `006_condutor.sql` | `condutor` table + RLS |
| `007_equipe.sql` | `equipe` table + RLS |
| `008_chamado.sql` | `chamado` table + RLS |
| `009_documento.sql` | `documento` table + RLS |
| `010_checklist.sql` | `checklist_modelo` + `checklist_execucao` tables + RLS |
| `011_ficha_medica.sql` | `ficha_medica` table + RLS |
| `012_mensagem.sql` | `mensagem` table (WhatsApp) + RLS |
| `013_seed_savior.sql` | Seed Savior as operator #1 + admin user |

### Files to modify:

| File | Change |
|------|--------|
| `savior-lps/.gitignore` | Add `platform/.next/`, `platform/node_modules/`, `platform/.env.local` |

---

## Sprint 0: Technical Foundation

### Task 1: Project scaffold + package.json

**Files:**
- Create: `platform/package.json`, `platform/next.config.ts`, `platform/tsconfig.json`, `platform/.gitignore`, `platform/.env.local.example`

- [ ] **Step 1: Create platform/package.json**

```json
{
  "name": "savior-platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.6.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.475.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.5.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^26.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.3.0"
  }
}
```

- [ ] **Step 2: Create platform/next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output for optimized Docker/Vercel deploys
  output: 'standalone',

  // Strict React mode for development
  reactStrictMode: true,

  // External packages that should not be bundled server-side
  serverExternalPackages: [],

  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vaoolcqccxvxvacyepen.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create platform/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create platform/.gitignore**

```
.next/
node_modules/
.env.local
.env.*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 5: Create platform/.env.local.example**

```
NEXT_PUBLIC_SUPABASE_URL=https://vaoolcqccxvxvacyepen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

- [ ] **Step 6: Update root .gitignore**

Add to `savior-lps/.gitignore`:
```
# Platform
platform/.next/
platform/node_modules/
platform/.env.local
platform/.env.*.local
```

- [ ] **Step 7: Run `cd platform && npm install` and verify build**

```bash
cd platform && npm install && npx next build
```

---

### Task 2: Tailwind config + design system tokens

**Files:**
- Create: `platform/tailwind.config.ts`, `platform/postcss.config.js`, `platform/app/globals.css`

- [ ] **Step 1: Create platform/postcss.config.js**

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 2: Create platform/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'oklch(0.29 0.058 256)',
          deep: 'oklch(0.22 0.045 256)',
          mid: 'oklch(0.37 0.06 256)',
          soft: 'oklch(0.42 0.055 256)',
        },
        green: {
          DEFAULT: 'oklch(0.68 0.14 168)',
          dark: 'oklch(0.55 0.12 168)',
          bright: 'oklch(0.76 0.15 168)',
        },
        cream: {
          DEFAULT: '#F4EFE6',
          light: '#FAF6EC',
          dark: '#E8DFCC',
        },
        alert: {
          DEFAULT: 'oklch(0.58 0.18 25)',
          light: 'oklch(0.92 0.04 25)',
        },
        amber: {
          DEFAULT: 'oklch(0.75 0.15 75)',
          light: 'oklch(0.93 0.04 75)',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        'body-xs': ['0.6875rem', { lineHeight: '1.4' }],
        'mono-lg': ['1rem', { lineHeight: '1.5' }],
        'mono-md': ['0.875rem', { lineHeight: '1.5' }],
        'mono-sm': ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        lg: '10px',
        xl: '16px',
      },
      spacing: {
        'rail': '72px',
        'rail-expanded': '240px',
      },
      boxShadow: {
        'card': '0 1px 3px oklch(0.29 0.058 256 / 0.08)',
        'card-hover': '0 4px 12px oklch(0.29 0.058 256 / 0.12)',
        'dropdown': '0 8px 24px oklch(0.29 0.058 256 / 0.15)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Create platform/app/globals.css**

```css
@import 'tailwindcss';

/* Bricolage Grotesque — display headings */
@font-face {
  font-family: 'Bricolage Grotesque';
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/bricolagegrotesque/v10/3y9U6as8bTXq_nANBjzKo3IeZx8z6up5BeSl5jBNz_19PcbfJFkO0GiPahY.woff2') format('woff2');
}

/* Hanken Grotesk — body text */
@font-face {
  font-family: 'Hanken Grotesk';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/hankengrotesk/v18/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_Ncs2d4K7w.woff2') format('woff2');
}

/* JetBrains Mono — numbers and code */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 100 800;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/jetbrainsmono/v21/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2') format('woff2');
}

@layer base {
  :root {
    --rail-width: 72px;
    --rail-expanded: 240px;
    --header-height: 56px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: 'Hanken Grotesk', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Focus visible for accessibility */
  :focus-visible {
    outline: 2px solid oklch(0.68 0.14 168);
    outline-offset: 2px;
    border-radius: 4px;
  }
}

@layer utilities {
  .font-mono-num {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
  }
}
```

Note: Font files should be self-hosted in production. For Sprint 0, Google Fonts CDN URLs are acceptable. Before production deploy, download woff2 files into `platform/public/fonts/` and update the `src:` paths to `/fonts/...`.

---

### Task 3: Supabase schema — core tables with RLS

**Files:**
- SQL migrations to run in Supabase dashboard (SQL Editor)

- [ ] **Step 1: Migration 001 — operador table**

```sql
-- 001_operador.sql
-- Core operator table. Every other table references operador_id.

create table if not exists public.operador (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nome text not null,
  cnpj text unique,
  marca text,
  logo_url text,
  cor_primaria text default 'oklch(0.29 0.058 256)',
  cor_acento text default 'oklch(0.68 0.14 168)',
  config_integracoes jsonb default '{}'::jsonb,
  ativo boolean not null default true
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger operador_updated_at
  before update on public.operador
  for each row execute function public.set_updated_at();

-- RLS
alter table public.operador enable row level security;

-- Authenticated users can read operators they belong to
create policy "Users read own operator"
  on public.operador for select
  using (
    id in (
      select operador_id from public.usuario_perfil
      where user_id = auth.uid()
    )
  );

-- Only admin role can update operator
create policy "Admin updates operator"
  on public.operador for update
  using (
    id in (
      select operador_id from public.usuario_perfil
      where user_id = auth.uid() and papel = 'admin'
    )
  );
```

- [ ] **Step 2: Migration 002 — user profile with roles**

```sql
-- 002_roles_auth.sql
-- Links auth.users to an operator + role

create type public.papel_usuario as enum (
  'admin',
  'gestor',
  'supervisor',
  'atendente',
  'motorista',
  'enfermagem'
);

create table if not exists public.usuario_perfil (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operador_id uuid not null references public.operador(id) on delete cascade,
  papel public.papel_usuario not null default 'atendente',
  nome_exibicao text,
  avatar_url text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, operador_id)
);

create trigger usuario_perfil_updated_at
  before update on public.usuario_perfil
  for each row execute function public.set_updated_at();

-- RLS
alter table public.usuario_perfil enable row level security;

create policy "Users read own profile"
  on public.usuario_perfil for select
  using (user_id = auth.uid());

create policy "Users read same operator profiles"
  on public.usuario_perfil for select
  using (
    operador_id in (
      select operador_id from public.usuario_perfil
      where user_id = auth.uid()
    )
  );

create policy "Admin manages profiles"
  on public.usuario_perfil for all
  using (
    operador_id in (
      select operador_id from public.usuario_perfil
      where user_id = auth.uid() and papel = 'admin'
    )
  );

-- Helper function: get current user's operador_id (used in RLS policies)
create or replace function public.current_operador_id()
returns uuid as $$
  select operador_id from public.usuario_perfil
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;
```

- [ ] **Step 3: Migration 003 — pagador table**

```sql
-- 003_pagador.sql

create type public.pagador_tipo as enum ('particular', 'convenio', 'hospital', 'empresa');

create table if not exists public.pagador (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  tipo public.pagador_tipo not null,
  nome text not null,
  cnpj text,
  cpf text,
  contato_nome text,
  contato_telefone text,
  contato_email text,
  dados_faturamento jsonb default '{}'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pagador_updated_at
  before update on public.pagador
  for each row execute function public.set_updated_at();

alter table public.pagador enable row level security;

create policy "Operator isolation"
  on public.pagador for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 4: Migration 004 — prestador table**

```sql
-- 004_prestador.sql

create table if not exists public.prestador (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  cnpj text,
  razao_social text not null,
  nome_fantasia text,
  cobertura_regioes text[] default '{}',
  rating numeric(3,2) default 0,
  comissao_percentual numeric(5,2) default 0,
  contato_nome text,
  contato_telefone text,
  contato_email text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger prestador_updated_at
  before update on public.prestador
  for each row execute function public.set_updated_at();

alter table public.prestador enable row level security;

create policy "Operator isolation"
  on public.prestador for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 5: Migration 005 — vtr table**

```sql
-- 005_vtr.sql

create type public.vtr_tipo as enum ('basica', 'uti', 'neonatal', 'aereo', 'moto');
create type public.vtr_status as enum ('disponivel', 'em_atendimento', 'manutencao', 'inativa');

create table if not exists public.vtr (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  prestador_id uuid references public.prestador(id),
  placa text not null,
  tipo public.vtr_tipo not null,
  status public.vtr_status not null default 'disponivel',
  modelo text,
  ano integer,
  km_atual integer,
  latitude numeric(10,7),
  longitude numeric(10,7),
  ultima_posicao_at timestamptz,
  telemetria_ref text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger vtr_updated_at
  before update on public.vtr
  for each row execute function public.set_updated_at();

alter table public.vtr enable row level security;

create policy "Operator isolation"
  on public.vtr for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 6: Migration 006 — condutor table**

```sql
-- 006_condutor.sql

create table if not exists public.condutor (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  prestador_id uuid references public.prestador(id),
  user_id uuid references auth.users(id),
  nome text not null,
  cpf text,
  cnh text,
  cnh_categoria text,
  cnh_vencimento date,
  telefone text,
  score_comportamental numeric(3,1) default 5.0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger condutor_updated_at
  before update on public.condutor
  for each row execute function public.set_updated_at();

alter table public.condutor enable row level security;

create policy "Operator isolation"
  on public.condutor for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 7: Migration 007 — equipe table**

```sql
-- 007_equipe.sql

create type public.equipe_funcao as enum ('enfermeiro', 'tecnico_enfermagem', 'medico', 'socorrista');

create table if not exists public.equipe (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  user_id uuid references auth.users(id),
  nome text not null,
  funcao public.equipe_funcao not null,
  conselho text,
  registro_conselho text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger equipe_updated_at
  before update on public.equipe
  for each row execute function public.set_updated_at();

alter table public.equipe enable row level security;

create policy "Operator isolation"
  on public.equipe for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 8: Migration 008 — chamado table**

```sql
-- 008_chamado.sql

create type public.chamado_canal as enum ('whatsapp', 'telefone', 'site', 'app', 'email', 'manual');
create type public.chamado_status as enum (
  'aberto',
  'em_cotacao',
  'aprovado',
  'despacho',
  'em_transito',
  'no_local',
  'em_transporte',
  'concluido',
  'cancelado'
);
create type public.chamado_servico as enum ('uti', 'basica', 'neonatal', 'remocao', 'evento', 'cobertura');

create table if not exists public.chamado (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  numero serial,
  canal public.chamado_canal not null default 'whatsapp',
  status public.chamado_status not null default 'aberto',
  servico public.chamado_servico,
  pagador_tipo public.pagador_tipo,
  pagador_id uuid references public.pagador(id),
  prestador_id uuid references public.prestador(id),
  vtr_id uuid references public.vtr(id),
  condutor_id uuid references public.condutor(id),

  -- Paciente
  paciente_nome text,
  paciente_cpf text,
  paciente_telefone text,
  paciente_idade integer,

  -- Solicitante (quem ligou/mandou msg)
  solicitante_nome text,
  solicitante_telefone text,

  -- Enderecos
  origem_endereco text,
  origem_lat numeric(10,7),
  origem_lng numeric(10,7),
  destino_endereco text,
  destino_lat numeric(10,7),
  destino_lng numeric(10,7),

  -- Valores
  valor_cotado numeric(10,2),
  valor_final numeric(10,2),

  -- SLA
  sla_minutos integer,
  eta_minutos integer,

  -- Timestamps do workflow
  cotado_at timestamptz,
  aprovado_at timestamptz,
  despachado_at timestamptz,
  chegada_at timestamptz,
  concluido_at timestamptz,
  cancelado_at timestamptz,

  -- Atendente
  atendente_id uuid references public.usuario_perfil(id),

  -- Metadata
  observacoes text,
  tags text[] default '{}',
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger chamado_updated_at
  before update on public.chamado
  for each row execute function public.set_updated_at();

-- Indices for common queries
create index idx_chamado_operador_status on public.chamado(operador_id, status);
create index idx_chamado_operador_created on public.chamado(operador_id, created_at desc);
create index idx_chamado_vtr on public.chamado(vtr_id) where vtr_id is not null;

alter table public.chamado enable row level security;

create policy "Operator isolation"
  on public.chamado for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 9: Migration 009 — documento table**

```sql
-- 009_documento.sql

create type public.documento_tipo as enum (
  'cnh', 'crlv', 'alvara', 'licenca_samu', 'contrato',
  'apolice_seguro', 'laudo_vistoria', 'certificado', 'foto', 'outro'
);

create table if not exists public.documento (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  entidade_tipo text not null, -- 'vtr', 'condutor', 'equipe', 'prestador', 'operador'
  entidade_id uuid not null,
  tipo public.documento_tipo not null,
  nome text not null,
  arquivo_url text,
  arquivo_path text, -- Supabase Storage path
  validade date,
  alerta_dias integer default 30, -- Days before expiry to alert
  verificado boolean default false,
  verificado_por uuid references public.usuario_perfil(id),
  verificado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger documento_updated_at
  before update on public.documento
  for each row execute function public.set_updated_at();

create index idx_documento_entidade on public.documento(entidade_tipo, entidade_id);
create index idx_documento_validade on public.documento(validade) where validade is not null;

alter table public.documento enable row level security;

create policy "Operator isolation"
  on public.documento for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 10: Migration 010 — checklist tables**

```sql
-- 010_checklist.sql

create table if not exists public.checklist_modelo (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  nome text not null,
  descricao text,
  tipo text not null, -- 'vtr_saida', 'vtr_retorno', 'equipamento', 'turno'
  itens jsonb not null default '[]'::jsonb,
  -- itens: [{ "id": "uuid", "texto": "...", "obrigatorio": true, "tipo": "check|foto|numero|texto" }]
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger checklist_modelo_updated_at
  before update on public.checklist_modelo
  for each row execute function public.set_updated_at();

create table if not exists public.checklist_execucao (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  modelo_id uuid not null references public.checklist_modelo(id),
  vtr_id uuid references public.vtr(id),
  condutor_id uuid references public.condutor(id),
  chamado_id uuid references public.chamado(id),
  respostas jsonb not null default '[]'::jsonb,
  -- respostas: [{ "item_id": "uuid", "valor": true|"texto"|123, "foto_url": "...", "at": "..." }]
  pendencias text[] default '{}',
  concluido boolean not null default false,
  concluido_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.checklist_modelo enable row level security;
alter table public.checklist_execucao enable row level security;

create policy "Operator isolation"
  on public.checklist_modelo for all
  using (operador_id = public.current_operador_id());

create policy "Operator isolation"
  on public.checklist_execucao for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 11: Migration 011 — ficha_medica table**

```sql
-- 011_ficha_medica.sql

create table if not exists public.ficha_medica (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  chamado_id uuid not null references public.chamado(id),
  template_id text, -- Reference to a template model (future)

  -- Sinais vitais
  pa_sistolica integer,
  pa_diastolica integer,
  fc integer,
  fr integer,
  spo2 numeric(4,1),
  temperatura numeric(3,1),
  glasgow integer,
  dor_escala integer, -- 0-10

  -- Anamnese
  queixa_principal text,
  historia_doenca_atual text,
  alergias text,
  medicamentos_uso text,
  antecedentes text,

  -- Condutas
  condutas text,
  medicamentos_administrados jsonb default '[]'::jsonb,
  procedimentos jsonb default '[]'::jsonb,

  -- Evolucoes (timeline de registros)
  evolucoes jsonb default '[]'::jsonb,
  -- [{ "at": "2026-08-19T...", "autor_id": "uuid", "texto": "..." }]

  -- Envios
  envios jsonb default '[]'::jsonb,
  -- [{ "destino": "hospital@email.com", "at": "...", "metodo": "email|whatsapp" }]

  profissional_id uuid references public.equipe(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ficha_medica_updated_at
  before update on public.ficha_medica
  for each row execute function public.set_updated_at();

alter table public.ficha_medica enable row level security;

create policy "Operator isolation"
  on public.ficha_medica for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 12: Migration 012 — mensagem table (WhatsApp)**

```sql
-- 012_mensagem.sql

create type public.mensagem_direcao as enum ('entrada', 'saida');
create type public.mensagem_tipo as enum ('texto', 'imagem', 'audio', 'video', 'documento', 'localizacao', 'contato', 'template', 'interativo', 'sistema');

create table if not exists public.mensagem (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operador(id) on delete cascade,
  wa_message_id text unique, -- Meta's message ID
  conversa_telefone text not null, -- E.164 format: +5521980358200
  direcao public.mensagem_direcao not null,
  tipo public.mensagem_tipo not null default 'texto',
  conteudo text, -- Text body or caption
  media_url text,
  media_mime text,
  metadata jsonb default '{}'::jsonb, -- Raw Meta webhook payload
  chamado_id uuid references public.chamado(id),
  atendente_id uuid references public.usuario_perfil(id),
  lido boolean not null default false,
  lido_at timestamptz,
  erro text,
  created_at timestamptz not null default now()
);

create index idx_mensagem_conversa on public.mensagem(operador_id, conversa_telefone, created_at desc);
create index idx_mensagem_chamado on public.mensagem(chamado_id) where chamado_id is not null;
create index idx_mensagem_wa_id on public.mensagem(wa_message_id) where wa_message_id is not null;

alter table public.mensagem enable row level security;

create policy "Operator isolation"
  on public.mensagem for all
  using (operador_id = public.current_operador_id());
```

- [ ] **Step 13: Migration 013 — seed Savior as operator #1**

```sql
-- 013_seed_savior.sql
-- Run AFTER creating the admin user in Supabase Auth dashboard

-- Insert Savior as operator #1
insert into public.operador (id, nome, cnpj, marca, config_integracoes)
values (
  '00000000-0000-0000-0000-000000000001',
  'Savior Medical Service',
  '29.389.060/0001-90',
  'Savior',
  '{
    "whatsapp": {
      "phone_number_id": "",
      "display_phone": "+5521980358200",
      "verify_token": ""
    },
    "pipedrive": {
      "enabled": false
    }
  }'::jsonb
);

-- Link admin user (replace USER_ID_HERE with actual auth.users.id after creating user)
-- insert into public.usuario_perfil (user_id, operador_id, papel, nome_exibicao)
-- values ('USER_ID_HERE', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin Savior');
```

---

### Task 4: Supabase client setup + auth

**Files:**
- Create: `platform/lib/supabase/client.ts`, `platform/lib/supabase/server.ts`, `platform/lib/supabase/middleware.ts`, `platform/middleware.ts`, `platform/types/database.ts`, `platform/types/enums.ts`

- [ ] **Step 1: Create platform/types/enums.ts**

```typescript
export const PAPEIS = ['admin', 'gestor', 'supervisor', 'atendente', 'motorista', 'enfermagem'] as const;
export type Papel = (typeof PAPEIS)[number];

export const CHAMADO_STATUS = [
  'aberto', 'em_cotacao', 'aprovado', 'despacho',
  'em_transito', 'no_local', 'em_transporte', 'concluido', 'cancelado',
] as const;
export type ChamadoStatus = (typeof CHAMADO_STATUS)[number];

export const CHAMADO_CANAL = ['whatsapp', 'telefone', 'site', 'app', 'email', 'manual'] as const;
export type ChamadoCanal = (typeof CHAMADO_CANAL)[number];

export const CHAMADO_SERVICO = ['uti', 'basica', 'neonatal', 'remocao', 'evento', 'cobertura'] as const;
export type ChamadoServico = (typeof CHAMADO_SERVICO)[number];

export const VTR_TIPO = ['basica', 'uti', 'neonatal', 'aereo', 'moto'] as const;
export type VtrTipo = (typeof VTR_TIPO)[number];

export const VTR_STATUS = ['disponivel', 'em_atendimento', 'manutencao', 'inativa'] as const;
export type VtrStatus = (typeof VTR_STATUS)[number];

export const PAGADOR_TIPO = ['particular', 'convenio', 'hospital', 'empresa'] as const;
export type PagadorTipo = (typeof PAGADOR_TIPO)[number];

export const MENSAGEM_DIRECAO = ['entrada', 'saida'] as const;
export type MensagemDirecao = (typeof MENSAGEM_DIRECAO)[number];

export const MENSAGEM_TIPO = [
  'texto', 'imagem', 'audio', 'video', 'documento',
  'localizacao', 'contato', 'template', 'interativo', 'sistema',
] as const;
export type MensagemTipo = (typeof MENSAGEM_TIPO)[number];

// Status label and color mapping for UI
export const STATUS_CONFIG: Record<ChamadoStatus, { label: string; color: string }> = {
  aberto: { label: 'Aberto', color: 'bg-amber-light text-amber' },
  em_cotacao: { label: 'Em cotacao', color: 'bg-amber-light text-amber' },
  aprovado: { label: 'Aprovado', color: 'bg-green-bright/20 text-green-dark' },
  despacho: { label: 'Despacho', color: 'bg-green-bright/20 text-green-dark' },
  em_transito: { label: 'Em transito', color: 'bg-navy-soft/20 text-navy' },
  no_local: { label: 'No local', color: 'bg-navy-soft/20 text-navy' },
  em_transporte: { label: 'Em transporte', color: 'bg-navy-soft/20 text-navy' },
  concluido: { label: 'Concluido', color: 'bg-cream-dark text-navy-mid' },
  cancelado: { label: 'Cancelado', color: 'bg-alert-light text-alert' },
};
```

- [ ] **Step 2: Create platform/types/database.ts**

```typescript
// Placeholder — generate with `npx supabase gen types typescript` after migrations
// For now, manual types matching the schema above

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      operador: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          nome: string;
          cnpj: string | null;
          marca: string | null;
          logo_url: string | null;
          cor_primaria: string | null;
          cor_acento: string | null;
          config_integracoes: Json;
          ativo: boolean;
        };
        Insert: Omit<Database['public']['Tables']['operador']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['operador']['Insert']>;
      };
      usuario_perfil: {
        Row: {
          id: string;
          user_id: string;
          operador_id: string;
          papel: string;
          nome_exibicao: string | null;
          avatar_url: string | null;
          telefone: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuario_perfil']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['usuario_perfil']['Insert']>;
      };
      // Additional table types follow same pattern — generate with CLI
    };
    Functions: {
      current_operador_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      papel_usuario: 'admin' | 'gestor' | 'supervisor' | 'atendente' | 'motorista' | 'enfermagem';
      chamado_status: 'aberto' | 'em_cotacao' | 'aprovado' | 'despacho' | 'em_transito' | 'no_local' | 'em_transporte' | 'concluido' | 'cancelado';
      chamado_canal: 'whatsapp' | 'telefone' | 'site' | 'app' | 'email' | 'manual';
      chamado_servico: 'uti' | 'basica' | 'neonatal' | 'remocao' | 'evento' | 'cobertura';
      vtr_tipo: 'basica' | 'uti' | 'neonatal' | 'aereo' | 'moto';
      vtr_status: 'disponivel' | 'em_atendimento' | 'manutencao' | 'inativa';
      pagador_tipo: 'particular' | 'convenio' | 'hospital' | 'empresa';
      mensagem_direcao: 'entrada' | 'saida';
      mensagem_tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'documento' | 'localizacao' | 'contato' | 'template' | 'interativo' | 'sistema';
    };
  };
}
```

After running all migrations, regenerate with: `npx supabase gen types typescript --project-id vaoolcqccxvxvacyepen > platform/types/database.ts`

- [ ] **Step 3: Create platform/lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Create platform/lib/supabase/server.ts**

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from Server Component — ignore (middleware handles refresh)
          }
        },
      },
    },
  );
}
```

- [ ] **Step 5: Create platform/lib/supabase/middleware.ts**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/chamados';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 6: Create platform/middleware.ts**

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, etc.
     * - API webhook routes (unauthenticated)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|api/webhooks).*)',
  ],
};
```

---

### Task 5: Root layout + auth pages

**Files:**
- Create: `platform/app/layout.tsx`, `platform/app/(auth)/layout.tsx`, `platform/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create platform/app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Savior Platform',
    default: 'Savior Platform',
  },
  description: 'Plataforma operacional Savior Medical Service',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-cream text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create platform/app/(auth)/layout.tsx**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep">
      <div className="w-full max-w-sm mx-auto px-6">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create platform/app/(auth)/login/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email ou senha incorretos');
      setLoading(false);
      return;
    }

    router.push('/chamados');
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center mb-8">
        <h1 className="font-display text-display-lg text-white mb-2">Savior</h1>
        <p className="text-body-sm text-white/50">Plataforma operacional</p>
      </div>

      {error && (
        <div className="bg-alert/10 border border-alert/30 text-alert text-body-sm rounded px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-body-xs text-white/60 mb-1.5 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full h-11 px-3 rounded bg-white/10 border border-white/15 text-white text-body-md placeholder:text-white/30 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          placeholder="admin@savior.com.br"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-body-xs text-white/60 mb-1.5 font-medium">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full h-11 px-3 rounded bg-white/10 border border-white/15 text-white text-body-md placeholder:text-white/30 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded bg-green text-navy-deep font-semibold text-body-md hover:bg-green-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

---

### Task 6: Dashboard layout (rail nav + header + main content)

**Files:**
- Create: `platform/components/layout/rail-nav.tsx`, `platform/components/layout/header.tsx`, `platform/components/layout/user-menu.tsx`, `platform/app/(dashboard)/layout.tsx`, `platform/app/(dashboard)/page.tsx`, `platform/app/(dashboard)/chamados/page.tsx`, `platform/app/(dashboard)/atendimento/page.tsx`, `platform/app/(dashboard)/mapa/page.tsx`, `platform/app/(dashboard)/configuracoes/page.tsx`, `platform/lib/supabase/hooks.ts`

- [ ] **Step 1: Create platform/lib/supabase/hooks.ts**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Papel } from '@/types/enums';

interface UserProfile {
  id: string;
  user_id: string;
  operador_id: string;
  papel: Papel;
  nome_exibicao: string | null;
  avatar_url: string | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('usuario_perfil')
          .select('id, user_id, operador_id, papel, nome_exibicao, avatar_url')
          .eq('user_id', user.id)
          .single();

        setProfile(data as UserProfile | null);
      }

      setLoading(false);
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
```

- [ ] **Step 2: Create platform/components/layout/rail-nav.tsx**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  MessageSquare,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ambulance,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/chamados', icon: LayoutDashboard, label: 'Chamados' },
  { href: '/atendimento', icon: MessageSquare, label: 'Atendimento' },
  { href: '/mapa', icon: MapPin, label: 'Mapa' },
  { href: '/configuracoes', icon: Settings, label: 'Configuracoes' },
] as const;

export function RailNav() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      className={clsx(
        'fixed left-0 top-0 h-screen bg-navy-deep flex flex-col z-40 transition-all duration-200',
        expanded ? 'w-[var(--rail-expanded)]' : 'w-[var(--rail)]',
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-white/8 shrink-0">
        <Ambulance className="w-6 h-6 text-green" />
        {expanded && (
          <span className="ml-3 font-display text-body-md text-white font-semibold">
            Savior
          </span>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 py-3 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded px-3 py-2.5 transition-colors',
                active
                  ? 'bg-green/15 text-green'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )}
              title={expanded ? undefined : label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {expanded && (
                <span className="text-body-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="h-10 flex items-center justify-center text-white/30 hover:text-white/60 border-t border-white/8"
      >
        {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </nav>
  );
}
```

- [ ] **Step 3: Create platform/components/layout/header.tsx**

```typescript
import { UserMenu } from './user-menu';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-14 border-b border-cream-dark bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-display text-display-md text-navy">{title}</h1>
      <UserMenu />
    </header>
  );
}
```

- [ ] **Step 4: Create platform/components/layout/user-menu.tsx**

```typescript
'use client';

import { useUser } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export function UserMenu() {
  const { profile, loading } = useUser();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-cream-dark animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-body-sm font-medium text-navy">
          {profile?.nome_exibicao ?? 'Usuario'}
        </p>
        <p className="text-body-xs text-navy-mid capitalize">
          {profile?.papel ?? ''}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
        <User className="w-4 h-4 text-green" />
      </div>
      <button
        onClick={handleLogout}
        className="p-2 rounded hover:bg-cream-dark transition-colors text-navy-mid hover:text-alert"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create platform/app/(dashboard)/layout.tsx**

```typescript
import { RailNav } from '@/components/layout/rail-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <RailNav />
      <main className="ml-[var(--rail)] min-h-screen">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Create dashboard page placeholders**

`platform/app/(dashboard)/page.tsx`:
```typescript
import { redirect } from 'next/navigation';

export default function DashboardHome() {
  redirect('/chamados');
}
```

`platform/app/(dashboard)/chamados/page.tsx`:
```typescript
import { Header } from '@/components/layout/header';

export default function ChamadosPage() {
  return (
    <>
      <Header title="Chamados" />
      <div className="p-6">
        <p className="text-body-md text-navy-mid">Sprint 2: Lista de chamados</p>
      </div>
    </>
  );
}
```

`platform/app/(dashboard)/atendimento/page.tsx`:
```typescript
import { Header } from '@/components/layout/header';

export default function AtendimentoPage() {
  return (
    <>
      <Header title="Atendimento" />
      <div className="p-6">
        <p className="text-body-md text-navy-mid">Sprint 1: Inbox WhatsApp</p>
      </div>
    </>
  );
}
```

`platform/app/(dashboard)/mapa/page.tsx`:
```typescript
import { Header } from '@/components/layout/header';

export default function MapaPage() {
  return (
    <>
      <Header title="Mapa" />
      <div className="p-6">
        <p className="text-body-md text-navy-mid">Sprint 3: Mapa e frota</p>
      </div>
    </>
  );
}
```

`platform/app/(dashboard)/configuracoes/page.tsx`:
```typescript
import { Header } from '@/components/layout/header';

export default function ConfiguracoesPage() {
  return (
    <>
      <Header title="Configuracoes" />
      <div className="p-6">
        <p className="text-body-md text-navy-mid">Configuracoes do operador</p>
      </div>
    </>
  );
}
```

---

### Task 7: Base UI components

**Files:**
- Create: `platform/components/ui/button.tsx`, `platform/components/ui/input.tsx`, `platform/components/ui/badge.tsx`, `platform/components/ui/card.tsx`, `platform/lib/utils.ts`

- [ ] **Step 1: Create platform/lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create platform/components/ui/button.tsx**

```typescript
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded font-body font-semibold transition-colors whitespace-nowrap',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-green text-navy-deep hover:bg-green-bright': variant === 'primary',
            'bg-transparent border border-navy/20 text-navy hover:bg-navy hover:text-white': variant === 'secondary',
            'bg-transparent text-navy-mid hover:bg-cream-dark hover:text-navy': variant === 'ghost',
            'bg-alert text-white hover:bg-alert/90': variant === 'danger',
          },
          {
            'h-8 px-3 text-body-xs': size === 'sm',
            'h-10 px-4 text-body-sm': size === 'md',
            'h-12 px-6 text-body-md': size === 'lg',
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
```

- [ ] **Step 3: Create platform/components/ui/input.tsx**

```typescript
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-body-xs font-medium text-navy-mid">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full h-10 px-3 rounded border text-body-md font-body bg-white',
            'placeholder:text-navy-mid/40',
            'focus:outline-none focus:ring-1 focus:ring-green focus:border-green',
            error ? 'border-alert' : 'border-cream-dark',
            className,
          )}
          {...props}
        />
        {error && <p className="text-body-xs text-alert">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
```

- [ ] **Step 4: Create platform/components/ui/badge.tsx**

```typescript
import { cn } from '@/lib/utils';
import type { ChamadoStatus } from '@/types/enums';
import { STATUS_CONFIG } from '@/types/enums';

interface BadgeProps {
  status: ChamadoStatus;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-body-xs font-medium',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
```

- [ ] **Step 5: Create platform/components/ui/card.tsx**

```typescript
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ className, padding = 'md', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-cream-dark shadow-card',
        {
          'p-3': padding === 'sm',
          'p-5': padding === 'md',
          'p-7': padding === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

### Task 8: Vitest setup + smoke tests

**Files:**
- Create: `platform/vitest.config.ts`, `platform/__tests__/setup.ts`, `platform/__tests__/utils.test.ts`

- [ ] **Step 1: Create platform/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 2: Create platform/__tests__/setup.ts**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Create platform/__tests__/utils.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd platform && npm run test:run
```

---

## Sprint 1: WhatsApp Nativo (substituir Blip) — Medium Detail

### Task 9: WhatsApp webhook receiver

**Files:**
- Create: `platform/app/api/webhooks/whatsapp/route.ts`, `platform/lib/whatsapp/types.ts`, `platform/lib/whatsapp/client.ts`, `platform/lib/whatsapp/webhook-handler.ts`

- [ ] **Step 1: Create WhatsApp types** — Meta Cloud API webhook payload types (message, status, contact, metadata, entry, change)
- [ ] **Step 2: Create webhook route** — GET handler for Meta verification (verify_token check), POST handler that parses webhook, validates signature, extracts messages
- [ ] **Step 3: Create webhook handler** — Process incoming messages: upsert contact by phone number, store message in `mensagem` table, trigger bot if no active human agent
- [ ] **Step 4: Create WhatsApp client** — Send text messages, send template messages, send interactive messages (buttons, lists), mark messages as read. Uses Meta Cloud API v21.0

### Task 10: Message storage and conversation model

**Files:**
- Create: `platform/lib/whatsapp/conversations.ts`

- [ ] **Step 1: Conversation query helpers** — List conversations grouped by phone number with last message preview, unread count, assigned agent. Query using Supabase with proper operator isolation
- [ ] **Step 2: Real-time subscription** — Subscribe to new messages via Supabase Realtime, filtered by operador_id

### Task 11: Chat UI — inbox + conversation + composer

**Files:**
- Create: `platform/components/chat/inbox.tsx`, `platform/components/chat/conversation.tsx`, `platform/components/chat/composer.tsx`, `platform/components/chat/message-bubble.tsx`

- [ ] **Step 1: Inbox component** — Left sidebar listing conversations sorted by last message. Search by phone/name. Unread indicator. Click to select conversation
- [ ] **Step 2: Conversation component** — Message history scrolled to bottom. Group messages by date. Show delivery status (sent/delivered/read ticks). Auto-scroll on new messages via Realtime
- [ ] **Step 3: Composer component** — Text input with send button. Support for quick replies (predefined messages). File attachment (images via Supabase Storage + WhatsApp media upload)
- [ ] **Step 4: Message bubble** — Incoming (left, cream bg) vs outgoing (right, green bg). Timestamp. Read receipts. Media preview (image, audio player, document link)
- [ ] **Step 5: Wire into atendimento page** — Replace placeholder with inbox + conversation layout (resizable panels)

### Task 12: Welcome bot (replicate Blip flow)

**Files:**
- Create: `platform/lib/whatsapp/bot.ts`, `platform/lib/whatsapp/bot-flows.ts`

- [ ] **Step 1: Bot state machine** — States: greeting, name_capture, menu, triage, transfer. Store state in `mensagem.metadata` or a `bot_state` table
- [ ] **Step 2: Greeting flow** — Send welcome message with interactive buttons (Emergencia, Agendamento, Plano, Falar com atendente)
- [ ] **Step 3: Triage flow** — Based on menu choice, ask qualifying questions (tipo ambulancia, origem, destino, paciente). Store answers in chamado draft
- [ ] **Step 4: Transfer to human** — Set conversation as "awaiting_agent", stop bot, notify available atendentes via Realtime. Atendente picks up from inbox
- [ ] **Step 5: Test with new WhatsApp number** — Configure Meta Cloud API with a test phone number. Verify full flow: user sends message, bot responds, transfer works, human agent sees conversation

### Task 13: Agent assignment and handoff

**Files:**
- Create: `platform/lib/whatsapp/assignment.ts`

- [ ] **Step 1: Assignment logic** — Auto-assign to least-busy atendente, or manual pick from inbox. Track assignment in `mensagem.atendente_id`
- [ ] **Step 2: Agent presence** — Track online atendentes (last_seen in usuario_perfil or Realtime presence channel)

---

## Sprint 2: Central de Atendimento — Medium Detail

### Task 14: Chamados list page

**Files:**
- Create: `platform/app/(dashboard)/chamados/page.tsx` (replace placeholder), `platform/components/chamados/chamados-list.tsx`, `platform/components/chamados/chamado-filters.tsx`

- [ ] **Step 1: Chamados list** — Table with columns: #numero, status (badge), paciente, servico, canal, atendente, criado_em. Sortable by created_at. Pagination (20 per page)
- [ ] **Step 2: Filters** — Filter by status (multi-select), servico, canal, date range. Persist filters in URL search params
- [ ] **Step 3: Real-time updates** — Subscribe to chamado changes, update list in-place

### Task 15: Chamado detail page

**Files:**
- Create: `platform/app/(dashboard)/chamados/[id]/page.tsx`, `platform/components/chamados/chamado-detail.tsx`, `platform/components/chamados/chamado-timeline.tsx`

- [ ] **Step 1: Detail layout** — Left: chamado data (patient, addresses, values). Right: timeline of status changes + conversation link
- [ ] **Step 2: Status transition** — Buttons to advance status (aberto -> em_cotacao -> aprovado -> despacho -> em_transito -> concluido). Validate transitions. Record timestamps
- [ ] **Step 3: Link to conversation** — If chamado has mensagem records, show link to open conversation in atendimento

### Task 16: Create chamado from WhatsApp conversation

**Files:**
- Modify: `platform/components/chat/conversation.tsx`
- Create: `platform/components/chamados/create-from-chat.tsx`

- [ ] **Step 1: "Criar chamado" button** in conversation header
- [ ] **Step 2: Pre-fill form** with data extracted from bot triage (patient name, service type, addresses from messages)
- [ ] **Step 3: Link chamado to conversation** — Set chamado_id on related mensagem records

### Task 17: Basic dispatch

**Files:**
- Create: `platform/components/chamados/dispatch-panel.tsx`

- [ ] **Step 1: VTR selector** — List available VTRs (status = disponivel), filter by tipo matching chamado.servico
- [ ] **Step 2: Equipe selector** — List available equipe members
- [ ] **Step 3: Dispatch action** — Assign VTR + condutor + equipe to chamado, update status to "despacho", update VTR status to "em_atendimento"

---

## Sprint 3: Mapa e Frota — Medium Detail

### Task 18: Leaflet map setup

**Files:**
- Create: `platform/components/mapa/map-container.tsx`, `platform/components/mapa/vtr-marker.tsx`

- [ ] **Step 1: Dynamic import Leaflet** — Use `next/dynamic` with ssr: false. OpenStreetMap tiles. Center on Rio de Janeiro (-22.9068, -43.1729)
- [ ] **Step 2: VTR markers** — Custom markers colored by VTR tipo (green=disponivel, amber=em_atendimento, red=manutencao). Popup with placa, tipo, condutor name
- [ ] **Step 3: Real-time position updates** — Subscribe to VTR position changes via Supabase Realtime. Animate marker movement

### Task 19: Fleet sidebar

**Files:**
- Create: `platform/components/mapa/fleet-sidebar.tsx`

- [ ] **Step 1: VTR list** — Cards with placa, tipo, status badge, condutor name, last position timestamp
- [ ] **Step 2: Filter by status** — Toggle disponivel/em_atendimento/manutencao
- [ ] **Step 3: Click to center** — Clicking VTR card pans map to that marker

### Task 20: Route calculation with OSRM

**Files:**
- Create: `platform/lib/osrm/client.ts`, `platform/components/mapa/route-overlay.tsx`

- [ ] **Step 1: OSRM client** — Call OSRM demo server (router.project-osrm.org) or self-hosted instance. Request route between origin and destination coordinates. Parse response (geometry, duration, distance)
- [ ] **Step 2: Route overlay** — Draw polyline on Leaflet map from OSRM geometry (decode polyline). Show distance and ETA in sidebar
- [ ] **Step 3: ETA on chamado** — When dispatching, calculate ETA from VTR position to chamado origin. Store eta_minutos on chamado

### Task 21: Wire mapa page

**Files:**
- Modify: `platform/app/(dashboard)/mapa/page.tsx` (replace placeholder)

- [ ] **Step 1: Full layout** — Map (70% width) + fleet sidebar (30% width). Header with VTR count summary
- [ ] **Step 2: Active chamados overlay** — Show active chamado origins/destinations on map with different icon style
- [ ] **Step 3: Click chamado marker** — Opens mini chamado detail with link to full detail page

---

## Verification Checklist

After Sprint 0 is complete, verify:

```bash
# Build passes (type safety)
cd platform && npm run build

# Tests pass
cd platform && npm run test:run

# Dev server starts
cd platform && npm run dev
# Visit http://localhost:3000 — should redirect to /login
# Visit http://localhost:3000/login — should show login form

# Supabase schema
# Run all 13 migrations in SQL Editor
# Verify tables exist in Supabase dashboard
# Verify RLS policies are active on all tables
# Create admin user in Auth dashboard
# Run seed migration 013 (update USER_ID_HERE)
# Test login with admin credentials
```

---

## Dependencies and Sequencing

```
Task 1 (scaffold) ──┐
Task 2 (tailwind) ──┤
Task 3 (SQL)    ────┤─── All parallel, no dependencies
Task 8 (vitest) ────┘
                    │
Task 4 (supabase client) ── depends on Task 1 + Task 3
                    │
Task 5 (auth pages) ── depends on Task 2 + Task 4
                    │
Task 6 (dashboard layout) ── depends on Task 5
                    │
Task 7 (UI components) ── depends on Task 2 (can parallel with Task 5-6)
```

Sprint 1 depends on Sprint 0 completion.
Sprint 2 depends on Sprint 1 (Task 11-12 for chat, Task 10 for messages).
Sprint 3 has no dependency on Sprint 1/2 except the base layout from Sprint 0.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Meta Cloud API approval delay | Start with test number; apply for production early |
| Supabase existing tables conflict | All new tables use distinct names (no `savior_` prefix needed since they are platform-native) |
| Tailwind v4 breaking changes | Pin exact version; CSS-first config is new but stable |
| OSRM demo server rate limits | Plan for self-hosted OSRM instance on Railway/Fly if demo throttles |
| Font loading in OKLCH browsers | OKLCH has 96%+ support; fallback hex values in CSS custom properties |
| RLS policy circular reference | `current_operador_id()` function is SECURITY DEFINER to avoid infinite recursion |
```

---

I cannot save this file because I am in read-only mode. To save it, run:

```bash
mkdir -p /Users/marcelomacbook/Projetos/savior-lps/docs/superpowers/plans
# Then paste the content above into:
# /Users/marcelomacbook/Projetos/savior-lps/docs/superpowers/plans/2026-08-19-savior-platform-foundation.md