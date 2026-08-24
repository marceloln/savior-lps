'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { mockPneusBackoffice, type PneuBackoffice, type PneuStatusBO } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';

const statusPill: Record<PneuStatusBO, { label: string; cls: string }> = {
  em_uso: { label: 'EM USO', cls: 'pill-green' },
  estoque: { label: 'ESTOQUE', cls: 'pill-blue' },
  descartado: { label: 'DESCARTADO', cls: 'pill-slate' },
  recapagem: { label: 'RECAPAGEM', cls: 'pill-amber' },
};

const vtrOptions = [...new Set(mockPneusBackoffice.filter((p) => p.vtr_nome).map((p) => p.vtr_nome!))].sort();

export default function PneusPage() {
  const [vtrFilter, setVtrFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PneuBackoffice | null>(null);

  const filtered = vtrFilter
    ? mockPneusBackoffice.filter((p) => p.vtr_nome === vtrFilter)
    : mockPneusBackoffice;

  const isOpen = creating || editing !== null;
  const closePanel = () => { setCreating(false); setEditing(null); };

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>CADASTROS</p>
          <h1 className="page-title">Pneus</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo pneu</span>
        </button>
      </div>

      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <span className="label">Filtrar VTR</span>
        <select className="form-select" style={{ width: 180 }} value={vtrFilter} onChange={(e) => setVtrFilter(e.target.value)}>
          <option value="">Todas</option>
          {vtrOptions.map((v) => (
            <option key={v} value={v}>AM {v}</option>
          ))}
        </select>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{filtered.length} pneus</span>
      </div>

      {/* Tire position diagram when filtered to a specific VTR */}
      {vtrFilter && (
        <div className="panel" style={{ marginBottom: 20, padding: 20 }}>
          <div className="label" style={{ marginBottom: 12 }}>POSICOES AM {vtrFilter}</div>
          <div className="flex items-center justify-center gap-12">
            {/* Front axle */}
            <div className="flex flex-col items-center gap-2">
              <span className="label" style={{ fontSize: 8 }}>DIANTEIRO</span>
              <div className="flex gap-8">
                {['DE', 'DD'].map((pos) => {
                  const tire = filtered.find((p) => p.posicao === pos);
                  return (
                    <div
                      key={pos}
                      style={{
                        width: 48,
                        height: 72,
                        borderRadius: 8,
                        border: `2px solid ${tire ? 'var(--green)' : 'var(--line2)'}`,
                        background: tire ? 'var(--green-l)' : 'var(--bg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <span className="mono" style={{ fontSize: 8, fontWeight: 700, color: tire ? 'var(--green-d)' : 'var(--muted2)' }}>{pos}</span>
                      {tire && <span className="mono" style={{ fontSize: 7, color: 'var(--muted)' }}>V{tire.vida}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Rear axle */}
            <div className="flex flex-col items-center gap-2">
              <span className="label" style={{ fontSize: 8 }}>TRASEIRO</span>
              <div className="flex gap-4">
                <div className="flex gap-1">
                  {['TIE', 'TII'].map((pos) => {
                    const tire = filtered.find((p) => p.posicao === pos);
                    return (
                      <div
                        key={pos}
                        style={{
                          width: 42,
                          height: 72,
                          borderRadius: 8,
                          border: `2px solid ${tire ? 'var(--green)' : 'var(--line2)'}`,
                          background: tire ? 'var(--green-l)' : 'var(--bg)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        <span className="mono" style={{ fontSize: 7, fontWeight: 700, color: tire ? 'var(--green-d)' : 'var(--muted2)' }}>{pos}</span>
                        {tire && <span className="mono" style={{ fontSize: 7, color: 'var(--muted)' }}>V{tire.vida}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1">
                  {['TDE', 'TDI'].map((pos) => {
                    const tire = filtered.find((p) => p.posicao === pos);
                    return (
                      <div
                        key={pos}
                        style={{
                          width: 42,
                          height: 72,
                          borderRadius: 8,
                          border: `2px solid ${tire ? 'var(--green)' : 'var(--line2)'}`,
                          background: tire ? 'var(--green-l)' : 'var(--bg)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        <span className="mono" style={{ fontSize: 7, fontWeight: 700, color: tire ? 'var(--green-d)' : 'var(--muted2)' }}>{pos}</span>
                        {tire && <span className="mono" style={{ fontSize: 7, color: 'var(--muted)' }}>V{tire.vida}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th className="th">Codigo</th>
              <th className="th">Dimensao</th>
              <th className="th">Marca</th>
              <th className="th">VTR</th>
              <th className="th">Posicao</th>
              <th className="th">Status</th>
              <th className="th">Vida</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const pill = statusPill[p.status];
              return (
                <tr key={p.id} className="table-row-click" onClick={() => { setEditing(p); setCreating(false); }}>
                  <td className="td mono" style={{ fontSize: 11, fontWeight: 600 }}>{p.codigo}</td>
                  <td className="td mono" style={{ fontSize: 11 }}>{p.dimensao}</td>
                  <td className="td" style={{ fontSize: 12 }}>{p.marca}</td>
                  <td className="td mono" style={{ fontSize: 11 }}>{p.vtr_nome ? `AM ${p.vtr_nome}` : '\u2014'}</td>
                  <td className="td mono" style={{ fontSize: 11 }}>{p.posicao || '\u2014'}</td>
                  <td className="td"><span className={`pill ${pill.cls}`}>{pill.label}</span></td>
                  <td className="td mono" style={{ fontSize: 11 }}>{p.vida}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={isOpen}
        onClose={closePanel}
        title={editing ? 'Editar pneu' : 'Novo pneu'}
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
        <FormField label="Codigo">
          <input className="form-input" defaultValue={editing?.codigo || ''} />
        </FormField>
        <FormField label="Dimensao">
          <input className="form-input" defaultValue={editing?.dimensao || '225/75 R16'} />
        </FormField>
        <FormField label="Marca">
          <input className="form-input" defaultValue={editing?.marca || ''} />
        </FormField>
        <FormField label="VTR">
          <select className="form-select" defaultValue={editing?.vtr_nome || ''}>
            <option value="">Sem VTR (estoque)</option>
            {vtrOptions.map((v) => <option key={v} value={v}>AM {v}</option>)}
          </select>
        </FormField>
        <FormField label="Posicao">
          <select className="form-select" defaultValue={editing?.posicao || ''}>
            <option value="">Nenhuma</option>
            {['DE', 'DD', 'TIE', 'TII', 'TDE', 'TDI', 'STEP'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select className="form-select" defaultValue={editing?.status || 'em_uso'}>
            <option value="em_uso">Em uso</option>
            <option value="estoque">Estoque</option>
            <option value="recapagem">Recapagem</option>
            <option value="descartado">Descartado</option>
          </select>
        </FormField>
        <FormField label="Vida (numero de recapagens)">
          <input className="form-input" type="number" defaultValue={editing?.vida ?? 0} />
        </FormField>
      </SlideOver>
    </div>
  );
}
