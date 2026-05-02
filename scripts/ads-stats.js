var SHEET_ID = "1tqY0lrLRNffSkKjzMRjbxh24Ld-faSOElUifhbDaz38";

function main() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  writeCampaigns(ss);
  writeDaily(ss);
  writeResumo(ss);
}

function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function writeCampaigns(ss) {
  var aba = getOrCreate(ss, "Campanhas");
  aba.clearContents();
  var h = ["Campanha", "Status", "Impressoes", "Cliques", "CTR", "Custo RS", "Conv", "CPA RS", "Atualizado"];
  aba.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");

  var q = "SELECT campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.ctr, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS AND campaign.status != REMOVED ORDER BY metrics.cost_micros DESC";
  var res = AdsApp.search(q);
  var now = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  var rows = [];

  while (res.hasNext()) {
    var r = res.next();
    var cost = r.metrics.costMicros / 1e6;
    var conv = r.metrics.conversions;
    var cpa = conv > 0 ? (cost / conv).toFixed(2) : "-";
    var status = r.campaign.status === "ENABLED" ? "Ativa" : "Pausada";
    rows.push([r.campaign.name, status, r.metrics.impressions, r.metrics.clicks, (r.metrics.ctr * 100).toFixed(2) + "%", cost.toFixed(2), conv.toFixed(0), cpa, now]);
  }

  if (rows.length) {
    aba.getRange(2, 1, rows.length, h.length).setValues(rows);
  }
}

function writeDaily(ss) {
  var aba = getOrCreate(ss, "Por dia");
  aba.clearContents();
  var h = ["Data", "Impressoes", "Cliques", "CTR", "Custo RS", "Conv"];
  aba.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");

  var q = "SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS ORDER BY segments.date DESC";
  var res = AdsApp.search(q);
  var byDay = {};

  while (res.hasNext()) {
    var r = res.next();
    var d = r.segments.date;
    if (!byDay[d]) {
      byDay[d] = { imp: 0, clk: 0, cost: 0, conv: 0 };
    }
    byDay[d].imp  += r.metrics.impressions;
    byDay[d].clk  += r.metrics.clicks;
    byDay[d].cost += r.metrics.costMicros / 1e6;
    byDay[d].conv += r.metrics.conversions;
  }

  var rows = [];
  var dates = Object.keys(byDay).sort().reverse();
  for (var i = 0; i < dates.length; i++) {
    var date = dates[i];
    var v = byDay[date];
    var p = date.split("-");
    var ctr = v.clk > 0 ? ((v.clk / v.imp) * 100).toFixed(2) + "%" : "0%";
    rows.push([p[2] + "/" + p[1] + "/" + p[0], v.imp, v.clk, ctr, v.cost.toFixed(2), v.conv.toFixed(0)]);
  }

  if (rows.length) {
    aba.getRange(2, 1, rows.length, h.length).setValues(rows);
  }
}

function writeResumo(ss) {
  var aba = getOrCreate(ss, "Resumo");
  aba.clearContents();

  var q = "SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS AND campaign.status != REMOVED";
  var res = AdsApp.search(q);
  var imp = 0, clk = 0, cost = 0, conv = 0;

  while (res.hasNext()) {
    var r = res.next();
    imp  += r.metrics.impressions;
    clk  += r.metrics.clicks;
    cost += r.metrics.costMicros / 1e6;
    conv += r.metrics.conversions;
  }

  var now = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  var ctr = clk > 0 ? ((clk / imp) * 100).toFixed(2) + "%" : "0%";
  var cpa = conv > 0 ? (cost / conv).toFixed(2) : "-";

  aba.getRange("A1:B8").setValues([
    ["Savior Ads - Ultimos 30 dias", ""],
    ["Atualizado em", now],
    ["Impressoes", imp],
    ["Cliques", clk],
    ["CTR", ctr],
    ["Gasto RS", cost.toFixed(2)],
    ["Conversoes", conv.toFixed(0)],
    ["CPA RS", cpa]
  ]);
}
