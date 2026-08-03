# Savior Tracking Audit — 2026-05-29

## Escopo

Auditoria rápida para explicar diferença entre cliques Google Ads e sessões GA4 no painel de estatísticas.

Dados consultados às 14:05 BRT:

- Google Ads: 96 cliques, R$ 644,24, 22,5 conversões
- GA4/site: 35 sessões, 11 cliques WhatsApp, 2 cliques telefone
- Blip: 33 entradas, 1 fechamento
- Taxa clique Ads -> sessão GA4: 36,5%

## O que foi encontrado

1. O painel consumia `daily[]`, que é fechado em D-1, para os gráficos. O dado de hoje fica em `funil.hoje`, então os gráficos podiam parecer atrasados ou zerados.
2. O layout carrega GA4 direto, sem GTM, porque o GTM antigo está documentado como problemático. O `gtag('config')` roda no head e os eventos de clique são enviados no handler global.
3. A captura de UTM/gclid roda antes do carregamento das tags e grava cookie `savior_utm`.
4. O tracking de WhatsApp e telefone dispara eventos GA4/Google Ads e também envia payload ao worker `savior-lead-capture`.
5. A queda atual é principalmente no indicador GA4 `sessions / ad_clicks`, não no Blip.

## Mudanças aplicadas

- `src/pages/estatisticas.astro` agora injeta um ponto `hoje parcial` nas séries dos gráficos usando `funil.hoje`, `funil.hoje_rj` e `funil.hoje_sp`.
- O gráfico "Tendência diária" passa a incluir o dia atual quando a API já gerou dados parciais.
- O gráfico "Funil RJ diário" passa a incluir o dia atual parcial.
- A seção "Sinais de decisão" agora alerta quando `sessions / ad_clicks < 60%`.

## Próximas verificações recomendadas

1. Testar uma URL com `?gclid=test&utm_source=google&utm_medium=cpc&utm_campaign=debug` e confirmar no DevTools que:
   - cookie `savior_utm` é criado;
   - request `collect` do GA4 sai com status 2xx;
   - clique WhatsApp dispara `generate_lead` e `conversion`.
2. Comparar GA4 Realtime com cliques de teste feitos em `/ambulancia-rj` e `/ambulancia-sp`.
3. Se a taxa clique -> sessão continuar abaixo de 60%, investigar redirects de campanha, consentimento, bloqueio de script por browser/adblock e carregamento lento antes do `gtag.js`.
