# Spec — Landing Page /plano-familiar (pré-lançamento)

Data: 2026-07-14 · Status: aprovada pelo Marcelo (abordagem A)

## Objetivo

Capturar interessados no Plano Familiar Savior (assistência de emergência por assinatura, pessoa física) antes do lançamento. Sem data definida: a página comunica "em breve" e posiciona a lista de espera como canal prioritário ("quem está na lista sabe primeiro e tem condição de lançamento").

Referências de mercado analisadas: cticor.com.br/para-voce (plano ambulância PF, Individual R$55/Familiar R$59 mensais) e vidauti.com.br/servicos (form de interesse por categoria). Não divulgar preço: só benefícios gerais.

## Página (nova rota `src/pages/plano-familiar.astro`)

Reusa o design system do savior-lps (tokens navy/green/cream em `global.css`, Inter + IBM Plex Mono, componentes existentes). Layout `Base.astro`.

1. **Hero** (navy, foto/vídeo da frota já existente em `/public`)
   - Eyebrow mono: `PLANO FAMILIAR · EM BREVE`
   - H1: "Ambulância UTI para a sua família. Sem depender de plano de saúde."
   - Sub: assistência de emergência 24h por assinatura, com a estrutura Savior, no RJ e em SP
   - Badge Google 4,7 (padrão da home)
   - **Form de interesse no hero**: desktop card à direita, mobile CTA âncora "Entrar na lista"
2. **Benefícios** — 6 cards com ícones mono (paths Lucide, padrão trabalhe-conosco):
   ambulância 24h sem limite de chamadas · UTI móvel com médico · orientação médica por telefone · equipe 100% própria · cobertura RJ e SP · prioridade e condição especial pra quem está na lista
3. **Como vai funcionar** — 3 passos: entrar na lista → ser avisado primeiro → contratar com condição de fundador
4. **Por que a Savior** — 46 anos, +100k atendimentos/ano, +450 profissionais, 4,7★ Google (números da home)
5. **FAQ** (componente `FAQ.astro`, 5 itens): o que é o plano · quando lança · quanto vai custar · onde funciona (RJ/SP) · "é plano de saúde?" (não: assistência de emergência complementar)
6. **CTA final** com o form repetido (id único por instância) → `Footer` padrão

## Form e worker

- Campos: nome*, WhatsApp*, e-mail*, cidade* (select: Rio de Janeiro / São Paulo / Outra)
- POST JSON pro worker binky `https://savior-lead-capture.marcelo-4f2.workers.dev` com `type: 'plano_familiar_interesse'` + utm do cookie `savior_utm` (padrão dos forms atuais)
- Worker (`workers/lead-capture/index.js`), novo handler:
  - E-mail por lead via Resend pra **savior@savior.com.br** (template visual dos e-mails existentes, reply-to do interessado, assunto `Plano Familiar - Interessado ({UF})`)
  - **Sem Pipedrive, sem Blip**
  - Contador KV `pfam:{segunda YYYY-MM-DD}:{uf}` (TTL 90d) no `UTM_STORE`
  - Resumo semanal existente (cron segunda 08:00 BRT) ganha seção "Plano Familiar — interessados da semana" com contagem por UF
- Deploy do worker é manual (`wrangler deploy -c workers/lead-capture/wrangler.toml`, conta binky `4f26...`)

## Regras da página

- **Zero WhatsApp**: sem CTAs wa.me, sem StickyHeader, sem FloatingWhatsApp (mesma lógica do /corporativo: conversão é o form, o bot devolveria pro site)
- Tracking: evento GA4 `pf_interesse` via dataLayer no sucesso do form, fora do funil comercial (não usar generate_lead)
- SEO: página indexável, meta/OG próprios, Schema.org `Service` + `FAQPage`, canonical `https://www.savior.com.br/plano-familiar`
- Copy no tom Savior: acolhedor, "escuta", sem travessões decorativos, sem promessas de preço/prazo
- Link discreto pra página no Footer (seção de links), sem banner nas outras LPs por enquanto

## Fora de escopo

Preço, data de lançamento, contador regressivo, integração Pipedrive/Blip, banner de divulgação nas outras páginas, automação de e-mail pro interessado (double opt-in). Entram no lançamento.

## Critérios de aceite

- [ ] Página no ar em /plano-familiar com todas as seções, build limpo
- [ ] Form envia, e-mail chega em savior@, KV incrementa, GA4 recebe `pf_interesse`
- [ ] Zero links wa.me/StickyHeader na página
- [ ] Schema Service + FAQPage válidos, meta/OG corretos
- [ ] Registro no vault (sessão + backlog + log + index) ao final
