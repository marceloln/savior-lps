'use client';

import { useState, useMemo } from 'react';
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

  const filtered = useMemo(() => {
    const list = mockFornecedores.filter((f) =>
      f.nome.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortKey] as string ?? '';
      const vb = (b as unknown as Record<string, unknown>)[sortKey] as string ?? '';
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [search, sortKey, sortDir]);

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

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    closePanel();
    showToast('Item excluído', 'info');
  };

  const isOpen = editing !== null || creating;

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Fornecedores</h1>
        </div>
        <button className="btn btn-green" onClick={openCreate}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo fornecedor</span>
        </button>
      </div>

      <div className="search-wrapper mb-4">
        <Search size={14} strokeWidth={1.8} className="search-icon-abs" />
        <input
          className="table-search"
          placeholder="Buscar fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <table className="table-full">
          <thead>
            <tr className="text-left">
              <th className="th sortable-th" onClick={() => handleSort('nome')}>Nome {sortKey === 'nome' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
              <th className="th sortable-th" onClick={() => handleSort('cnpj')}>CNPJ {sortKey === 'cnpj' && <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>
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
                <td className="td fw-600">{f.nome}</td>
                <td className="td mono text-sm">{f.cnpj}</td>
                <td className="td mono text-sm">{f.telefone}</td>
                <td className="td text-sm text-muted">{f.email}</td>
                <td className="td text-sm">{f.tipo}</td>
                <td className="td mono text-sm">{f.uf}</td>
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
          <div className="slide-footer-between">
            <div>
              {editing && <button className="btn-red" onClick={handleDelete}>Excluir</button>}
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
