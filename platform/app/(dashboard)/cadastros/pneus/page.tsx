'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { mockPneusBackoffice, type PneuBackoffice, type PneuStatusBO } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const statusPill: Record<PneuStatusBO, { label: string; cls: string }> = {
  em_uso: { label: 'EM USO', cls: 'pill-green' },
  estoque: { label: 'ESTOQUE', cls: 'pill-blue' },
  descartado: { label: 'DESCARTADO', cls: 'pill-slate' },
  recapagem: { label: 'RECAPAGEM', cls: 'pill-amber' },
};

const vtrOptions = [...new Set(mockPneusBackoffice.filter((p) => p.vtr_nome).map((p) => p.vtr_nome!))].sort();

export default function PneusPage() {
  const { showToast } = useToast();
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
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Pneus</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo pneu</span>
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
        <span className="mono text-sm text-muted">{filtered.length} pneus</span>
      </div>

      {/* Tire position diagram when filtered to a specific VTR */}
      {vtrFilter && (
        <div className="panel mb-5 p-5">
          <div className="label mb-3">POSIÇÕES AM {vtrFilter}</div>
          <div className="flex items-center justify-center gap-12">
            {/* Front axle */}
            <div className="flex flex-col items-center gap-2">
              <span className="label text-2xs">DIANTEIRO</span>
              <div className="flex gap-8">
                {['DE', 'DD'].map((pos) => {
                  const tire = filtered.find((p) => p.posicao === pos);
                  return (
                    <div
                      key={pos}
                      className={`tire-slot tire-front ${tire ? 'tire-slot-active' : 'tire-slot-empty'}`}
                    >
                      <span className={`mono text-2xs fw-700 ${tire ? 'text-green-d' : 'text-muted2'}`}>{pos}</span>
                      {tire && <span className="mono text-[7px] text-muted">V{tire.vida}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Rear axle */}
            <div className="flex flex-col items-center gap-2">
              <span className="label text-2xs">TRASEIRO</span>
              <div className="flex gap-4">
                <div className="flex gap-1">
                  {['TIE', 'TII'].map((pos) => {
                    const tire = filtered.find((p) => p.posicao === pos);
                    return (
                      <div
                        key={pos}
                        className={`tire-slot tire-rear ${tire ? 'tire-slot-active' : 'tire-slot-empty'}`}
                      >
                        <span className={`mono text-[7px] fw-700 ${tire ? 'text-green-d' : 'text-muted2'}`}>{pos}</span>
                        {tire && <span className="mono text-[7px] text-muted">V{tire.vida}</span>}
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
                        className={`tire-slot tire-rear ${tire ? 'tire-slot-active' : 'tire-slot-empty'}`}
                      >
                        <span className={`mono text-[7px] fw-700 ${tire ? 'text-green-d' : 'text-muted2'}`}>{pos}</span>
                        {tire && <span className="mono text-[7px] text-muted">V{tire.vida}</span>}
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
        <table className="table-full">
          <thead>
            <tr className="text-left">
              <th className="th">Código</th>
              <th className="th">Dimensão</th>
              <th className="th">Marca</th>
              <th className="th">VTR</th>
              <th className="th">Posição</th>
              <th className="th">Status</th>
              <th className="th">Vida</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const pill = statusPill[p.status];
              return (
                <tr key={p.id} className="table-row-click" onClick={() => { setEditing(p); setCreating(false); }}>
                  <td className="td mono text-sm fw-600">{p.codigo}</td>
                  <td className="td mono text-sm">{p.dimensao}</td>
                  <td className="td text-base">{p.marca}</td>
                  <td className="td mono text-sm">{p.vtr_nome ? `AM ${p.vtr_nome}` : '\u2014'}</td>
                  <td className="td mono text-sm">{p.posicao || '\u2014'}</td>
                  <td className="td"><span className={`pill ${pill.cls}`}>{pill.label}</span></td>
                  <td className="td mono text-sm">{p.vida}</td>
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
          <div className="slide-footer-between">
            <div>{editing && <button className="btn-red">Excluir</button>}</div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { closePanel(); showToast('Pneu salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="Código">
          <input className="form-input" defaultValue={editing?.codigo || ''} />
        </FormField>
        <FormField label="Dimensão">
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
        <FormField label="Posição">
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
        <FormField label="Vida (número de recapagens)">
          <input className="form-input" type="number" defaultValue={editing?.vida ?? 0} />
        </FormField>
      </SlideOver>
    </div>
  );
}
