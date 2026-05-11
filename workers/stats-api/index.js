/**
 * Cloudflare Worker — Savior Stats API
 *
 * Cron trigger (1x/hora): coleta Google Ads + GA4 + Blip, salva no KV.
 * HTTP GET /stats-data.json: retorna o JSON cacheado do KV.
 *
 * Secrets (wrangler secret put):
 *   GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID,
 *   GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN,
 *   GA4_REFRESH_TOKEN, BLIP_HTTP_KEY
 *
 * Vars (wrangler.toml):
 *   GOOGLE_ADS_MCC_ID, GOOGLE_ADS_CUSTOMER_ID,
 *   GA4_PROPERTY_ID, ALLOWED_ORIGIN
 *
 * KV:
 *   STATS_KV — namespace com chave "stats-data" (JSON)
 */

const KV_KEY = 'stats-data';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ─── OAuth helper ────────────────────────────────────────

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

// ─── Google Ads REST API helpers ─────────────────────────

async function adsQuery(env, query) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GOOGLE_ADS_REFRESH_TOKEN
  );
  const customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
  const mccId = env.GOOGLE_ADS_MCC_ID.replace(/-/g, '');

  const res = await fetch(
    `https://googleads.googleapis.com/v20/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'developer-token': env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'login-customer-id': mccId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
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

// Fetch aggregated Ads data (no date dimension)
async function fetchGoogleAds(env, startDate, endDate) {
  const query = `
    SELECT campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr, metrics.average_cpc
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
  `;
  return adsQuery(env, query);
}

// Fetch Ads data with daily breakdown (for trend chart)
async function fetchGoogleAdsDaily(env, startDate, endDate) {
  const query = `
    SELECT segments.date, campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
  `;
  return adsQuery(env, query);
}

async function fetchGoogleAdsKeywords(env, startDate, endDate) {
  const query = `
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
  `;
  return adsQuery(env, query);
}

// ─── Ads row parsers ─────────────────────────────────────

function isRJ(name) {
  return /RJ|Rio|Niter[oó]i|Grande RIO/i.test(name);
}

function parseAdsRows(rows) {
  const byCampaign = {};
  let totalImpr = 0, totalClicks = 0, totalCost = 0, totalConv = 0;
  let rjImpr = 0, rjClicks = 0, rjCost = 0, rjConv = 0;
  let spImpr = 0, spClicks = 0, spCost = 0, spConv = 0;

  for (const r of rows) {
    const name = r.campaign?.name || 'unknown';
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
    byCampaign[name].cost += costMicros / 1_000_000;
    byCampaign[name].conversions += conv;

    totalImpr += impr;
    totalClicks += clicks;
    totalCost += costMicros / 1_000_000;
    totalConv += conv;

    if (isRJ(name)) {
      rjImpr += impr; rjClicks += clicks; rjCost += costMicros / 1_000_000; rjConv += conv;
    } else {
      spImpr += impr; spClicks += clicks; spCost += costMicros / 1_000_000; spConv += conv;
    }
  }

  const campanhas = Object.entries(byCampaign).map(([name, d]) => ({
    Campanha: name,
    Impressoes: d.impressions,
    Cliques: d.clicks,
    'Custo RS': round2(d.cost),
    Conv: round2(d.conversions),
    'CPA RS': d.conversions > 0 ? round2(d.cost / d.conversions) : 0,
  }));

  campanhas.sort((a, b) => b['Custo RS'] - a['Custo RS']);

  function mkResumo(i, c, co, cv) {
    return {
      Impressoes: i, Cliques: c,
      CTR: i > 0 ? (c / i * 100).toFixed(1) + '%' : '0%',
      'Gasto RS': round2(co),
      Conversoes: round2(cv),
      'CPA RS': cv > 0 ? round2(co / cv) : 0,
    };
  }

  return {
    resumo: mkResumo(totalImpr, totalClicks, totalCost, totalConv),
    resumo_rj: mkResumo(rjImpr, rjClicks, rjCost, rjConv),
    resumo_sp: mkResumo(spImpr, spClicks, spCost, spConv),
    campanhas,
  };
}

function parseKeywordRows(rows) {
  return rows.map(r => {
    const kw = r.adGroupCriterion?.keyword?.text || '';
    const camp = r.campaign?.name || '';
    const m = r.metrics || {};
    const clicks = Number(m.clicks) || 0;
    const costMicros = Number(m.costMicros) || 0;
    const cost = costMicros / 1_000_000;
    const conv = Number(m.conversions) || 0;
    const impr = Number(m.impressions) || 0;
    return {
      Keyword: kw, Campanha: camp,
      Impressoes: impr, Cliques: clicks,
      CTR: impr > 0 ? (clicks / impr * 100).toFixed(1) + '%' : '0%',
      'Custo RS': round2(cost),
      Conv: round2(conv),
      'CPA RS': conv > 0 ? round2(cost / conv) : 0,
    };
  });
}

// Parse daily rows into { 'YYYY-MM-DD': {clicks, cost, conv, impr, rj_clicks, rj_cost, sp_clicks, sp_cost, ...} }
function parseDailyAdsRows(rows) {
  const byDate = {};
  for (const r of rows) {
    const date = r.segments?.date;
    if (!date) continue;
    const name = r.campaign?.name || '';
    const m = r.metrics || {};
    const clicks = Number(m.clicks) || 0;
    const cost = (Number(m.costMicros) || 0) / 1_000_000;
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

// ─── GA4 Data API ────────────────────────────────────────

async function fetchGA4(env, startDate, endDate) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GA4_REFRESH_TOKEN
  );
  const propertyId = env.GA4_PROPERTY_ID;

  const sessionsRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
      }),
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
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          orGroup: {
            expressions: [
              { filter: { fieldName: 'eventName', stringFilter: { value: 'whatsapp_click' } } },
              { filter: { fieldName: 'eventName', stringFilter: { value: 'phone_click' } } },
            ],
          },
        },
      }),
    }
  );

  let waClicks = 0, phClicks = 0;
  if (eventsRes.ok) {
    const eventsData = await eventsRes.json();
    for (const row of (eventsData.rows || [])) {
      const eventName = row.dimensionValues?.[0]?.value;
      const count = Number(row.metricValues?.[0]?.value) || 0;
      if (eventName === 'whatsapp_click') waClicks = count;
      if (eventName === 'phone_click') phClicks = count;
    }
  }

  return { sessions, bounceRate: round2(bounceRate * 100), waClicks, phClicks };
}

// GA4 daily sessions (for trend chart)
async function fetchGA4Daily(env, startDate, endDate) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GA4_REFRESH_TOKEN
  );
  const propertyId = env.GA4_PROPERTY_ID;

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }],
      }),
    }
  );

  if (!res.ok) return {};

  const data = await res.json();
  const byDate = {};
  for (const row of (data.rows || [])) {
    const raw = row.dimensionValues?.[0]?.value || '';
    const date = raw.length === 8 ? `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}` : raw;
    byDate[date] = Number(row.metricValues?.[0]?.value) || 0;
  }
  return byDate;
}

// ─── Blip API ────────────────────────────────────────────

async function fetchBlipContacts(env, startDate, endDate) {
  const headers = {
    'Authorization': env.BLIP_HTTP_KEY,
    'Content-Type': 'application/json',
  };

  let count = 0;
  let skip = 0;
  const take = 100;
  const startTs = new Date(startDate + 'T00:00:00-03:00').getTime();
  const endTs = endDate ? new Date(endDate + 'T23:59:59-03:00').getTime() : Date.now();
  let keepGoing = true;

  while (keepGoing) {
    const res = await fetch('https://savior.http.msging.net/commands', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: `stats-${Date.now()}-${skip}`,
        to: 'postmaster@crm.msging.net',
        method: 'get',
        uri: `/contacts?$orderby=lastMessageDate+desc&$skip=${skip}&$take=${take}`,
      }),
    });

    if (!res.ok) break;

    const data = await res.json();
    const items = data.resource?.items || [];

    if (items.length === 0) break;

    for (const c of items) {
      const lastMsg = c.lastMessageDate ? new Date(c.lastMessageDate).getTime() : 0;
      if (lastMsg >= startTs && lastMsg <= endTs) {
        count++;
      } else if (lastMsg < startTs) {
        keepGoing = false;
        break;
      }
    }

    if (items.length < take) break;
    skip += take;

    if (skip > 2000) break;
  }

  return count;
}

// Blip daily counts for trend chart
async function fetchBlipDaily(env, startDate, numDays) {
  const headers = {
    'Authorization': env.BLIP_HTTP_KEY,
    'Content-Type': 'application/json',
  };

  // Build date buckets
  const buckets = {};
  const startD = new Date(startDate + 'T00:00:00-03:00');
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startD);
    d.setDate(d.getDate() + i);
    buckets[fmtDate(d)] = 0;
  }

  const startTs = startD.getTime();
  let skip = 0;
  const take = 100;
  let keepGoing = true;

  while (keepGoing) {
    const res = await fetch('https://savior.http.msging.net/commands', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: `daily-${Date.now()}-${skip}`,
        to: 'postmaster@crm.msging.net',
        method: 'get',
        uri: `/contacts?$orderby=lastMessageDate+desc&$skip=${skip}&$take=${take}`,
      }),
    });

    if (!res.ok) break;
    const data = await res.json();
    const items = data.resource?.items || [];
    if (items.length === 0) break;

    for (const c of items) {
      const lastMsg = c.lastMessageDate ? new Date(c.lastMessageDate).getTime() : 0;
      if (lastMsg < startTs) { keepGoing = false; break; }
      // Convert to BR timezone date string
      const brDate = new Date(lastMsg - 3 * 60 * 60 * 1000);
      const dateKey = fmtDate(brDate);
      if (dateKey in buckets) buckets[dateKey]++;
    }

    if (items.length < take) break;
    skip += take;
    if (skip > 3000) break;
  }

  return buckets;
}

// ─── Date helpers ────────────────────────────────────────

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

// ─── Build funil period (with regional split) ────────────

async function buildPeriod(env, startDate, endDate, days) {
  const [adsRows, ga4] = await Promise.all([
    fetchGoogleAds(env, startDate, endDate),
    fetchGA4(env, startDate, endDate),
  ]);

  let impr = 0, clicks = 0, cost = 0, conv = 0;
  let rjImpr = 0, rjClicks = 0, rjCost = 0, rjConv = 0;
  let spImpr = 0, spClicks = 0, spCost = 0, spConv = 0;

  for (const r of adsRows) {
    const name = r.campaign?.name || '';
    const m = r.metrics || {};
    const _impr = Number(m.impressions) || 0;
    const _clicks = Number(m.clicks) || 0;
    const _cost = (Number(m.costMicros) || 0) / 1_000_000;
    const _conv = Number(m.conversions) || 0;

    impr += _impr; clicks += _clicks; cost += _cost; conv += _conv;

    if (isRJ(name)) {
      rjImpr += _impr; rjClicks += _clicks; rjCost += _cost; rjConv += _conv;
    } else {
      spImpr += _impr; spClicks += _clicks; spCost += _cost; spConv += _conv;
    }
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
      impressions: round2(di),
      ad_clicks: round2(dc),
      sessions: round2(ds),
      wa_clicks: round2(dwa),
      ph_clicks: round2(dph),
      blip: 0,
      cost: round2(dco),
      cpc: dc > 0 ? round2(dco / dc) : 0,
      ctr: di > 0 ? round2((dc / di) * 100) : 0,
      conversions: round2(dcv),
      cpl_blip: 0,
      bounce: bounce || 0,
      form_start: 0,
    };
  }

  // Proportional split of GA4 metrics by click ratio (GA4 has no regional dimension)
  const rjRatio = clicks > 0 ? rjClicks / clicks : 0;
  const spRatio = clicks > 0 ? spClicks / clicks : 0;

  const cons = mkPeriod(impr, clicks, cost, conv, ga4.sessions, ga4.waClicks, ga4.phClicks, ga4.bounceRate);
  const rj = mkPeriod(rjImpr, rjClicks, rjCost, rjConv, Math.round(ga4.sessions * rjRatio), Math.round(ga4.waClicks * rjRatio), Math.round(ga4.phClicks * rjRatio), ga4.bounceRate);
  const sp = mkPeriod(spImpr, spClicks, spCost, spConv, Math.round(ga4.sessions * spRatio), Math.round(ga4.waClicks * spRatio), Math.round(ga4.phClicks * spRatio), ga4.bounceRate);

  return { cons, rj, sp };
}

// ─── Main collection ─────────────────────────────────────

async function collectAllData(env) {
  const today = fmtDate(new Date());
  const yesterday = fmtDate(daysAgo(1));
  const d2Date = fmtDate(daysAgo(2));
  const d30start = fmtDate(daysAgo(30));
  const d90start = fmtDate(daysAgo(90));

  // Collect all periods + ads detail + daily series in parallel
  const [hojeP, ontemP, d2P, periodo30, periodo90, adsDetail, kwDetail, dailyAdsRows, dailyGA4] = await Promise.all([
    buildPeriod(env, today, today, 1),
    buildPeriod(env, yesterday, yesterday, 1),
    buildPeriod(env, d2Date, d2Date, 1),
    buildPeriod(env, d30start, yesterday, 30),
    buildPeriod(env, d90start, yesterday, 90),
    fetchGoogleAds(env, d30start, yesterday),
    fetchGoogleAdsKeywords(env, d30start, yesterday),
    fetchGoogleAdsDaily(env, d30start, yesterday),
    fetchGA4Daily(env, d30start, yesterday),
  ]);

  // Blip contacts — run sequentially to avoid concurrent HTTP limits
  let blipToday = 0, blipOntem = 0, blipD2 = 0, blip30 = 0, blip90 = 0;
  let blipDaily = {};
  try { blipDaily = await fetchBlipDaily(env, d30start, 31); } catch(e) { console.error('Blip daily:', e.message); }

  // Derive period counts from daily buckets (avoids redundant API calls)
  if (Object.keys(blipDaily).length > 0) {
    blipToday = blipDaily[today] || 0;
    blipOntem = blipDaily[yesterday] || 0;
    blipD2 = blipDaily[d2Date] || 0;
    blip30 = Object.values(blipDaily).reduce((a, v) => a + v, 0);
    // 90d: estimate from 30d average (full 90d scan too heavy for Workers)
    blip90 = blip30;
  } else {
    // Fallback: fetch individually if daily failed
    try { blip30 = await fetchBlipContacts(env, d30start, yesterday); } catch(e) { console.error('Blip 30d:', e.message); }
    try { blipToday = await fetchBlipContacts(env, today, today); } catch(e) { console.error('Blip today:', e.message); }
    try { blipOntem = await fetchBlipContacts(env, yesterday, yesterday); } catch(e) { console.error('Blip ontem:', e.message); }
    try { blipD2 = await fetchBlipContacts(env, d2Date, d2Date); } catch(e) { console.error('Blip d2:', e.message); }
  }

  // Fill blip into periods (proportional split by clicks ratio)
  function fillBlip(period, blipCount, days) {
    const daily = days > 0 ? blipCount / days : blipCount;
    period.cons.blip = round2(daily);
    period.cons.cpl_blip = daily > 0 ? round2(period.cons.cost / daily) : 0;

    // Split blip proportionally by ad_clicks ratio
    const totalClicks = period.cons.ad_clicks || 1;
    const rjRatio = totalClicks > 0 ? (period.rj.ad_clicks / totalClicks) : 0;
    const spRatio = totalClicks > 0 ? (period.sp.ad_clicks / totalClicks) : 0;

    const rjBlip = round2(daily * rjRatio);
    const spBlip = round2(daily * spRatio);
    period.rj.blip = rjBlip;
    period.rj.cpl_blip = rjBlip > 0 ? round2(period.rj.cost / rjBlip) : 0;
    period.sp.blip = spBlip;
    period.sp.cpl_blip = spBlip > 0 ? round2(period.sp.cost / spBlip) : 0;
  }

  fillBlip(hojeP, blipToday, 1);
  fillBlip(ontemP, blipOntem, 1);
  fillBlip(d2P, blipD2, 1);
  fillBlip(periodo30, blip30, 30);
  fillBlip(periodo90, blip90, 90);

  // Parse daily ads data for trend chart
  const adsByDate = parseDailyAdsRows(dailyAdsRows);

  // Build daily array (sorted by date)
  const dailyDates = [];
  const cursor = new Date(d30start + 'T00:00:00Z');
  const endCursor = new Date(yesterday + 'T00:00:00Z');
  while (cursor <= endCursor) {
    dailyDates.push(fmtDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const daily = dailyDates.map(date => {
    const ads = adsByDate[date] || {};
    const sessions = dailyGA4[date] || 0;
    const blip = blipDaily[date] || 0;
    return {
      date,
      clicks: ads.clicks || 0,
      cost: round2(ads.cost || 0),
      conv: round2(ads.conv || 0),
      impr: ads.impr || 0,
      sessions,
      blip,
      rj_clicks: ads.rj_clicks || 0,
      rj_cost: round2(ads.rj_cost || 0),
      sp_clicks: ads.sp_clicks || 0,
      sp_cost: round2(ads.sp_cost || 0),
    };
  });

  // Parse ads detail with regional split
  const ads = parseAdsRows(adsDetail);
  ads.keywords = parseKeywordRows(kwDetail);
  ads.ok = true;

  const now = new Date();
  const brOffset = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  return {
    gerado_em: brOffset.toISOString().replace('Z', '-03:00'),
    funil: {
      labels: {
        hoje: today.slice(5) + ' (parcial)',
        ontem: yesterday.slice(5),
        d2: d2Date.slice(5),
        '30d': 'Méd/dia 30d',
        '90d': 'Méd/dia 90d',
      },
      hoje: hojeP.cons,
      hoje_rj: hojeP.rj,
      hoje_sp: hojeP.sp,
      ontem: ontemP.cons,
      ontem_rj: ontemP.rj,
      ontem_sp: ontemP.sp,
      d2: d2P.cons,
      d2_rj: d2P.rj,
      d2_sp: d2P.sp,
      '30d': periodo30.cons,
      '30d_rj': periodo30.rj,
      '30d_sp': periodo30.sp,
      '90d': periodo90.cons,
      '90d_rj': periodo90.rj,
      '90d_sp': periodo90.sp,
    },
    daily,
    resumo: {
      pessoas: 0,
      empresas: 0,
      leads_wa_30d: blip30,
      formularios_30d: 0,
    },
    por_mes: {},
    por_pipeline: {},
    por_tipo: {},
    por_cidade: {},
    ads,
  };
}

// ─── HTTP handler ────────────────────────────────────────

async function handleRequest(request, env) {
  const url = new URL(request.url);

  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = [env.ALLOWED_ORIGIN, 'http://localhost:4321', 'http://localhost:3000'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : env.ALLOWED_ORIGIN;

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (url.pathname === '/stats-data.json' && request.method === 'GET') {
    const cached = await env.STATS_KV.get(KV_KEY);

    if (cached) {
      return new Response(cached, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    try {
      const data = await collectAllData(env);
      const json = JSON.stringify(data);
      await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
      return new Response(json, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (url.pathname === '/refresh' && request.method === 'POST') {
    try {
      const data = await collectAllData(env);
      const json = JSON.stringify(data);
      await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
      return new Response(JSON.stringify({ ok: true, gerado_em: data.gerado_em }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Not found', { status: 404 });
}

// ─── Cron handler ────────────────────────────────────────

async function handleScheduled(event, env) {
  console.log('Cron: collecting stats data...');
  try {
    const data = await collectAllData(env);
    const json = JSON.stringify(data);
    await env.STATS_KV.put(KV_KEY, json, { expirationTtl: 7200 });
    console.log('Cron: stats data updated at', data.gerado_em);
  } catch (e) {
    console.error('Cron: collection failed:', e.message);
  }
}

// ─── Export ──────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  },
};
