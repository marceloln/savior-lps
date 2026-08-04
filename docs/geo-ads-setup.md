# Savior Geo Pages — Setup Google Ads + GA4

## Pré-requisitos
- Geo pages deployadas e recebendo tráfego
- GTM publicado com container ID correto
- GA4 property 393620916 ativa

---

## 1. Criar Labels Google Ads por Geo Page

No Google Ads:
1. Ferramentas → Conversões → Nova ação de conversão
2. Tipo: Website
3. Criar 14 conversões (uma por geo page):

| Nome da conversão | Página |
|---|---|
| Savior Geo — Copacabana | /ambulancia-rj/copacabana |
| Savior Geo — Zona Sul | /ambulancia-rj/zona-sul |
| Savior Geo — Barra Recreio | /ambulancia-rj/barra-recreio |
| Savior Geo — Niterói | /ambulancia-rj/niteroi |
| Savior Geo — Zona Norte | /ambulancia-rj/zona-norte |
| Savior Geo — Zona Oeste | /ambulancia-rj/zona-oeste |
| Savior Geo — Centro | /ambulancia-rj/centro |
| Savior Geo — Baixada | /ambulancia-rj/baixada-fluminense |
| Savior Geo — Serrana | /ambulancia-rj/regiao-serrana |
| Savior Geo — Oceânica | /ambulancia-rj/regiao-oceanica |
| Savior Geo — Búzios | /ambulancia-rj/buzios |
| Savior Geo — Angra | /ambulancia-rj/angra-dos-reis |
| Savior Geo — Intermunicipal | /ambulancia-rj/intermunicipal |
| Savior Geo — Interestadual | /ambulancia-rj/remocao-interestadual |

4. Para cada uma, copiar a label gerada (ex: `AbCdEfGhIjKl`)
5. Substituir no código em `src/layouts/Base.astro` → `GADS_LABELS`

---

## 2. Configurar GA4 — Custom Dimension

No GA4 (property 393620916):
1. Admin → Custom definitions → Create custom dimension
2. Nome: `geo_region`
3. Scope: Event
4. Event parameter: `geo_region`
5. Salvar

Isso permite filtrar todos os eventos (whatsapp_click, phone_click, generate_lead) por região.

---

## 3. Importar Conversões GA4 → Google Ads

1. Google Ads → Ferramentas → Conversões → Importar
2. Selecionar: Google Analytics 4
3. Importar: `whatsapp_click` (já configurado como conversão no GA4)
4. Repetir para `phone_click`

As conversões importadas herdarão automaticamente o `geo_region` como dimensão.

---

## 4. Criar Campanhas por Região

Estrutura sugerida:

```
Campanha: Savior RJ — Geo Copacabana
  Grupo: Ambulância Copacabana
    Keywords: ambulância copacabana, ambulância leme, ambulância particular copacabana
    UTM: utm_source=google&utm_medium=cpc&utm_campaign=rj-copacabana

Campanha: Savior RJ — Geo Zona Sul
  Grupo: Ambulância Zona Sul
    Keywords: ambulância botafogo, ambulância flamengo, ambulância leblon
    UTM: utm_source=google&utm_medium=cpc&utm_campaign=rj-zona-sul
```

Cada campanha aponta para a geo page correspondente.

---

## 5. Dashboard GA4 — Conversões por Região

No GA4 → Explorar → Criar exploração:

| Dimensão | Métrica |
|---|---|
| Page path | Conversões (whatsapp_click) |
| geo_region (custom) | Conversões (phone_click) |
| Source/Medium | Taxa de conversão |

Filtro: Page path contém `/ambulancia-rj/`

---

## 6. Validar Atribuição

Após deploy, testar cada geo page:

1. Abrir a página com UTM: `?utm_source=google&utm_medium=cpc&utm_campaign=rj-copacabana`
2. DevTools → Application → Cookies → verificar `savior_utm`
3. Console → `window._saviorUtm` → confirmar campaign
4. Clicar botão WhatsApp → verificar que o texto contém `[rj-copacabana-hero-v01]`
5. GTM Preview → verificar que `whatsapp_click` dispara com `geo_region: copacabana`
6. GA4 Real-time → verificar evento com custom dimension

Repetir para 2-3 páginas representativas.
