'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { mockOrdensServico, mockFornecedores, type OrdemServico, type OSStatus, type OSPrioridade } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const columns: { status: OSStatus; label: string; color: string }[] = [
  { status: 'agendada', label: 'Agendada', color: 'var(--blue)' },
  { status: 'em_andamento', label: 'Em andamento', color: 'var(--amber)' },
  { status: 'aguardando_peca', label: 'Aguardando peça', color: 'var(--violet)' },
  { status: 'concluida', label: 'Concluída', color: 'var(--green)' },
];

const prioridadePill: Record<OSPrioridade, { label: string; cls: string }> = {
  baixa: { label: 'BAIXA', cls: 'pill-slate' },
  media: { label: 'MÉDIA', cls: 'pill-blue' },
  alta: { label: 'ALTA', cls: 'pill-amber' },
  critica: { label: 'CRÍTICA', cls: 'pill-red' },
};

const vtrOptions = [...new Set(mockOrdensServico.map((os) => os.vtr_nome))].sort();

export default function OrdensServicoPage() {
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<OrdemServico | null>(null);

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
          <h1 className="page-title">Ordens de Serviço</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Nova OS</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ marginTop: 8 }}>
        {columns.map((col) => {
          const items = mockOrdensServico.filter((os) => os.status === col.status);
          return (
            <div key={col.status} className="kanban-column">
              <div className="kanban-column-header">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: col.color, flexShrink: 0 }} />
                <span className="kanban-column-title">{col.label}</span>
                <span className="kanban-column-count">{items.length}</span>
              </div>
              <div className="kanban-column-body">
                {items.map((os) => {
                  const prio = prioridadePill[os.prioridade];
                  return (
                    <div key={os.id} className="kanban-card" onClick={() => { setEditing(os); setCreating(false); }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13 }}>AM {os.vtr_nome}</span>
                        <span className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{os.vtr_placa}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.35, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {os.descricao}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`pill ${prio.cls}`}>{prio.label}</span>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>R$ {os.valor.toLocaleString('pt-BR')}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 10, color: 'var(--muted)' }}>{os.fornecedor}</div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted2)', fontSize: 11 }}>Nenhuma OS</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SlideOver
        open={isOpen}
        onClose={closePanel}
        title={editing ? `OS #${editing.id}` : 'Nova OS'}
        footer={
          <div className="flex gap-2" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>{editing && <button className="btn-red">Excluir</button>}</div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
              <button className="btn btn-green" onClick={() => { closePanel(); showToast('Ordem de serviço salva com sucesso', 'success'); }}>Salvar</button>
            </div>
          </div>
        }
      >
        <FormField label="VTR">
          <select className="form-select" defaultValue={editing?.vtr_nome || ''}>
            {vtrOptions.map((v) => <option key={v} value={v}>AM {v}</option>)}
          </select>
        </FormField>
        <FormField label="Fornecedor">
          <select className="form-select" defaultValue={editing?.fornecedor || ''}>
            {mockFornecedores.filter((f) => f.ativo).map((f) => (
              <option key={f.id} value={f.nome}>{f.nome}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Tipo">
          <select className="form-select" defaultValue={editing?.tipo || 'preventiva'}>
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
          </select>
        </FormField>
        <FormField label="Descrição">
          <textarea className="form-textarea" defaultValue={editing?.descricao || ''} />
        </FormField>
        <FormField label="Prioridade">
          <select className="form-select" defaultValue={editing?.prioridade || 'media'}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select className="form-select" defaultValue={editing?.status || 'agendada'}>
            <option value="agendada">Agendada</option>
            <option value="em_andamento">Em andamento</option>
            <option value="aguardando_peca">Aguardando peça</option>
            <option value="concluida">Concluída</option>
          </select>
        </FormField>
        <FormField label="Valor (R$)">
          <input className="form-input" type="number" defaultValue={editing?.valor || 0} />
        </FormField>
        <FormField label="Itens (separados por virgula)">
          <textarea className="form-textarea" defaultValue={editing?.itens.join(', ') || ''} />
        </FormField>
      </SlideOver>
    </div>
  );
}
