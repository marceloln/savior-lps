#!/usr/bin/env python3
"""
Savior — Stats JSON Generator
Gera public/stats-data.json para a página /estatisticas

Uso local:
  python3 scripts/funil_json.py

Uso no CI (GitHub Actions):
  python3 scripts/funil_json.py public/stats-data.json
"""
import json, os, sys
from datetime import datetime, timezone, timedelta

BRT   = timezone(timedelta(hours=-3))
now   = datetime.now(BRT)
today = now.date()
fmt   = lambda d: d.strftime('%Y-%m-%d')
lbl   = lambda d: d.strftime('%d/%m')

# ── Datas ──────────────────────────────────────────────────────────
d0     = today
d1     = today - timedelta(days=1)
d2     = today - timedelta(days=2)
avg_e  = d1
mes_s  = avg_e - timedelta(days=27)   # 28 dias / 4 sem
trim_s = avg_e - timedelta(days=83)   # 84 dias / 12 sem

print(f"\nHoje BRT : {today}  ({now.strftime('%H:%M')})")
print(f"30d      : {fmt(mes_s)} → {fmt(avg_e)}")
print(f"90d      : {fmt(trim_s)} → {fmt(avg_e)}\n")

# ── Credenciais ────────────────────────────────────────────────────
creds_path = os.environ.get(
    'GOOGLE_ADS_CREDS_PATH',
    os.path.expanduser('~/.config/prill/google-ads.json')
)
creds = json.load(open(creds_path))

# ── Google Ads ─────────────────────────────────────────────────────
from google.ads.googleads.client import GoogleAdsClient

cfg = {
    'developer_token': creds['developer_token'],
    'client_id':       creds['client_id'],
    'client_secret':   creds['client_secret'],
    'refresh_token':   creds['refresh_token'],
    'login_customer_id': creds['mcc_customer_id'],
    'use_proto_plus':  True
}
gads = GoogleAdsClient.load_from_dict(cfg)
svc  = gads.get_service('GoogleAdsService')
cid  = creds['savior_customer_id']

def ga_total(start, end):
    q = f"""
      SELECT metrics.impressions, metrics.clicks,
             metrics.cost_micros, metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '{fmt(start)}' AND '{fmt(end)}'
    """
    r = [0, 0, 0.0, 0.0]
    for row in svc.search(customer_id=cid, query=q):
        r[0] += row.metrics.impressions
        r[1] += row.metrics.clicks
        r[2] += row.metrics.cost_micros / 1_000_000
        r[3] += row.metrics.conversions
    return r

def ga_campaigns(start, end):
    q = f"""
      SELECT campaign.name, metrics.impressions, metrics.clicks,
             metrics.cost_micros, metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '{fmt(start)}' AND '{fmt(end)}'
        AND campaign.status = 'ENABLED'
    """
    camps = []
    for row in svc.search(customer_id=cid, query=q):
        imp  = row.metrics.impressions
        clk  = row.metrics.clicks
        cost = row.metrics.cost_micros / 1_000_000
        conv = row.metrics.conversions
        camps.append({
            'Campanha':   row.campaign.name,
            'Impressoes': imp,
            'Cliques':    clk,
            'CTR':        f"{clk/imp*100:.1f}%" if imp else '0%',
            'Custo RS':   round(cost, 2),
            'Conv':       conv,
            'CPA RS':     round(cost / conv, 2) if conv else 0,
        })
    camps.sort(key=lambda c: c['Conv'], reverse=True)
    return camps

print("[1/3] Google Ads...", end='', flush=True)
G = {
    'd0': ga_total(d0, d0),
    'd1': ga_total(d1, d1),
    'd2': ga_total(d2, d2),
    '1m': ga_total(mes_s, avg_e),
    '3m': ga_total(trim_s, avg_e),
}
camps_30d = ga_campaigns(mes_s, avg_e)
print(" ok")

# ── GA4 ────────────────────────────────────────────────────────────
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Metric, Dimension
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

gc = Credentials(
    token=None,
    refresh_token=creds['analytics_refresh_token'],
    token_uri='https://oauth2.googleapis.com/token',
    client_id=creds['client_id'],
    client_secret=creds['client_secret'],
    scopes=['https://www.googleapis.com/auth/analytics.readonly']
)
gc.refresh(Request())
ga4  = BetaAnalyticsDataClient(credentials=gc)
prop = "properties/393620916"

def ga4_sessions(start, end):
    req = RunReportRequest(property=prop,
        date_ranges=[DateRange(start_date=fmt(start), end_date=fmt(end))],
        metrics=[Metric(name="sessions")])
    r = ga4.run_report(req)
    return int(r.rows[0].metric_values[0].value) if r.rows else 0

def ga4_events(start, end):
    req = RunReportRequest(property=prop,
        date_ranges=[DateRange(start_date=fmt(start), end_date=fmt(end))],
        dimensions=[Dimension(name="eventName")],
        metrics=[Metric(name="eventCount")])
    r = ga4.run_report(req)
    return {row.dimension_values[0].value: int(row.metric_values[0].value) for row in r.rows}

def ga4_bounce(start, end):
    req = RunReportRequest(property=prop,
        date_ranges=[DateRange(start_date=fmt(start), end_date=fmt(end))],
        metrics=[Metric(name="bounceRate")])
    r = ga4.run_report(req)
    return round(float(r.rows[0].metric_values[0].value) * 100, 1) if r.rows else 0.0

print("[2/3] GA4...", end='', flush=True)
S = {}; E = {}; BR = {}
for key, s, e in [('d0',d0,d0), ('d1',d1,d1), ('d2',d2,d2),
                   ('1m',mes_s,avg_e), ('3m',trim_s,avg_e)]:
    S[key]  = ga4_sessions(s, e)
    E[key]  = ga4_events(s, e)
    BR[key] = ga4_bounce(s, e)
print(" ok")

# ── Blip (RJ) ──────────────────────────────────────────────────────
import requests as rlib

print("[3/3] Blip...", end='', flush=True)
hdr = {"Authorization": creds['blip_http_key'], "Content-Type": "application/json"}
blip_by_day = {}
skip, stop = 0, False
while not stop:
    p = {"id": f"b{skip}", "to": "postmaster@crm.msging.net", "method": "get",
         "uri": f"/contacts?$orderby=lastMessageDate+desc&$skip={skip}&$take=100"}
    items = rlib.post("https://msging.net/commands", json=p,
                      headers=hdr, timeout=15).json().get('resource', {}).get('items', [])
    if not items: break
    for c in items:
        lmd = c.get('lastMessageDate', '')
        if not lmd: continue
        try:
            dt = datetime.fromisoformat(lmd.replace('Z', '+00:00')).astimezone(BRT).date()
        except: continue
        if dt < trim_s: stop = True; break
        blip_by_day[dt] = blip_by_day.get(dt, 0) + 1
    skip += 100
    if len(items) < 100: break

def blip(s, e): return sum(v for d, v in blip_by_day.items() if s <= d <= e)
B = {
    'd0': blip(d0, d0), 'd1': blip(d1, d1), 'd2': blip(d2, d2),
    '1m': blip(mes_s, avg_e), '3m': blip(trim_s, avg_e),
}
print(" ok\n")

# ── Monta objeto de período ─────────────────────────────────────────
def period(key, divisor=1):
    imp  = G[key][0] / divisor
    clk  = G[key][1] / divisor
    cost = G[key][2] / divisor
    conv = G[key][3] / divisor
    sess = S[key]    / divisor
    wa   = E[key].get('whatsapp_click', 0) / divisor
    ph   = E[key].get('phone_click',    0) / divisor
    bl   = B[key]    / divisor
    return {
        'impressions': round(imp,  1),
        'ad_clicks':   round(clk,  1),
        'sessions':    round(sess, 1),
        'wa_clicks':   round(wa,   1),
        'ph_clicks':   round(ph,   1),
        'blip':        round(bl,   1),
        'cost':        round(cost, 2),
        'cpc':         round(cost / clk,       2) if clk else 0,
        'ctr':         round(clk  / imp * 100, 1) if imp else 0,
        'conversions': round(conv, 1),
        'cpl_blip':    round(cost / bl,        2) if bl  else 0,
        'bounce':      BR[key],
        'form_start':  0,
    }

# ── Resumo GAds 30d ─────────────────────────────────────────────────
g1m = G['1m']
ads_resumo = {
    'Impressoes': g1m[0],
    'Cliques':    g1m[1],
    'CTR':        f"{g1m[1]/g1m[0]*100:.1f}%" if g1m[0] else '0%',
    'Gasto RS':   round(g1m[2], 2),
    'Conversoes': g1m[3],
    'CPA RS':     round(g1m[2] / g1m[3], 2) if g1m[3] else 0,
}

# ── JSON final ──────────────────────────────────────────────────────
data = {
    'gerado_em': now.isoformat(),
    'funil': {
        'labels': {
            'hoje':  lbl(d0) + ' (parcial)',
            'ontem': lbl(d1),
            'd2':    lbl(d2),
            '30d':   'Méd/dia 30d',
            '90d':   'Méd/dia 90d',
        },
        'hoje':  period('d0'),
        'ontem': period('d1'),
        'd2':    period('d2'),
        '30d':   period('1m', 28),
        '90d':   period('3m', 84),
    },
    'resumo': {
        'pessoas':         0,
        'empresas':        0,
        'leads_wa_30d':    E['1m'].get('whatsapp_click', 0),
        'formularios_30d': 0,
    },
    'por_mes':      {},
    'por_pipeline': {},
    'por_tipo':     {},
    'por_cidade':   {},
    'ads': {
        'ok':       True,
        'resumo':   ads_resumo,
        'campanhas': camps_30d,
    },
}

# ── Salvar ─────────────────────────────────────────────────────────
output = sys.argv[1] if len(sys.argv) > 1 else 'public/stats-data.json'
os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
with open(output, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, default=str)

print(f"Salvo    : {output}")
print(f"Gerado   : {now.strftime('%d/%m/%Y %H:%M')} BRT")
print(f"Blip RJ  : hoje={B['d0']}  ontem={B['d1']}  30d={B['1m']}")
print(f"GAds 30d : imp={g1m[0]:,.0f}  conv={g1m[3]:.0f}  CPA=R${ads_resumo['CPA RS']}")
