'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { mockFuncionariosDetail } from '@/lib/mock-data';
import type { FuncionarioDetail, FuncionarioStatus } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

/* ── Status pill config ──────────────────────────────────────────── */

const statusPillCls: Record<FuncionarioStatus, { cls: string; label: string }> = {
  ativo: { cls: 'pill-green', label: 'ATIVO' },
  ferias: { cls: 'pill-blue', label: 'FÉRIAS' },
  afastado: { cls: 'pill-amber', label: 'AFASTADO' },
  desligado: { cls: 'pill-red', label: 'DESLIGADO' },
};

const funcaoPillCls: Record<string, string> = {
  Motorista: 'pill-green',
  Compras: 'pill-blue',
  'Auxiliar de Frota': 'pill-amber',
  Enfermeiro: 'pill-violet',
  'Técnico de Enfermagem': 'pill-violet',
  Médico: 'pill-red',
  Administrativo: 'pill-slate',
};

const FUNCOES = ['Motorista', 'Enfermeiro', 'Técnico de Enfermagem', 'Médico', 'Auxiliar de Frota', 'Compras', 'Administrativo'];
const FILIAIS = ['SAVIOR - RJ', 'SAVIOR - SP'];
const REGIOES = ['RJ', 'SP'];
const STATUS_OPTIONS: FuncionarioStatus[] = ['ativo', 'ferias', 'afastado', 'desligado'];
const PER_PAGE = 25;

/* ── Empty form state ────────────────────────────────────────────── */

const UF_OPTIONS = ['RJ', 'SP', 'MG', 'ES', 'BA', 'PR', 'SC', 'RS', 'DF', 'GO', 'CE', 'PE', 'PA', 'MA', 'AM'];

function isHealthPro(funcao?: string) {
  return funcao === 'Médico' || funcao === 'Enfermeiro' || funcao === 'Técnico de Enfermagem';
}

function emptyForm(): Partial<FuncionarioDetail> {
  return {
    nome: '', funcao: 'Motorista', status: 'ativo', matricula: '', cpf: '', cnh: '',
    cnh_vencimento: '', telefone: '', email: '', filial: 'SAVIOR - RJ', regiao: 'RJ',
    conselho_tipo: null, conselho_numero: '', conselho_uf: '', especialidade: '',
  };
}

export default function EquipePage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterFuncao, setFilterFuncao] = useState('Todos');
  const [filterRegiao, setFilterRegiao] = useState('Todos');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  /* slide-over state */
  const [slideOpen, setSlideOpen] = useState(false);
  const [slideMode, setSlideMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Partial<FuncionarioDetail>>(emptyForm());

  /* ── Counts for chips ────────────────────────────────────────── */
  const funcaoCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of mockFuncionariosDetail) {
      c[e.funcao] = (c[e.funcao] ?? 0) + 1;
    }
    return c;
  }, []);

  const regiaoCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of mockFuncionariosDetail) {
      c[e.regiao] = (c[e.regiao] ?? 0) + 1;
    }
    return c;
  }, []);

  /* ── Unique funcoes present in data ──────────────────────────── */
  const funcaoKeys = useMemo(() => {
    const keys = Object.keys(funcaoCounts);
    keys.sort((a, b) => (funcaoCounts[b] ?? 0) - (funcaoCounts[a] ?? 0));
    return keys;
  }, [funcaoCounts]);

  /* ── Filter ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = mockFuncionariosDetail;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.nome.toLowerCase().includes(q));
    }
    if (filterFuncao !== 'Todos') {
      list = list.filter((e) => e.funcao === filterFuncao);
    }
    if (filterRegiao !== 'Todos') {
      list = list.filter((e) => e.regiao === filterRegiao);
    }
    return list;
  }, [search, filterFuncao, filterRegiao]);

  /* ── Sort ────────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortKey] as string ?? '';
      const vb = (b as unknown as Record<string, unknown>)[sortKey] as string ?? '';
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  /* ── Pagination ──────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  /* ── Handlers ────────────────────────────────────────────────── */
  function openCreate() {
    setForm(emptyForm());
    setSlideMode('create');
    setSlideOpen(true);
  }

  function openEdit(emp: FuncionarioDetail) {
    setForm({ ...emp });
    setSlideMode('edit');
    setSlideOpen(true);
  }

  function setField(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  // Reset page when filters change
  function changeFilterFuncao(v: string) {
    setFilterFuncao(v);
    setPage(1);
  }
  function changeFilterRegiao(v: string) {
    setFilterRegiao(v);
    setPage(1);
  }

  function exportCSV() {
    const headers = ['Nome', 'Função', 'Matrícula', 'Status', 'Filial', 'CNH/Conselho'];
    const rows = sorted.map(d => [d.nome, d.funcao, d.matricula ?? '', d.status, d.filial ?? '', d.conselho_numero || d.cnh || '']);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipe-savior.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado com sucesso', 'success');
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <p className="breadcrumb mb-1">EQUIPE</p>
        <div className="flex-between">
          <div className="flex items-end gap-3">
            <h1 className="page-title">Equipe</h1>
            <span className="mono text-muted text-sm pb-0.5">
              {mockFuncionariosDetail.length} colaboradores
            </span>
          </div>
          <button className="btn btn-green flex items-center gap-2" onClick={openCreate}>
            <Plus size={14} strokeWidth={2} />
            Novo funcionário
          </button>
        </div>
      </div>

      {/* Search + Export */}
      <div className="mb-3 flex items-center gap-3">
        <div className="search-wrapper flex-1 max-w-80">
          <Search
            size={14}
            strokeWidth={1.8}
            className="search-icon-abs"
          />
          <input
            type="text"
            className="table-search"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={exportCSV}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filter chips: função */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="label mr-1">FUNÇÃO</span>
        <button
          className={`chip ${filterFuncao === 'Todos' ? 'chip-active' : ''}`}
          onClick={() => changeFilterFuncao('Todos')}
        >
          Todos
        </button>
        {funcaoKeys.map((f) => (
          <button
            key={f}
            className={`chip ${filterFuncao === f ? 'chip-active' : ''}`}
            onClick={() => changeFilterFuncao(f)}
          >
            {f} <span className="mono chip-count">({funcaoCounts[f]})</span>
          </button>
        ))}
      </div>

      {/* Filter chips: região */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="label mr-1">REGIÃO</span>
        <button
          className={`chip ${filterRegiao === 'Todos' ? 'chip-active' : ''}`}
          onClick={() => changeFilterRegiao('Todos')}
        >
          Todos
        </button>
        {REGIOES.map((r) => (
          <button
            key={r}
            className={`chip ${filterRegiao === r ? 'chip-active' : ''}`}
            onClick={() => changeFilterRegiao(r)}
          >
            {r} <span className="mono chip-count">({regiaoCounts[r] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Result count */}
      {(search || filterFuncao !== 'Todos' || filterRegiao !== 'Todos') && (
        <p className="mono text-muted2 mb-2 text-xs">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="panel overflow-hidden">
        <table className="table-full">
          <thead>
            <tr>
              <th className="th text-left sortable-th" onClick={() => handleSort('nome')}>NOME {sortKey === 'nome' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('funcao')}>FUNÇÃO {sortKey === 'funcao' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left">CONSELHO</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('matricula')}>MATRÍCULA {sortKey === 'matricula' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('filial')}>FILIAL {sortKey === 'filial' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('status')}>STATUS {sortKey === 'status' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((emp) => {
              const fpCls = funcaoPillCls[emp.funcao] ?? 'pill-slate';
              const sp = statusPillCls[emp.status] ?? statusPillCls.ativo;
              return (
                <tr
                  key={emp.id}
                  className="table-row-click"
                  onClick={() => openEdit(emp)}
                >
                  <td className="td text-base-1 fw-500 text-ink">
                    {emp.nome}
                  </td>
                  <td className="td">
                    <span className={`pill ${fpCls}`}>
                      {emp.funcao}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono text-sm text-ink2">
                      {emp.conselho_numero ?? '\u2014'}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono text-sm text-ink2">
                      {emp.matricula ?? '\u2014'}
                    </span>
                  </td>
                  <td className="td text-sm text-muted">
                    {emp.filial ?? '\u2014'}
                  </td>
                  <td className="td">
                    <span className={`pill ${sp.cls}`}>
                      {sp.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <span className="mono text-muted2 text-xs">
              {(safePage - 1) * PER_PAGE + 1}\u2013{Math.min(safePage * PER_PAGE, sorted.length)} de {sorted.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline btn-paginate"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="mono text-sm text-ink2">
                {safePage} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-paginate"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over: create / edit */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={slideMode === 'create' ? 'Novo funcionário' : 'Editar funcionário'}
        footer={
          <div className="slide-footer-between">
            <div>
              {slideMode === 'edit' && form.sofit_id && (
                <Link
                  href={`/equipe/${form.sofit_id}`}
                  className="text-sm fw-600 text-green-d no-underline"
                >
                  Ver ficha completa
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline" onClick={() => setSlideOpen(false)}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { setSlideOpen(false); showToast('Funcionário salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="Nome">
          <input className="form-input" value={form.nome ?? ''} onChange={(e) => setField('nome', e.target.value)} />
        </FormField>

        <div className="cols2">
          <FormField label="Função">
            <select className="form-select" value={form.funcao ?? 'Motorista'} onChange={(e) => setField('funcao', e.target.value)}>
              {FUNCOES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select className="form-select" value={form.status ?? 'ativo'} onChange={(e) => setField('status', e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusPillCls[s].label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="cols2">
          <FormField label="Matrícula">
            <input className="form-input mono text-base" value={form.matricula ?? ''} onChange={(e) => setField('matricula', e.target.value)} />
          </FormField>
          <FormField label="CPF">
            <input className="form-input" value={form.cpf ?? ''} onChange={(e) => setField('cpf', e.target.value)} />
          </FormField>
        </div>

        {/* Conditional: health professional */}
        {isHealthPro(form.funcao) && (
          <>
            <div className="cols2">
              <FormField label={form.funcao === 'Médico' ? 'CRM' : 'COREN'}>
                <input className="form-input mono text-base" value={form.conselho_numero ?? ''} onChange={(e) => setField('conselho_numero', e.target.value)} placeholder={form.funcao === 'Médico' ? 'CRM-RJ 52-12345-6' : 'COREN-RJ 456.789'} />
              </FormField>
              <FormField label="UF do Conselho">
                <select className="form-select" value={form.conselho_uf ?? ''} onChange={(e) => setField('conselho_uf', e.target.value)}>
                  <option value="">Selecionar</option>
                  {UF_OPTIONS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Especialidade">
              <input className="form-input" value={form.especialidade ?? ''} onChange={(e) => setField('especialidade', e.target.value)} placeholder="Ex: Emergência, UTI" />
            </FormField>
          </>
        )}

        {/* Conditional: driver */}
        {form.funcao === 'Motorista' && (
          <div className="cols2">
            <FormField label="CNH">
              <input className="form-input mono text-base" value={form.cnh ?? ''} onChange={(e) => setField('cnh', e.target.value)} />
            </FormField>
            <FormField label="CNH Vencimento">
              <input className="form-input" type="date" value={form.cnh_vencimento ?? ''} onChange={(e) => setField('cnh_vencimento', e.target.value)} />
            </FormField>
          </div>
        )}

        <div className="cols2">
          <FormField label="Telefone">
            <input className="form-input" value={form.telefone ?? ''} onChange={(e) => setField('telefone', e.target.value)} />
          </FormField>
          <FormField label="Email">
            <input className="form-input" type="email" value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} />
          </FormField>
        </div>

        <div className="cols2">
          <FormField label="Filial">
            <select className="form-select" value={form.filial ?? ''} onChange={(e) => setField('filial', e.target.value)}>
              <option value="">Selecionar</option>
              {FILIAIS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Região">
            <select className="form-select" value={form.regiao ?? ''} onChange={(e) => setField('regiao', e.target.value)}>
              {REGIOES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
        </div>
      </SlideOver>
    </div>
  );
}
