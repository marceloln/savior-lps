'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft } from 'lucide-react';
import { mockFornecedores, type Fornecedor } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const emptyForm: { nome: string; cnpj: string; telefone: string; email: string; tipo: string; uf: 'RJ' | 'SP' } = { nome: '', cnpj: '', telefone: '', email: '', tipo: 'Oficina', uf: 'RJ' };

export default function FornecedoresPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = mockFornecedores.filter((f) =>
    f.nome.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (f: Fornecedor) => {
    setForm({ nome: f.nome, cnpj: f.cnpj, telefone: f.telefone, email: f.email, tipo: f.tipo, uf: f.uf });
    setEditing(f);
    setCreating(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  };

  const closePanel = () => {
    setEditing(null);
    setCreating(false);
  };

  const isOpen = editing !== null || creating;

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>CADASTROS</p>
          <h1 className="page-title">Fornecedores</h1>
        </div>
        <button className="btn btn-green" onClick={openCreate}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo fornecedor</span>
        </button>
      </div>

      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <Search size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted2)' }} />
        <input
          className="table-search"
          placeholder="Buscar fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th className="th">Nome</th>
              <th className="th">CNPJ</th>
              <th className="th">Telefone</th>
              <th className="th">Email</th>
              <th className="th">Tipo</th>
              <th className="th">UF</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="table-row-click" onClick={() => openEdit(f)}>
                <td className="td" style={{ fontWeight: 600 }}>{f.nome}</td>
                <td className="td mono" style={{ fontSize: 11 }}>{f.cnpj}</td>
                <td className="td mono" style={{ fontSize: 11 }}>{f.telefone}</td>
                <td className="td" style={{ fontSize: 11, color: 'var(--muted)' }}>{f.email}</td>
                <td className="td" style={{ fontSize: 11 }}>{f.tipo}</td>
                <td className="td mono" style={{ fontSize: 11 }}>{f.uf}</td>
                <td className="td">
                  <span className={`pill ${f.ativo ? 'pill-green' : 'pill-slate'}`}>
                    {f.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={isOpen}
        onClose={closePanel}
        title={editing ? 'Editar fornecedor' : 'Novo fornecedor'}
        footer={
          <div className="flex gap-2" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              {editing && <button className="btn-red">Excluir</button>}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { closePanel(); showToast('Fornecedor salvo com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="Nome">
          <input className="form-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </FormField>
        <FormField label="CNPJ">
          <input className="form-input" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
        </FormField>
        <FormField label="Telefone">
          <input className="form-input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(21) 0000-0000" />
        </FormField>
        <FormField label="Email">
          <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FormField>
        <FormField label="Tipo">
          <select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option>Oficina</option>
            <option>Posto de combustível</option>
            <option>Reformador de pneus</option>
            <option>Autopeças</option>
          </select>
        </FormField>
        <FormField label="UF">
          <select className="form-select" value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value as 'RJ' | 'SP' })}>
            <option value="RJ">RJ</option>
            <option value="SP">SP</option>
          </select>
        </FormField>
      </SlideOver>
    </div>
  );
}
