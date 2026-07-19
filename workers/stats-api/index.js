// savior-stats-api — Cloudflare Worker
// Aggregates Google Ads, GA4, Blip, and Pipedrive data
// ALFA-17: Blip coleta dividida em fases RJ/SP com cache KV para evitar corte das últimas chamadas HTTP

var KV_KEY = "stats-data";
var TOKEN_URL = "https://oauth2.googleapis.com/token";

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function adsQuery(env, query) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GOOGLE_ADS_REFRESH_TOKEN
  );
  const customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "");
  const mccId = env.GOOGLE_ADS_MCC_ID.replace(/-/g, "");
  const res = await fetch(
    `https://googleads.googleapis.com/v24/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN,
        "login-customer-id": mccId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Ads API error (${res.status}): ${text}`);
  }
  const chunks = await res.json();
  const rows = [];
  for (const chunk of chunks) {
    if (chunk.results) rows.push(...chunk.results);
  }
  return rows;
}

async function fetchGoogleAds(env, startDate, endDate) {
  return adsQuery(env, `
    SELECT campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr, metrics.average_cpc
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
  `);
}

async function fetchGoogleAdsDaily(env, startDate, endDate) {
  return adsQuery(env, `
    SELECT segments.date, campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
  `);
}

async function fetchGoogleAdsKeywords(env, startDate, endDate) {
  return adsQuery(env, `
    SELECT ad_group_criterion.keyword.text,
           campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions
    FROM keyword_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
      AND ad_group_criterion.status = 'ENABLED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `);
}

function isRJ(name) {
  return /RJ|Rio|Niter[oó]i|Grande RIO/i.test(name);
}

function parseAdsRows(rows) {
  const byCampaign = {};
  let totalImpr = 0, totalClicks = 0, totalCost = 0, totalConv = 0;
  let rjImpr = 0, rjClicks = 0, rjCost = 0, rjConv = 0;
  let spImpr = 0, spClicks = 0, spCost = 0, spConv = 0;
  for (const r of rows) {
    const name = r.campaign?.name || "unknown";
    const m = r.metrics || {};
    const impr = Number(m.impressions) || 0;
    const clicks = Number(m.clicks) || 0;
    const costMicros = Number(m.costMicros) || 0;
    const conv = Number(m.conversions) || 0;
    if (!byCampaign[name]) {
      byCampaign[name] = { impressions: 0, clicks: 0, cost: 0, conversions: 0 };
    }
    byCampaign[name].impressions += impr;
    byCampaign[name].clicks += clicks;
    byCampaign[name].cost += costMicros / 1e6;
    byCampaign[name].conversions += conv;
    totalImpr += impr;
    totalClicks += clicks;
    totalCost += costMicros / 1e6;
    totalConv += conv;
    if (isRJ(name)) {
      rjImpr += impr; rjClicks += clicks; rjCost += costMicros / 1e6; rjConv += conv;
    } else {
      spImpr += impr; spClicks += clicks; spCost += costMicros / 1e6; spConv += conv;
    }
  }
  const campanhas = Object.entries(byCampaign).map(([name, d]) => ({
    Campanha: name,
    Impressoes: d.impressions,
    Cliques: d.clicks,
    "Custo RS": round2(d.cost),
    Conv: round2(d.conversions),
    "CPA RS": d.conversions > 0 ? round2(d.cost / d.conversions) : 0
  }));
  campanhas.sort((a, b) => b["Custo RS"] - a["Custo RS"]);
  function mkResumo(i, c, co, cv) {
    return {
      Impressoes: i, Cliques: c,
      CTR: i > 0 ? (c / i * 100).toFixed(1) + "%" : "0%",
      "Gasto RS": round2(co), Conversoes: round2(cv),
      "CPA RS": cv > 0 ? round2(co / cv) : 0
    };
  }
  return {
    resumo: mkResumo(totalImpr, totalClicks, totalCost, totalConv),
    resumo_rj: mkResumo(rjImpr, rjClicks, rjCost, rjConv),
    resumo_sp: mkResumo(spImpr, spClicks, spCost, spConv),
    campanhas
  };
}

function parseKeywordRows(rows) {
  return rows.map((r) => {
    const kw = r.adGroupCriterion?.keyword?.text || "";
    const camp = r.campaign?.name || "";
    const m = r.metrics || {};
    const clicks = Number(m.clicks) || 0;
    const costMicros = Number(m.costMicros) || 0;
    const cost = costMicros / 1e6;
    const conv = Number(m.conversions) || 0;
    const impr = Number(m.impressions) || 0;
    return {
      Keyword: kw, Campanha: camp, Impressoes: impr, Cliques: clicks,
      CTR: impr > 0 ? (clicks / impr * 100).toFixed(1) + "%" : "0%",
      "Custo RS": round2(cost), Conv: round2(conv),
      "CPA RS": conv > 0 ? round2(cost / conv) : 0
    };
  });
}

function parseDailyAdsRows(rows) {
  const byDate = {};
  for (const r of rows) {
    const date = r.segments?.date;
    if (!date) continue;
    const name = r.campaign?.name || "";
    const m = r.metrics || {};
    const clicks = Number(m.clicks) || 0;
    const cost = (Number(m.costMicros) || 0) / 1e6;
    const conv = Number(m.conversions) || 0;
    const impr = Number(m.impressions) || 0;
    const rj = isRJ(name);
    if (!byDate[date]) {
      byDate[date] = { clicks: 0, cost: 0, conv: 0, impr: 0, rj_clicks: 0, rj_cost: 0, rj_conv: 0, sp_clicks: 0, sp_cost: 0, sp_conv: 0 };
    }
    const d = byDate[date];
    d.clicks += clicks; d.cost += cost; d.conv += conv; d.impr += impr;
    if (rj) { d.rj_clicks += clicks; d.rj_cost += cost; d.rj_conv += conv; }
    else { d.sp_clicks += clicks; d.sp_cost += cost; d.sp_conv += conv; }
  }
  return byDate;
}

async function fetchGA4(env, startDate, endDate) {
  const token = await refreshAccessToken(env.GOOGLE_ADS_CLIENT_ID, env.GOOGLE_ADS_CLIENT_SECRET, env.GA4_REFRESH_TOKEN);
  const propertyId = env.GA4_PROPERTY_ID;
  const sessionsRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: "sessions" }, { name: "bounceRate" }]
      })
    }
  );
  if (!sessionsRes.ok) {
    const text = await sessionsRes.text();
    throw new Error(`GA4 sessions error (${sessionsRes.status}): ${text}`);
  }
  const sessionsData = await sessionsRes.json();
  const sessionsRow = sessionsData.rows?.[0]?.metricValues || [];
  const sessions = Number(sessionsRow[0]?.value) || 0;
  const bounceRate = Number(sessionsRow[1]?.value) || 0;
  const eventsRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          orGroup: {
            expressions: [
              { filter: { fieldName: "eventName", stringFilter: { value: "whatsapp_click" } } },
              { filter: { fieldName: "eventName", stringFilter: { value: "phone_click" } } }
            ]
          }
        }
      })
    }
  );
  let waClicks = 0, phClicks = 0;
  if (eventsRes.ok) {
    const eventsData = await eventsRes.json();
    for (const row of eventsData.rows || []) {
      const eventName = row.dimensionValues?.[0]?.value;
      const count = Number(row.metricValues?.[0]?.value) || 0;
      if (eventName === "whatsapp_click") waClicks = count;
      if (eventName === "phone_click") phClicks = count;
    }
  }
  return { sessions, bounceRate: round2(bounceRate * 100), waClicks, phClicks };
}

async function fetchGA4Daily(env, startDate, endDate) {
  const token = await refreshAccessToken(env.GOOGLE_ADS_CLIENT_ID, env.GOOGLE_ADS_CLIENT_SECRET, env.GA4_REFRESH_TOKEN);
  const propertyId = env.GA4_PROPERTY_ID;
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }]
      })
    }
  );
  if (!res.ok) return {};
  const data = await res.json();
  const byDate = {};
  for (const row of data.rows || []) {
    const raw = row.dimensionValues?.[0]?.value || "";
    const date = raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
    byDate[date] = Number(row.metricValues?.[0]?.value) || 0;
  }
  return byDate;
}

// Blip: fetch desk tickets with entry/closed/sucesso/sem_tag/venda buckets
// endpoint optional: defaults to https://{botDomain}.http.msging.net/commands
async function fetchBlipBothDaily(httpKey, botDomain, startDate, numDays, endpoint) {
  const url = endpoint || `https://${botDomain}.http.msging.net/commands`;
  const headers = { "Authorization": httpKey, "Content-Type": "application/json" };
  const entryBuckets = {};
  const closedBuckets = {};
  const sucessoBuckets = {};
  const semTagBuckets = {};
  const vendaBuckets = {};
  const vendaUtiBuckets = {};
  const vendaBasBuckets = {};
  // filas: { teamName: { d7: int, d30: int } }
  const filasMap = {};
  const startD = new Date(startDate + "T00:00:00-03:00");
  const d7cutoff = new Date(startD);
  d7cutoff.setDate(d7cutoff.getDate() + (numDays - 7));
  // hoje/ontem em data BR (offset -3h)
  const nowBR = new Date(Date.now() - 3 * 60 * 60 * 1e3);
  const todayBR = fmtDate(nowBR);
  const yesterdayBR = fmtDate(new Date(nowBR.getTime() - 24 * 60 * 60 * 1e3));
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startD);
    d.setDate(d.getDate() + i);
    const key = fmtDate(d);
    entryBuckets[key] = 0;
    closedBuckets[key] = 0;
    sucessoBuckets[key] = 0;
    semTagBuckets[key] = 0;
    vendaBuckets[key] = 0;
    vendaUtiBuckets[key] = 0;
    vendaBasBuckets[key] = 0;
  }
  const startTs = startD.getTime();
  const d7Ts = d7cutoff.getTime();
  let skip = 0;
  const take = 100;
  let keepGoing = true;
  while (keepGoing) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: `both-${Date.now()}-${skip}`,
        to: "postmaster@desk.msging.net",
        method: "get",
        uri: `/tickets?$skip=${skip}&$take=${take}`
      })
    });
    if (!res.ok) { console.error("Blip HTTP error:", res.status); break; }
    const data = await res.json();
    if (data.status === "failure") { console.error("Blip API failure:", data.reason); break; }
    const items = data.resource?.items || [];
    if (items.length === 0) break;
    for (const t of items) {
      const openTs = t.openDate ? new Date(t.openDate).getTime() : 0;
      if (openTs > 0 && openTs < startTs) { keepGoing = false; break; }
      // Skip test tickets entirely
      const tags = t.tags || [];
      if (tags.includes("Teste")) continue;
      if (openTs > 0) {
        const brOpen = new Date(openTs - 3 * 60 * 60 * 1e3);
        const openKey = fmtDate(brOpen);
        if (openKey in entryBuckets) entryBuckets[openKey]++;
        // Count vendas by tag regardless of close status.
        // Tags atuais (Novo Fluxo alfa, desde ~10/07/2026): "VR - UTI" e "VR - BAS".
        // Legadas mantidas pro histórico: "Venda realizada", "Finalizado com sucesso".
        const isVenda = tags.includes("Venda realizada") || tags.includes("Finalizado com sucesso") || tags.some((x) => String(x).trim().toUpperCase().startsWith("VR - "));
        if (isVenda && openKey in vendaBuckets) vendaBuckets[openKey]++;
        // Split UTI vs BAS (novas tags do Novo Fluxo alfa)
        const isUti = tags.some((x) => String(x).trim().toUpperCase() === "VR - UTI");
        const isBas = tags.some((x) => String(x).trim().toUpperCase() === "VR - BAS");
        if (isUti && openKey in vendaUtiBuckets) vendaUtiBuckets[openKey]++;
        if (isBas && openKey in vendaBasBuckets) vendaBasBuckets[openKey]++;
        // Contagem por fila (team) — usa data de abertura, mesmos cutoffs d7/d30
        const teamName = (t.team && t.team.trim()) ? t.team.trim() : "DIRECT_TRANSFER";
        if (!filasMap[teamName]) filasMap[teamName] = { hoje: 0, ontem: 0, d7: 0, d30: 0 };
        filasMap[teamName].d30++;
        if (openTs >= d7Ts) filasMap[teamName].d7++;
        if (openKey === todayBR) filasMap[teamName].hoje++;
        else if (openKey === yesterdayBR) filasMap[teamName].ontem++;
      }
      if (t.closed && t.closeDate) {
        const closeTs = new Date(t.closeDate).getTime();
        const brClose = new Date(closeTs - 3 * 60 * 60 * 1e3);
        const closeKey = fmtDate(brClose);
        if (closeKey in closedBuckets) {
          closedBuckets[closeKey]++;
          const isSucesso = tags.includes("Finalizado com sucesso") || tags.includes("Venda realizada") || tags.some((x) => String(x).trim().toUpperCase().startsWith("VR - "));
          if (isSucesso) sucessoBuckets[closeKey]++;
          if (tags.length === 0) semTagBuckets[closeKey]++;
        }
      }
    }
    if (items.length < take) break;
    if (skip >= 600) break;
    skip += take;
    if (skip > 1000) break;
  }
  return {
    entries: entryBuckets,
    closed: closedBuckets,
    sucesso: sucessoBuckets,
    sem_tag: semTagBuckets,
    venda: vendaBuckets,
    venda_uti: vendaUtiBuckets,
    venda_bas: vendaBasBuckets,
    filas: filasMap
  };
}

// Blip SP: count CRM contacts (SP router has NO desk module)
// overrides: mapa identity → data real (ISO), corrige lastMessageDate bumpado
// pelos backfills de extras de 17-18/07/2026 (o índice do CRM re-indexa
// lastMessageDate = agora em qualquer merge/set de contato; não é gravável).
async function fetchBlipCrmDaily(httpKey, botDomain, startDate, numDays, overrides) {
  const headers = { "Authorization": httpKey, "Content-Type": "application/json" };
  // Distribuição de origem UTM (extras gravados pelo blip-utm-sync)
  const origSource = { organico: 0, google_cpc: 0, google: 0, sem_atribuicao: 0 };
  const origCampanha = {};
  let origTotal = 0;
  const entryBuckets = {};
  const startD = new Date(startDate + "T00:00:00-03:00");
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startD);
    d.setDate(d.getDate() + i);
    entryBuckets[fmtDate(d)] = 0;
  }
  const startTs = startD.getTime();
  let skip = 0;
  const take = 100;
  let keepGoing = true;
  while (keepGoing) {
    const crmHost = botDomain ? `https://${botDomain}.http.msging.net/commands` : "https://http.msging.net/commands";
    const res = await fetch(crmHost, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: `crm-${Date.now()}-${skip}`,
        to: "postmaster@crm.msging.net",
        method: "get",
        uri: `/contacts?$orderby=lastMessageDate+desc&$skip=${skip}&$take=${take}`
      })
    });
    if (!res.ok) { console.error("Blip CRM HTTP error:", res.status); break; }
    const data = await res.json();
    if (data.status === "failure") { console.error("Blip CRM failure:", data.reason); break; }
    const items = data.resource?.items || [];
    if (items.length === 0 || skip >= 800) break;
    for (const c of items) {
      // Terminação da paginação usa SEMPRE a data do índice (ordem desc)
      const idxTs = c.lastMessageDate ? new Date(c.lastMessageDate).getTime() : 0;
      if (idxTs < startTs) { keepGoing = false; break; }
      // Skip test contacts (group "Teste"/"Testers" or name starting with "Tester")
      if (c.group === "Teste" || c.group === "Testers" || (c.name && c.name.startsWith("Tester"))) continue;
      // Bucketing usa a data corrigida quando o contato está no mapa de
      // overrides e o índice caiu na janela poluída (>= 17/07/2026)
      let lastMsg = idxTs;
      const ov = overrides && c.identity ? overrides[c.identity] : null;
      if (ov && c.lastMessageDate && c.lastMessageDate >= "2026-07-17") {
        lastMsg = new Date(ov).getTime();
        if (lastMsg < startTs) continue; // data real anterior à janela: não conta
      }
      const brDate = new Date(lastMsg - 3 * 60 * 60 * 1e3);
      const dateKey = fmtDate(brDate);
      if (dateKey in entryBuckets) entryBuckets[dateKey]++;
      // Origem UTM do contato (dentro da janela)
      origTotal++;
      const ex = c.extras || {};
      const src = (ex.utm_source || "").trim();
      if (src in origSource) origSource[src]++;
      else if (src) origSource[src] = (origSource[src] || 0) + 1;
      else origSource.sem_atribuicao++;
      const cmp = (ex.utm_campaign || "").trim();
      if (cmp && cmp !== "sem-tag") origCampanha[cmp] = (origCampanha[cmp] || 0) + 1;
    }
    if (items.length < take) break;
    await new Promise((r)=>setTimeout(r,250)); // throttle Blip
    skip += take;
    if (skip > 2000) break;
  }
  // SP has no desk, so closed/sucesso/sem_tag are always 0
  const zeroBuckets = {};
  for (const key of Object.keys(entryBuckets)) zeroBuckets[key] = 0;
  const topCampanhas = {};
  for (const [k, v] of Object.entries(origCampanha).sort((a, b) => b[1] - a[1]).slice(0, 10)) topCampanhas[k] = v;
  const origens = { janela_dias: numDays - 1, total: origTotal, por_source: origSource, por_campanha: topCampanhas };
  return { entries: entryBuckets, closed: zeroBuckets, sucesso: zeroBuckets, sem_tag: zeroBuckets, origens };
}

// --- ALFA-17: Blip collection split into two phases with KV cache ---

// collectBlipRJ: desk saviorprincipal + saviorrj bot + alfa bot + CRM RJ
// Returns: { entries, closed, sucesso, sem_tag, venda, venda_uti, venda_bas, filas, contacts }
async function collectBlipRJ(env) {
  const BOT_DOMAIN = "savior";
  const d30start = fmtDate(daysAgo(30));
  const rjKey = env.BLIP_HTTP_KEY;

  let entries = {};
  let closed = {};
  let sucesso = {};
  let sem_tag = {};
  let venda = {};
  let venda_uti = {};
  let venda_bas = {};
  let filas = {};
  let contacts = {};
  let origens = null;

  function mergeBuckets(target, source) {
    for (const k of Object.keys(source)) {
      if (k in target) target[k] += source[k];
      else target[k] = source[k];
    }
  }
  function mergeFilas(target, source) {
    for (const [team, counts] of Object.entries(source)) {
      if (!target[team]) target[team] = { hoje: 0, ontem: 0, d7: 0, d30: 0 };
      target[team].hoje += counts.hoje || 0;
      target[team].ontem += counts.ontem || 0;
      target[team].d7 += counts.d7 || 0;
      target[team].d30 += counts.d30 || 0;
    }
  }

  // saviorprincipal desk (domínio custom + BLIP_HTTP_KEY)
  try {
    const rjBoth = await fetchBlipBothDaily(rjKey, BOT_DOMAIN, d30start, 31);
    entries = rjBoth.entries;
    closed = rjBoth.closed;
    sucesso = rjBoth.sucesso;
    sem_tag = rjBoth.sem_tag;
    venda = rjBoth.venda;
    venda_uti = rjBoth.venda_uti;
    venda_bas = rjBoth.venda_bas;
    mergeFilas(filas, rjBoth.filas);
    console.log("collectBlipRJ: saviorprincipal OK, entries:", Object.values(entries).reduce((a,v)=>a+v,0), "venda:", Object.values(venda).reduce((a,v)=>a+v,0));
  } catch (e) { console.error("collectBlipRJ: saviorprincipal ERROR:", e.message); }

  // saviorrj bot (host genérico + BLIP_RJ_HTTP_KEY)
  if (env.BLIP_RJ_HTTP_KEY) {
    try {
      const rjBot = await fetchBlipBothDaily(env.BLIP_RJ_HTTP_KEY, null, d30start, 31, "https://http.msging.net/commands");
      mergeBuckets(entries, rjBot.entries);
      mergeBuckets(closed, rjBot.closed);
      mergeBuckets(sucesso, rjBot.sucesso);
      mergeBuckets(sem_tag, rjBot.sem_tag);
      mergeBuckets(venda, rjBot.venda);
      mergeBuckets(venda_uti, rjBot.venda_uti);
      mergeBuckets(venda_bas, rjBot.venda_bas);
      mergeFilas(filas, rjBot.filas);
      console.log("collectBlipRJ: saviorrj OK, entries:", Object.values(rjBot.entries).reduce((a,v)=>a+v,0), "venda:", Object.values(rjBot.venda).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("collectBlipRJ: saviorrj ERROR:", e.message); }
  }

  // alfa bot (host genérico + BLIP_ALFA_KEY)
  if (env.BLIP_ALFA_KEY) {
    try {
      const rjAlfa = await fetchBlipBothDaily(env.BLIP_ALFA_KEY, null, d30start, 31, "https://http.msging.net/commands");
      mergeBuckets(entries, rjAlfa.entries);
      mergeBuckets(closed, rjAlfa.closed);
      mergeBuckets(sucesso, rjAlfa.sucesso);
      mergeBuckets(sem_tag, rjAlfa.sem_tag);
      mergeBuckets(venda, rjAlfa.venda);
      mergeBuckets(venda_uti, rjAlfa.venda_uti);
      mergeBuckets(venda_bas, rjAlfa.venda_bas);
      mergeFilas(filas, rjAlfa.filas);
      console.log("collectBlipRJ: alfa OK, entries:", Object.values(rjAlfa.entries).reduce((a,v)=>a+v,0), "venda:", Object.values(rjAlfa.venda).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("collectBlipRJ: alfa ERROR:", e.message); }
  }

  // CRM RJ — router key, domínio custom BOT_DOMAIN
  const rjCrmKey = env.BLIP_ROUTER_KEY || rjKey;
  try {
    // Correção lastMessageDate (incidente backfill 17-18/07/2026)
    let lmdOverrides = null;
    try {
      const ovRaw = await env.STATS_KV.get("lmd_overrides");
      lmdOverrides = ovRaw ? JSON.parse(ovRaw) : null;
    } catch (e) { console.error("collectBlipRJ: lmd_overrides parse ERROR:", e.message); }
    const rjCrm = await fetchBlipCrmDaily(rjCrmKey, BOT_DOMAIN, d30start, 31, lmdOverrides);
    contacts = rjCrm.entries;
    origens = rjCrm.origens;
    console.log("collectBlipRJ: CRM OK, contacts:", Object.values(contacts).reduce((a,v)=>a+v,0), "origens:", origens ? origens.total : 0);
  } catch (e) { console.error("collectBlipRJ: CRM ERROR:", e.message); }

  return { entries, closed, sucesso, sem_tag, venda, venda_uti, venda_bas, filas, contacts, origens };
}

// collectBlipSP: CRM SP + desk SP antigo + desk contingência SP
// Returns: { contacts, venda }
async function collectBlipSP(env) {
  const d30start = fmtDate(daysAgo(30));
  const spKey = env.BLIP_SP_HTTP_KEY;

  let contacts = {};
  let venda = {};

  function mergeBuckets(target, source) {
    for (const k of Object.keys(source)) {
      if (k in target) target[k] += source[k];
      else target[k] = source[k];
    }
  }

  // CRM SP (host genérico + BLIP_SP_HTTP_KEY)
  if (spKey) {
    try {
      const spCrm = await fetchBlipCrmDaily(spKey, null, d30start, 31);
      contacts = spCrm.entries;
      console.log("collectBlipSP: CRM SP OK, contacts:", Object.values(contacts).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("collectBlipSP: CRM SP ERROR:", e.message); }
  }

  // desk SP antigo (host genérico + BLIP_SP_DESK_KEY)
  if (env.BLIP_SP_DESK_KEY) {
    try {
      const spDesk = await fetchBlipBothDaily(env.BLIP_SP_DESK_KEY, null, d30start, 31, "https://http.msging.net/commands");
      mergeBuckets(venda, spDesk.venda);
      console.log("collectBlipSP: desk SP OK, venda:", Object.values(spDesk.venda).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("collectBlipSP: desk SP ERROR:", e.message); }
  }

  // desk contingência SP (host genérico + BLIP_SP_CONT_KEY)
  if (env.BLIP_SP_CONT_KEY) {
    try {
      const spCont = await fetchBlipBothDaily(env.BLIP_SP_CONT_KEY, null, d30start, 31, "https://http.msging.net/commands");
      mergeBuckets(venda, spCont.venda);
      console.log("collectBlipSP: contingência SP OK, venda:", Object.values(spCont.venda).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("collectBlipSP: contingência SP ERROR:", e.message); }
  }

  return { contacts, venda };
}

// --- Pipedrive ---
async function fetchPipedriveStats(token) {
  const BASE = "https://api.pipedrive.com/v1";
  const result = { pessoas: 0, empresas: 0, por_pipeline: {}, por_tipo: {}, por_cidade: {} };

  let start = 0;
  let allDeals = [];
  let hasMore = true;
  while (hasMore && start < 200) {
    const res = await fetch(`${BASE}/deals?api_token=${token}&status=all_not_deleted&start=${start}&limit=100&sort=add_time DESC`);
    if (!res.ok) { console.error("Pipedrive deals error:", res.status); break; }
    const data = await res.json();
    if (!data.success) break;
    const items = data.data || [];
    allDeals = allDeals.concat(items);
    hasMore = data.additional_data?.pagination?.more_items_in_collection || false;
    start += 100;
  }

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentDeals = allDeals.filter(d => new Date(d.add_time) >= cutoff);

  const personIds = new Set();
  const orgIds = new Set();
  const pipelineNames = {};
  const pipelineCounts = {};

  for (const deal of recentDeals) {
    if (deal.person_id?.value) personIds.add(deal.person_id.value);
    if (deal.org_id?.value) orgIds.add(deal.org_id.value);
    const pName = deal.pipeline_id ? String(deal.pipeline_id) : "outros";
    pipelineCounts[pName] = (pipelineCounts[pName] || 0) + 1;
  }

  result.pessoas = personIds.size;
  result.empresas = orgIds.size;

  try {
    const pRes = await fetch(`${BASE}/pipelines?api_token=${token}`);
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        for (const p of pData.data) {
          pipelineNames[String(p.id)] = p.name;
        }
      }
    }
  } catch (e) { console.error("Pipedrive pipelines error:", e.message); }

  for (const [pid, count] of Object.entries(pipelineCounts)) {
    const name = pipelineNames[pid] || `Pipeline ${pid}`;
    result.por_pipeline[name] = count;
  }

  for (const deal of recentDeals) {
    const title = deal.title || "";
    const parts = title.split("|").map(s => s.trim());
    const tipo = parts.length >= 2 ? parts[0] : "Outros";
    result.por_tipo[tipo] = (result.por_tipo[tipo] || 0) + 1;
  }

  for (const deal of recentDeals) {
    const city = deal.org_id?.address_locality || "";
    if (city) {
      result.por_cidade[city] = (result.por_cidade[city] || 0) + 1;
    }
  }

  return result;
}

// --- Helpers ---
function nowBRT() { return new Date(Date.now() - 3 * 60 * 60 * 1e3); }
function fmtDate(d) { return d.toISOString().slice(0, 10); }
function daysAgo(n) { const d = nowBRT(); d.setDate(d.getDate() - n); return d; }
function round2(v) { return Math.round(v * 100) / 100; }

async function buildPeriod(env, startDate, endDate, days) {
  const [adsRows, ga4] = await Promise.all([
    fetchGoogleAds(env, startDate, endDate),
    fetchGA4(env, startDate, endDate)
  ]);
  let impr = 0, clicks = 0, cost = 0, conv = 0;
  let rjImpr = 0, rjClicks = 0, rjCost = 0, rjConv = 0;
  let spImpr = 0, spClicks = 0, spCost = 0, spConv = 0;
  for (const r of adsRows) {
    const name = r.campaign?.name || "";
    const m = r.metrics || {};
    const _impr = Number(m.impressions) || 0;
    const _clicks = Number(m.clicks) || 0;
    const _cost = (Number(m.costMicros) || 0) / 1e6;
    const _conv = Number(m.conversions) || 0;
    impr += _impr; clicks += _clicks; cost += _cost; conv += _conv;
    if (isRJ(name)) { rjImpr += _impr; rjClicks += _clicks; rjCost += _cost; rjConv += _conv; }
    else { spImpr += _impr; spClicks += _clicks; spCost += _cost; spConv += _conv; }
  }
  function mkPeriod(i, c, co, cv, sess, wa, ph, bounce) {
    const di = days > 0 ? i / days : i;
    const dc = days > 0 ? c / days : c;
    const ds = days > 0 ? sess / days : sess;
    const dco = days > 0 ? co / days : co;
    const dcv = days > 0 ? cv / days : cv;
    const dwa = days > 0 ? wa / days : wa;
    const dph = days > 0 ? ph / days : ph;
    return {
      impressions: round2(di), ad_clicks: round2(dc), sessions: round2(ds),
      wa_clicks: round2(dwa), ph_clicks: round2(dph),
      blip: 0, blip_closed: 0, blip_sucesso: 0, blip_sem_tag: 0, blip_venda: 0, blip_contacts: 0,
      cost: round2(dco), cpc: dc > 0 ? round2(dco / dc) : 0,
      ctr: di > 0 ? round2(dc / di * 100) : 0,
      conversions: round2(dcv), cpl_blip: 0,
      bounce: bounce || 0, form_start: 0
    };
  }
  const rjRatio = clicks > 0 ? rjClicks / clicks : 0;
  const spRatio = clicks > 0 ? spClicks / clicks : 0;
  const cons = mkPeriod(impr, clicks, cost, conv, ga4.sessions, ga4.waClicks, ga4.phClicks, ga4.bounceRate);
  const rj = mkPeriod(rjImpr, rjClicks, rjCost, rjConv, Math.round(ga4.sessions * rjRatio), Math.round(ga4.waClicks * rjRatio), Math.round(ga4.phClicks * rjRatio), ga4.bounceRate);
  const sp = mkPeriod(spImpr, spClicks, spCost, spConv, Math.round(ga4.sessions * spRatio), Math.round(ga4.waClicks * spRatio), Math.round(ga4.phClicks * spRatio), ga4.bounceRate);
  return { cons, rj, sp };
}

// --- buildMainJson: lê caches Blip do KV e monta o JSON principal (sem fetches Blip) ---
async function buildMainJson(env) {
  const today = fmtDate(nowBRT());
  const yesterday = fmtDate(daysAgo(1));
  const d2Date = fmtDate(daysAgo(2));
  const d30start = fmtDate(daysAgo(30));
  const d90start = fmtDate(daysAgo(90));

  const [hojeP, ontemP, d2P, periodo30, periodo90, adsDetail, kwDetail, dailyAdsRows, dailyGA4] = await Promise.all([
    buildPeriod(env, today, today, 1),
    buildPeriod(env, yesterday, yesterday, 1),
    buildPeriod(env, d2Date, d2Date, 1),
    buildPeriod(env, d30start, yesterday, 30),
    buildPeriod(env, d90start, yesterday, 90),
    fetchGoogleAds(env, d30start, yesterday),
    fetchGoogleAdsKeywords(env, d30start, yesterday),
    fetchGoogleAdsDaily(env, d30start, yesterday),
    fetchGA4Daily(env, d30start, yesterday)
  ]);

  // Ler caches Blip do KV (sem fetch Blip)
  const [rjRaw, spRaw] = await Promise.all([
    env.STATS_KV.get("blipcache_rj"),
    env.STATS_KV.get("blipcache_sp")
  ]);
  const rjCache = rjRaw ? JSON.parse(rjRaw) : {};
  const spCache = spRaw ? JSON.parse(spRaw) : {};

  const blipDailyRJ = rjCache.entries || {};
  const blipClosedDailyRJ = rjCache.closed || {};
  const blipSucessoRJ = rjCache.sucesso || {};
  const blipSemTagRJ = rjCache.sem_tag || {};
  const blipVendaRJ = rjCache.venda || {};
  const blipVendaUtiRJ = rjCache.venda_uti || {};
  const blipVendaBasRJ = rjCache.venda_bas || {};
  const blipFilasRJ = rjCache.filas || {};
  const blipContactsRJ = rjCache.contacts || {};

  const blipContactsSP = spCache.contacts || {};
  const blipVendaSP = spCache.venda || {};

  // SP entries/closed/sucesso/sem_tag derived from contacts (no desk)
  const blipDailySP = blipContactsSP;
  const zeroBucketsSP = {};
  for (const k of Object.keys(blipContactsSP)) zeroBucketsSP[k] = 0;
  const blipClosedDailySP = zeroBucketsSP;
  const blipSucessoSP = zeroBucketsSP;
  const blipSemTagSP = zeroBucketsSP;

  function sumBuckets(buckets) { return Object.values(buckets).reduce((a, v) => a + v, 0); }
  function dayVal(buckets, date) { return buckets[date] || 0; }

  const rjToday = dayVal(blipDailyRJ, today), spToday = dayVal(blipDailySP, today);
  const rjOntem = dayVal(blipDailyRJ, yesterday), spOntem = dayVal(blipDailySP, yesterday);
  const rjD2 = dayVal(blipDailyRJ, d2Date), spD2 = dayVal(blipDailySP, d2Date);
  const rj30 = sumBuckets(blipDailyRJ), sp30 = sumBuckets(blipDailySP);
  const bcRjToday = dayVal(blipClosedDailyRJ, today), bcSpToday = dayVal(blipClosedDailySP, today);
  const bcRjOntem = dayVal(blipClosedDailyRJ, yesterday), bcSpOntem = dayVal(blipClosedDailySP, yesterday);
  const bcRjD2 = dayVal(blipClosedDailyRJ, d2Date), bcSpD2 = dayVal(blipClosedDailySP, d2Date);
  const bcRj30 = sumBuckets(blipClosedDailyRJ), bcSp30 = sumBuckets(blipClosedDailySP);

  // Venda realizada (tag específica)
  const vdRjToday = dayVal(blipVendaRJ, today), vdRjOntem = dayVal(blipVendaRJ, yesterday), vdRjD2 = dayVal(blipVendaRJ, d2Date);
  const vdRj30 = sumBuckets(blipVendaRJ);
  const vdSpToday = dayVal(blipVendaSP, today), vdSpOntem = dayVal(blipVendaSP, yesterday), vdSpD2 = dayVal(blipVendaSP, d2Date);
  const vdSp30 = sumBuckets(blipVendaSP);

  // Split UTI vs BAS (agrega tudo em d7 e d30)
  function sumBucketsLast(buckets, days) {
    const allDates = Object.keys(buckets).sort();
    const slice = days ? allDates.slice(-days) : allDates;
    return slice.reduce((a, k) => a + (buckets[k] || 0), 0);
  }
  const utiD7 = sumBucketsLast(blipVendaUtiRJ, 7);
  const utiD30 = sumBuckets(blipVendaUtiRJ);
  const basD7 = sumBucketsLast(blipVendaBasRJ, 7);
  const basD30 = sumBuckets(blipVendaBasRJ);

  // Contatos CRM (bot interactions, superset de desk tickets)
  const ctRjToday = dayVal(blipContactsRJ, today), ctSpToday = dayVal(blipContactsSP, today);
  const ctRjOntem = dayVal(blipContactsRJ, yesterday), ctSpOntem = dayVal(blipContactsSP, yesterday);
  const ctRjD2 = dayVal(blipContactsRJ, d2Date), ctSpD2 = dayVal(blipContactsSP, d2Date);
  const ctRj30 = sumBuckets(blipContactsRJ), ctSp30 = sumBuckets(blipContactsSP);

  function fillBlip(period, rjBlip, spBlip, rjClosed, spClosed, rjVenda, spVenda, rjContacts, spContacts, days) {
    const dRj = days > 0 ? rjBlip / days : rjBlip;
    const dSp = days > 0 ? spBlip / days : spBlip;
    const dRjC = days > 0 ? rjClosed / days : rjClosed;
    const dSpC = days > 0 ? spClosed / days : spClosed;
    const dRjV = days > 0 ? rjVenda / days : rjVenda;
    const dSpV = days > 0 ? spVenda / days : spVenda;
    const dRjCt = days > 0 ? rjContacts / days : rjContacts;
    const dSpCt = days > 0 ? spContacts / days : spContacts;
    period.cons.blip = round2(dRj + dSp);
    period.cons.cpl_blip = (dRj + dSp) > 0 ? round2(period.cons.cost / (dRj + dSp)) : 0;
    period.cons.blip_closed = round2(dRjC + dSpC);
    period.cons.blip_venda = round2(dRjV + dSpV);
    period.cons.blip_contacts = round2(dRjCt + dSpCt);
    period.rj.blip = round2(dRj);
    period.rj.cpl_blip = dRj > 0 ? round2(period.rj.cost / dRj) : 0;
    period.rj.blip_closed = round2(dRjC);
    period.rj.blip_venda = round2(dRjV);
    period.rj.blip_contacts = round2(dRjCt);
    period.sp.blip = round2(dSp);
    period.sp.cpl_blip = dSp > 0 ? round2(period.sp.cost / dSp) : 0;
    period.sp.blip_closed = round2(dSpC);
    period.sp.blip_venda = round2(dSpV);
    period.sp.blip_contacts = round2(dSpCt);
  }

  fillBlip(hojeP, rjToday, spToday, bcRjToday, bcSpToday, vdRjToday, vdSpToday, ctRjToday, ctSpToday, 1);
  fillBlip(ontemP, rjOntem, spOntem, bcRjOntem, bcSpOntem, vdRjOntem, vdSpOntem, ctRjOntem, ctSpOntem, 1);
  fillBlip(d2P, rjD2, spD2, bcRjD2, bcSpD2, vdRjD2, vdSpD2, ctRjD2, ctSpD2, 1);
  fillBlip(periodo30, rj30, sp30, bcRj30, bcSp30, vdRj30, vdSp30, ctRj30, ctSp30, 30);
  fillBlip(periodo90, rj30, sp30, bcRj30, bcSp30, vdRj30, vdSp30, ctRj30, ctSp30, 90);

  const adsByDate = parseDailyAdsRows(dailyAdsRows);
  const dailyDates = [];
  const cursor = new Date(d30start + "T00:00:00Z");
  const endCursor = new Date(yesterday + "T00:00:00Z");
  while (cursor <= endCursor) {
    dailyDates.push(fmtDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const daily = dailyDates.map((date) => {
    const ads2 = adsByDate[date] || {};
    const sessions = dailyGA4[date] || 0;
    const blip_rj = blipDailyRJ[date] || 0;
    const blip_sp = blipDailySP[date] || 0;
    const blip_closed_rj = blipClosedDailyRJ[date] || 0;
    const blip_closed_sp = blipClosedDailySP[date] || 0;
    const blip_sucesso_rj = (blipSucessoRJ[date] || 0);
    const blip_sucesso_sp = (blipSucessoSP[date] || 0);
    const blip_sem_tag_rj = (blipSemTagRJ[date] || 0);
    const blip_sem_tag_sp = (blipSemTagSP[date] || 0);
    const blip_venda_rj = (blipVendaRJ[date] || 0);
    const blip_venda_sp = (blipVendaSP[date] || 0);
    const blip_venda_uti = (blipVendaUtiRJ[date] || 0);
    const blip_venda_bas = (blipVendaBasRJ[date] || 0);
    const blip_contacts_rj = (blipContactsRJ[date] || 0);
    const blip_contacts_sp = (blipContactsSP[date] || 0);
    return {
      date, clicks: ads2.clicks || 0, cost: round2(ads2.cost || 0),
      conv: round2(ads2.conv || 0), impr: ads2.impr || 0, sessions,
      blip: blip_rj + blip_sp, blip_closed: blip_closed_rj + blip_closed_sp,
      blip_sucesso: blip_sucesso_rj + blip_sucesso_sp,
      blip_sem_tag: blip_sem_tag_rj + blip_sem_tag_sp,
      blip_venda: blip_venda_rj + blip_venda_sp,
      blip_venda_uti, blip_venda_bas,
      blip_contacts: blip_contacts_rj + blip_contacts_sp,
      blip_rj, blip_sp, blip_closed_rj, blip_closed_sp,
      blip_contacts_rj, blip_contacts_sp, blip_venda_rj, blip_venda_sp,
      rj_clicks: ads2.rj_clicks || 0, rj_cost: round2(ads2.rj_cost || 0), rj_conv: round2(ads2.rj_conv || 0),
      sp_clicks: ads2.sp_clicks || 0, sp_cost: round2(ads2.sp_cost || 0), sp_conv: round2(ads2.sp_conv || 0)
    };
  });

  const ads = parseAdsRows(adsDetail);
  ads.keywords = parseKeywordRows(kwDetail);
  ads.ok = true;

  // Pipedrive stats
  let pipedriveStats = { pessoas: 0, empresas: 0, por_pipeline: {}, por_tipo: {}, por_cidade: {} };
  if (env.PIPEDRIVE_TOKEN) {
    try {
      pipedriveStats = await fetchPipedriveStats(env.PIPEDRIVE_TOKEN);
      console.log("Pipedrive OK, pessoas:", pipedriveStats.pessoas, "empresas:", pipedriveStats.empresas);
    } catch (e) { console.error("Pipedrive ERROR:", e.message); }
  }

  const now = new Date();
  const brOffset = new Date(now.getTime() - 3 * 60 * 60 * 1e3);

  return {
    gerado_em: brOffset.toISOString().replace("Z", "-03:00"),
    origens: rjCache.origens || null,
    funil: {
      labels: {
        hoje: today.slice(5) + " (parcial)",
        ontem: yesterday.slice(5),
        d2: d2Date.slice(5),
        "30d": "Med/dia 30d",
        "90d": "Med/dia 90d"
      },
      hoje: hojeP.cons, hoje_rj: hojeP.rj, hoje_sp: hojeP.sp,
      ontem: ontemP.cons, ontem_rj: ontemP.rj, ontem_sp: ontemP.sp,
      d2: d2P.cons, d2_rj: d2P.rj, d2_sp: d2P.sp,
      "30d": periodo30.cons, "30d_rj": periodo30.rj, "30d_sp": periodo30.sp,
      "90d": periodo90.cons, "90d_rj": periodo90.rj, "90d_sp": periodo90.sp
    },
    daily,
    resumo: {
      pessoas: pipedriveStats.pessoas,
      empresas: pipedriveStats.empresas,
      leads_wa_30d: rj30 + sp30,
      formularios_30d: 0
    },
    por_mes: {},
    por_pipeline: pipedriveStats.por_pipeline,
    por_tipo: pipedriveStats.por_tipo,
    por_cidade: pipedriveStats.por_cidade,
    ads,
    blip_venda_split: {
      uti: { d7: utiD7, d30: utiD30 },
      bas: { d7: basD7, d30: basD30 }
    },
    blip_filas: blipFilasRJ
  };
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = [env.ALLOWED_ORIGIN, "https://savior.com.br", "https://www.savior.com.br", "http://localhost:4321", "http://localhost:3000"];
  const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".savior-site.pages.dev");
  const corsOrigin = isAllowed ? origin : env.ALLOWED_ORIGIN;
  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (url.pathname === "/stats-data.json" && request.method === "GET") {
    const cached = await env.STATS_KV.get(KV_KEY);
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }
      });
    }
    try {
      const data = await buildMainJson(env);
      const json = JSON.stringify(data);
      await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
      return new Response(json, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  // POST /refresh-rj: coleta fase RJ, salva cache blipcache_rj
  if (url.pathname === "/refresh-rj" && request.method === "POST") {
    try {
      const result = await collectBlipRJ(env);
      await env.STATS_KV.put("blipcache_rj", JSON.stringify(result));
      console.log("refresh-rj: cache salvo OK");
      return new Response(JSON.stringify({ ok: true, phase: "rj" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  // POST /refresh-sp: coleta fase SP, salva cache blipcache_sp
  if (url.pathname === "/refresh-sp" && request.method === "POST") {
    try {
      const result = await collectBlipSP(env);
      await env.STATS_KV.put("blipcache_sp", JSON.stringify(result));
      console.log("refresh-sp: cache salvo OK");
      return new Response(JSON.stringify({ ok: true, phase: "sp" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  // POST /refresh: reconstrói JSON principal lendo caches (sem fetch Blip)
  if (url.pathname === "/refresh" && request.method === "POST") {
    try {
      const data = await buildMainJson(env);
      const json = JSON.stringify(data);
      await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
      return new Response(JSON.stringify({ ok: true, gerado_em: data.gerado_em }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  return new Response("Not found", { status: 404 });
}

async function handleScheduled(event, env) {
  const hour = new Date().getUTCHours();
  const phase = hour % 2 === 0 ? "rj" : "sp";
  console.log(`Cron: hour=${hour}, running phase=${phase}`);
  try {
    if (phase === "rj") {
      const result = await collectBlipRJ(env);
      await env.STATS_KV.put("blipcache_rj", JSON.stringify(result));
      console.log("Cron: blipcache_rj saved OK");
    } else {
      const result = await collectBlipSP(env);
      await env.STATS_KV.put("blipcache_sp", JSON.stringify(result));
      console.log("Cron: blipcache_sp saved OK");
    }
    // Reconstruir JSON principal lendo caches (ambas as fases)
    const data = await buildMainJson(env);
    const json = JSON.stringify(data);
    await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
    console.log("Cron: stats-data updated at", data.gerado_em);
  } catch (e) {
    console.error("Cron: failed:", e.message);
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  }
};
