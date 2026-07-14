# Plano Familiar LP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página /plano-familiar de pré-lançamento que captura interessados (nome, WhatsApp, e-mail, cidade) e envia por e-mail pra savior@savior.com.br, com contagem no resumo semanal.

**Architecture:** Nova rota Astro estática reusando o design system do savior-lps; worker `savior-lead-capture` (conta binky) ganha handler `plano_familiar_interesse` (Resend + contador KV) e o resumo semanal ganha seção Plano Familiar. Zero WhatsApp na página.

**Tech Stack:** Astro 5 static, Cloudflare Pages (deploy via GitHub Actions no push), Cloudflare Worker + KV (deploy manual via wrangler, conta `4f26044db4b747d623cb2710c2fbc87b`), Resend.

**Spec:** `docs/superpowers/specs/2026-07-14-plano-familiar-design.md`

**Verificação neste repo:** não há test runner; o ciclo é `npm run build` + grep no `dist/` + curl no worker.

---

### Task 1: Worker — handler plano_familiar_interesse + seção no resumo semanal

**Files:**
- Modify: `workers/lead-capture/index.js` (roteamento após branch candidatura ~linha 90; helpers no fim junto de `bumpCandCount`/`sendResumoSemanal`)

- [ ] **Step 1: Constante de destino** perto de `RESUMO_EMAILS` (~linha 46)

```js
// Leads do Plano Familiar (pré-lançamento) — e-mail por lead + contagem no resumo semanal
const PF_EMAIL = ['savior@savior.com.br'];
```

- [ ] **Step 2: Rotear o novo type** logo após o branch `body.type === 'candidatura'`

```js
    // Interesse no Plano Familiar (pré-lançamento) — só e-mail + contador. Sem Pipedrive, sem Blip.
    if (body.type === 'plano_familiar_interesse') {
      return handlePlanoFamiliar(body, env);
    }
```

- [ ] **Step 3: Handler + contador no fim do arquivo** (após `sendResumoSemanal`)

```js
// ============================================================
// Plano Familiar (pré-lançamento) — e-mail do interessado pra
// PF_EMAIL + contador semanal no KV (pfam:{segunda}:{uf}).
// Sem Pipedrive e sem Blip: é lista de espera, não atendimento.
// ============================================================
async function handlePlanoFamiliar(body, env) {
  const {
    nome = '',
    whatsapp = '',
    email = '',
    cidade = '',
    utm_source = 'direct',
    utm_campaign = 'none',
  } = body;

  const uf = cidade === 'sp' ? 'sp' : cidade === 'rj' ? 'rj' : 'outra';
  const ufLabel = uf === 'sp' ? 'São Paulo' : uf === 'rj' ? 'Rio de Janeiro' : 'Outra cidade';

  if (!nome.trim() || !email.trim() || !whatsapp.trim()) {
    return new Response(JSON.stringify({ ok: false, error: 'nome, whatsapp e email obrigatórios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
  if (!env.RESEND_API_KEY) {
    console.error('Plano Familiar sem RESEND_API_KEY configurada');
    return new Response(JSON.stringify({ ok: false, error: 'email não configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (label, val) => val ? `<tr><td style="padding:5px 16px 5px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:5px 0;font-weight:500">${esc(val)}</td></tr>` : '';
  const dateTag = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const emailBody = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0B2540;padding:18px 24px;border-radius:8px 8px 0 0">
      <span style="color:#00B87C;font-weight:700;font-size:18px;letter-spacing:.05em">SAVIOR</span>
      <span style="color:rgba(255,255,255,.5);font-size:12px;margin-left:12px">Interessado — Plano Familiar (lista de espera)</span>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <table style="border-collapse:collapse;font-size:14px;width:100%">
        ${row('Nome', nome)}
        ${row('WhatsApp', whatsapp)}
        ${row('E-mail', email)}
        ${row('Cidade', ufLabel)}
      </table>
      <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
      <p style="font-size:12px;color:#9ca3af;margin:0">🔗 ${esc(utm_source)} · 🎯 ${esc(utm_campaign)} · Enviado pelo site /plano-familiar</p>
    </div>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Site Savior <noreply@savior.com.br>',
      to: PF_EMAIL,
      reply_to: email,
      subject: `Plano Familiar - Interessado (${uf.toUpperCase()}) — ${dateTag}`,
      html: emailBody,
    }),
  }).catch((err) => {
    console.error('Plano Familiar email send failed:', err);
    return null;
  });

  const ok = !!(res && res.ok);
  if (!ok && res) console.error('Plano Familiar Resend error:', res.status, await res.text().catch(() => ''));
  console.log(`Plano Familiar ${ok ? 'enviado' : 'FALHOU'}: uf=${uf}`);
  if (ok) await bumpPfamCount(env, uf);

  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

async function bumpPfamCount(env, uf) {
  if (!env.UTM_STORE) return;
  try {
    const key = `pfam:${ymd(mondayOf(spNow()))}:${uf}`;
    const cur = parseInt(await env.UTM_STORE.get(key), 10) || 0;
    await env.UTM_STORE.put(key, String(cur + 1), { expirationTtl: 7776000 });
  } catch (e) {
    console.error('bumpPfamCount falhou:', e);
  }
}
```

- [ ] **Step 4: Seção Plano Familiar no resumo semanal.** Em `sendResumoSemanal`, após o cálculo de `counts` e antes de montar `html`:

```js
  // Interessados Plano Familiar da mesma semana
  let pfam = { rj: 0, sp: 0, outra: 0 };
  if (sample) {
    pfam = { rj: 7, sp: 4, outra: 1 };
  } else if (env.UTM_STORE) {
    const pfList = await env.UTM_STORE.list({ prefix: `pfam:${ymd(weekStart)}:` });
    for (const k of pfList.keys) {
      const uf = k.name.split(':')[2];
      const v = parseInt(await env.UTM_STORE.get(k.name), 10) || 0;
      if (uf in pfam) pfam[uf] += v;
    }
  }
  const pfamTotal = pfam.rj + pfam.sp + pfam.outra;
```

E no template `html`, logo após `${block('sp', 'São Paulo')}`:

```js
      <h3 style="margin:24px 0 4px;font-size:13px;color:#00A06C;text-transform:uppercase;letter-spacing:.06em">Plano Familiar · ${pfamTotal} interessado${pfamTotal === 1 ? '' : 's'}</h3>
      <table style="border-collapse:collapse;font-size:14px;width:100%">
        <tr><td style="padding:8px 16px 8px 0;color:#444;border-bottom:1px solid #f3f4f6">Rio de Janeiro</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0B2540;border-bottom:1px solid #f3f4f6">${pfam.rj}</td></tr>
        <tr><td style="padding:8px 16px 8px 0;color:#444;border-bottom:1px solid #f3f4f6">São Paulo</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0B2540;border-bottom:1px solid #f3f4f6">${pfam.sp}</td></tr>
        <tr><td style="padding:8px 16px 8px 0;color:#444">Outras cidades</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0B2540">${pfam.outra}</td></tr>
      </table>
```

- [ ] **Step 5: Deploy do worker e teste**

Run: `export CLOUDFLARE_ACCOUNT_ID=4f26044db4b747d623cb2710c2fbc87b && npx wrangler deploy -c workers/lead-capture/wrangler.toml`
Expected: `Deployed savior-lead-capture triggers` + `schedule: 0 11 * * 1`

Run (teste real, 1 e-mail chega em savior@ marcado TESTE):
```bash
curl -s -X POST https://savior-lead-capture.marcelo-4f2.workers.dev \
  -H 'Content-Type: application/json' \
  -d '{"type":"plano_familiar_interesse","nome":"TESTE Plano Familiar Claude","whatsapp":"21999999999","email":"marcelo@binky.com.br","cidade":"rj","utm_source":"teste"}'
```
Expected: `{"ok":true}`

Run (conferir KV): `npx wrangler kv key list --namespace-id bf84c7323bef4f939d843c6caa18b80a --prefix pfam`
Expected: 1 chave `pfam:<segunda>:rj`

- [ ] **Step 6: Commit**

```bash
git add workers/lead-capture/index.js
git commit -m "feat(worker): handler plano_familiar_interesse + seção PF no resumo semanal"
```

---

### Task 2: Página /plano-familiar — frontmatter, hero e form

**Files:**
- Create: `src/pages/plano-familiar.astro`

Padrões: `src/pages/trabalhe-conosco.astro` (página sem WhatsApp, form → worker, ícones Lucide inline) e `src/pages/corporativo.astro` (inputs de form). Layout `Base.astro` (já injeta UTM capture e GTM). NÃO importar StickyHeader nem FloatingWhatsApp.

- [ ] **Step 1: Criar a página com frontmatter completo**

```astro
---
// ============================================================
// /plano-familiar — pré-lançamento (lista de espera)
// Sem WhatsApp de propósito: conversão é o form (ver spec
// docs/superpowers/specs/2026-07-14-plano-familiar-design.md)
// ============================================================
import Base from '../layouts/Base.astro';
import Footer from '../components/Footer.astro';
import FAQ from '../components/FAQ.astro';

const BENEFICIOS = [
  { icon: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>', titulo: 'Ambulância 24h, sem limite', texto: 'Emergência não escolhe hora. Acionamento ilimitado, todos os dias do ano, direto na central Savior.' },
  { icon: '<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>', titulo: 'UTI móvel com médico', texto: 'Suporte avançado de vida com médico e enfermeiro a bordo quando o quadro exigir.' },
  { icon: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>', titulo: 'Orientação médica por telefone', texto: 'Antes da ambulância sair, um profissional escuta e orienta os primeiros passos.' },
  { icon: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>', titulo: 'Equipe 100% própria', texto: 'Médicos, enfermeiros e condutores contratados e treinados pela Savior. Nada terceirizado.' },
  { icon: '<circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.9.7 3.4 1.8 4.9L12 22l6.2-7.1C19.3 13.4 20 11.9 20 10a8 8 0 0 0-8-8Z"/>', titulo: 'Rio de Janeiro e São Paulo', texto: 'Bases próprias nas duas cidades, com a mesma central 24h que opera há 46 anos.' },
  { icon: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>', titulo: 'Prioridade de quem está na lista', texto: 'Quem entra na lista é avisado primeiro e garante a condição especial de lançamento.' },
];

const PASSOS = [
  { num: '01', titulo: 'Entre na lista', texto: 'Preencha o formulário com seus dados. Leva menos de um minuto.' },
  { num: '02', titulo: 'Seja avisado primeiro', texto: 'Quando o plano abrir, você recebe as condições antes da divulgação geral.' },
  { num: '03', titulo: 'Contrate com condição de fundador', texto: 'A lista de espera tem prioridade e condição especial de lançamento.' },
];

const faqItems = [
  { q: 'O que é o Plano Familiar da Savior?', a: 'Uma assinatura de assistência de emergência para sua família: ambulância 24h, UTI móvel e orientação médica por telefone, com a estrutura própria da Savior no Rio de Janeiro e em São Paulo.' },
  { q: 'Quando o plano será lançado?', a: 'A data será anunciada em breve. Quem está na lista de espera é avisado primeiro, antes da divulgação geral.' },
  { q: 'Quanto vai custar?', a: 'Os valores serão divulgados no lançamento. A lista de espera garante a condição especial de fundador.' },
  { q: 'Onde o plano vai funcionar?', a: 'No Rio de Janeiro e em São Paulo, nas mesmas áreas de cobertura da operação Savior. Outras cidades entram no radar conforme a demanda da lista.' },
  { q: 'É um plano de saúde?', a: 'Não. É um serviço de assistência de emergência que complementa o plano de saúde: a maioria dos planos não cobre ambulância particular com resposta rápida.' },
];

const schema = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "name": "Plano Familiar Savior",
      "serviceType": "Assistência de emergência médica por assinatura",
      "provider": { "@type": "MedicalClinic", "name": "Savior Medical Service", "url": "https://www.savior.com.br" },
      "areaServed": ["Rio de Janeiro", "São Paulo"],
      "description": "Assinatura de assistência de emergência para famílias: ambulância 24h, UTI móvel e orientação médica por telefone. Pré-lançamento com lista de espera."
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqItems.map((i) => ({ "@type": "Question", "name": i.q, "acceptedAnswer": { "@type": "Answer", "text": i.a } }))
    }
  ]
});
---
```

- [ ] **Step 2: Markup do hero + form** (classes `pf-*`, CSS na Task 3)

```astro
<Base
  title="Plano Familiar | Ambulância UTI por assinatura — Savior"
  description="Assistência de emergência 24h para sua família: ambulância UTI, orientação médica e equipe própria, no RJ e em SP. Entre na lista de espera do lançamento."
  canonical="https://www.savior.com.br/plano-familiar"
  schema={schema}
  dateModified="2026-07-14"
>
  <main id="main">
    <section class="pf-hero" id="topo">
      <div class="pf-hero-bg" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcset="/img/gallery/team-mobile.webp" type="image/webp" />
          <img src="/img/gallery/team.webp" alt="" width="1536" height="1024" loading="eager" fetchpriority="high" />
        </picture>
      </div>
      <div class="pf-hero-overlay" aria-hidden="true"></div>
      <div class="pf-hero-content wrap">
        <a href="/" class="pf-hero-brand" aria-label="Savior Medical Service, página inicial">
          <div>
            <div class="pf-hero-wordmark">SAVIOR</div>
            <div class="pf-hero-descriptor">Medical Service</div>
          </div>
        </a>
        <div class="pf-hero-grid">
          <div class="pf-hero-left">
            <p class="eyebrow on-dark" style="margin-bottom:18px">Plano Familiar · Em breve</p>
            <h1>Ambulância UTI para a sua família. <em class="pf-green-bright">Sem depender de plano de saúde.</em></h1>
            <p class="pf-hero-sub">Assistência de emergência 24h por assinatura, com a estrutura que atende o Rio de Janeiro e São Paulo há 46 anos. Entre na lista e seja avisado no lançamento.</p>
            <a href="#lista" class="btn btn-primary pf-hero-cta-mobile" data-event="cta_click" data-event-category="cta" data-event-label="pf-hero-lista">Entrar na lista</a>
            <div class="pf-hero-rating" role="img" aria-label="4,7 estrelas, mais de 730 avaliações no Google">
              <!-- copiar o SVG do G colorido do bloco corp-hero-rating em src/pages/index.astro (~linha 181) -->
              <span style="font-weight:700;color:#fff;font-size:13px">4,7</span>
              <span style="color:#FBBC05;font-size:11px">★★★★★</span>
              <span style="color:rgba(255,255,255,.6);font-size:12px">730+ avaliações no Google</span>
            </div>
          </div>
          <div class="pf-hero-right" id="lista">
            <form class="pf-form-card" id="pfForm" novalidate>
              <p class="pf-form-title">Entre na lista de espera</p>
              <p class="pf-form-sub">Sem compromisso. Você é avisado primeiro e garante a condição de lançamento.</p>
              <label class="pf-label" for="pf-nome">Nome *</label>
              <input class="pf-input" id="pf-nome" name="nome" type="text" required autocomplete="name" />
              <label class="pf-label" for="pf-whatsapp">WhatsApp *</label>
              <input class="pf-input" id="pf-whatsapp" name="whatsapp" type="tel" required autocomplete="tel" placeholder="(21) 99999-9999" />
              <label class="pf-label" for="pf-email">E-mail *</label>
              <input class="pf-input" id="pf-email" name="email" type="email" required autocomplete="email" placeholder="voce@email.com.br" />
              <label class="pf-label" for="pf-cidade">Cidade *</label>
              <select class="pf-input" id="pf-cidade" name="cidade" required>
                <option value="" disabled selected>Selecione</option>
                <option value="rj">Rio de Janeiro</option>
                <option value="sp">São Paulo</option>
                <option value="outra">Outra cidade</option>
              </select>
              <button type="submit" class="btn btn-primary pf-submit" data-event="cta_click" data-event-category="cta" data-event-label="pf-form-submit">Quero ser avisado</button>
              <p class="pf-form-note">Seus dados ficam só com a Savior e são usados apenas pra te avisar do lançamento.</p>
              <p class="pf-form-feedback" id="pfFeedback" role="status" aria-live="polite"></p>
            </form>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Script de submit** (fim da página, antes do `</Base>`; padrão trabalhe-conosco, SEM generate_lead)

```html
<script is:inline>
  (function () {
    var form = document.getElementById('pfForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fb = document.getElementById('pfFeedback');
      var btn = form.querySelector('.pf-submit');
      var nome = document.getElementById('pf-nome').value.trim();
      var whatsapp = document.getElementById('pf-whatsapp').value.trim();
      var email = document.getElementById('pf-email').value.trim();
      var cidade = document.getElementById('pf-cidade').value;
      if (!nome || !whatsapp || !email || !cidade) { fb.textContent = 'Preencha todos os campos.'; return; }
      var utm = window._saviorUtm || {};
      btn.disabled = true; btn.textContent = 'Enviando...';
      fetch('https://savior-lead-capture.marcelo-4f2.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plano_familiar_interesse',
          nome: nome, whatsapp: whatsapp, email: email, cidade: cidade,
          utm_source: utm.source || 'direct', utm_campaign: utm.campaign || 'none'
        })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && d.ok) {
          form.querySelectorAll('input, select, .pf-submit, .pf-label').forEach(function (el) { el.style.display = 'none'; });
          fb.textContent = 'Pronto! Você está na lista. Vamos te avisar em primeira mão no lançamento.';
          fb.classList.add('ok');
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'pf_interesse', page: 'plano-familiar', cidade: cidade });
        } else { throw new Error('fail'); }
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Quero ser avisado';
        fb.textContent = 'Não conseguimos enviar agora. Tente novamente em instantes.';
      });
    });
  })();
</script>
```

- [ ] **Step 4: Build parcial**

Run: `npm run build 2>&1 | tail -3`
Expected: `Complete!` sem erros

- [ ] **Step 5: Commit**

```bash
git add src/pages/plano-familiar.astro
git commit -m "feat(plano-familiar): página base com hero e form de lista de espera"
```

---

### Task 3: Página /plano-familiar — seções, FAQ, CTA final e CSS

**Files:**
- Modify: `src/pages/plano-familiar.astro`

- [ ] **Step 1: Seções após o hero** (dentro do `<main>`)

```astro
    <!-- ═══ BENEFÍCIOS ═══ -->
    <section class="section pf-beneficios" aria-labelledby="ben-heading">
      <div class="wrap">
        <p class="eyebrow" style="margin-bottom:12px">O que está incluído</p>
        <h2 id="ben-heading">Emergência resolvida, <em class="accent-text">sem susto no boleto</em></h2>
        <p class="pf-section-intro">O Plano Familiar coloca a estrutura da Savior de prontidão para as pessoas que você ama.</p>
        <div class="pf-ben-grid">
          {BENEFICIOS.map((b) => (
            <article class="pf-ben-card">
              <svg class="pf-ben-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" set:html={b.icon} />
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <!-- ═══ COMO VAI FUNCIONAR ═══ -->
    <section class="section pf-passos" aria-labelledby="passos-heading">
      <div class="wrap">
        <p class="eyebrow on-dark" style="margin-bottom:12px">Como vai funcionar</p>
        <h2 id="passos-heading" class="on-dark">Três passos até o lançamento</h2>
        <div class="pf-passos-grid">
          {PASSOS.map((p) => (
            <div class="pf-passo">
              <span class="pf-passo-num">{p.num}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <!-- ═══ POR QUE A SAVIOR ═══ -->
    <section class="section pf-prova" aria-labelledby="prova-heading">
      <div class="wrap">
        <p class="eyebrow" style="margin-bottom:12px">Por que a Savior</p>
        <h2 id="prova-heading">Quem vai atender sua família <em class="accent-text">já atende há 46 anos</em></h2>
        <div class="pf-stats">
          <div class="pf-stat"><strong>46</strong><span>anos de operação contínua</span></div>
          <div class="pf-stat"><strong>+100k</strong><span>atendimentos nos últimos 12 meses</span></div>
          <div class="pf-stat"><strong>+450</strong><span>médicos, enfermeiros e socorristas</span></div>
          <div class="pf-stat"><strong>4,7★</strong><span>mais de 730 avaliações no Google</span></div>
        </div>
      </div>
    </section>

    <FAQ items={faqItems} titleHtml="Perguntas sobre o <em>Plano Familiar</em>" eyebrow="DÚVIDAS" />

    <!-- ═══ CTA FINAL ═══ -->
    <section class="section pf-cta-final" aria-labelledby="ctaf-heading">
      <div class="wrap pf-cta-inner">
        <p class="eyebrow on-dark" style="margin-bottom:16px">Falta pouco</p>
        <h2 id="ctaf-heading" class="on-dark">Sua família na frente da fila.<br /><em class="pf-green-bright">Entre na lista de espera.</em></h2>
        <a href="#lista" class="btn btn-primary on-dark" data-event="cta_click" data-event-category="cta" data-event-label="pf-cta-final">Entrar na lista</a>
      </div>
    </section>

  </main>

  <Footer showBothCities={true} showBairros={false} />
</Base>
```

- [ ] **Step 2: CSS da página** em `<style>` no fim, usando tokens de `global.css`:
  - `.pf-hero`: copiar bloco `.tc-hero*` do trabalhe-conosco (position relative, min-height 100svh, bg img cover, overlay gradiente navy) renomeando prefixo pra `pf-`
  - `.pf-hero-grid`: `display:grid; grid-template-columns:1.1fr .9fr; gap:48px; align-items:center;` → 1 coluna abaixo de 960px
  - `.pf-form-card`: card branco (`background:#fff; border-radius:12px; padding:28px 24px; box-shadow:0 10px 40px rgba(0,0,0,.25)`); `.pf-label` (12px, mono, uppercase, verde escuro); `.pf-input` (padrão inputs do corporativo: borda `var(--cream-dark)`, radius 8px, focus ring verde); `.pf-form-feedback.ok { color: var(--green-dark); font-weight:600 }`
  - `.pf-hero-cta-mobile`: `display:none` desktop; `display:inline-flex` abaixo de 960px
  - `.pf-ben-grid`: 3 colunas → 2 (960px) → 1 (600px); card `background:var(--cream-light); border:1px solid var(--cream-dark); border-radius:12px; padding:24px`; `.pf-ben-icon { width:28px; height:28px; color:var(--green-dark); margin-bottom:12px }`
  - `.pf-passos`: fundo `var(--navy)`; `.pf-passo-num` IBM Plex Mono verde 14px; grid 3 → 1 colunas
  - `.pf-prova .pf-stats`: grid 4 → 2 colunas; `strong` 40px/800 navy; `span` 14px cinza
  - `.pf-cta-final`: fundo `var(--navy-deep)`, texto centralizado

- [ ] **Step 3: Build + validações no dist**

Run: `npm run build 2>&1 | tail -3` → `Complete!`
Validar `dist/plano-familiar.html`: contém `FAQPage`, `"Service"`, `pfForm`; ZERO `href="https://wa.me`; ZERO `sticky-header`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/plano-familiar.astro
git commit -m "feat(plano-familiar): benefícios, passos, prova social, FAQ e CTA final"
```

---

### Task 4: Link no Footer

**Files:**
- Modify: `src/components/Footer.astro:162`

- [ ] **Step 1: Adicionar link** após `<a href="/trabalhe-conosco">Trabalhe Conosco</a>`:

```astro
      <a href="/plano-familiar">Plano Familiar</a>
```

- [ ] **Step 2: Build e conferir** `dist/index.html` contém `/plano-familiar`

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: link Plano Familiar no footer"
```

---

### Task 5: Deploy, validação em produção e registro no vault

- [ ] **Step 1: Push** (dispara deploy no Pages)

```bash
git pull --rebase && git push
```

- [ ] **Step 2: Acompanhar Actions e validar produção**

Run: `gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status --interval 10`
Depois: `curl -s https://www.savior.com.br/plano-familiar/ | grep -c "Entre na lista"` ≥ 1

- [ ] **Step 3: Abrir no navegador pro Marcelo aprovar o visual** (`open https://www.savior.com.br/plano-familiar`)

- [ ] **Step 4: Registro no vault** (regra permanente Savior): nota de sessão do dia + `savior-backlog.md` + `vault/log.md` + `vault/index.md`

- [ ] **Step 5: Commit da spec e do plano**

```bash
git add docs/superpowers/
git commit -m "docs: spec e plano do /plano-familiar"
```
