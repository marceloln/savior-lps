'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { mockWarehouses } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

export default function AlmoxarifadosPage() {
  const { showToast } = useToast();
  const [slideOpen, setSlideOpen] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formFilial, setFormFilial] = useState('SAVIOR - RJ');
  const [formStatus, setFormStatus] = useState('ativo');

  function openCreate() {
    setFormNome('');
    setFormFilial('SAVIOR - RJ');
    setFormStatus('ativo');
    setSlideOpen(true);
  }

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Almoxarifados</h1>
        </div>
        <button className="btn btn-green" onClick={openCreate}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo almoxarifado</span>
        </button>
      </div>

      <div className="panel">
        <table className="table-full">
          <thead>
            <tr className="text-left">
              <th className="th">ID</th>
              <th className="th">Nome</th>
              <th className="th">Filial</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockWarehouses.map((w) => (
              <tr key={w.id}>
                <td className="td mono text-sm text-muted">{w.id}</td>
                <td className="td fw-600">{w.nome}</td>
                <td className="td mono text-sm">{w.uf}</td>
                <td className="td">
                  <span className={`pill ${w.ativo ? 'pill-green' : 'pill-slate'}`}>
                    {w.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
              </tr>
            ))}
            {mockWarehouses.length === 0 && (
              <tr>
                <td className="td text-center text-muted p-8" colSpan={4}>
                  Nenhum almoxarifado cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Novo almoxarifado"
        footer={
          <div className="slide-footer-end">
            <button className="btn btn-outline" onClick={() => setSlideOpen(false)}>Cancelar</button>
            <button className="btn btn-green ml-2" onClick={() => { setSlideOpen(false); showToast('Almoxarifado salvo com sucesso', 'success'); }}>Salvar</button>
          </div>
        }
      >
        <FormField label="Nome">
          <input className="form-input" value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: Almoxarifado Central RJ" />
        </FormField>
        <FormField label="Filial">
          <select className="form-select" value={formFilial} onChange={(e) => setFormFilial(e.target.value)}>
            <option value="SAVIOR - RJ">SAVIOR - RJ</option>
            <option value="SAVIOR - SP">SAVIOR - SP</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select className="form-select" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </FormField>
      </SlideOver>
    </div>
  );
}
