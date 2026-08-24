'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ArrowRight } from 'lucide-react';
import { mockVtrs, statusPill, statusLabel, tipoVtrPill, vtrStats } from '@/lib/mock-data';
import type { Vtr, VtrStatus, VtrTipo } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

type FilterStatus = 'todas' | VtrStatus;
type FilterTipo = 'todos' | VtrTipo;

const statusFilters: { label: string; value: FilterStatus; count: number }[] = [
  { label: 'Todas', value: 'todas', count: vtrStats.total },
  { label: 'Disponível', value: 'disponivel', count: vtrStats.disponivel },
  { label: 'Em uso', value: 'em_atendimento', count: vtrStats.em_atendimento },
  { label: 'Manutenção', value: 'manutencao', count: vtrStats.manutencao },
];

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
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todas');
  const [tipoFilter, setTipoFilter] = useState<FilterTipo>('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

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
    return mockVtrs.filter((v) => {
      if (statusFilter !== 'todas' && v.status !== statusFilter) return false;
      if (tipoFilter !== 'todos' && v.tipo !== tipoFilter) return false;
      if (q && !v.placa.toLowerCase().includes(q) && !v.nome.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [statusFilter, tipoFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const start = page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, filtered.length);

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

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <p className="breadcrumb mb-1">FROTA</p>
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-3">
            <h1 className="page-title">Frota</h1>
            <span className="mono text-muted" style={{ fontSize: '11px', paddingBottom: 2 }}>
              {vtrStats.total} veículos
            </span>
          </div>
          <button className="btn btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={openCreate}>
            <Plus size={14} strokeWidth={2} />
            Novo veículo
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4" style={{ position: 'relative', width: 260 }}>
        <Search
          size={14}
          strokeWidth={1.8}
          style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted2)' }}
        />
        <input
          type="text"
          className="table-search"
          placeholder="Buscar placa ou VTR..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
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
            <span className="mono" style={{ fontSize: '9px', marginLeft: 4, opacity: 0.7 }}>{f.count}</span>
          </button>
        ))}

        <span style={{ width: 1, height: 20, background: 'var(--line2)', margin: '0 4px' }} />

        {tipoFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterTipo(f.value)}
            className={`chip ${tipoFilter === f.value ? 'chip-active' : ''}`}
          >
            {f.label}
          </button>
        ))}

        <span className="mono text-muted2 ml-3" style={{ fontSize: '10px' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="th" style={{ textAlign: 'left' }}>VTR</th>
              <th className="th" style={{ textAlign: 'left' }}>PLACA</th>
              <th className="th" style={{ textAlign: 'left' }}>MODELO</th>
              <th className="th" style={{ textAlign: 'left' }}>TIPO</th>
              <th className="th" style={{ textAlign: 'left' }}>STATUS</th>
              <th className="th" style={{ textAlign: 'left' }}>REGIÃO</th>
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
                    <span className="font-display" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                      {vtr.nome}
                    </span>
                  </td>
                  <td className="td">
                    <span className="mono" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
                      {vtr.placa}
                    </span>
                  </td>
                  <td className="td" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
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
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
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
      {filtered.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Mostrando {start}–{end} de {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: '11px' }}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: '11px' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            {editingVtr && (
              <Link
                href={`/frota/${editingVtr.id}`}
                style={{ fontSize: '12px', color: 'var(--green-d)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}
              >
                Ver detalhe <ArrowRight size={12} strokeWidth={1.8} />
              </Link>
            )}
            <div style={{ display: 'flex', gap: 10, marginLeft: editingVtr ? 0 : 'auto' }}>
              <button className="btn btn-outline" onClick={() => setSlideOpen(false)}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { setSlideOpen(false); showToast('Veículo salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Nome">
            <input className="form-input" value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: 340" />
          </FormField>
          <FormField label="Placa">
            <input className="form-input mono" value={formPlaca} onChange={(e) => setFormPlaca(e.target.value)} placeholder="ABC1D23" />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Versão">
            <input className="form-input" value={formVersao} onChange={(e) => setFormVersao(e.target.value)} placeholder="L2H2" />
          </FormField>
          <FormField label="Grupo">
            <input className="form-input" value={formGrupo} onChange={(e) => setFormGrupo(e.target.value)} placeholder="Ambulância" />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Chassi">
            <input className="form-input mono" value={formChassi} onChange={(e) => setFormChassi(e.target.value)} placeholder="9BM6882..." />
          </FormField>
          <FormField label="Renavam">
            <input className="form-input mono" value={formRenavam} onChange={(e) => setFormRenavam(e.target.value)} placeholder="01234567890" />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
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
