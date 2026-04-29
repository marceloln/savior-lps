# GTM Setup — Savior Medical Service

Container: `GTM-5GVSJN4Z`
GA4 Property: `G-43FPPY00QR`
Google Ads: conta `7412268707` (Savior)
Última revisão: 2026-04-27

---

## Visão geral das conversões

Duas ações valem como conversão para a Savior:

| Ação | Evento dataLayer | GA4 | Google Ads | Blip |
|---|---|---|---|---|
| Clique em botão WhatsApp | `whatsapp_click` | ✅ conversão principal | ✅ importar do GA4 | ✅ conectar |
| Clique em número de telefone | `phone_click` | ✅ conversão principal | ✅ importar do GA4 | — |

**Por que importar do GA4 ao invés de tag direta?**
O Blip exige conversões do tipo "importação" para conseguir conectar. Importar do GA4 também elimina duplicação: uma única fonte de verdade (GA4) alimenta tanto o Google Ads quanto o Blip.

---

## 1. Variáveis — Data Layer Variables (DLV)

Crie em **Variáveis → Variáveis definidas pelo usuário → Nova → Variável da camada de dados**.

| Nome da variável GTM | Nome na camada de dados | Tipo de valor |
|---|---|---|
| `emergencia-rj \| DLV \| event_label` | `event_label` | Versão 2 |
| `emergencia-rj \| DLV \| campaign` | `campaign` | Versão 2 |
| `emergencia-rj \| DLV \| attribution.source` | `attribution.source` | Versão 2 |
| `emergencia-rj \| DLV \| attribution.medium` | `attribution.medium` | Versão 2 |
| `emergencia-rj \| DLV \| attribution.campaign` | `attribution.campaign` | Versão 2 |
| `emergencia-rj \| DLV \| attribution.gclid` | `attribution.gclid` | Versão 2 |
| `emergencia-rj \| DLV \| attribution.first_landing` | `attribution.first_landing` | Versão 2 |

---

## 2. Triggers (Gatilhos)

### T1 — WhatsApp Click
- Tipo: **Evento personalizado**
- Nome do evento: `whatsapp_click`
- Ativar em: **Todos os eventos personalizados**

### T2 — Phone Click
- Tipo: **Evento personalizado**
- Nome do evento: `phone_click`
- Ativar em: **Todos os eventos personalizados**

### T3 — UTM Loaded
- Tipo: **Evento personalizado**
- Nome do evento: `utm_loaded`
- Ativar em: **Todos os eventos personalizados**

### T4 — CTA Click
- Tipo: **Evento personalizado**
- Nome do evento: `cta_click`
- Ativar em: **Todos os eventos personalizados**

### T5 — All Pages
- Tipo: **Exibição de página**
- Ativar em: **Todas as páginas**

### T6 — Página /ambulancia-rj
- Tipo: **Exibição de página**
- Condição: `Page Path` → `contém` → `/ambulancia-rj`

---

## 3. Tags GTM

### Tag 1 — GA4 Config
- Tipo: **Google Analytics: configuração do GA4**
- ID de medição: `G-43FPPY00QR`
- Gatilho: **T5 — All Pages**

---

### Tag 2 — GA4 | WhatsApp Click
- Tipo: **Google Analytics: evento do GA4**
- ID de medição: `G-43FPPY00QR`
- Nome do evento: `whatsapp_click`
- Parâmetros do evento:
  - `event_label` → `{{emergencia-rj | DLV | event_label}}`
  - `campaign` → `{{emergencia-rj | DLV | campaign}}`
  - `utm_source` → `{{emergencia-rj | DLV | attribution.source}}`
  - `utm_medium` → `{{emergencia-rj | DLV | attribution.medium}}`
  - `utm_campaign` → `{{emergencia-rj | DLV | attribution.campaign}}`
  - `gclid` → `{{emergencia-rj | DLV | attribution.gclid}}`
  - `first_landing` → `{{emergencia-rj | DLV | attribution.first_landing}}`
- Gatilho: **T1 — WhatsApp Click**

---

### Tag 3 — GA4 | Phone Click
- Tipo: **Google Analytics: evento do GA4**
- ID de medição: `G-43FPPY00QR`
- Nome do evento: `phone_click`
- Parâmetros do evento:
  - `event_label` → `{{emergencia-rj | DLV | event_label}}`
  - `campaign` → `{{emergencia-rj | DLV | campaign}}`
  - `utm_source` → `{{emergencia-rj | DLV | attribution.source}}`
  - `utm_medium` → `{{emergencia-rj | DLV | attribution.medium}}`
  - `utm_campaign` → `{{emergencia-rj | DLV | attribution.campaign}}`
  - `gclid` → `{{emergencia-rj | DLV | attribution.gclid}}`
  - `first_landing` → `{{emergencia-rj | DLV | attribution.first_landing}}`
- Gatilho: **T2 — Phone Click**

---

### Tag 4 — Google Ads | Remarketing (All Pages)
- Tipo: **Remarketing do Google Ads**
- ID de conversão: *(Google Ads → Ferramentas → Gerenciador de públicos-alvo → Origens de público-alvo → Tag do Google Ads → Detalhes da tag)*
- Gatilho: **T5 — All Pages**

> ⚠️ Não criar tags de conversão direta do Google Ads aqui. As conversões vêm via importação do GA4 (ver Seção 4). Isso evita dupla contagem.

---

### Tag 5 — Meta Pixel | Base
- Tipo: **HTML personalizado**
- HTML:
```html
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID');
fbq('track', 'PageView');
</script>
```
- Substitua `SEU_PIXEL_ID` pelo ID numérico do Events Manager
- Gatilho: **T5 — All Pages**

---

### Tag 6 — Meta Pixel | Lead (WhatsApp)
- Tipo: **HTML personalizado**
- HTML:
```html
<script>fbq('track', 'Lead', {content_name: '{{emergencia-rj | DLV | event_label}}'})</script>
```
- Gatilho: **T1 — WhatsApp Click**

---

### Tag 7 — Meta Pixel | Lead (Phone)
- Tipo: **HTML personalizado**
- HTML:
```html
<script>fbq('track', 'Lead', {content_name: 'phone-{{emergencia-rj | DLV | event_label}}'})</script>
```
- Gatilho: **T2 — Phone Click**

---

### Tag 8 — LinkedIn | Base
- Tipo: **HTML personalizado**
- HTML:
```html
<script>
window._linkedin_partner_id = 'SEU_PARTNER_ID';
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
(function(l) {
  if (!l){ window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]; }
  var s=document.getElementsByTagName('script')[0];
  var b=document.createElement('script');
  b.type='text/javascript'; b.async=true;
  b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';
  s.parentNode.insertBefore(b,s);
})(window.lintrk);
</script>
```
- Substitua `SEU_PARTNER_ID` pelo Partner ID do Campaign Manager
- Gatilho: **T5 — All Pages**

---

### Tag 9 — LinkedIn | Conversão WhatsApp
- Tipo: **HTML personalizado**
- HTML:
```html
<script>window.lintrk('track', { conversion_id: SEU_CONVERSION_ID_WA })</script>
```
- Substitua `SEU_CONVERSION_ID_WA` pelo ID de conversão criado no Campaign Manager
- Gatilho: **T1 — WhatsApp Click**

---

### Tag 10 — LinkedIn | Conversão Phone
- Tipo: **HTML personalizado**
- HTML:
```html
<script>window.lintrk('track', { conversion_id: SEU_CONVERSION_ID_PHONE })</script>
```
- Substitua `SEU_CONVERSION_ID_PHONE` pelo ID de conversão para ligações no Campaign Manager
- Gatilho: **T2 — Phone Click**

---

## 4. GA4 → Google Ads → Blip (passo a passo)

Este é o fluxo obrigatório para que o Blip consiga conectar as conversões. Execute nesta ordem.

### Passo 1 — Publicar o GTM

Publicar o container `GTM-5GVSJN4Z` com todas as tags acima antes de avançar. Sem publicação, nenhum evento chega no GA4.

---

### Passo 2 — Marcar eventos como conversão no GA4

Após o primeiro clique real em produção (evento aparece no GA4):

> GA4 → Admin → Eventos → encontre o evento → ativar toggle "Marcar como conversão"

| Evento | Marcar como conversão |
|---|---|
| `whatsapp_click` | ✅ sim — conversão principal |
| `phone_click` | ✅ sim — conversão principal |

---

### Passo 3 — Vincular GA4 ao Google Ads

Se ainda não estiver vinculado:

> GA4 → Admin → Vinculações de produtos Google → Google Ads → Vincular → selecionar conta `7412268707`

Confirmar que a vinculação aparece como "Ativa".

---

### Passo 4 — Importar conversões do GA4 para o Google Ads

> Google Ads (conta `7412268707`) → Ferramentas e configurações → Conversões → `+` → **Importar** → **Google Analytics 4** → Continuar

Selecionar e importar os dois eventos:

| Evento GA4 | Nome sugerido no Google Ads | Categoria | Contagem |
|---|---|---|---|
| `whatsapp_click` | `Savior — WhatsApp Click` | Lead | Uma por clique |
| `phone_click` | `Savior — Phone Click` | Lead | Uma por clique |

> ⚠️ Marcar ambos como **conversão principal** (não secundária) para o algoritmo de smart bidding otimizar por eles.

Após importar, cada conversão recebe um status "Sem dados recentes" — normal até os primeiros cliques chegarem.

---

### Passo 5 — Conectar no Blip

Após o Passo 4, as conversões do tipo "importação" aparecem na tela do Blip:

> Blip → Integrações → Google → Conectar evento de conversão → selecionar `Savior — WhatsApp Click`

O Blip usará essa conversão para medir o custo por conversa iniciada e otimizar os anúncios Click-to-WhatsApp.

---

## 5. Fluxo completo de atribuição

```
Usuário clica no anúncio Google (gclid gerado automaticamente)
  ↓
LP carrega: utm-capture.ts (síncrono, <head>)
  · Lê UTMs + gclid da URL
  · Persiste no cookie savior_utm (30 dias, first-touch)
  · Expõe window._saviorUtm
  · Push utm_loaded → dataLayer (antes do GTM)
  ↓
GTM carrega (assíncrono)
  · Tag 1 (GA4 Config) registra sessão
  ↓
wa-enhance.ts (após DOM)
  · Reescreve todos os botões WhatsApp:
    "Mensagem [campaign-location-v01] [gclid:Cj0K...]"
  ↓
Usuário clica em botão WhatsApp
  · dataLayer: whatsapp_click + attribution.*
  · Tag 2 (GA4): evento chega no GA4 com todos os parâmetros
  · GA4 → Google Ads import: conversão registrada em ~4h
  · Blip: conversão conectada ao anúncio
  ↓
Atendente recebe mensagem no WhatsApp / Blip
  · Tag de atribuição visível no texto: [rj-emergencia-price-uti-v01] [gclid:Cj0K...]
  · Blip pode parsear com regex \[([^\]]+)\]

Usuário clica em telefone (alternativo)
  · dataLayer: phone_click + attribution.*
  · Tag 3 (GA4): evento chega no GA4
  · GA4 → Google Ads import: conversão phone registrada
  · Não passa pelo Blip (ligação direta)
```

---

## 6. Como testar a atribuição localmente

```bash
npm run dev  # http://localhost:4321
```

| URL de teste | Cookie `savior_utm` | Tag esperada no botão WA |
|---|---|---|
| `...?utm_source=google&utm_medium=cpc&utm_campaign=rj-emergencia` | source=google, campaign=rj-emergencia | `[rj-emergencia-hero-v01]` |
| `...?utm_source=facebook&utm_campaign=rj-uti` | source=facebook, campaign=rj-uti | `[rj-uti-hero-v01]` |
| `...?gclid=TestGCLID123` | source=direct, gclid=TestGCLID123 | `[direct-hero-v01] [gclid:TestGCLID123]` |
| (sem params, sem cookie) | source=direct, campaign=direct | `[direct-hero-v01]` |

**Checklist:**
1. DevTools → Application → Cookies → `savior_utm` contém JSON correto
2. Console → `window._saviorUtm` retorna o objeto de atribuição
3. Console → `window.dataLayer[0].event === 'utm_loaded'` com `attribution.*` completo
4. Hover em botão WA → URL na barra de status contém `%5B` (= `[`) no param `text`
5. GTM Preview Mode → Tag 2 "GA4 | WhatsApp Click" dispara ao clicar botão WA
6. GTM Preview Mode → Tag 3 "GA4 | Phone Click" dispara ao clicar número de telefone

---

## 7. IDs necessários (preencher antes do deploy)

| ID | Onde encontrar | Status |
|---|---|---|
| GTM Container ID | GTM-5GVSJN4Z | ✅ configurado |
| GA4 Measurement ID | G-43FPPY00QR | ✅ configurado |
| Google Ads Account | 7412268707 | ✅ confirmado |
| Meta Pixel ID | Meta Events Manager → Pixels | ❌ pendente |
| LinkedIn Partner ID | Campaign Manager → Insight Tag | ❌ pendente |
| LinkedIn Conversion ID (WA) | Campaign Manager → Conversões | ❌ pendente (criar após vincular) |
| LinkedIn Conversion ID (Phone) | Campaign Manager → Conversões | ❌ pendente (criar após vincular) |
| Google Ads Remarketing ID | Google Ads → Gerenciador de públicos | ❌ pendente |
