'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { mockEquipamentos, mockVtrs, type Equipamento, type EquipamentoCategoria, type EquipamentoStatus } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const statusPill: Record<EquipamentoStatus, { label: string; cls: string }> = {
  operacional: { label: 'OPERACIONAL', cls: 'pill-green' },
  manutencao: { label: 'MANUTENÇÃO', cls: 'pill-amber' },
  vencido: { label: 'VENCIDO', cls: 'pill-red' },
  ausente: { label: 'AUSENTE', cls: 'pill-slate' },
};

const categorias: EquipamentoCategoria[] = ['Monitorizacao', 'Ventilacao', 'Imobilizacao', 'Medicamentos', 'Acessorios'];

const vtrOptions = [...new Set(mockEquipamentos.map((e) => e.vtr_nome))].sort();

export default function EquipamentosPage() {
  const { showToast } = useToast();
  const [vtrFilter, setVtrFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Equipamento | null>(null);

  const filtered = vtrFilter
    ? mockEquipamentos.filter((e) => e.vtr_nome === vtrFilter)
    : mockEquipamentos;

  const grouped = categorias
    .map((cat) => ({
      categoria: cat,
      items: filtered.filter((e) => e.categoria === cat),
    }))
    .filter((g) => g.items.length > 0);

  const isOpen = creating || editing !== null;

  const closePanel = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    closePanel();
    showToast('Item excluído', 'info');
  };

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Equipamentos</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo equipamento</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="label">Filtrar VTR</span>
        <select className="form-select w-[180px]" value={vtrFilter} onChange={(e) => setVtrFilter(e.target.value)}>
          <option value="">Todas</option>
          {vtrOptions.map((v) => (
            <option key={v} value={v}>AM {v}</option>
          ))}
        </select>
        <span className="mono text-sm text-muted">{filtered.length} itens</span>
      </div>

      {grouped.map((g) => (
        <div key={g.categoria} className="mb-5">
          <div className="mb-2">
            <span className="label text-[9px]">{g.categoria}</span>
            <span className="mono text-xs text-muted2 ml-2">{g.items.length}</span>
          </div>
          <div className="panel">
            <table className="table-full">
              <thead>
                <tr className="text-left">
                  <th className="th">Equipamento</th>
                  <th className="th">VTR</th>
                  <th className="th">N. Serie</th>
                  <th className="th">Status</th>
                  <th className="th">Calibração</th>
                  <th className="th">Próxima</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((eq) => {
                  const pill = statusPill[eq.status];
                  return (
                    <tr key={eq.id} className="table-row-click" onClick={() => { setEditing(eq); setCreating(false); }}>
                      <td className="td fw-600">{eq.nome}</td>
                      <td className="td mono text-sm">AM {eq.vtr_nome}</td>
                      <td className="td mono text-xs text-muted">{eq.numero_serie}</td>
                      <td className="td"><span className={`pill ${pill.cls}`}>{pill.label}</span></td>
                      <td className="td mono text-sm">{eq.data_calibracao}</td>
                      <td className="td mono text-sm">{eq.proxima_calibracao}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <SlideOver
        open={isOpen}
        onClose={closePanel}
        title={editing ? 'Editar equipamento' : 'Novo equipamento'}
        footer={
          <div className="slide-footer-between">
            <div>{editing && <button className="btn-red" onClick={handleDelete}>Excluir</button>}</div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { closePanel(); showToast('Equipamento salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="Nome">
          <input className="form-input" defaultValue={editing?.nome || ''} />
        </FormField>
        <FormField label="Categoria">
          <select className="form-select" defaultValue={editing?.categoria || 'Monitorizacao'}>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="VTR">
          <select className="form-select" defaultValue={editing?.vtr_nome || ''}>
            {vtrOptions.map((v) => <option key={v} value={v}>AM {v}</option>)}
          </select>
        </FormField>
        <FormField label="Status">
          <select className="form-select" defaultValue={editing?.status || 'operacional'}>
            <option value="operacional">Operacional</option>
            <option value="manutencao">Manutenção</option>
            <option value="vencido">Vencido</option>
            <option value="ausente">Ausente</option>
          </select>
        </FormField>
        <FormField label="Número de série">
          <input className="form-input" defaultValue={editing?.numero_serie || ''} />
        </FormField>
        <FormField label="Data calibração">
          <input className="form-input" type="date" defaultValue={editing?.data_calibracao || ''} />
        </FormField>
        <FormField label="Próxima calibração">
          <input className="form-input" type="date" defaultValue={editing?.proxima_calibracao || ''} />
        </FormField>
      </SlideOver>
    </div>
  );
}
