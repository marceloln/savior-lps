'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { mockOrdensServico, mockFornecedores, type OrdemServico, type OSStatus, type OSPrioridade } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const columns: { status: OSStatus; label: string; dotCls: string }[] = [
  { status: 'agendada', label: 'Agendada', dotCls: 'bg-blue' },
  { status: 'em_andamento', label: 'Em andamento', dotCls: 'bg-amber' },
  { status: 'aguardando_peca', label: 'Aguardando peça', dotCls: 'bg-violet' },
  { status: 'concluida', label: 'Concluída', dotCls: 'bg-green' },
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
  const [osOverrides, setOsOverrides] = useState<Record<number, OSStatus>>({});

  const osData = useMemo(() => {
    return mockOrdensServico.map(os =>
      osOverrides[os.id] ? { ...os, status: osOverrides[os.id] } : os
    );
  }, [osOverrides]);

  const handleMoveOS = (osId: string, newStatus: OSStatus) => {
    setOsOverrides(prev => ({ ...prev, [Number(osId)]: newStatus }));
    const col = columns.find(c => c.status === newStatus);
    showToast(`OS movida para ${col?.label ?? newStatus}`, 'success');
  };

  const isOpen = creating || editing !== null;
  const closePanel = () => { setCreating(false); setEditing(null); };

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
          <h1 className="page-title">Ordens de Serviço</h1>
        </div>
        <button className="btn btn-green" onClick={() => { setCreating(true); setEditing(null); }}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Nova OS</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-2">
        {columns.map((col) => {
          const items = osData.filter((os) => os.status === col.status);
          return (
            <div
              key={col.status}
              className="kanban-column"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('drag-over');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const osId = e.dataTransfer.getData('osId');
                handleMoveOS(osId, col.status);
              }}
            >
              <div className="kanban-column-header">
                <div className={`kanban-dot ${col.dotCls}`} />
                <span className="kanban-column-title">{col.label}</span>
                <span className="kanban-column-count">{items.length}</span>
              </div>
              <div className="kanban-column-body">
                {items.map((os) => {
                  const prio = prioridadePill[os.prioridade];
                  return (
                    <div
                      key={os.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('osId', String(os.id));
                        e.currentTarget.classList.add('dragging');
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove('dragging');
                      }}
                      onClick={() => { setEditing(os); setCreating(false); }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-display fw-700 text-md">AM {os.vtr_nome}</span>
                        <span className="mono text-[9px] text-muted">{os.vtr_placa}</span>
                      </div>
                      <p className="text-sm-1 text-ink2 leading-snug mb-2 line-clamp-2">
                        {os.descricao}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`pill ${prio.cls}`}>{prio.label}</span>
                        <span className="mono text-sm fw-600">R$ {os.valor.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="mt-1.5 text-xs text-muted">{os.fornecedor}</div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="p-4 text-center text-muted2 text-sm">Nenhuma OS</div>
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
          <div className="slide-footer-between">
            <div>{editing && <button className="btn-red" onClick={handleDelete}>Excluir</button>}</div>
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
