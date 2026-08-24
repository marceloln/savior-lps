'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, AlertTriangle } from 'lucide-react';
import { mockDocumentos, type Documento, type DocumentoStatus } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';

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
  const [tab, setTab] = useState<TabFilter>('todos');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Documento | null>(null);

  const vencidos = mockDocumentos.filter((d) => d.status === 'vencido');
  const vencendo30 = mockDocumentos.filter((d) => {
    const days = daysUntil(d.data_vencimento);
    return days > 0 && days <= 30 && d.status !== 'vencido';
  });
  const vencendo90 = mockDocumentos.filter((d) => {
    const days = daysUntil(d.data_vencimento);
    return days > 30 && days <= 90 && d.status !== 'vencido';
  });

  const filtered = tab === 'todos'
    ? mockDocumentos
    : mockDocumentos.filter((d) => d.status === tab);

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
        <Link href="/cadastros" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>CADASTROS</p>
          <h1 className="page-title">Documentos</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo documento</span>
        </button>
      </div>

      {/* Alert banners */}
      <div className="flex flex-col gap-3" style={{ marginBottom: 20 }}>
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
      <div className="flex" style={{ borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="mono" style={{ fontSize: 10, marginLeft: 4, color: 'var(--muted2)' }}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th className="th">Documento</th>
              <th className="th">Tipo</th>
              <th className="th">Entidade</th>
              <th className="th">Emissao</th>
              <th className="th">Vencimento</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const pill = statusPill[doc.status];
              const days = daysUntil(doc.data_vencimento);
              return (
                <tr key={doc.id} className="table-row-click" onClick={() => { setEditing(doc); setCreating(false); }}>
                  <td className="td" style={{ fontWeight: 600 }}>{doc.nome}</td>
                  <td className="td"><span className="pill pill-slate">{doc.tipo}</span></td>
                  <td className="td" style={{ fontSize: 11 }}>{doc.entidade_nome}</td>
                  <td className="td mono" style={{ fontSize: 11 }}>{doc.data_emissao}</td>
                  <td className="td mono" style={{ fontSize: 11, color: days <= 0 ? 'var(--red)' : days <= 30 ? 'var(--amber)' : 'var(--ink)' }}>
                    {doc.data_vencimento}
                    {days <= 30 && days > 0 && <span style={{ fontSize: 9, marginLeft: 4 }}>({days}d)</span>}
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
          <div className="flex gap-2" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>{editing && <button className="btn-red">Excluir</button>}</div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
              <button className="btn btn-green" onClick={closePanel}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="Tipo de entidade">
          <select className="form-select" defaultValue={editing?.entidade_tipo || 'vtr'}>
            <option value="vtr">VTR</option>
            <option value="funcionario">Funcionario</option>
          </select>
        </FormField>
        <FormField label="Entidade">
          <input className="form-input" defaultValue={editing?.entidade_nome || ''} placeholder="Nome da VTR ou funcionario" />
        </FormField>
        <FormField label="Tipo do documento">
          <select className="form-select" defaultValue={editing?.tipo || 'CRLV'}>
            <option>CRLV</option>
            <option>CNH</option>
            <option>Alvara</option>
            <option>Seguro</option>
            <option>ANVISA</option>
            <option>Contrato</option>
          </select>
        </FormField>
        <FormField label="Nome">
          <input className="form-input" defaultValue={editing?.nome || ''} />
        </FormField>
        <FormField label="Data emissao">
          <input className="form-input" type="date" defaultValue={editing?.data_emissao || ''} />
        </FormField>
        <FormField label="Data vencimento">
          <input className="form-input" type="date" defaultValue={editing?.data_vencimento || ''} />
        </FormField>
        <FormField label="Arquivo">
          <input className="form-input" type="file" style={{ padding: '8px 12px' }} />
        </FormField>
      </SlideOver>
    </div>
  );
}
