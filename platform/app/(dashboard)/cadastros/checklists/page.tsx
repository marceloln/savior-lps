'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Check,
  X,
} from 'lucide-react';
import {
  mockChecklistModelos,
  mockChecklistExecucoes,
  type ChecklistModelo,
  type ChecklistExecucao,
} from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';

// ── Helpers ──────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string) {
  const map: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    (map[k] ??= []).push(item);
  }
  return map;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const resultadoLabel: Record<string, string> = {
  aprovado: 'Aprovado',
  reprovado_parcial: 'Reprovado parcial',
  reprovado: 'Reprovado',
};

const resultadoPill: Record<string, string> = {
  aprovado: 'pill-green',
  reprovado_parcial: 'pill-amber',
  reprovado: 'pill-red',
};

const tipoBadge: Record<string, { cls: string; icon: string }> = {
  bool: { cls: 'pill-slate', icon: '\u2713' },
  foto: { cls: 'pill-violet', icon: '\uD83D\uDCF7' },
  número: { cls: 'pill-blue', icon: '\uD83D\uDD22' },
  texto: { cls: 'pill-amber', icon: '\uD83D\uDCDD' },
};

const resultadoBgCls: Record<string, string> = {
  aprovado: 'bg-green-l',
  reprovado_parcial: 'bg-amber-l',
  reprovado: 'bg-red-l',
};

// ── Main ─────────────────────────────────────────────────────────────────

export default function ChecklistsPage() {
  const [tab, setTab] = useState<'modelos' | 'execucoes'>('modelos');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [selectedExec, setSelectedExec] = useState<ChecklistExecucao | null>(null);
  const [filterVtr, setFilterVtr] = useState('');
  const [filterResultado, setFilterResultado] = useState('');
  const [search, setSearch] = useState('');

  // Unique VTR names for filter
  const vtrNames = [...new Set(mockChecklistExecucoes.map((e) => e.vtr_nome))].sort();

  const filteredExecs = mockChecklistExecucoes.filter((e) => {
    if (filterVtr && e.vtr_nome !== filterVtr) return false;
    if (filterResultado && e.resultado !== filterResultado) return false;
    if (search && !e.executado_por.toLowerCase().includes(search.toLowerCase()) && !e.vtr_nome.includes(search)) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-hd">
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Checklists</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-5">
        <button className={`tab ${tab === 'modelos' ? 'tab-active' : ''}`} onClick={() => setTab('modelos')}>
          Modelos
        </button>
        <button className={`tab ${tab === 'execucoes' ? 'tab-active' : ''}`} onClick={() => setTab('execucoes')}>
          Execuções
        </button>
      </div>

      {/* ════════ Tab Modelos ════════ */}
      {tab === 'modelos' && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn btn-green">
              <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo modelo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mockChecklistModelos.map((modelo) => (
              <ModeloCard
                key={modelo.id}
                modelo={modelo}
                expanded={expandedModel === modelo.id}
                onToggle={() => setExpandedModel(expandedModel === modelo.id ? null : modelo.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ════════ Tab Execuções ════════ */}
      {tab === 'execucoes' && (
        <div>
          {/* Filters */}
          <div className="flex gap-2.5 mb-4 items-center flex-wrap">
            <div className="search-wrapper">
              <Search size={14} strokeWidth={1.8} className="search-icon-abs" />
              <input
                className="table-search"
                placeholder="Buscar motorista ou VTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select w-[160px] py-1.5 px-2.5 text-base"
              value={filterVtr}
              onChange={(e) => setFilterVtr(e.target.value)}
            >
              <option value="">Todas VTRs</option>
              {vtrNames.map((v) => (
                <option key={v} value={v}>VTR {v}</option>
              ))}
            </select>

            <select
              className="form-select w-[180px] py-1.5 px-2.5 text-base"
              value={filterResultado}
              onChange={(e) => setFilterResultado(e.target.value)}
            >
              <option value="">Todos resultados</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado_parcial">Reprovado parcial</option>
              <option value="reprovado">Reprovado</option>
            </select>
          </div>

          {/* Table */}
          <div className="panel">
            <table className="table-full">
              <thead>
                <tr className="text-left">
                  <th className="th">Data</th>
                  <th className="th">VTR</th>
                  <th className="th">Motorista</th>
                  <th className="th">Resultado</th>
                  <th className="th">Itens</th>
                  <th className="th">Duração</th>
                </tr>
              </thead>
              <tbody>
                {filteredExecs.map((exec) => (
                  <tr
                    key={exec.id}
                    className="table-row-click"
                    onClick={() => setSelectedExec(exec)}
                  >
                    <td className="td mono text-base whitespace-nowrap">
                      {formatDate(exec.data)}
                    </td>
                    <td className="td">
                      <div className="flex flex-col gap-0.5">
                        <span className="fw-600 text-base-1">VTR {exec.vtr_nome}</span>
                        <span className="mono text-xs text-muted">{exec.vtr_placa}</span>
                      </div>
                    </td>
                    <td className="td text-base-1">{exec.executado_por}</td>
                    <td className="td">
                      <span className={`pill ${resultadoPill[exec.resultado]}`}>
                        {resultadoLabel[exec.resultado]}
                      </span>
                    </td>
                    <td className="td mono text-base">
                      {exec.itens_aprovados}/{exec.total_itens}
                    </td>
                    <td className="td mono text-base">
                      {exec.duracao_minutos} min
                    </td>
                  </tr>
                ))}
                {filteredExecs.length === 0 && (
                  <tr>
                    <td className="td text-center text-muted p-8" colSpan={6}>
                      Nenhuma execução encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════ Slide-over: Execução detalhe ════════ */}
      <SlideOver
        open={selectedExec !== null}
        onClose={() => setSelectedExec(null)}
        title="Detalhe da execução"
      >
        {selectedExec && <ExecDetail exec={selectedExec} />}
      </SlideOver>
    </div>
  );
}

// ── ModeloCard ────────────────────────────────────────────────────────────

function ModeloCard({ modelo, expanded, onToggle }: { modelo: ChecklistModelo; expanded: boolean; onToggle: () => void }) {
  const grouped = groupBy(modelo.itens, (i) => i.categoria);
  const categories = Object.keys(grouped);

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={onToggle}
        className="modelo-toggle"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-lg text-ink">
              {modelo.nome}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`pill ${modelo.tipo_vtr === 'uti' ? 'pill-red' : 'pill-blue'}`}>
              {modelo.tipo_vtr === 'uti' ? 'UTI' : 'Básica'}
            </span>
            <span className="pill pill-slate">{modelo.frequencia}</span>
            <span className="pill pill-green">ativo</span>
            <span className="mono text-xs text-muted ml-1">
              {modelo.itens.length} itens
            </span>
          </div>
        </div>
        <div className="text-muted2 flex items-center mt-1">
          {expanded ? <ChevronDown size={16} strokeWidth={1.8} /> : <ChevronRight size={16} strokeWidth={1.8} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t-line px-4.5 pb-4">
          {categories.map((cat) => (
            <div key={cat} className="mt-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="cat-header">
                  {cat}
                </span>
                <span className="mono text-[9px] text-muted2 bg-page rounded-md px-1.5 py-0.5">
                  {grouped[cat].length}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {grouped[cat].map((item, idx) => (
                  <div
                    key={idx}
                    className={`checklist-item-row ${idx < grouped[cat].length - 1 ? 'border-b-line' : ''}`}
                  >
                    <span className="flex-1 text-ink">{item.nome}</span>
                    <span className={`pill ${(tipoBadge[item.tipo] || { cls: 'pill-slate' }).cls}`}>{(tipoBadge[item.tipo] || { icon: '' }).icon} {item.tipo}</span>
                    {item.obrigatorio && (
                      <span className="pill pill-red text-[7px]">obrigatório</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-end">
            <button className="btn btn-outline text-sm py-1.5 px-3.5">
              Editar modelo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ExecDetail (slide-over content) ──────────────────────────────────────

function ExecDetail({ exec }: { exec: ChecklistExecucao }) {
  const score = Math.round((exec.itens_aprovados / exec.total_itens) * 100);
  const grouped = groupBy(exec.itens_resultado, (i) => i.categoria);
  const categories = Object.keys(grouped);

  return (
    <div>
      {/* Header info */}
      <div className="mb-4.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-display text-xl">VTR {exec.vtr_nome}</span>
          <span className="mono text-sm text-muted">{exec.vtr_placa}</span>
        </div>
        <div className="text-base text-muted mb-1">
          {formatDate(exec.data)} · {exec.executado_por}
        </div>
        <div className="text-sm text-muted mb-3">
          {exec.modelo_nome}
        </div>
      </div>

      {/* Result badge (large) */}
      <div className={`exec-result-banner ${resultadoBgCls[exec.resultado]}`}>
        <span className={`pill ${resultadoPill[exec.resultado]} text-xs px-2.5 py-1`}>
          {resultadoLabel[exec.resultado]}
        </span>
        <div className="flex-1" />
        <div className="text-right">
          <div className="mono text-2xl fw-700 text-ink">
            {score}%
          </div>
          <div className="mono text-[9px] text-muted">
            {exec.itens_aprovados}/{exec.total_itens} aprovados
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-5">
        <div className="kpi-card flex-1 text-center">
          <div className="kpi-label">Aprovados</div>
          <div className="kpi-value-md text-green-d">{exec.itens_aprovados}</div>
        </div>
        <div className="kpi-card flex-1 text-center">
          <div className="kpi-label">Reprovados</div>
          <div className={`kpi-value-md ${exec.itens_reprovados > 0 ? 'text-red' : 'text-muted2'}`}>{exec.itens_reprovados}</div>
        </div>
        <div className="kpi-card flex-1 text-center">
          <div className="kpi-label">Duração</div>
          <div className="kpi-value-md">{exec.duracao_minutos}<span className="text-sm fw-400 text-muted"> min</span></div>
        </div>
      </div>

      {/* Items by category */}
      {categories.map((cat) => (
        <div key={cat} className="mb-4">
          <div className="cat-header mb-1.5">
            {cat}
          </div>
          <div className="flex flex-col gap-0.5">
            {grouped[cat].map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col py-1.5 px-2.5 rounded-lg ${item.aprovado ? '' : 'bg-red-l'}`}
              >
                <div className="flex items-center gap-2">
                  {item.aprovado ? (
                    <Check size={14} strokeWidth={2.2} className="text-green shrink-0" />
                  ) : (
                    <X size={14} strokeWidth={2.2} className="text-red shrink-0" />
                  )}
                  <span className="text-base-1 text-ink flex-1">{item.nome}</span>
                </div>
                {!item.aprovado && item.observacao && (
                  <div className="text-sm text-red ml-5.5 mt-0.5 leading-snug">
                    {item.observacao}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
