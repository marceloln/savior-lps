// savior-stats-api — Cloudflare Worker
// Aggregates Google Ads, GA4, Blip, and Pipedrive data

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
  const startD = new Date(startDate + "T00:00:00-03:00");
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startD);
    d.setDate(d.getDate() + i);
    const key = fmtDate(d);
    entryBuckets[key] = 0;
    closedBuckets[key] = 0;
    sucessoBuckets[key] = 0;
    semTagBuckets[key] = 0;
    vendaBuckets[key] = 0;
  }
  const startTs = startD.getTime();
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
        // Count vendas by tag regardless of close status (both current and legacy tag)
        if ((tags.includes("Venda realizada") || tags.includes("Finalizado com sucesso")) && openKey in vendaBuckets) vendaBuckets[openKey]++;
      }
      if (t.closed && t.closeDate) {
        const closeTs = new Date(t.closeDate).getTime();
        const brClose = new Date(closeTs - 3 * 60 * 60 * 1e3);
        const closeKey = fmtDate(brClose);
        if (closeKey in closedBuckets) {
          closedBuckets[closeKey]++;
          if (tags.includes("Finalizado com sucesso") || tags.includes("Venda realizada")) sucessoBuckets[closeKey]++;
          if (tags.length === 0) semTagBuckets[closeKey]++;
        }
      }
    }
    if (items.length < take) break;
    skip += take;
    if (skip > 5000) break;
  }
  return { entries: entryBuckets, closed: closedBuckets, sucesso: sucessoBuckets, sem_tag: semTagBuckets, venda: vendaBuckets };
}

// Blip SP: count CRM contacts (SP router has NO desk module)
async function fetchBlipCrmDaily(httpKey, botDomain, startDate, numDays) {
  const headers = { "Authorization": httpKey, "Content-Type": "application/json" };
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
    const res = await fetch(`https://${botDomain}.http.msging.net/commands`, {
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
    if (items.length === 0) break;
    for (const c of items) {
      const lastMsg = c.lastMessageDate ? new Date(c.lastMessageDate).getTime() : 0;
      if (lastMsg < startTs) { keepGoing = false; break; }
      // Skip test contacts (group "Teste" or name starting with "Tester")
      if (c.group === "Teste" || (c.name && c.name.startsWith("Tester"))) continue;
      const brDate = new Date(lastMsg - 3 * 60 * 60 * 1e3);
      const dateKey = fmtDate(brDate);
      if (dateKey in entryBuckets) entryBuckets[dateKey]++;
    }
    if (items.length < take) break;
    skip += take;
    if (skip > 3000) break;
  }
  // SP has no desk, so closed/sucesso/sem_tag are always 0
  const zeroBuckets = {};
  for (const key of Object.keys(entryBuckets)) zeroBuckets[key] = 0;
  return { entries: entryBuckets, closed: zeroBuckets, sucesso: zeroBuckets, sem_tag: zeroBuckets };
}

// --- Pipedrive ---
async function fetchPipedriveStats(token) {
  const BASE = "https://api.pipedrive.com/v1";
  const result = { pessoas: 0, empresas: 0, por_pipeline: {}, por_tipo: {}, por_cidade: {} };

  let start = 0;
  let allDeals = [];
  let hasMore = true;
  while (hasMore && start < 500) {
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

async function collectAllData(env) {
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

  const BOT_DOMAIN = "savior";
  const rjKey = env.BLIP_HTTP_KEY;
  const spKey = env.BLIP_SP_HTTP_KEY;
  let blipDailyRJ = {}, blipDailySP = {};
  let blipClosedDailyRJ = {}, blipClosedDailySP = {};
  let blipSucessoRJ = {}, blipSucessoSP = {};
  let blipSemTagRJ = {}, blipSemTagSP = {};
  let blipVendaRJ = {}, blipVendaSP = {};
  let blipContactsRJ = {}, blipContactsSP = {};

  // RJ: desk tickets from saviorprincipal + saviorrj (both serve RJ)
  function mergeBuckets(target, source) {
    for (const k of Object.keys(source)) {
      if (k in target) target[k] += source[k];
      else target[k] = source[k];
    }
  }
  try {
    const rjBoth = await fetchBlipBothDaily(rjKey, BOT_DOMAIN, d30start, 31);
    blipDailyRJ = rjBoth.entries;
    blipClosedDailyRJ = rjBoth.closed;
    blipSucessoRJ = rjBoth.sucesso;
    blipSemTagRJ = rjBoth.sem_tag;
    blipVendaRJ = rjBoth.venda;
    console.log("Blip RJ Principal OK, entries:", Object.values(blipDailyRJ).reduce((a,v)=>a+v,0), "venda:", Object.values(blipVendaRJ).reduce((a,v)=>a+v,0));
  } catch (e) { console.error("Blip RJ Principal ERROR:", e.message); }

  // RJ: also fetch from saviorrj bot (had real traffic in some periods)
  if (env.BLIP_RJ_HTTP_KEY) {
    try {
      const rjBot = await fetchBlipBothDaily(env.BLIP_RJ_HTTP_KEY, null, d30start, 31, "https://http.msging.net/commands");
      mergeBuckets(blipDailyRJ, rjBot.entries);
      mergeBuckets(blipClosedDailyRJ, rjBot.closed);
      mergeBuckets(blipSucessoRJ, rjBot.sucesso);
      mergeBuckets(blipSemTagRJ, rjBot.sem_tag);
      mergeBuckets(blipVendaRJ, rjBot.venda);
      console.log("Blip RJ Bot OK, entries:", Object.values(rjBot.entries).reduce((a,v)=>a+v,0), "venda:", Object.values(rjBot.venda).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("Blip RJ Bot ERROR:", e.message); }
  }

  // RJ CRM contacts (bot interactions, superset of desk tickets)
  try {
    const rjCrm = await fetchBlipCrmDaily(rjKey, BOT_DOMAIN, d30start, 31);
    blipContactsRJ = rjCrm.entries;
    console.log("Blip RJ CRM OK, contacts:", Object.values(blipContactsRJ).reduce((a,v)=>a+v,0));
  } catch (e) { console.error("Blip RJ CRM ERROR:", e.message); }

  // SP: uses CRM contacts (SP router has NO desk module)
  if (spKey) {
    try {
      const spBoth = await fetchBlipCrmDaily(spKey, BOT_DOMAIN, d30start, 31);
      blipDailySP = spBoth.entries;
      blipClosedDailySP = spBoth.closed;
      blipSucessoSP = spBoth.sucesso;
      blipSemTagSP = spBoth.sem_tag;
      blipContactsSP = spBoth.entries; // SP CRM contacts = entries (no desk)
      console.log("Blip SP OK, entries:", Object.values(blipDailySP).reduce((a,v)=>a+v,0));
    } catch (e) { console.error("Blip SP ERROR:", e.message); }
  }

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
  // SP não tem desk, venda sempre 0
  const vdSpToday = 0, vdSpOntem = 0, vdSpD2 = 0, vdSp30 = 0;

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
    const blip_venda_sp = 0; // SP não tem desk
    const blip_contacts_rj = (blipContactsRJ[date] || 0);
    const blip_contacts_sp = (blipContactsSP[date] || 0);
    return {
      date, clicks: ads2.clicks || 0, cost: round2(ads2.cost || 0),
      conv: round2(ads2.conv || 0), impr: ads2.impr || 0, sessions,
      blip: blip_rj + blip_sp, blip_closed: blip_closed_rj + blip_closed_sp,
      blip_sucesso: blip_sucesso_rj + blip_sucesso_sp,
      blip_sem_tag: blip_sem_tag_rj + blip_sem_tag_sp,
      blip_venda: blip_venda_rj + blip_venda_sp,
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
    ads
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
      const data = await collectAllData(env);
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
  if (url.pathname === "/refresh" && request.method === "POST") {
    try {
      const data = await collectAllData(env);
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
  console.log("Cron: collecting stats data...");
  try {
    const data = await collectAllData(env);
    const json = JSON.stringify(data);
    await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
    console.log("Cron: stats data updated at", data.gerado_em);
  } catch (e) {
    console.error("Cron: collection failed:", e.message);
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
