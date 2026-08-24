'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import {
  mockLeads, mockLeadsEnriched, mockGA4Sources,
  type Lead, type LeadEstagio, type LeadEnriched, type GA4Source, type ChamadoCanal,
} from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';

/* ═══════════════ CONSTANTS ═══════════════ */

type ViewTab = 'pipeline' | 'base' | 'aquisicao';

const estagios: { key: LeadEstagio; label: string; color: string }[] = [
  { key: 'novo', label: 'Novo', color: 'var(--blue)' },
  { key: 'qualificado', label: 'Qualificado', color: 'var(--violet)' },
  { key: 'cotado', label: 'Cotado', color: 'var(--amber)' },
  { key: 'negociando', label: 'Negociando', color: 'var(--green)' },
];

const canalPill: Record<string, { label: string; cls: string }> = {
  whatsapp: { label: 'WHATSAPP', cls: 'pill-green' },
  telefone: { label: 'TELEFONE', cls: 'pill-blue' },
  site: { label: 'SITE', cls: 'pill-violet' },
  email: { label: 'EMAIL', cls: 'pill-amber' },
  manual: { label: 'MANUAL', cls: 'pill-slate' },
  outro: { label: 'OUTRO', cls: 'pill-slate' },
};

const statusPill: Record<string, { label: string; cls: string }> = {
  novo: { label: 'NOVO', cls: 'pill-blue' },
  qualificado: { label: 'QUALIFICADO', cls: 'pill-violet' },
  cotado: { label: 'COTADO', cls: 'pill-amber' },
  negociando: { label: 'NEGOCIANDO', cls: 'pill-green' },
  convertido: { label: 'CONVERTIDO', cls: 'pill-green' },
  perdido: { label: 'PERDIDO', cls: 'pill-red' },
};

const sourcePill: Record<string, string> = {
  'google cpc': 'pill-green',
  'google organic': 'pill-blue',
  '(direct) (none)': 'pill-slate',
  'chatgpt.com referral': 'pill-violet',
  'instagram social': 'pill-amber',
  'facebook cpc': 'pill-blue',
  'whatsapp referral': 'pill-green',
  'bing organic': 'pill-blue',
  'linkedin social': 'pill-violet',
};

const PER_PAGE = 50;

/* ═══════════════ HELPERS ═══════════════ */

function fmt(v: number) { return v.toLocaleString('pt-BR'); }
function fmtR(v: number) { return `R$ ${fmt(v)}`; }
function fmtDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function daysSince(dateStr: string): number {
  const now = new Date('2026-08-20T12:00:00');
  return Math.floor((now.getTime() - new Date(dateStr).getTime()) / 86400000);
}

function timeAgo(dateStr: string): string {
  const d = daysSince(dateStr);
  if (d < 1) return 'hoje';
  if (d === 1) return '1d';
  return `${d}d`;
}

/* ═══════════════ PIPELINE VIEW ═══════════════ */

function PipelineView({ onSelect }: { onSelect: (l: Lead) => void }) {
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);

  const cutoff = new Date('2026-08-20T12:00:00');
  cutoff.setDate(cutoff.getDate() - dateRange);

  const filtered = mockLeads.filter(l => {
    if (l.estagio === 'convertido' || l.estagio === 'perdido') return false;
    return new Date(l.created_at) >= cutoff;
  });

  const totalPipeline = filtered.length;
  const pipelineValue = filtered.reduce((s, l) => s + l.valor_estimado, 0);
  const avgDays = totalPipeline > 0
    ? Math.round(filtered.reduce((s, l) => s + daysSince(l.created_at), 0) / totalPipeline)
    : 0;

  return (
    <>
      {/* Date filters */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        {([7, 30, 90] as const).map(d => (
          <button key={d} className={`chip ${dateRange === d ? 'chip-active' : ''}`} onClick={() => setDateRange(d)}>
            {d}d
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Pipeline ativo</div>
          <div className="kpi-value">{totalPipeline}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor pipeline</div>
          <div className="kpi-value" style={{ color: 'var(--green)' }}>{fmtR(pipelineValue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Tempo medio (dias)</div>
          <div className="kpi-value">{avgDays}</div>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {estagios.map(est => {
          const items = filtered.filter(l => l.estagio === est.key);
          return (
            <div key={est.key} className="kanban-column">
              <div className="kanban-column-header">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: est.color, flexShrink: 0 }} />
                <span className="kanban-column-title">{est.label}</span>
                <span className="kanban-column-count">{items.length}</span>
              </div>
              <div className="kanban-column-body">
                {items.map(lead => {
                  const canal = canalPill[lead.canal] || canalPill.outro;
                  return (
                    <div key={lead.id} className="kanban-card" onClick={() => onSelect(lead)}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12.5, marginBottom: 3 }}>
                        {lead.nome}
                      </div>
                      {lead.empresa && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{lead.empresa}</div>
                      )}
                      <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                        <span className={`pill ${canal.cls}`}>{canal.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{fmtR(lead.valor_estimado)}</span>
                        <span className="mono" style={{ fontSize: 9, color: 'var(--muted2)' }}>{timeAgo(lead.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted2)', fontSize: 11 }}>Nenhum lead</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════ BASE COMPLETA VIEW ═══════════════ */

function BaseCompletaView({ onSelectEnriched }: { onSelectEnriched: (l: LeadEnriched) => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [canalFilter, setCanalFilter] = useState<string>('todos');
  const [page, setPage] = useState(1);

  const data = mockLeadsEnriched;

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.nome.toLowerCase().includes(q) ||
        (l.empresa || '').toLowerCase().includes(q) ||
        (l.telefone || '').includes(q)
      );
    }
    if (statusFilter !== 'todos') result = result.filter(l => l.status === statusFilter);
    if (canalFilter !== 'todos') result = result.filter(l => l.canal === canalFilter);
    return result;
  }, [data, search, statusFilter, canalFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--muted2)' }} />
          <input
            className="table-search"
            style={{ width: '100%' }}
            placeholder="Buscar nome, empresa, telefone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={13} style={{ color: 'var(--muted2)' }} />
        </div>
        <select className="form-select" style={{ width: 140, padding: '6px 28px 6px 10px', fontSize: 11 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="todos">Status: Todos</option>
          <option value="novo">Novo</option>
          <option value="qualificado">Qualificado</option>
          <option value="cotado">Cotado</option>
          <option value="negociando">Negociando</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </select>
        <select className="form-select" style={{ width: 140, padding: '6px 28px 6px 10px', fontSize: 11 }} value={canalFilter} onChange={e => { setCanalFilter(e.target.value); setPage(1); }}>
          <option value="todos">Canal: Todos</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="site">Site</option>
          <option value="telefone">Telefone</option>
          <option value="outro">Outro</option>
        </select>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>
          {fmt(filtered.length)} leads
        </div>
      </div>

      {/* Table */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="th" style={{ textAlign: 'left' }}>Data</th>
              <th className="th" style={{ textAlign: 'left' }}>Nome</th>
              <th className="th" style={{ textAlign: 'left' }}>Empresa</th>
              <th className="th" style={{ textAlign: 'left' }}>Canal</th>
              <th className="th" style={{ textAlign: 'left' }}>Origem</th>
              <th className="th" style={{ textAlign: 'left' }}>Campanha</th>
              <th className="th" style={{ textAlign: 'left' }}>Servico</th>
              <th className="th" style={{ textAlign: 'right' }}>Valor</th>
              <th className="th" style={{ textAlign: 'left' }}>Status</th>
              <th className="th" style={{ textAlign: 'left' }}>Atendente</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(lead => {
              const canal = canalPill[lead.canal] || canalPill.outro;
              const status = statusPill[lead.status] || statusPill.novo;
              const sourceKey = `${lead.utm_source} ${lead.utm_medium}`;
              const srcCls = sourcePill[sourceKey] || 'pill-slate';
              return (
                <tr key={lead.id} className="table-row-click" onClick={() => onSelectEnriched(lead)}>
                  <td className="td mono" style={{ fontSize: 10.5, whiteSpace: 'nowrap' }}>{fmtDate(lead.primeiro_contato)}</td>
                  <td className="td" style={{ fontWeight: 600, fontSize: 12.5 }}>{lead.nome}</td>
                  <td className="td" style={{ fontSize: 11, color: 'var(--muted)' }}>{lead.empresa || '\u2014'}</td>
                  <td className="td"><span className={`pill ${canal.cls}`}>{canal.label}</span></td>
                  <td className="td">
                    {lead.utm_source && (
                      <span className={`pill ${srcCls}`}>{lead.utm_source?.toUpperCase()}</span>
                    )}
                  </td>
                  <td className="td" style={{ fontSize: 10.5, color: 'var(--muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.utm_campaign || '\u2014'}
                  </td>
                  <td className="td" style={{ fontSize: 11, color: 'var(--ink2)' }}>{lead.tipo_servico || '\u2014'}</td>
                  <td className="td mono" style={{ fontSize: 11, fontWeight: 700, textAlign: 'right' }}>
                    {lead.valor_estimado ? fmtR(lead.valor_estimado) : '\u2014'}
                  </td>
                  <td className="td"><span className={`pill ${status.cls}`}>{status.label}</span></td>
                  <td className="td" style={{ fontSize: 11, color: 'var(--muted)' }}>{lead.atendente || '\u2014'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between" style={{ marginTop: 12, padding: '0 4px' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted2)' }}>
          Pagina {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button className="chip" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ opacity: page <= 1 ? 0.4 : 1 }}>
            <ChevronLeft size={12} /> Anterior
          </button>
          <button className="chip" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ opacity: page >= totalPages ? 0.4 : 1 }}>
            Proxima <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════ AQUISICAO VIEW ═══════════════ */

function AquisicaoView() {
  const data = mockGA4Sources;
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0);
  const totalConversions = data.reduce((s, d) => s + d.conversions, 0);
  const totalUsers = data.reduce((s, d) => s + d.users, 0);

  // Source breakdown (aggregate by source)
  const bySource: Record<string, { sessions: number; conversions: number }> = {};
  data.forEach(d => {
    const key = d.source;
    if (!bySource[key]) bySource[key] = { sessions: 0, conversions: 0 };
    bySource[key].sessions += d.sessions;
    bySource[key].conversions += d.conversions;
  });
  const sourceEntries = Object.entries(bySource).sort((a, b) => b[1].sessions - a[1].sessions);
  const maxSessions = sourceEntries[0]?.[1].sessions || 1;

  // Canal breakdown from leads
  const leads = mockLeadsEnriched;
  const byCanal: Record<string, number> = {};
  leads.forEach(l => { byCanal[l.canal] = (byCanal[l.canal] || 0) + 1; });
  const canalEntries = Object.entries(byCanal).sort((a, b) => b[1] - a[1]);
  const maxCanal = canalEntries[0]?.[1] || 1;

  // Monthly trend (simulated from leads by month)
  const monthCounts: Record<string, number> = {};
  leads.forEach(l => {
    const d = new Date(l.primeiro_contato);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });
  const monthEntries = Object.entries(monthCounts).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMonth = Math.max(...monthEntries.map(e => e[1]), 1);

  // Source colors
  const srcColors: Record<string, string> = {
    'google': 'var(--green)',
    '(direct)': 'var(--slate)',
    'chatgpt.com': 'var(--violet)',
    'instagram': 'var(--amber)',
    'facebook': 'var(--blue)',
    'bing': 'var(--blue)',
    'whatsapp': 'var(--green-d)',
    'linkedin': 'var(--violet)',
  };

  const canalColors: Record<string, string> = {
    whatsapp: 'var(--green)',
    site: 'var(--violet)',
    telefone: 'var(--blue)',
    outro: 'var(--slate)',
  };

  return (
    <>
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-label">Sessoes totais</div>
          <div className="kpi-value">{fmt(totalSessions)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Usuarios</div>
          <div className="kpi-value">{fmt(totalUsers)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Conversoes</div>
          <div className="kpi-value" style={{ color: 'var(--green)' }}>{fmt(totalConversions)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Taxa conversao</div>
          <div className="kpi-value">{(totalConversions / totalSessions * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Source breakdown (bar chart) */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Sessoes por fonte</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sourceEntries.map(([source, v]) => (
              <div key={source} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="mono" style={{ fontSize: 10, width: 80, textAlign: 'right', color: 'var(--muted)', flexShrink: 0 }}>
                  {source}
                </div>
                <div style={{ flex: 1, height: 18, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(v.sessions / maxSessions) * 100}%`,
                    height: '100%',
                    background: srcColors[source] || 'var(--muted2)',
                    borderRadius: 4,
                    minWidth: 4,
                  }} />
                </div>
                <div className="mono" style={{ fontSize: 10, fontWeight: 700, width: 50, color: 'var(--ink2)' }}>
                  {fmt(v.sessions)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canal breakdown (bar chart) */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Leads por canal</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canalEntries.map(([canal, count]) => (
              <div key={canal} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="mono" style={{ fontSize: 10, width: 80, textAlign: 'right', color: 'var(--muted)', flexShrink: 0 }}>
                  {canal}
                </div>
                <div style={{ flex: 1, height: 18, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(count / maxCanal) * 100}%`,
                    height: '100%',
                    background: canalColors[canal] || 'var(--muted2)',
                    borderRadius: 4,
                    minWidth: 4,
                  }} />
                </div>
                <div className="mono" style={{ fontSize: 10, fontWeight: 700, width: 40, color: 'var(--ink2)' }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <span className="panel-title">Tendencia mensal</span>
        </div>
        <div className="panel-body" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
          {monthEntries.map(([month, count]) => {
            const pct = (count / maxMonth) * 100;
            const label = month.split('-');
            return (
              <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink2)' }}>{count}</div>
                <div style={{ width: '100%', height: `${pct}%`, minHeight: 4, background: 'var(--green)', borderRadius: '4px 4px 0 0' }} />
                <div className="mono" style={{ fontSize: 8, color: 'var(--muted2)' }}>{label[1]}/{label[0].slice(2)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign performance table */}
      <div className="panel" style={{ marginTop: 16, overflow: 'hidden' }}>
        <div className="panel-header">
          <span className="panel-title">Performance por campanha</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="th" style={{ textAlign: 'left' }}>Campanha</th>
              <th className="th" style={{ textAlign: 'left' }}>Fonte</th>
              <th className="th" style={{ textAlign: 'right' }}>Sessoes</th>
              <th className="th" style={{ textAlign: 'right' }}>Conversoes</th>
              <th className="th" style={{ textAlign: 'right' }}>Taxa</th>
              <th className="th" style={{ textAlign: 'right' }}>Usuarios</th>
            </tr>
          </thead>
          <tbody>
            {data.sort((a, b) => b.conversions - a.conversions).map((row, i) => (
              <tr key={i}>
                <td className="td" style={{ fontSize: 11.5, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.campaign}
                </td>
                <td className="td">
                  <span className={`pill ${sourcePill[`${row.source} ${row.medium}`] || 'pill-slate'}`}>
                    {row.source.toUpperCase()}
                  </span>
                </td>
                <td className="td mono" style={{ fontSize: 11, textAlign: 'right' }}>{fmt(row.sessions)}</td>
                <td className="td mono" style={{ fontSize: 11, textAlign: 'right', fontWeight: 700 }}>{fmt(row.conversions)}</td>
                <td className="td mono" style={{ fontSize: 11, textAlign: 'right', color: row.conversions / row.sessions > 0.05 ? 'var(--green-d)' : 'var(--muted)' }}>
                  {(row.conversions / row.sessions * 100).toFixed(1)}%
                </td>
                <td className="td mono" style={{ fontSize: 11, textAlign: 'right' }}>{fmt(row.users)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ═══════════════ ENRICHED LEAD SLIDE-OVER ═══════════════ */

function EnrichedLeadDetail({ lead }: { lead: LeadEnriched }) {
  const sections = [
    {
      title: 'DADOS PESSOAIS',
      rows: [
        { k: 'Nome', v: lead.nome },
        { k: 'Telefone', v: lead.telefone || '\u2014' },
        { k: 'Email', v: lead.email || '\u2014' },
        { k: 'Empresa', v: lead.empresa || '\u2014' },
      ],
    },
    {
      title: 'ATRIBUICAO',
      rows: [
        { k: 'Canal', v: lead.canal },
        { k: 'Fonte', v: lead.utm_source || '\u2014' },
        { k: 'Midia', v: lead.utm_medium || '\u2014' },
        { k: 'Campanha', v: lead.utm_campaign || '\u2014' },
      ],
    },
    {
      title: 'NEGOCIO',
      rows: [
        { k: 'Servico', v: lead.tipo_servico || '\u2014' },
        { k: 'Regiao', v: lead.regiao || '\u2014' },
        { k: 'Valor estimado', v: lead.valor_estimado ? fmtR(lead.valor_estimado) : '\u2014' },
        { k: 'Valor fechado', v: lead.valor_fechado ? fmtR(lead.valor_fechado) : '\u2014' },
        { k: 'Status', v: lead.status },
        { k: 'Atendente', v: lead.atendente || '\u2014' },
      ],
    },
    {
      title: 'HISTORICO',
      rows: [
        { k: 'Primeiro contato', v: fmtDate(lead.primeiro_contato) },
        { k: 'Ultimo contato', v: fmtDate(lead.ultimo_contato) },
        { k: 'Notas', v: lead.notas || '\u2014' },
      ],
    },
    {
      title: 'PIPEDRIVE',
      rows: [
        { k: 'ID', v: lead.pipedrive_id ? `#${lead.pipedrive_id}` : '\u2014' },
        { k: 'Pipeline', v: lead.pipedrive_pipeline || '\u2014' },
        { k: 'Estagio', v: lead.pipedrive_stage || '\u2014' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {sections.map(sec => (
        <div key={sec.title}>
          <div className="label" style={{ marginBottom: 8 }}>{sec.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sec.rows.map(row => (
              <div key={row.k} className="ws-info-row">
                <span className="ws-key">{row.k}</span>
                <span className="ws-val" style={{ fontFamily: row.k === 'Valor estimado' || row.k === 'Valor fechado' || row.k === 'ID' ? 'var(--mono)' : undefined }}>
                  {row.k === 'Canal' ? (
                    <span className={`pill ${(canalPill[row.v] || canalPill.outro).cls}`}>{(canalPill[row.v] || canalPill.outro).label}</span>
                  ) : row.k === 'Status' ? (
                    <span className={`pill ${(statusPill[row.v] || statusPill.novo).cls}`}>{(statusPill[row.v] || statusPill.novo).label}</span>
                  ) : row.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */

export default function LeadsPage() {
  const [view, setView] = useState<ViewTab>('pipeline');
  const [creating, setCreating] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedEnriched, setSelectedEnriched] = useState<LeadEnriched | null>(null);

  const isOpen = creating || selectedLead !== null || selectedEnriched !== null;
  const closePanel = () => { setCreating(false); setSelectedLead(null); setSelectedEnriched(null); };

  const slideTitle = selectedEnriched ? selectedEnriched.nome : selectedLead ? selectedLead.nome : 'Novo lead';

  return (
    <div>
      <div className="page-hd">
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>GESTAO</p>
          <h1 className="page-title">Leads</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setSelectedLead(null); setSelectedEnriched(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo lead</span>
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab ${view === 'pipeline' ? 'tab-active' : ''}`} onClick={() => setView('pipeline')}>
          Pipeline
        </button>
        <button className={`tab ${view === 'base' ? 'tab-active' : ''}`} onClick={() => setView('base')}>
          Base completa
        </button>
        <button className={`tab ${view === 'aquisicao' ? 'tab-active' : ''}`} onClick={() => setView('aquisicao')}>
          Aquisicao
        </button>
      </div>

      {/* Views */}
      {view === 'pipeline' && (
        <PipelineView onSelect={l => { setSelectedLead(l); setSelectedEnriched(null); setCreating(false); }} />
      )}
      {view === 'base' && (
        <BaseCompletaView onSelectEnriched={l => { setSelectedEnriched(l); setSelectedLead(null); setCreating(false); }} />
      )}
      {view === 'aquisicao' && <AquisicaoView />}

      {/* Slide-over */}
      <SlideOver
        open={isOpen}
        onClose={closePanel}
        title={slideTitle}
        footer={
          <div className="flex gap-2" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={closePanel}>Fechar</button>
            {(creating || selectedLead) && <button className="btn btn-green" onClick={closePanel}>Salvar</button>}
          </div>
        }
      >
        {selectedEnriched ? (
          <EnrichedLeadDetail lead={selectedEnriched} />
        ) : selectedLead ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>CONTATO</div>
              <div style={{ fontSize: 12.5 }}>{selectedLead.telefone}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{selectedLead.email}</div>
            </div>
            {selectedLead.empresa && (
              <div>
                <div className="label" style={{ marginBottom: 4 }}>EMPRESA</div>
                <div style={{ fontSize: 12.5 }}>{selectedLead.empresa}</div>
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <div className="label" style={{ marginBottom: 4 }}>CANAL</div>
                <span className={`pill ${canalPill[selectedLead.canal].cls}`}>{canalPill[selectedLead.canal].label}</span>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 4 }}>REGIAO</div>
                <div style={{ fontSize: 12.5 }}>{selectedLead.regiao}</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="label" style={{ marginBottom: 4 }}>SERVICO</div>
                <div style={{ fontSize: 12.5 }}>{selectedLead.tipo_servico}</div>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 4 }}>VALOR</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{fmtR(selectedLead.valor_estimado)}</div>
              </div>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>ESTAGIO</div>
              <select className="form-select" defaultValue={selectedLead.estagio}>
                {[...estagios, { key: 'convertido' as LeadEstagio, label: 'Convertido' }, { key: 'perdido' as LeadEstagio, label: 'Perdido' }].map(e => (
                  <option key={e.key} value={e.key}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>NOTAS</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.4, background: 'var(--bg)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}>
                {selectedLead.notas}
              </div>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>TIMELINE</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                <div>Criado em {new Date(selectedLead.created_at).toLocaleDateString('pt-BR')} as {new Date(selectedLead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>Ultimo contato {new Date(selectedLead.ultimo_contato).toLocaleDateString('pt-BR')} as {new Date(selectedLead.ultimo_contato).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <FormField label="Nome">
              <input className="form-input" />
            </FormField>
            <FormField label="Telefone">
              <input className="form-input" placeholder="(21) 00000-0000" />
            </FormField>
            <FormField label="Email">
              <input className="form-input" type="email" />
            </FormField>
            <FormField label="Canal">
              <select className="form-select">
                <option value="whatsapp">WhatsApp</option>
                <option value="telefone">Telefone</option>
                <option value="site">Site</option>
                <option value="email">Email</option>
                <option value="manual">Manual</option>
              </select>
            </FormField>
            <FormField label="Tipo de servico">
              <input className="form-input" placeholder="UTI Movel, Basica, Cobertura..." />
            </FormField>
            <FormField label="Regiao">
              <input className="form-input" placeholder="Zona Sul RJ" />
            </FormField>
            <FormField label="Empresa (se B2B)">
              <input className="form-input" />
            </FormField>
            <FormField label="Valor estimado (R$)">
              <input className="form-input" type="number" />
            </FormField>
            <FormField label="Notas">
              <textarea className="form-textarea" />
            </FormField>
          </>
        )}
      </SlideOver>
    </div>
  );
}
