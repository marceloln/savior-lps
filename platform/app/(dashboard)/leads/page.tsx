'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import {
  mockLeads, mockLeadsEnriched, mockGA4Sources,
  type Lead, type LeadEstagio, type LeadEnriched, type GA4Source, type ChamadoCanal,
} from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

/* ═══════════════ CONSTANTS ═══════════════ */

type ViewTab = 'pipeline' | 'base' | 'aquisicao';

const estagios: { key: LeadEstagio; label: string; dotCls: string }[] = [
  { key: 'novo', label: 'Novo', dotCls: 'bg-blue' },
  { key: 'qualificado', label: 'Qualificado', dotCls: 'bg-violet' },
  { key: 'cotado', label: 'Cotado', dotCls: 'bg-amber' },
  { key: 'negociando', label: 'Negociando', dotCls: 'bg-green' },
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
      <div className="flex items-center gap-2 mb-4">
        {([7, 30, 90] as const).map(d => (
          <button key={d} className={`chip ${dateRange === d ? 'chip-active' : ''}`} onClick={() => setDateRange(d)}>
            {d}d
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="kpi-card">
          <div className="kpi-label">Pipeline ativo</div>
          <div className="kpi-value">{totalPipeline}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor pipeline</div>
          <div className="kpi-value text-green">{fmtR(pipelineValue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Tempo médio (dias)</div>
          <div className="kpi-value">{avgDays}</div>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-3">
        {estagios.map(est => {
          const items = filtered.filter(l => l.estagio === est.key);
          return (
            <div key={est.key} className="kanban-column">
              <div className="kanban-column-header">
                <div className={`kanban-dot ${est.dotCls}`} />
                <span className="kanban-column-title">{est.label}</span>
                <span className="kanban-column-count">{items.length}</span>
              </div>
              <div className="kanban-column-body">
                {items.map(lead => {
                  const canal = canalPill[lead.canal] || canalPill.outro;
                  return (
                    <div key={lead.id} className="kanban-card" onClick={() => onSelect(lead)}>
                      <div className="font-display fw-700 text-base-1 mb-0.5">
                        {lead.nome}
                      </div>
                      {lead.empresa && (
                        <div className="text-xs text-muted mb-1">{lead.empresa}</div>
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`pill ${canal.cls}`}>{canal.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="mono text-sm fw-700">{fmtR(lead.valor_estimado)}</span>
                        <span className="mono text-[9px] text-muted2">{timeAgo(lead.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="p-4 text-center text-muted2 text-sm">Nenhum lead neste estágio</div>
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
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="search-wrapper flex-1 max-w-80">
          <Search size={14} className="search-icon-abs" />
          <input
            className="table-search w-full"
            placeholder="Buscar nome, empresa, telefone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={13} className="text-muted2" />
        </div>
        <select className="form-select w-[140px] py-1.5 px-2.5 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="todos">Status: Todos</option>
          <option value="novo">Novo</option>
          <option value="qualificado">Qualificado</option>
          <option value="cotado">Cotado</option>
          <option value="negociando">Negociando</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </select>
        <select className="form-select w-[140px] py-1.5 px-2.5 text-sm" value={canalFilter} onChange={e => { setCanalFilter(e.target.value); setPage(1); }}>
          <option value="todos">Canal: Todos</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="site">Site</option>
          <option value="telefone">Telefone</option>
          <option value="outro">Outro</option>
        </select>
        <div className="mono text-xs text-muted ml-auto">
          {fmt(filtered.length)} leads
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <table className="table-full">
          <thead>
            <tr>
              <th className="th text-left">Data</th>
              <th className="th text-left">Nome</th>
              <th className="th text-left">Empresa</th>
              <th className="th text-left">Canal</th>
              <th className="th text-left">Origem</th>
              <th className="th text-left">Campanha</th>
              <th className="th text-left">Serviço</th>
              <th className="th text-right">Valor</th>
              <th className="th text-left">Status</th>
              <th className="th text-left">Atendente</th>
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
                  <td className="td mono text-xs-1 whitespace-nowrap">{fmtDate(lead.primeiro_contato)}</td>
                  <td className="td fw-600 text-base-1">{lead.nome}</td>
                  <td className="td text-sm text-muted">{lead.empresa || '\u2014'}</td>
                  <td className="td"><span className={`pill ${canal.cls}`}>{canal.label}</span></td>
                  <td className="td">
                    {lead.utm_source && (
                      <span className={`pill ${srcCls}`}>{lead.utm_source?.toUpperCase()}</span>
                    )}
                  </td>
                  <td className="td text-xs-1 text-muted max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {lead.utm_campaign || '\u2014'}
                  </td>
                  <td className="td text-sm text-ink2">{lead.tipo_servico || '\u2014'}</td>
                  <td className="td mono text-sm fw-700 text-right">
                    {lead.valor_estimado ? fmtR(lead.valor_estimado) : '\u2014'}
                  </td>
                  <td className="td"><span className={`pill ${status.cls}`}>{status.label}</span></td>
                  <td className="td text-sm text-muted">{lead.atendente || '\u2014'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="mono text-xs text-muted2">
          Página {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-paginate-md" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={12} /> Anterior
          </button>
          <button className="btn btn-outline btn-paginate-md" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Próxima <ChevronRight size={12} />
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

  // Source colors mapped to CSS classes
  const srcBarCls: Record<string, string> = {
    'google': 'bg-green',
    '(direct)': 'bg-slate-l',
    'chatgpt.com': 'bg-violet-l',
    'instagram': 'bg-amber-l',
    'facebook': 'bg-blue-l',
    'bing': 'bg-blue-l',
    'whatsapp': 'bg-green',
    'linkedin': 'bg-violet-l',
  };

  const canalBarCls: Record<string, string> = {
    whatsapp: 'bg-green',
    site: 'bg-violet-l',
    telefone: 'bg-blue-l',
    outro: 'bg-slate-l',
  };

  return (
    <>
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Sessões totais</div>
          <div className="kpi-value">{fmt(totalSessions)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Usuários</div>
          <div className="kpi-value">{fmt(totalUsers)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Conversões</div>
          <div className="kpi-value text-green">{fmt(totalConversions)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Taxa de conversão</div>
          <div className="kpi-value">{(totalConversions / totalSessions * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Source breakdown (bar chart) */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Sessões por fonte</span>
          </div>
          <div className="panel-body flex flex-col gap-2.5">
            {sourceEntries.map(([source, v]) => (
              <div key={source} className="flex items-center gap-2.5">
                <div className="mono text-xs w-20 text-right text-muted shrink-0">
                  {source}
                </div>
                <div className="flex-1 h-4.5 bg-page rounded overflow-hidden">
                  <div
                    className={`h-full rounded min-w-1 ${srcBarCls[source] || 'bg-slate-l'}`}
                    style={{ width: `${(v.sessions / maxSessions) * 100}%` }}
                  />
                </div>
                <div className="mono text-xs fw-700 w-12.5 text-ink2">
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
          <div className="panel-body flex flex-col gap-2.5">
            {canalEntries.map(([canal, count]) => (
              <div key={canal} className="flex items-center gap-2.5">
                <div className="mono text-xs w-20 text-right text-muted shrink-0">
                  {canal}
                </div>
                <div className="flex-1 h-4.5 bg-page rounded overflow-hidden">
                  <div
                    className={`h-full rounded min-w-1 ${canalBarCls[canal] || 'bg-slate-l'}`}
                    style={{ width: `${(count / maxCanal) * 100}%` }}
                  />
                </div>
                <div className="mono text-xs fw-700 w-10 text-ink2">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="panel mt-4">
        <div className="panel-header">
          <span className="panel-title">Tendência mensal</span>
        </div>
        <div className="panel-body flex items-end gap-2 h-[140px]">
          {monthEntries.map(([month, count]) => {
            const pct = (count / maxMonth) * 100;
            const label = month.split('-');
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="mono text-xs fw-700 text-ink2">{count}</div>
                <div className="w-full bg-green rounded-t min-h-1" style={{ height: `${pct}%` }} />
                <div className="mono text-2xs text-muted2">{label[1]}/{label[0].slice(2)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign performance table */}
      <div className="panel mt-4 overflow-hidden">
        <div className="panel-header">
          <span className="panel-title">Performance por campanha</span>
        </div>
        <table className="table-full">
          <thead>
            <tr>
              <th className="th text-left">Campanha</th>
              <th className="th text-left">Fonte</th>
              <th className="th text-right">Sessões</th>
              <th className="th text-right">Conversões</th>
              <th className="th text-right">Taxa</th>
              <th className="th text-right">Usuários</th>
            </tr>
          </thead>
          <tbody>
            {data.sort((a, b) => b.conversions - a.conversions).map((row, i) => (
              <tr key={i}>
                <td className="td text-sm-1 fw-600 max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.campaign}
                </td>
                <td className="td">
                  <span className={`pill ${sourcePill[`${row.source} ${row.medium}`] || 'pill-slate'}`}>
                    {row.source.toUpperCase()}
                  </span>
                </td>
                <td className="td mono text-sm text-right">{fmt(row.sessions)}</td>
                <td className="td mono text-sm text-right fw-700">{fmt(row.conversions)}</td>
                <td className={`td mono text-sm text-right ${row.conversions / row.sessions > 0.05 ? 'text-green-d' : 'text-muted'}`}>
                  {(row.conversions / row.sessions * 100).toFixed(1)}%
                </td>
                <td className="td mono text-sm text-right">{fmt(row.users)}</td>
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
      title: 'ATRIBUIÇÃO',
      rows: [
        { k: 'Canal', v: lead.canal },
        { k: 'Fonte', v: lead.utm_source || '\u2014' },
        { k: 'Midia', v: lead.utm_medium || '\u2014' },
        { k: 'Campanha', v: lead.utm_campaign || '\u2014' },
      ],
    },
    {
      title: 'NEGÓCIO',
      rows: [
        { k: 'Serviço', v: lead.tipo_servico || '\u2014' },
        { k: 'Região', v: lead.regiao || '\u2014' },
        { k: 'Valor estimado', v: lead.valor_estimado ? fmtR(lead.valor_estimado) : '\u2014' },
        { k: 'Valor fechado', v: lead.valor_fechado ? fmtR(lead.valor_fechado) : '\u2014' },
        { k: 'Status', v: lead.status },
        { k: 'Atendente', v: lead.atendente || '\u2014' },
      ],
    },
    {
      title: 'HISTÓRICO',
      rows: [
        { k: 'Primeiro contato', v: fmtDate(lead.primeiro_contato) },
        { k: 'Último contato', v: fmtDate(lead.ultimo_contato) },
        { k: 'Notas', v: lead.notas || '\u2014' },
      ],
    },
    {
      title: 'PIPEDRIVE',
      rows: [
        { k: 'ID', v: lead.pipedrive_id ? `#${lead.pipedrive_id}` : '\u2014' },
        { k: 'Pipeline', v: lead.pipedrive_pipeline || '\u2014' },
        { k: 'Estágio', v: lead.pipedrive_stage || '\u2014' },
      ],
    },
  ];

  const monoKeys = new Set(['Valor estimado', 'Valor fechado', 'ID']);

  return (
    <div className="flex flex-col gap-4.5">
      {sections.map(sec => (
        <div key={sec.title}>
          <div className="label mb-2">{sec.title}</div>
          <div className="flex flex-col gap-0.5">
            {sec.rows.map(row => (
              <div key={row.k} className="ws-info-row">
                <span className="ws-key">{row.k}</span>
                <span className={`ws-val ${monoKeys.has(row.k) ? 'mono' : ''}`}>
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
  const { showToast } = useToast();
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
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">GESTÃO</p>
          <h1 className="page-title">Leads</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setSelectedLead(null); setSelectedEnriched(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo lead</span>
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar mb-5">
        <button className={`tab ${view === 'pipeline' ? 'tab-active' : ''}`} onClick={() => setView('pipeline')}>
          Pipeline
        </button>
        <button className={`tab ${view === 'base' ? 'tab-active' : ''}`} onClick={() => setView('base')}>
          Base completa
        </button>
        <button className={`tab ${view === 'aquisicao' ? 'tab-active' : ''}`} onClick={() => setView('aquisicao')}>
          Aquisição
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
          <div className="slide-footer-end">
            <button className="btn btn-outline" onClick={closePanel}>Fechar</button>
            {(creating || selectedLead) && <button className="btn btn-green ml-2" onClick={() => { closePanel(); showToast('Lead salvo com sucesso', 'success'); }}>Salvar</button>}
          </div>
        }
      >
        {selectedEnriched ? (
          <EnrichedLeadDetail lead={selectedEnriched} />
        ) : selectedLead ? (
          <div className="flex flex-col gap-3.5">
            <div>
              <div className="label mb-1">CONTATO</div>
              <div className="text-base-1">{selectedLead.telefone}</div>
              <div className="text-base-1 text-muted">{selectedLead.email}</div>
            </div>
            {selectedLead.empresa && (
              <div>
                <div className="label mb-1">EMPRESA</div>
                <div className="text-base-1">{selectedLead.empresa}</div>
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <div className="label mb-1">CANAL</div>
                <span className={`pill ${canalPill[selectedLead.canal].cls}`}>{canalPill[selectedLead.canal].label}</span>
              </div>
              <div>
                <div className="label mb-1">REGIÃO</div>
                <div className="text-base-1">{selectedLead.regiao}</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="label mb-1">SERVIÇO</div>
                <div className="text-base-1">{selectedLead.tipo_servico}</div>
              </div>
              <div>
                <div className="label mb-1">VALOR</div>
                <div className="mono text-lg fw-700">{fmtR(selectedLead.valor_estimado)}</div>
              </div>
            </div>
            <div>
              <div className="label mb-1">ESTÁGIO</div>
              <select className="form-select" defaultValue={selectedLead.estagio}>
                {[...estagios, { key: 'convertido' as LeadEstagio, label: 'Convertido' }, { key: 'perdido' as LeadEstagio, label: 'Perdido' }].map(e => (
                  <option key={e.key} value={e.key}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label mb-1">NOTAS</div>
              <textarea className="form-textarea" defaultValue={selectedLead.notas} />
            </div>
            <div>
              <div className="label mb-1">TIMELINE</div>
              <div className="text-sm text-muted">
                <div>Criado em {new Date(selectedLead.created_at).toLocaleDateString('pt-BR')} as {new Date(selectedLead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>Último contato {new Date(selectedLead.ultimo_contato).toLocaleDateString('pt-BR')} as {new Date(selectedLead.ultimo_contato).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
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
            <FormField label="Tipo de serviço">
              <input className="form-input" placeholder="UTI Móvel, Básica, Cobertura..." />
            </FormField>
            <FormField label="Região">
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
