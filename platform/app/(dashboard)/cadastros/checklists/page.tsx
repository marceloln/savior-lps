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
  Camera,
  Filter,
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

const tipoBadge: Record<string, string> = {
  bool: 'pill-slate',
  foto: 'pill-violet',
  número: 'pill-blue',
  texto: 'pill-amber',
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
        <Link href="/cadastros" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>CADASTROS</p>
          <h1 className="page-title">Checklists</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
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
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Search size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted2)' }} />
              <input
                className="table-search"
                placeholder="Buscar motorista ou VTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 160, padding: '7px 32px 7px 10px', fontSize: 12 }}
              value={filterVtr}
              onChange={(e) => setFilterVtr(e.target.value)}
            >
              <option value="">Todas VTRs</option>
              {vtrNames.map((v) => (
                <option key={v} value={v}>VTR {v}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 180, padding: '7px 32px 7px 10px', fontSize: 12 }}
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
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
                    <td className="td mono" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatDate(exec.data)}
                    </td>
                    <td className="td">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 12.5 }}>VTR {exec.vtr_nome}</span>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{exec.vtr_placa}</span>
                      </div>
                    </td>
                    <td className="td" style={{ fontSize: 12.5 }}>{exec.executado_por}</td>
                    <td className="td">
                      <span className={`pill ${resultadoPill[exec.resultado]}`}>
                        {resultadoLabel[exec.resultado]}
                      </span>
                    </td>
                    <td className="td mono" style={{ fontSize: 12 }}>
                      {exec.itens_aprovados}/{exec.total_itens}
                    </td>
                    <td className="td mono" style={{ fontSize: 12 }}>
                      {exec.duracao_minutos} min
                    </td>
                  </tr>
                ))}
                {filteredExecs.length === 0 && (
                  <tr>
                    <td className="td" colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
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
    <div className="panel" style={{ overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '16px 18px',
          textAlign: 'left',
          fontFamily: 'var(--sans)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="font-display" style={{ fontSize: 14, color: 'var(--ink)' }}>
              {modelo.nome}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className={`pill ${modelo.tipo_vtr === 'uti' ? 'pill-red' : 'pill-blue'}`}>
              {modelo.tipo_vtr === 'uti' ? 'UTI' : 'Básica'}
            </span>
            <span className="pill pill-slate">{modelo.frequencia}</span>
            <span className="pill pill-green">ativo</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>
              {modelo.itens.length} itens
            </span>
          </div>
        </div>
        <div style={{ color: 'var(--muted2)', display: 'flex', alignItems: 'center', marginTop: 4 }}>
          {expanded ? <ChevronDown size={16} strokeWidth={1.8} /> : <ChevronRight size={16} strokeWidth={1.8} />}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '0 18px 16px' }}>
          {categories.map((cat) => (
            <div key={cat} style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink2)' }}>
                  {cat}
                </span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--muted2)', background: 'var(--bg)', borderRadius: 6, padding: '1px 6px' }}>
                  {grouped[cat].length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {grouped[cat].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 0',
                      borderBottom: idx < grouped[cat].length - 1 ? '1px solid var(--line)' : 'none',
                      fontSize: 12.5,
                    }}
                  >
                    <span style={{ flex: 1, color: 'var(--ink)' }}>{item.nome}</span>
                    <span className={`pill ${tipoBadge[item.tipo] || 'pill-slate'}`}>{item.tipo}</span>
                    {item.obrigatorio && (
                      <span className="pill pill-red" style={{ fontSize: 7 }}>obrigatório</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" style={{ fontSize: 11, padding: '7px 14px' }}>
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
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="font-display" style={{ fontSize: 16 }}>VTR {exec.vtr_nome}</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{exec.vtr_placa}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
          {formatDate(exec.data)} · {exec.executado_por}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
          {exec.modelo_nome}
        </div>
      </div>

      {/* Result badge (large) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 'var(--r)',
        background: exec.resultado === 'aprovado' ? 'var(--green-l)' : exec.resultado === 'reprovado_parcial' ? 'var(--amber-l)' : 'var(--red-l)',
        marginBottom: 18,
      }}>
        <span className={`pill ${resultadoPill[exec.resultado]}`} style={{ fontSize: 10, padding: '4px 10px' }}>
          {resultadoLabel[exec.resultado]}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
            {score}%
          </div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
            {exec.itens_aprovados}/{exec.total_itens} aprovados
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="kpi-card" style={{ flex: 1, textAlign: 'center' }}>
          <div className="kpi-label">Aprovados</div>
          <div className="kpi-value" style={{ fontSize: 18, color: 'var(--green-d)' }}>{exec.itens_aprovados}</div>
        </div>
        <div className="kpi-card" style={{ flex: 1, textAlign: 'center' }}>
          <div className="kpi-label">Reprovados</div>
          <div className="kpi-value" style={{ fontSize: 18, color: exec.itens_reprovados > 0 ? 'var(--red)' : 'var(--muted2)' }}>{exec.itens_reprovados}</div>
        </div>
        <div className="kpi-card" style={{ flex: 1, textAlign: 'center' }}>
          <div className="kpi-label">Duração</div>
          <div className="kpi-value" style={{ fontSize: 18 }}>{exec.duracao_minutos}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}> min</span></div>
        </div>
      </div>

      {/* Items by category */}
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--ink2)',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {cat}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {grouped[cat].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '7px 10px',
                  borderRadius: 8,
                  background: item.aprovado ? 'transparent' : 'var(--red-l)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.aprovado ? (
                    <Check size={14} strokeWidth={2.2} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  ) : (
                    <X size={14} strokeWidth={2.2} style={{ color: 'var(--red)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 12.5, color: 'var(--ink)', flex: 1 }}>{item.nome}</span>
                </div>
                {!item.aprovado && item.observacao && (
                  <div style={{ fontSize: 11, color: 'var(--red)', marginLeft: 22, marginTop: 3, lineHeight: 1.35 }}>
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
