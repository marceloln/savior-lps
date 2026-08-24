'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockFuncionariosDetail } from '@/lib/mock-data';
import type { FuncionarioDetail, FuncionarioStatus } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';

/* ── Status pill config ──────────────────────────────────────────── */

const statusPill: Record<FuncionarioStatus, { bg: string; color: string; label: string }> = {
  ativo: { bg: 'var(--green-l)', color: 'var(--green-d)', label: 'ATIVO' },
  ferias: { bg: 'var(--blue-l)', color: 'var(--blue)', label: 'FÉRIAS' },
  afastado: { bg: 'var(--amber-l)', color: 'var(--amber)', label: 'AFASTADO' },
  desligado: { bg: 'var(--red-l)', color: 'var(--red)', label: 'DESLIGADO' },
};

const funcaoPill: Record<string, { bg: string; color: string }> = {
  Motorista: { bg: 'var(--green-l)', color: 'var(--green-d)' },
  Compras: { bg: 'var(--blue-l)', color: 'var(--blue)' },
  'Auxiliar de Frota': { bg: 'var(--amber-l)', color: 'var(--amber)' },
  Enfermeiro: { bg: 'var(--violet-l)', color: 'var(--violet)' },
  'Técnico de Enfermagem': { bg: 'var(--violet-l)', color: 'var(--violet)' },
  Médico: { bg: 'var(--red-l)', color: 'var(--red)' },
  Administrativo: { bg: 'var(--slate-l)', color: 'var(--slate)' },
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
  const [search, setSearch] = useState('');
  const [filterFuncao, setFilterFuncao] = useState('Todos');
  const [filterRegiao, setFilterRegiao] = useState('Todos');
  const [page, setPage] = useState(1);

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

  /* ── Pagination ──────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

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

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <p className="breadcrumb mb-1">EQUIPE</p>
        <div className="flex items-center gap-3" style={{ justifyContent: 'space-between' }}>
          <div className="flex items-end gap-3">
            <h1 className="page-title">Equipe</h1>
            <span className="mono text-muted" style={{ fontSize: '11px', paddingBottom: 2 }}>
              {mockFuncionariosDetail.length} colaboradores
            </span>
          </div>
          <button className="btn btn-green flex items-center gap-2" onClick={openCreate}>
            <Plus size={14} strokeWidth={2} />
            Novo funcionário
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3" style={{ maxWidth: 320 }}>
        <div className="flex items-center gap-2" style={{
          background: 'var(--card)',
          borderRadius: 10,
          padding: '8px 14px',
          border: '1px solid var(--line)',
        }}>
          <Search size={14} style={{ color: 'var(--muted2)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12.5px',
              color: 'var(--ink)',
              width: '100%',
              fontFamily: 'var(--sans)',
            }}
          />
        </div>
      </div>

      {/* Filter chips: função */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="label" style={{ marginRight: 4 }}>FUNÇÃO</span>
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
            {f} <span className="mono" style={{ fontSize: '9px', marginLeft: 3, opacity: 0.7 }}>({funcaoCounts[f]})</span>
          </button>
        ))}
      </div>

      {/* Filter chips: região */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="label" style={{ marginRight: 4 }}>REGIÃO</span>
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
            {r} <span className="mono" style={{ fontSize: '9px', marginLeft: 3, opacity: 0.7 }}>({regiaoCounts[r] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Result count */}
      {(search || filterFuncao !== 'Todos' || filterRegiao !== 'Todos') && (
        <p className="mono text-muted2 mb-2" style={{ fontSize: '10px' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="panel overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="th" style={{ textAlign: 'left' }}>NOME</th>
              <th className="th" style={{ textAlign: 'left' }}>FUNÇÃO</th>
              <th className="th" style={{ textAlign: 'left' }}>CONSELHO</th>
              <th className="th" style={{ textAlign: 'left' }}>MATRÍCULA</th>
              <th className="th" style={{ textAlign: 'left' }}>FILIAL</th>
              <th className="th" style={{ textAlign: 'left' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((emp) => {
              const fp = funcaoPill[emp.funcao] ?? { bg: 'var(--slate-l)', color: 'var(--slate)' };
              const sp = statusPill[emp.status] ?? statusPill.ativo;
              return (
                <tr
                  key={emp.id}
                  className="table-row-click"
                  onClick={() => openEdit(emp)}
                >
                  <td className="td" style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)' }}>
                    {emp.nome}
                  </td>
                  <td className="td">
                    <span className="pill" style={{ background: fp.bg, color: fp.color }}>
                      {emp.funcao}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--ink2)' }}>
                      {emp.conselho_numero ?? '\u2014'}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--ink2)' }}>
                      {emp.matricula ?? '\u2014'}
                    </span>
                  </td>
                  <td className="td" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {emp.filial ?? '\u2014'}
                  </td>
                  <td className="td">
                    <span className="pill" style={{ background: sp.bg, color: sp.color }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--line)',
          }}>
            <span className="mono text-muted2" style={{ fontSize: '10px' }}>
              {(safePage - 1) * PER_PAGE + 1}\u2013{Math.min(safePage * PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline"
                style={{ padding: '5px 10px' }}
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--ink2)' }}>
                {safePage} / {totalPages}
              </span>
              <button
                className="btn btn-outline"
                style={{ padding: '5px 10px' }}
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
          <div className="flex items-center gap-2" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              {slideMode === 'edit' && form.sofit_id && (
                <Link
                  href={`/equipe/${form.sofit_id}`}
                  style={{ fontSize: '11px', color: 'var(--green-d)', fontWeight: 600, textDecoration: 'none' }}
                >
                  Ver ficha completa
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline" onClick={() => setSlideOpen(false)}>Cancelar</button>
              <button className="btn btn-green" onClick={() => setSlideOpen(false)}>Salvar</button>
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
                <option key={s} value={s}>{statusPill[s].label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="cols2">
          <FormField label="Matrícula">
            <input className="form-input mono" style={{ fontSize: '12px' }} value={form.matricula ?? ''} onChange={(e) => setField('matricula', e.target.value)} />
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
                <input className="form-input mono" style={{ fontSize: '12px' }} value={form.conselho_numero ?? ''} onChange={(e) => setField('conselho_numero', e.target.value)} placeholder={form.funcao === 'Médico' ? 'CRM-RJ 52-12345-6' : 'COREN-RJ 456.789'} />
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
              <input className="form-input mono" style={{ fontSize: '12px' }} value={form.cnh ?? ''} onChange={(e) => setField('cnh', e.target.value)} />
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
