# Plano: Formulário de Agendamento Savior

## Objetivo
Página /agendar com formulário de 4 etapas para solicitar/agendar ambulância.
Integrado ao Supabase (bookings) + WhatsApp (mensagem pré-formatada).

## Stack
- Astro 5 (página estática) + React island (formulário interativo)
- Supabase JS v2 (client-side, insert em savior_bookings)
- CSS vars do projeto (navy, green, cream, Inter, IBM Plex Mono)
- Zero dependência nova além de @supabase/supabase-js

## Fluxo de 4 Steps

### Step 1: Paciente
- Nome, data nascimento
- Diagnóstico (select com 8 opções humanas)
- Mobilidade (4 opções visuais)
- Peso aprox + equipamentos
- Sugestão inteligente de ambulância (inline)

### Step 2: Trajeto
- Endereço de origem (texto)
- Hospital de destino (picker com busca/filtro por região) ou endereço livre
- Data: botões rápidos (Hoje/Amanhã/Escolher)
- Horário: botões rápidos (Manhã/Tarde/Noite/Exato)

### Step 3: Contato
- Nome do responsável, telefone
- Forma de pagamento (Pix 5%/Cartão 3x/Faturamento)
- Observações (checkboxes: elevador, portaria, peso, oxigênio, infecciosa)

### Step 4: Confirmar
- Resumo completo
- Botão submit → Supabase + WhatsApp

## Arquivos a criar
1. `src/pages/agendar.astro` — página wrapper
2. `src/components/booking/BookingForm.tsx` — componente React (island)
3. `src/lib/supabase.ts` — client Supabase (public anon key)

## Dados
- Hospitais: fetch do Supabase (savior_hospitals + savior_regions)
- Bookings: insert no Supabase (savior_bookings)
- WhatsApp: wa.me/5521980358200 com mensagem formatada

## Design
- Identidade Savior: navy/green/cream, Inter, IBM Plex Mono
- Header vermelho de emergência fixo
- Barra flutuante "Prefere falar?" no bottom
- Cards com border-left green 3px
- Botões min-height 48px, inputs border-radius 8px

## Não inclui no MVP
- Admin panel (sprint 2)
- API machine customers (sprint 3)
- Google Places autocomplete (nice-to-have)
- Pagamento online
- Auth/login
