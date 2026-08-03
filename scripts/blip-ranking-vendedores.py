#!/usr/bin/env python3
"""
Blip Desk — Ranking de vendedores normalizado por horas de atividade
Uso: python3 scripts/blip-ranking-vendedores.py

Puxa todos os tickets disponiveis na API (~750 max, ~37 dias) e gera:
  1. Tabela por vendedor com metricas absolutas e normalizadas por 10h
  2. Ranking por score/10h
  3. Detalhe de fechamentos por tag

Scoring por ticket: Sucesso=10 | Em cotacao=3 | Info=1 | Sem sucesso=-2 | Sem resposta=-3
Bonus tempo resposta: <5min=+5 | <15min=+3 | <30min=+1
"""
import json, requests, uuid
from collections import defaultdict
from datetime import datetime

# --- Config ---
BLIP_URL = "https://savior.http.msging.net/commands"
BLIP_KEY = "Key c2F2aW9ycHJpbmNpcGFsOlowS2FtWUpEOXE4aGllZjVpb1R5"
HEADERS = {"Authorization": BLIP_KEY, "Content-Type": "application/json"}

NAMES = {
    "centralsavior1.rj@gmail.com": "Saritha Tolentino",
    "centralsavior2.rj@gmail.com": "Lohaine Silva",
    "centralsavior3.rj@gmail.com": "Daiane Cristina",
    "centralsavior5.rj@gmail.com": "Millena Alves",
    "centralsavior6.rj@gmail.com": "Luiz Henrique",
    "centralsavior9.rj@gmail.com": "Thaysa Marracho",
    "centralsavior10.rj@gmail.com": "Laura Bomfim",
    "centralsavior11.rj@gmail.com": "Rayanne Lopes",
    "operacional1.rj@savior.com.br": "Leticia Oliveira",
    "operacional2.rj@savior.com.br": "Renan Melo",
    "operacional3.rj@savior.com.br": "Claudia Feitoza",
}


def blip_cmd(uri):
    payload = {
        "id": str(uuid.uuid4()),
        "to": "postmaster@desk.msging.net",
        "method": "get",
        "uri": uri,
    }
    return requests.post(BLIP_URL, json=payload, headers=HEADERS).json()


# --- Fetch all tickets ---
print("Buscando tickets...")
all_tickets = []
for skip in range(0, 2000, 25):
    resp = blip_cmd(f"/tickets?$skip={skip}&$take=25")
    if resp.get("status") == "success" and resp.get("resource"):
        items = (
            resp["resource"].get("items", [])
            if isinstance(resp["resource"], dict)
            else []
        )
        all_tickets.extend(items)
        if len(items) < 25:
            break
    else:
        break

tickets = [t for t in all_tickets if t.get("openDate", "")[:4] >= "2026"]
if not tickets:
    print("Nenhum ticket encontrado.")
    exit(1)

oldest = min(t.get("openDate", "") for t in tickets)[:10]
newest = max(t.get("openDate", "") for t in tickets)[:10]
days_span = (
    datetime.strptime(newest, "%Y-%m-%d") - datetime.strptime(oldest, "%Y-%m-%d")
).days + 1
print(f"Total: {len(tickets)} tickets | {oldest} ate {newest} ({days_span} dias)\n")

# --- Build agent data ---
agent_data = defaultdict(
    lambda: {
        "total": 0,
        "sucesso": 0,
        "sem_sucesso": 0,
        "sem_resp": 0,
        "cotacao": 0,
        "info": 0,
        "teste": 0,
        "active_days": set(),
        "resp_times": [],
        "hours_by_day": defaultdict(set),
        "teams": defaultdict(int),
    }
)

for t in tickets:
    agent_raw = t.get("agentIdentity", "")
    if not agent_raw:
        continue
    agent = agent_raw.split("@")[0].replace("%40", "@")
    d = agent_data[agent]
    d["total"] += 1

    opened = t.get("openDate", "")[:10]
    hour = t.get("openDate", "")[11:13]
    d["active_days"].add(opened)
    try:
        d["hours_by_day"][opened].add(int(hour))
    except ValueError:
        pass

    team = t.get("team", "(sem fila)")
    d["teams"][team] += 1

    tags = t.get("tags", [])
    for tg in tags:
        name = tg if isinstance(tg, str) else tg.get("name", "") if isinstance(tg, dict) else ""
        if name == "Finalizado com sucesso":
            d["sucesso"] += 1
        elif name == "Finalizado sem sucesso":
            d["sem_sucesso"] += 1
        elif name == "Sem resposta do cliente":
            d["sem_resp"] += 1
        elif name == "Em cotação":
            d["cotacao"] += 1
        elif "nforma" in name or "vida" in name:
            d["info"] += 1
        elif name == "Teste":
            d["teste"] += 1

    op = t.get("openDate", "")
    fr = t.get("firstResponseDate", "")
    if op and fr and len(op) > 18 and len(fr) > 18:
        try:
            delta = (
                datetime.strptime(fr[:19], "%Y-%m-%dT%H:%M:%S")
                - datetime.strptime(op[:19], "%Y-%m-%dT%H:%M:%S")
            ).total_seconds() / 60
            if 0 < delta < 1440:
                d["resp_times"].append(delta)
        except ValueError:
            pass

# --- Calculate scores and build rows ---
rows = []
for agent, d in agent_data.items():
    if d["total"] < 3:
        continue
    name = NAMES.get(agent, agent)

    est_hours = sum(max(len(hours), 1) for hours in d["hours_by_day"].values())
    days = len(d["active_days"])
    avg_resp = sum(d["resp_times"]) / len(d["resp_times"]) if d["resp_times"] else 999

    suc_10h = (d["sucesso"] / est_hours * 10) if est_hours > 0 else 0
    tickets_10h = (d["total"] / est_hours * 10) if est_hours > 0 else 0

    score_raw = (
        d["sucesso"] * 10
        + d["cotacao"] * 3
        + d["info"] * 1
        + d["sem_sucesso"] * (-2)
        + d["sem_resp"] * (-3)
    )
    score_10h = (score_raw / est_hours * 10) if est_hours > 0 else 0

    if avg_resp < 5:
        score_10h += 5
    elif avg_resp < 15:
        score_10h += 3
    elif avg_resp < 30:
        score_10h += 1

    rows.append(
        {
            "name": name,
            "agent": agent,
            "total": d["total"],
            "sucesso": d["sucesso"],
            "sem_sucesso": d["sem_sucesso"],
            "sem_resp": d["sem_resp"],
            "cotacao": d["cotacao"],
            "info": d["info"],
            "teste": d["teste"],
            "days": days,
            "est_hours": est_hours,
            "avg_resp": avg_resp,
            "suc_10h": suc_10h,
            "tickets_10h": tickets_10h,
            "score_10h": score_10h,
            "teams": dict(d["teams"]),
        }
    )

rows.sort(key=lambda x: -x["score_10h"])

# --- Print ---
MEDALS = {1: "\U0001f947", 2: "\U0001f948", 3: "\U0001f949"}
sep = "-" * 115

print("=" * 115)
print(f"RANKING VENDEDORES SAVIOR — {oldest} a {newest} ({days_span} dias, {len(tickets)} tickets)")
print("Normalizado por horas estimadas de atividade")
print("=" * 115)
print()
print(
    f"{'#':>2} {'Nome':<20} {'Tickets':>7} {'Suces':>5} {'S/suc':>5} "
    f"{'S/resp':>6} {'Cotac':>5} {'Dias':>4} {'~Horas':>6} "
    f"{'Resp':>6} {'Suc/10h':>7} {'Tkt/10h':>7} {'Score/10h':>9}"
)
print(sep)

for i, r in enumerate(rows, 1):
    medal = MEDALS.get(i, "  ")
    resp_s = f"{r['avg_resp']:.0f}m" if r["avg_resp"] < 999 else "N/A"
    print(
        f"{medal}{i:>1} {r['name']:<20} {r['total']:>7} {r['sucesso']:>5} "
        f"{r['sem_sucesso']:>5} {r['sem_resp']:>6} {r['cotacao']:>5} "
        f"{r['days']:>4} {r['est_hours']:>6} {resp_s:>6} "
        f"{r['suc_10h']:>7.1f} {r['tickets_10h']:>7.1f} {r['score_10h']:>9.1f}"
    )

print()
print("Legenda:")
print("  ~Horas  = horas distintas com tickets (proxy de horas online)")
print("  Suc/10h = finalizados com sucesso a cada 10h de atividade")
print("  Tkt/10h = tickets atendidos a cada 10h de atividade")
print("  Score/10h = score ponderado normalizado por 10h")
print("  Scoring: Sucesso=10 | Cotacao=3 | Info=1 | Sem sucesso=-2 | Sem resposta=-3")
print("  Bonus resposta: <5min=+5 | <15min=+3 | <30min=+1")

# --- Detail by agent ---
print()
print("=" * 115)
print("DETALHE POR VENDEDOR")
print("=" * 115)
for r in rows:
    taxa = (r["sucesso"] / r["total"] * 100) if r["total"] > 0 else 0
    print(
        f"\n{r['name']} ({r['agent']}) — {r['total']} tickets, "
        f"{r['sucesso']} sucesso ({taxa:.0f}%), {r['days']} dias ativos, ~{r['est_hours']}h"
    )
    print(f"  Filas: {r['teams']}")
    print(
        f"  Sucesso={r['sucesso']} | Sem sucesso={r['sem_sucesso']} | "
        f"Sem resposta={r['sem_resp']} | Em cotacao={r['cotacao']} | "
        f"Info={r['info']} | Teste={r['teste']}"
    )
