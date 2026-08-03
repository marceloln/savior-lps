#!/usr/bin/env python3
"""
Blip Desk — Tickets por dia e faixa horária
Uso: python3 scripts/blip-tickets-by-hour.py [dias_atras]
  dias_atras: quantos dias puxar (default: 7)

Exemplo:
  python3 scripts/blip-tickets-by-hour.py       # ultimos 7 dias
  python3 scripts/blip-tickets-by-hour.py 14    # ultimos 14 dias
"""
import json, requests, uuid, sys
from collections import defaultdict
from datetime import datetime, timedelta

# --- Config ---
BLIP_URL = "https://savior.http.msging.net/commands"
BLIP_KEY = "Key c2F2aW9ycHJpbmNpcGFsOlowS2FtWUpEOXE4aGllZjVpb1R5"
HEADERS = {"Authorization": BLIP_KEY, "Content-Type": "application/json"}
DIAS = int(sys.argv[1]) if len(sys.argv) > 1 else 7
CUTOFF = (datetime.now() - timedelta(days=DIAS)).strftime("%Y-%m-%d")
WEEKDAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]

def blip_cmd(uri):
    payload = {
        "id": str(uuid.uuid4()),
        "to": "postmaster@desk.msging.net",
        "method": "get",
        "uri": uri,
    }
    return requests.post(BLIP_URL, json=payload, headers=HEADERS).json()

# --- Fetch tickets with pagination ---
all_tickets = []
for skip in range(0, 2000, 25):
    resp = blip_cmd(f"/tickets?$skip={skip}&$take=25")
    if resp.get("status") == "success" and resp.get("resource"):
        res = resp["resource"]
        items = res.get("items", []) if isinstance(res, dict) else []
        all_tickets.extend(items)
        if items:
            last_date = items[-1].get("openDate", "")[:10]
            if last_date < CUTOFF:
                break
        if len(items) < 25:
            break
    else:
        break

# --- Group by day and time slot ---
by_day = defaultdict(list)
for t in all_tickets:
    d = t.get("openDate", "")[:10]
    if d >= CUTOFF:
        by_day[d].append(t)

def time_slot(ticket):
    h = ticket.get("openDate", "")[11:13]
    try:
        hour = int(h)
    except ValueError:
        return "?"
    if hour < 7:
        return "00-07"
    elif hour < 10:
        return "07-10"
    elif hour < 14:
        return "10-14"
    elif hour < 18:
        return "14-18"
    else:
        return "18-00"

def weekday_pt(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return WEEKDAYS_PT[dt.weekday()]

# --- Print table ---
slots = ["00-07", "07-10", "10-14", "14-18", "18-00"]
header = f"{'Dia':<14} {'Total':>5}"
for s in slots:
    header += f" {s:>6}"
print(header)
print("-" * len(header))

for d in sorted(by_day.keys()):
    tickets = by_day[d]
    wd = weekday_pt(d)
    day_label = f"{wd} {d[8:]}/{d[5:7]}"
    row = f"{day_label:<14} {len(tickets):>5}"
    for s in slots:
        count = sum(1 for t in tickets if time_slot(t) == s)
        row += f" {count:>6}"
    print(row)

# Totals
total = sum(len(v) for v in by_day.values())
print("-" * len(header))
row = f"{'TOTAL':<14} {total:>5}"
for s in slots:
    count = sum(1 for d in by_day.values() for t in d if time_slot(t) == s)
    row += f" {count:>6}"
print(row)

# Average (excluding today)
today = datetime.now().strftime("%Y-%m-%d")
past_days = {d: v for d, v in by_day.items() if d != today}
if past_days:
    n = len(past_days)
    avg = sum(len(v) for v in past_days.values()) / n
    row = f"{'MEDIA/dia':<14} {avg:>5.0f}"
    for s in slots:
        count = sum(1 for d in past_days.values() for t in d if time_slot(t) == s) / n
        row += f" {count:>6.1f}"
    print(row)

# --- Detail for today ---
if today in by_day:
    print(f"\n=== Hoje ({weekday_pt(today)} {today[8:]}/{today[5:7]}) ===")
    for t in sorted(by_day[today], key=lambda x: x.get("openDate", "")):
        seq = t.get("sequentialId", "")
        status = t.get("status", "")
        opened = t.get("openDate", "")[:19]
        print(f"  #{seq} {status:<18} {opened}")
