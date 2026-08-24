'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ArrowRight, Download } from 'lucide-react';
import { mockVtrs, statusPill, statusLabel, tipoVtrPill, vtrStats } from '@/lib/mock-data';
import type { Vtr, VtrStatus, VtrTipo } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useVtrs } from '@/lib/supabase/hooks';
import Link from 'next/link';

type FilterStatus = 'todas' | VtrStatus;
type FilterTipo = 'todos' | VtrTipo;

const tipoFilters: { label: string; value: FilterTipo }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'UTI', value: 'uti' },
  { label: 'Básica', value: 'basica' },
  { label: 'Moto', value: 'moto' },
];

const PAGE_SIZE = 25;

function getRegiao(lat: number): string {
  if (lat < -23.0) return 'SP';
  return 'RJ';
}

export default function FrotaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { vtrs: supaVtrs, loading } = useVtrs();

  // Map Supabase data to component format, fallback to mock
  const allVtrs: Vtr[] = useMemo(() => {
    if (supaVtrs.length > 0) {
      return supaVtrs.map((v: any) => ({
        id: String(v.id),
        nome: v.nome ?? '',
        placa: v.placa ?? '',
        tipo: v.tipo as VtrTipo,
        status: v.status as VtrStatus,
        modelo: v.modelo ?? '',
        latitude: Number(v.latitude) || 0,
        longitude: Number(v.longitude) || 0,
        sofit_id: v.sofit_id ?? 0,
      }));
    }
    return mockVtrs;
  }, [supaVtrs]);

  // Dynamic stats from actual data
  const dynamicStats = useMemo(() => ({
    total: allVtrs.length,
    disponivel: allVtrs.filter(v => v.status === 'disponivel').length,
    em_atendimento: allVtrs.filter(v => v.status === 'em_atendimento').length,
    manutencao: allVtrs.filter(v => v.status === 'manutencao').length,
  }), [allVtrs]);

  const statusFilters: { label: string; value: FilterStatus; count: number }[] = [
    { label: 'Todas', value: 'todas', count: dynamicStats.total },
    { label: 'Disponivel', value: 'disponivel', count: dynamicStats.disponivel },
    { label: 'Em uso', value: 'em_atendimento', count: dynamicStats.em_atendimento },
    { label: 'Manutencao', value: 'manutencao', count: dynamicStats.manutencao },
  ];

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todas');
  const [tipoFilter, setTipoFilter] = useState<FilterTipo>('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
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

  // Slide-over state
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingVtr, setEditingVtr] = useState<Vtr | null>(null);

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formPlaca, setFormPlaca] = useState('');
  const [formTipo, setFormTipo] = useState('basica');
  const [formStatus, setFormStatus] = useState('disponivel');
  const [formModelo, setFormModelo] = useState('');
  const [formVersao, setFormVersao] = useState('');
  const [formGrupo, setFormGrupo] = useState('');
  const [formChassi, setFormChassi] = useState('');
  const [formRenavam, setFormRenavam] = useState('');
  const [formAnoFab, setFormAnoFab] = useState('');
  const [formAnoMod, setFormAnoMod] = useState('');
  const [formKm, setFormKm] = useState('');
  const [formRegiao, setFormRegiao] = useState('RJ');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allVtrs.filter((v) => {
      if (statusFilter !== 'todas' && v.status !== statusFilter) return false;
      if (tipoFilter !== 'todos' && v.tipo !== tipoFilter) return false;
      if (q && !v.placa.toLowerCase().includes(q) && !v.nome.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allVtrs, statusFilter, tipoFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sortKey === 'regiao') {
        va = getRegiao(a.latitude);
        vb = getRegiao(b.latitude);
      } else {
        va = (a as unknown as Record<string, unknown>)[sortKey] as string ?? '';
        vb = (b as unknown as Record<string, unknown>)[sortKey] as string ?? '';
      }
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const start = page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  const exportCSV = () => {
    const headers = ['Nome', 'Placa', 'Modelo', 'Tipo', 'Status', 'Região'];
    const rows = sorted.map(d => [d.nome, d.placa, d.modelo, d.tipo, d.status, getRegiao(d.latitude)]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frota-savior.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado com sucesso', 'success');
  };

  function openCreate() {
    setEditingVtr(null);
    setFormNome('');
    setFormPlaca('');
    setFormTipo('basica');
    setFormStatus('disponivel');
    setFormModelo('');
    setFormVersao('');
    setFormGrupo('');
    setFormChassi('');
    setFormRenavam('');
    setFormAnoFab('');
    setFormAnoMod('');
    setFormKm('');
    setFormRegiao('RJ');
    setSlideOpen(true);
  }

  function openEdit(vtr: Vtr) {
    setEditingVtr(vtr);
    setFormNome(vtr.nome);
    setFormPlaca(vtr.placa);
    setFormTipo(vtr.tipo);
    setFormStatus(vtr.status);
    setFormModelo(vtr.modelo);
    setFormVersao('');
    setFormGrupo('');
    setFormChassi('');
    setFormRenavam('');
    setFormAnoFab('');
    setFormAnoMod('');
    setFormKm('');
    setFormRegiao(getRegiao(vtr.latitude));
    setSlideOpen(true);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(0);
  }

  function handleFilterStatus(val: FilterStatus) {
    setStatusFilter(val);
    setPage(0);
  }

  function handleFilterTipo(val: FilterTipo) {
    setTipoFilter(val);
    setPage(0);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="line" width="200" height={28} />
        <div className="flex gap-3">
          <Skeleton variant="card" height={40} />
        </div>
        <Skeleton variant="card" height={400} />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <p className="breadcrumb mb-1">FROTA</p>
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-3">
            <h1 className="page-title">Frota</h1>
            <span className="mono text-muted frota-total">
              {dynamicStats.total} veiculos
            </span>
          </div>
          <button className="btn btn-green btn-inline-flex" onClick={openCreate}>
            <Plus size={14} strokeWidth={2} />
            Novo veículo
          </button>
        </div>
      </div>

      {/* Search + Export */}
      <div className="mb-4 flex items-center gap-3">
        <div className="search-wrapper flex-1">
          <Search
            size={14}
            strokeWidth={1.8}
            className="search-icon-abs"
          />
          <input
            type="text"
            className="table-search"
            placeholder="Buscar placa ou VTR..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={exportCSV}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterStatus(f.value)}
            className={`chip ${statusFilter === f.value ? 'chip-active' : ''}`}
          >
            {f.label}
            <span className="mono chip-count">{f.count}</span>
          </button>
        ))}

        <span className="filter-sep" />

        {tipoFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterTipo(f.value)}
            className={`chip ${tipoFilter === f.value ? 'chip-active' : ''}`}
          >
            {f.label}
          </button>
        ))}

        <span className="mono text-muted2 ml-3 filter-result-count">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <table className="table-full">
          <thead>
            <tr>
              <th className="th text-left sortable-th" onClick={() => handleSort('nome')}>VTR {sortKey === 'nome' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('placa')}>PLACA {sortKey === 'placa' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('modelo')}>MODELO {sortKey === 'modelo' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('tipo')}>TIPO {sortKey === 'tipo' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('status')}>STATUS {sortKey === 'status' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th text-left sortable-th" onClick={() => handleSort('regiao')}>REGIÃO {sortKey === 'regiao' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((vtr) => {
              const tp = tipoVtrPill[vtr.tipo];
              return (
                <tr
                  key={vtr.id}
                  className="table-row-click"
                  onClick={() => router.push('/frota/' + vtr.id)}
                >
                  <td className="td">
                    <span className="font-display td-name">
                      {vtr.nome}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono td-placa">
                      {vtr.placa}
                    </span>
                  </td>
                  <td className="td td-model">
                    {vtr.modelo}
                  </td>
                  <td className="td">
                    <span className={`pill ${tp.pill}`}>{tp.label}</span>
                  </td>
                  <td className="td">
                    <span className={`pill ${statusPill[vtr.status]}`}>
                      {statusLabel[vtr.status]}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono text-muted td-region">
                      {getRegiao(vtr.latitude)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > PAGE_SIZE && (
        <div className="pagination">
          <span className="mono pagination-info">
            Mostrando {start}–{end} de {sorted.length}
          </span>
          <div className="pagination-btns">
            <button
              className="btn btn-outline btn-page"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </button>
            <button
              className="btn btn-outline btn-page"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Slide-over: Create / Edit */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editingVtr ? `Editar VTR ${editingVtr.nome}` : 'Novo veículo'}
        footer={
          <div className="slide-footer-row">
            {editingVtr && (
              <Link
                href={`/frota/${editingVtr.id}`}
                className="slide-detail-link"
              >
                Ver detalhe <ArrowRight size={12} strokeWidth={1.8} />
              </Link>
            )}
            <div className={`slide-btns ${editingVtr ? '' : 'slide-btns-right'}`}>
              <button className="btn btn-outline" onClick={() => setSlideOpen(false)}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { setSlideOpen(false); showToast('Veículo salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <div className="form-grid-2">
          <FormField label="Nome">
            <input className="form-input" value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: 340" />
          </FormField>
          <FormField label="Placa">
            <input className="form-input mono" value={formPlaca} onChange={(e) => setFormPlaca(e.target.value)} placeholder="ABC1D23" />
          </FormField>
        </div>

        <div className="form-grid-2">
          <FormField label="Tipo">
            <select className="form-select" value={formTipo} onChange={(e) => setFormTipo(e.target.value)}>
              <option value="basica">Básica</option>
              <option value="uti">UTI</option>
              <option value="moto">Moto</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select className="form-select" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              <option value="disponivel">Disponível</option>
              <option value="em_atendimento">Em atendimento</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativa">Inativa</option>
            </select>
          </FormField>
        </div>

        <FormField label="Modelo">
          <input className="form-input" value={formModelo} onChange={(e) => setFormModelo(e.target.value)} placeholder="Renault Master 2.3" />
        </FormField>

        <div className="form-grid-2">
          <FormField label="Versão">
            <input className="form-input" value={formVersao} onChange={(e) => setFormVersao(e.target.value)} placeholder="L2H2" />
          </FormField>
          <FormField label="Grupo">
            <input className="form-input" value={formGrupo} onChange={(e) => setFormGrupo(e.target.value)} placeholder="Ambulância" />
          </FormField>
        </div>

        <div className="form-grid-2">
          <FormField label="Chassi">
            <input className="form-input mono" value={formChassi} onChange={(e) => setFormChassi(e.target.value)} placeholder="9BM6882..." />
          </FormField>
          <FormField label="Renavam">
            <input className="form-input mono" value={formRenavam} onChange={(e) => setFormRenavam(e.target.value)} placeholder="01234567890" />
          </FormField>
        </div>

        <div className="form-grid-3">
          <FormField label="Ano fabricação">
            <input className="form-input" type="number" value={formAnoFab} onChange={(e) => setFormAnoFab(e.target.value)} placeholder="2024" />
          </FormField>
          <FormField label="Ano modelo">
            <input className="form-input" type="number" value={formAnoMod} onChange={(e) => setFormAnoMod(e.target.value)} placeholder="2025" />
          </FormField>
          <FormField label="KM atual">
            <input className="form-input mono" type="number" value={formKm} onChange={(e) => setFormKm(e.target.value)} placeholder="45.000" />
          </FormField>
        </div>

        <FormField label="Região">
          <select className="form-select" value={formRegiao} onChange={(e) => setFormRegiao(e.target.value)}>
            <option value="RJ">RJ</option>
            <option value="SP">SP</option>
          </select>
        </FormField>
      </SlideOver>
    </div>
  );
}
