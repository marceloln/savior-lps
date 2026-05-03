/**
 * Google Ads Script — Savior Medical Service
 * Planilha: 1tqY0lrLRNffSkKjzMRjbxh24Ld-faSOElUifhbDaz38
 *
 * Abas geradas:
 *   Resumo              — totais dos últimos 30 dias (sobrescreve)
 *   Campanhas           — por campanha, últimos 30 dias (sobrescreve)
 *   Por dia             — por dia, últimos 30 dias (sobrescreve)
 *   Historico           — um registro por dia acumulado (NUNCA apaga)
 *   Historico Campanhas — um registro por campanha/dia acumulado (NUNCA apaga)
 *
 * Frequência sugerida: horária (só histórico reescreve linhas do dia atual)
 */

var SHEET_ID = "1tqY0lrLRNffSkKjzMRjbxh24Ld-faSOElUifhbDaz38";
var TZ = "America/Sao_Paulo";

function main() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  writeResumo(ss);
  writeCampaigns(ss);
  writeDaily(ss);
  appendHistorico(ss);
  appendHistoricoCampanhas(ss);
}

// ─────────────────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────────────────

function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function today() {
  return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
}

function nowBr() {
  return Utilities.formatDate(new Date(), TZ, "dd/MM/yyyy HH:mm");
}

function pct(num, den) {
  return den > 0 ? ((num / den) * 100).toFixed(2) + "%" : "0%";
}

function cpa(cost, conv) {
  return conv > 0 ? (cost / conv).toFixed(2) : "-";
}

// ─────────────────────────────────────────────────────────
// Resumo (últimos 30 dias) — sobrescreve
// ─────────────────────────────────────────────────────────

function writeResumo(ss) {
  var aba = getOrCreate(ss, "Resumo");
  aba.clearContents();

  var q = "SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions " +
          "FROM campaign " +
          "WHERE segments.date DURING LAST_30_DAYS AND campaign.status != REMOVED";
  var res = AdsApp.search(q);
  var imp = 0, clk = 0, cost = 0, conv = 0;

  while (res.hasNext()) {
    var r = res.next();
    imp  += r.metrics.impressions;
    clk  += r.metrics.clicks;
    cost += r.metrics.costMicros / 1e6;
    conv += r.metrics.conversions;
  }

  // Gravar números brutos (sem formatação) para evitar problema de locale no CSV
  aba.getRange("A1:B8").setValues([
    ["Savior Ads - Ultimos 30 dias", ""],
    ["Atualizado em",  nowBr()],
    ["Impressoes",     imp],
    ["Cliques",        clk],
    ["CTR",            pct(clk, imp)],
    ["Gasto RS",       cost.toFixed(2)],
    ["Conversoes",     Math.round(conv)],
    ["CPA RS",         cpa(cost, conv)]
  ]);

  // Formatar coluna B como número puro (sem separador de milhar)
  // para evitar que o Sheets exporte "133.174" em vez de "133174"
  aba.getRange("B3:B4").setNumberFormat("0");
  aba.getRange("B6").setNumberFormat("0.00");
  aba.getRange("B7").setNumberFormat("0");
  aba.getRange("B8").setNumberFormat("0.00");
}

// ─────────────────────────────────────────────────────────
// Campanhas (últimos 30 dias) — sobrescreve
// ─────────────────────────────────────────────────────────

function writeCampaigns(ss) {
  var aba = getOrCreate(ss, "Campanhas");
  aba.clearContents();
  var h = ["Campanha", "Status", "Impressoes", "Cliques", "CTR", "Custo RS", "Conv", "CPA RS", "Atualizado"];
  aba.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");

  var q = "SELECT campaign.name, campaign.status, metrics.impressions, metrics.clicks, " +
          "metrics.ctr, metrics.cost_micros, metrics.conversions " +
          "FROM campaign " +
          "WHERE segments.date DURING LAST_30_DAYS AND campaign.status != REMOVED " +
          "ORDER BY metrics.cost_micros DESC";
  var res = AdsApp.search(q);
  var now = nowBr();
  var rows = [];

  while (res.hasNext()) {
    var r = res.next();
    var cost = r.metrics.costMicros / 1e6;
    var conv = r.metrics.conversions;
    var status = r.campaign.status === "ENABLED" ? "Ativa" : "Pausada";
    rows.push([
      r.campaign.name,
      status,
      r.metrics.impressions,
      r.metrics.clicks,
      pct(r.metrics.clicks, r.metrics.impressions),
      cost.toFixed(2),
      Math.round(conv),
      cpa(cost, conv),
      now
    ]);
  }

  if (rows.length) {
    aba.getRange(2, 1, rows.length, h.length).setValues(rows);
    // Números sem separador de milhar
    aba.getRange(2, 3, rows.length, 2).setNumberFormat("0");
    aba.getRange(2, 6, rows.length, 1).setNumberFormat("0.00");
    aba.getRange(2, 7, rows.length, 1).setNumberFormat("0");
    aba.getRange(2, 8, rows.length, 1).setNumberFormat("0.00");
  }
}

// ─────────────────────────────────────────────────────────
// Por dia (últimos 30 dias) — sobrescreve
// ─────────────────────────────────────────────────────────

function writeDaily(ss) {
  var aba = getOrCreate(ss, "Por dia");
  aba.clearContents();
  var h = ["Data", "Impressoes", "Cliques", "CTR", "Custo RS", "Conv"];
  aba.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");

  var q = "SELECT segments.date, metrics.impressions, metrics.clicks, " +
          "metrics.cost_micros, metrics.conversions " +
          "FROM campaign " +
          "WHERE segments.date DURING LAST_30_DAYS " +
          "ORDER BY segments.date DESC";
  var res = AdsApp.search(q);
  var byDay = {};

  while (res.hasNext()) {
    var r = res.next();
    var d = r.segments.date;
    if (!byDay[d]) byDay[d] = { imp: 0, clk: 0, cost: 0, conv: 0 };
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
    rows.push([
      p[2] + "/" + p[1] + "/" + p[0],
      v.imp,
      v.clk,
      pct(v.clk, v.imp),
      v.cost.toFixed(2),
      Math.round(v.conv)
    ]);
  }

  if (rows.length) {
    aba.getRange(2, 1, rows.length, h.length).setValues(rows);
    aba.getRange(2, 2, rows.length, 2).setNumberFormat("0");
    aba.getRange(2, 5, rows.length, 1).setNumberFormat("0.00");
    aba.getRange(2, 6, rows.length, 1).setNumberFormat("0");
  }
}

// ─────────────────────────────────────────────────────────
// Historico — totais diários acumulados (NUNCA apaga)
// Uma linha por dia. Ao rodar de hora em hora, atualiza o dia atual.
// ─────────────────────────────────────────────────────────

function appendHistorico(ss) {
  var aba = getOrCreate(ss, "Historico");
  var h = ["Data", "Impressoes", "Cliques", "CTR", "Custo RS", "Conv", "CPA RS"];

  // Criar cabeçalho se aba nova
  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");
  }

  var dataHoje = today();

  // Buscar totais do dia atual (TODA a conta)
  var q = "SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions " +
          "FROM campaign " +
          "WHERE segments.date = '" + dataHoje + "' AND campaign.status != REMOVED";
  var res = AdsApp.search(q);
  var imp = 0, clk = 0, cost = 0, conv = 0;

  while (res.hasNext()) {
    var r = res.next();
    imp  += r.metrics.impressions;
    clk  += r.metrics.clicks;
    cost += r.metrics.costMicros / 1e6;
    conv += r.metrics.conversions;
  }

  // Remover linha existente de hoje (para atualizar)
  var lastRow = aba.getLastRow();
  if (lastRow > 1) {
    var dates = aba.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = dates.length - 1; i >= 0; i--) {
      if (String(dates[i][0]).trim() === dataHoje) {
        aba.deleteRow(i + 2);
      }
    }
  }

  // Adicionar linha de hoje no final
  var novaLinha = [
    dataHoje,
    imp,
    clk,
    pct(clk, imp),
    cost.toFixed(2),
    Math.round(conv),
    cpa(cost, conv)
  ];
  aba.appendRow(novaLinha);

  // Formatar números
  var ultimaLinha = aba.getLastRow();
  aba.getRange(ultimaLinha, 2, 1, 2).setNumberFormat("0");
  aba.getRange(ultimaLinha, 5, 1, 1).setNumberFormat("0.00");
  aba.getRange(ultimaLinha, 6, 1, 1).setNumberFormat("0");
  aba.getRange(ultimaLinha, 7, 1, 1).setNumberFormat("0.00");

  // Manter ordenado por data (mais recente em cima)
  if (aba.getLastRow() > 2) {
    aba.getRange(2, 1, aba.getLastRow() - 1, h.length).sort({ column: 1, ascending: false });
  }
}

// ─────────────────────────────────────────────────────────
// Historico Campanhas — por campanha por dia (NUNCA apaga)
// Uma linha por campanha por dia.
// ─────────────────────────────────────────────────────────

function appendHistoricoCampanhas(ss) {
  var aba = getOrCreate(ss, "Historico Campanhas");
  var h = ["Data", "Campanha", "Impressoes", "Cliques", "CTR", "Custo RS", "Conv", "CPA RS"];

  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");
  }

  var dataHoje = today();

  var q = "SELECT campaign.name, metrics.impressions, metrics.clicks, " +
          "metrics.cost_micros, metrics.conversions " +
          "FROM campaign " +
          "WHERE segments.date = '" + dataHoje + "' AND campaign.status != REMOVED " +
          "ORDER BY metrics.cost_micros DESC";
  var res = AdsApp.search(q);
  var campanhas = [];

  while (res.hasNext()) {
    var r = res.next();
    var cost = r.metrics.costMicros / 1e6;
    var conv = r.metrics.conversions;
    campanhas.push([
      dataHoje,
      r.campaign.name,
      r.metrics.impressions,
      r.metrics.clicks,
      pct(r.metrics.clicks, r.metrics.impressions),
      cost.toFixed(2),
      Math.round(conv),
      cpa(cost, conv)
    ]);
  }

  if (!campanhas.length) return;

  // Remover linhas de hoje antes de reinserir
  var lastRow = aba.getLastRow();
  if (lastRow > 1) {
    var allDates = aba.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = allDates.length - 1; i >= 0; i--) {
      if (String(allDates[i][0]).trim() === dataHoje) {
        aba.deleteRow(i + 2);
      }
    }
  }

  // Inserir novas linhas
  var startRow = aba.getLastRow() + 1;
  aba.getRange(startRow, 1, campanhas.length, h.length).setValues(campanhas);

  // Formatar
  aba.getRange(startRow, 3, campanhas.length, 2).setNumberFormat("0");
  aba.getRange(startRow, 6, campanhas.length, 1).setNumberFormat("0.00");
  aba.getRange(startRow, 7, campanhas.length, 1).setNumberFormat("0");
  aba.getRange(startRow, 8, campanhas.length, 1).setNumberFormat("0.00");

  // Ordenar por data desc, depois custo desc
  if (aba.getLastRow() > 2) {
    aba.getRange(2, 1, aba.getLastRow() - 1, h.length)
       .sort([{ column: 1, ascending: false }, { column: 6, ascending: false }]);
  }
}
