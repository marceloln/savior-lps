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

// ─── Google Ads REST API ─────────────────────────────────

async function fetchGoogleAds(env, startDate, endDate) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GOOGLE_ADS_REFRESH_TOKEN
  );

  const customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
  const mccId = env.GOOGLE_ADS_MCC_ID.replace(/-/g, '');

  const query = `
    SELECT campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr, metrics.average_cpc
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
  `;

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

async function fetchGoogleAdsKeywords(env, startDate, endDate) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GOOGLE_ADS_REFRESH_TOKEN
  );

  const customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
  const mccId = env.GOOGLE_ADS_MCC_ID.replace(/-/g, '');

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
    throw new Error(`Google Ads Keywords API error (${res.status}): ${text}`);
  }

  const chunks = await res.json();
  const rows = [];
  for (const chunk of chunks) {
    if (chunk.results) rows.push(...chunk.results);
  }
  return rows;
}

function parseAdsRows(rows) {
  const byCampaign = {};
  let totalImpr = 0, totalClicks = 0, totalCost = 0, totalConv = 0;

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

  return {
    resumo: {
      Impressoes: totalImpr,
      Cliques: totalClicks,
      CTR: totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(1) + '%' : '0%',
      'Gasto RS': round2(totalCost),
      Conversoes: round2(totalConv),
      'CPA RS': totalConv > 0 ? round2(totalCost / totalConv) : 0,
    },
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
      Keyword: kw,
      Campanha: camp,
      Impressoes: impr,
      Cliques: clicks,
      CTR: impr > 0 ? (clicks / impr * 100).toFixed(1) + '%' : '0%',
      'Custo RS': round2(cost),
      Conv: round2(conv),
      'CPA RS': conv > 0 ? round2(cost / conv) : 0,
    };
  });
}

// ─── GA4 Data API ────────────────────────────────────────

async function fetchGA4(env, startDate, endDate) {
  const token = await refreshAccessToken(
    env.GOOGLE_ADS_CLIENT_ID,
    env.GOOGLE_ADS_CLIENT_SECRET,
    env.GA4_REFRESH_TOKEN
  );

  const propertyId = env.GA4_PROPERTY_ID;

  // Sessions
  const sessionsRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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

  // Events (whatsapp_click, phone_click)
  const eventsRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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

// ─── Blip API ────────────────────────────────────────────

async function fetchBlipContacts(env, startDate) {
  const headers = {
    'Authorization': env.BLIP_HTTP_KEY,
    'Content-Type': 'application/json',
  };

  let count = 0;
  let skip = 0;
  const take = 100;
  const startTs = new Date(startDate + 'T00:00:00-03:00').getTime();
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
      if (lastMsg >= startTs) {
        count++;
      } else {
        keepGoing = false;
        break;
      }
    }

    if (items.length < take) break;
    skip += take;

    // Safety limit
    if (skip > 2000) break;
  }

  return count;
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

// ─── Build funil period ──────────────────────────────────

async function buildPeriod(env, startDate, endDate, days) {
  const [adsRows, ga4] = await Promise.all([
    fetchGoogleAds(env, startDate, endDate),
    fetchGA4(env, startDate, endDate),
  ]);

  let impr = 0, clicks = 0, cost = 0, conv = 0;
  for (const r of adsRows) {
    const m = r.metrics || {};
    impr += Number(m.impressions) || 0;
    clicks += Number(m.clicks) || 0;
    cost += (Number(m.costMicros) || 0) / 1_000_000;
    conv += Number(m.conversions) || 0;
  }

  const dailyImpr = days > 0 ? impr / days : impr;
  const dailyClicks = days > 0 ? clicks / days : clicks;
  const dailySessions = days > 0 ? ga4.sessions / days : ga4.sessions;
  const dailyCost = days > 0 ? cost / days : cost;
  const dailyConv = days > 0 ? conv / days : conv;
  const dailyWa = days > 0 ? ga4.waClicks / days : ga4.waClicks;
  const dailyPh = days > 0 ? ga4.phClicks / days : ga4.phClicks;

  return {
    impressions: round2(dailyImpr),
    ad_clicks: round2(dailyClicks),
    sessions: round2(dailySessions),
    wa_clicks: round2(dailyWa),
    ph_clicks: round2(dailyPh),
    blip: 0, // filled later
    cost: round2(dailyCost),
    cpc: dailyClicks > 0 ? round2(dailyCost / dailyClicks) : 0,
    ctr: dailyImpr > 0 ? round2((dailyClicks / dailyImpr) * 100) : 0,
    conversions: round2(dailyConv),
    cpl_blip: 0, // filled later
    bounce: ga4.bounceRate || 0,
    form_start: 0,
  };
}

// ─── Main collection ─────────────────────────────────────

async function collectAllData(env) {
  const today = fmtDate(new Date());
  const yesterday = fmtDate(daysAgo(1));
  const d2 = fmtDate(daysAgo(2));
  const d30start = fmtDate(daysAgo(30));
  const d90start = fmtDate(daysAgo(90));

  // Collect all periods + ads detail in parallel where possible
  const [hoje, ontem, periodo30, periodo90, adsDetail, kwDetail] = await Promise.all([
    buildPeriod(env, today, today, 1),
    buildPeriod(env, yesterday, yesterday, 1),
    buildPeriod(env, d30start, yesterday, 30),
    buildPeriod(env, d90start, yesterday, 90),
    fetchGoogleAds(env, d30start, yesterday),
    fetchGoogleAdsKeywords(env, d90start, yesterday),
  ]);

  // Blip contacts (30d and today)
  let blip30 = 0, blipToday = 0;
  try {
    [blip30, blipToday] = await Promise.all([
      fetchBlipContacts(env, d30start),
      fetchBlipContacts(env, today),
    ]);
  } catch (e) {
    console.error('Blip fetch error:', e.message);
  }

  // Fill blip into periods
  hoje.blip = blipToday;
  hoje.cpl_blip = blipToday > 0 ? round2(hoje.cost / blipToday) : 0;

  periodo30.blip = round2(blip30 / 30);
  periodo30.cpl_blip = periodo30.blip > 0 ? round2(periodo30.cost / periodo30.blip) : 0;

  // Parse ads detail
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
        d2: d2.slice(5),
        '30d': 'Méd/dia 30d',
        '90d': 'Méd/dia 90d',
      },
      hoje,
      ontem,
      d2: ontem, // simplified
      '30d': periodo30,
      '90d': periodo90,
    },
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

  // CORS
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

    // No cache, try to collect fresh
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

  // Manual trigger
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
