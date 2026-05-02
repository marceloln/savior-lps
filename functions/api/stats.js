/**
 * Cloudflare Pages Function — GET /api/stats?key=savior79
 *
 * Retorna métricas agregadas dos leads do site (4 pipelines SITE + Leads WA).
 * Requer env var PIPEDRIVE_TOKEN.
 */

const BASE = 'https://api.pipedrive.com/v1';

const PIPELINES = [
  { id: 8,  name: 'Eventos RJ',     city: 'RJ', type: 'Eventos' },
  { id: 9,  name: 'Eventos SP',     city: 'SP', type: 'Eventos' },
  { id: 10, name: 'Corporativo RJ', city: 'RJ', type: 'Corporativo' },
  { id: 11, name: 'Corporativo SP', city: 'SP', type: 'Corporativo' },
];

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  if (searchParams.get('key') !== 'savior79') {
    return json({ error: 'unauthorized' }, 401);
  }

  const token = context.env.PIPEDRIVE_TOKEN;
  if (!token) return json({ error: 'not_configured' }, 500);

  const hdrs = { 'x-api-token': token };

  // Busca paralela: leads WA + deals dos 4 pipelines
  const [leadsData, ...dealsData] = await Promise.all([
    fetch(`${BASE}/leads?limit=500`, { headers: hdrs }).then(r => r.json()),
    ...PIPELINES.map(p =>
      fetch(`${BASE}/deals?pipeline_id=${p.id}&status=all&limit=500`, { headers: hdrs })
        .then(r => r.json())
    ),
  ]);

  const leads    = leadsData?.data ?? [];
  const allDeals = dealsData.flatMap(r => r?.data ?? []);

  // ── Por pipeline ───────────────────────────────────────────────
  const por_pipeline = {};
  PIPELINES.forEach((p, i) => {
    por_pipeline[p.name] = dealsData[i]?.data?.length ?? 0;
  });

  // ── Por tipo e cidade ──────────────────────────────────────────
  const por_tipo   = { Eventos: 0, Corporativo: 0 };
  const por_cidade = { RJ: 0, SP: 0 };
  PIPELINES.forEach((p, i) => {
    const n = dealsData[i]?.data?.length ?? 0;
    por_tipo[p.type]   += n;
    por_cidade[p.city] += n;
  });

  // ── Por mês (últimos 6 meses) ──────────────────────────────────
  const por_mes = {};

  const addMes = (isoDate, key) => {
    const mes = isoDate?.slice(0, 7);
    if (!mes) return;
    if (!por_mes[mes]) por_mes[mes] = { leads_wa: 0, formularios: 0 };
    por_mes[mes][key]++;
  };

  leads.forEach(l    => addMes(l.add_time, 'leads_wa'));
  allDeals.forEach(d => addMes(d.add_time, 'formularios'));

  // Ordena mais recente primeiro
  const por_mes_ordenado = Object.fromEntries(
    Object.entries(por_mes).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12)
  );

  // ── Empresas únicas (corporativo) ──────────────────────────────
  const empresas = new Set(
    allDeals
      .filter(d => d.org_id)
      .map(d => d.org_id?.value ?? d.org_id)
  );

  // ── Google Ads (planilha pública) ─────────────────────────────
  const ads = await fetchAds();

  return json({
    resumo: {
      leads_wa:    leads.length,
      formularios: allDeals.length,
      pessoas:     allDeals.filter(d => d.person_id).length,
      empresas:    empresas.size,
    },
    por_pipeline,
    por_tipo,
    por_cidade,
    por_mes: por_mes_ordenado,
    ads,
    gerado_em: new Date().toISOString(),
  });
}

// ── Google Ads via planilha pública ────────────────────────────
const SHEET_ID = '1tqY0lrLRNffSkKjzMRjbxh24Ld-faSOElUifhbDaz38';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

async function fetchAds() {
  try {
    const [resumoText, campanhasText] = await Promise.all([
      fetch(SHEET_URL + 'Resumo').then(r => r.text()),
      fetch(SHEET_URL + 'Campanhas').then(r => r.text()),
    ]);

    // Resumo: linhas A1:B8 → { label: value }
    const resumo = {};
    parseCsv(resumoText).forEach(([label, value]) => {
      if (label) resumo[label.trim()] = (value ?? '').trim();
    });

    // Campanhas: primeira linha = headers, demais = dados
    const campRows = parseCsv(campanhasText);
    const headers  = campRows[0] ?? [];
    const campanhas = campRows.slice(1).map(row =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] ?? '').trim()]))
    ).filter(r => r['Campanha']);

    return { resumo, campanhas, ok: true };
  } catch {
    return { ok: false };
  }
}

function parseCsv(text) {
  return text.trim().split('\n').map(line => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur);
    return cols;
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
