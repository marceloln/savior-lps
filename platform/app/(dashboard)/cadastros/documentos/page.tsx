'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, AlertTriangle } from 'lucide-react';
import { mockDocumentos, type Documento, type DocumentoStatus } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const statusPill: Record<DocumentoStatus, { label: string; cls: string }> = {
  vigente: { label: 'VIGENTE', cls: 'pill-green' },
  renovando: { label: 'RENOVANDO', cls: 'pill-amber' },
  vencido: { label: 'VENCIDO', cls: 'pill-red' },
  pendente: { label: 'PENDENTE', cls: 'pill-slate' },
};

type TabFilter = 'todos' | 'vencido' | 'renovando' | 'vigente';

function daysUntil(dateStr: string): number {
  const now = new Date('2026-08-20');
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DocumentosPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabFilter>('todos');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Documento | null>(null);
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

  const vencidos = mockDocumentos.filter((d) => d.status === 'vencido');
  const vencendo30 = mockDocumentos.filter((d) => {
    const days = daysUntil(d.data_vencimento);
    return days > 0 && days <= 30 && d.status !== 'vencido';
  });
  const vencendo90 = mockDocumentos.filter((d) => {
    const days = daysUntil(d.data_vencimento);
    return days > 30 && days <= 90 && d.status !== 'vencido';
  });

  const filteredRaw = tab === 'todos'
    ? mockDocumentos
    : mockDocumentos.filter((d) => d.status === tab);

  const filtered = useMemo(() => {
    return [...filteredRaw].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortKey === 'vencimento' ? 'data_vencimento' : sortKey] as string ?? '';
      const vb = (b as unknown as Record<string, unknown>)[sortKey === 'vencimento' ? 'data_vencimento' : sortKey] as string ?? '';
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredRaw, sortKey, sortDir]);

  const isOpen = creating || editing !== null;
  const closePanel = () => { setCreating(false); setEditing(null); };

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: mockDocumentos.length },
    { key: 'vencido', label: 'Vencidos', count: vencidos.length },
    { key: 'renovando', label: 'Vencendo', count: vencendo30.length + vencendo90.length },
    { key: 'vigente', label: 'Vigentes', count: mockDocumentos.filter((d) => d.status === 'vigente').length },
  ];

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Documentos</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo documento</span>
        </button>
      </div>

      {/* Alert banners */}
      <div className="flex flex-col gap-3 mb-5">
        {vencidos.length > 0 && (
          <div className="alert-banner alert-banner-red">
            <AlertTriangle size={16} strokeWidth={2} />
            <span><strong>{vencidos.length}</strong> documento{vencidos.length > 1 ? 's' : ''} vencido{vencidos.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {(vencendo30.length > 0 || vencendo90.length > 0) && (
          <div className="alert-banner alert-banner-amber">
            <AlertTriangle size={16} strokeWidth={2} />
            <span>
              {vencendo30.length > 0 && <><strong>{vencendo30.length}</strong> vencendo em 30 dias</>}
              {vencendo30.length > 0 && vencendo90.length > 0 && ' · '}
              {vencendo90.length > 0 && <><strong>{vencendo90.length}</strong> vencendo em 90 dias</>}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="mono text-xs ml-1 text-muted2">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        <table className="table-full">
          <thead>
            <tr className="text-left">
              <th className="th sortable-th" onClick={() => handleSort('nome')}>Documento {sortKey === 'nome' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th sortable-th" onClick={() => handleSort('tipo')}>Tipo {sortKey === 'tipo' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th">Entidade</th>
              <th className="th">Emissão</th>
              <th className="th sortable-th" onClick={() => handleSort('vencimento')}>Vencimento {sortKey === 'vencimento' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th sortable-th" onClick={() => handleSort('status')}>Status {sortKey === 'status' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const pill = statusPill[doc.status];
              const days = daysUntil(doc.data_vencimento);
              return (
                <tr key={doc.id} className="table-row-click" onClick={() => { setEditing(doc); setCreating(false); }}>
                  <td className="td fw-600">{doc.nome}</td>
                  <td className="td"><span className="pill pill-slate">{doc.tipo}</span></td>
                  <td className="td text-sm">{doc.entidade_nome}</td>
                  <td className="td mono text-sm">{doc.data_emissao}</td>
                  <td className={`td mono text-sm ${days <= 0 ? 'text-red' : days <= 30 ? 'text-amber' : 'text-ink'}`}>
                    {doc.data_vencimento}
                    {days <= 30 && days > 0 && <span className="text-[9px] ml-1">({days}d)</span>}
                  </td>
                  <td className="td"><span className={`pill ${pill.cls}`}>{pill.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={isOpen}
        onClose={closePanel}
        title={editing ? 'Editar documento' : 'Novo documento'}
        footer={
          <div className="slide-footer-between">
            <div>{editing && <button className="btn-red">Excluir</button>}</div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { closePanel(); showToast('Documento salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="Tipo de entidade">
          <select className="form-select" defaultValue={editing?.entidade_tipo || 'vtr'}>
            <option value="vtr">VTR</option>
            <option value="funcionario">Funcionário</option>
          </select>
        </FormField>
        <FormField label="Entidade">
          <input className="form-input" defaultValue={editing?.entidade_nome || ''} placeholder="Nome da VTR ou funcionário" />
        </FormField>
        <FormField label="Tipo do documento">
          <select className="form-select" defaultValue={editing?.tipo || 'CRLV'}>
            <option>CRLV</option>
            <option>CNH</option>
            <option>Alvará</option>
            <option>Seguro</option>
            <option>ANVISA</option>
            <option>Contrato</option>
          </select>
        </FormField>
        <FormField label="Nome">
          <input className="form-input" defaultValue={editing?.nome || ''} />
        </FormField>
        <FormField label="Data emissão">
          <input className="form-input" type="date" defaultValue={editing?.data_emissao || ''} />
        </FormField>
        <FormField label="Data vencimento">
          <input className="form-input" type="date" defaultValue={editing?.data_vencimento || ''} />
        </FormField>
        <FormField label="Arquivo">
          <input className="form-input py-2 px-3" type="file" />
        </FormField>
      </SlideOver>
    </div>
  );
}
