'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Search, Trash2 } from 'lucide-react';
import {
  mockOrcamentosEvento,
  tabelaPrecos,
  type OrcamentoEvento,
} from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

// ── helpers ──────────────────────────────────────────────────────

const tipoLabel: Record<string, string> = {
  basica: 'Ambulância Básica',
  uti: 'Ambulância UTI',
  posto_medico: 'Posto Médico',
};

const statusConfig: Record<string, { pill: string; label: string }> = {
  rascunho: { pill: 'pill-slate', label: 'RASCUNHO' },
  enviado: { pill: 'pill-blue', label: 'ENVIADO' },
  aprovado: { pill: 'pill-green', label: 'APROVADO' },
  recusado: { pill: 'pill-red', label: 'RECUSADO' },
  expirado: { pill: 'pill-amber', label: 'EXPIRADO' },
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

function itensResumo(itens: OrcamentoEvento['itens']) {
  return itens.map((i) => `${i.quantidade}× ${tipoLabel[i.tipo]}`).join(', ');
}

// ── types for form ──────────────────────────────────────────────

type TipoServico = 'basica' | 'uti' | 'posto_medico';

interface ItemForm {
  tipo: TipoServico;
  quantidade: number;
  horas: number;
  desconto: number; // 0 to 0.20
}

interface OrcamentoForm {
  cliente_nome: string;
  cliente_empresa: string;
  cliente_telefone: string;
  cliente_email: string;
  evento_nome: string;
  evento_data: string;
  evento_local: string;
  evento_publico_estimado: number;
  itens: ItemForm[];
}

const emptyItem: ItemForm = { tipo: 'basica', quantidade: 1, horas: 4, desconto: 0 };

const emptyForm: OrcamentoForm = {
  cliente_nome: '',
  cliente_empresa: '',
  cliente_telefone: '',
  cliente_email: '',
  evento_nome: '',
  evento_data: '',
  evento_local: '',
  evento_publico_estimado: 0,
  itens: [{ ...emptyItem }],
};

// ── calculator line ─────────────────────────────────────────────

function calcLine(item: ItemForm) {
  const preco = tabelaPrecos.find((p) => p.tipo_servico === item.tipo);
  if (!preco) return { valorHora: 0, subtotalBruto: 0, subtotalLiquido: 0 };
  const horas = Math.max(item.horas, preco.minimo_horas);
  const subtotalBruto = preco.valor_hora * item.quantidade * horas;
  const subtotalLiquido = subtotalBruto * (1 - item.desconto);
  return { valorHora: preco.valor_hora, subtotalBruto, subtotalLiquido };
}

// ── page ────────────────────────────────────────────────────────

export default function OrcamentosPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<OrcamentoEvento | null>(null);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrcamentoForm>({ ...emptyForm, itens: [{ ...emptyItem }] });

  const filtered = mockOrcamentosEvento.filter(
    (o) =>
      o.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      o.evento_nome.toLowerCase().includes(search.toLowerCase()) ||
      (o.cliente_empresa || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ ...emptyForm, itens: [{ ...emptyItem }] });
    setStep(1);
    setViewing(null);
    setCreating(true);
  };

  const openView = (o: OrcamentoEvento) => {
    setViewing(o);
    setCreating(false);
  };

  const closePanel = () => {
    setViewing(null);
    setCreating(false);
  };

  const isOpen = viewing !== null || creating;

  // ── item handlers ───────────────────────────────────────────

  const updateItem = (idx: number, patch: Partial<ItemForm>) => {
    const newItens = form.itens.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...patch };
      const preco = tabelaPrecos.find((p) => p.tipo_servico === updated.tipo);
      if (preco && updated.horas < preco.minimo_horas) updated.horas = preco.minimo_horas;
      if (updated.desconto > 0.20) updated.desconto = 0.20;
      if (updated.desconto < 0) updated.desconto = 0;
      if (updated.quantidade < 1) updated.quantidade = 1;
      return updated;
    });
    setForm({ ...form, itens: newItens });
  };

  const addItem = () => {
    setForm({ ...form, itens: [...form.itens, { ...emptyItem }] });
  };

  const removeItem = (idx: number) => {
    if (form.itens.length <= 1) return;
    setForm({ ...form, itens: form.itens.filter((_, i) => i !== idx) });
  };

  // ── totals ──────────────────────────────────────────────────

  const totals = useMemo(() => {
    let bruto = 0;
    let liquido = 0;
    for (const item of form.itens) {
      const c = calcLine(item);
      bruto += c.subtotalBruto;
      liquido += c.subtotalLiquido;
    }
    return { bruto, liquido, desconto: bruto - liquido };
  }, [form.itens]);

  // ── render ──────────────────────────────────────────────────

  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" className="back-link-muted">
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div className="flex-1">
          <p className="breadcrumb breadcrumb-spaced">CADASTROS</p>
          <h1 className="page-title">Orçamentos de Eventos</h1>
        </div>
        <button className="btn btn-green" onClick={openCreate}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo orçamento</span>
        </button>
      </div>

      <div className="search-wrapper mb-4">
        <Search size={14} strokeWidth={1.8} className="search-icon-abs" />
        <input
          className="table-search"
          placeholder="Buscar por cliente ou evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <table className="table-full">
          <thead>
            <tr className="text-left">
              <th className="th">Cliente</th>
              <th className="th">Evento</th>
              <th className="th">Data</th>
              <th className="th">Itens</th>
              <th className="th text-right">Valor total</th>
              <th className="th">Status</th>
              <th className="th">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const sc = statusConfig[o.status];
              return (
                <tr key={o.id} className="table-row-click" onClick={() => openView(o)}>
                  <td className="td fw-600">
                    {o.cliente_nome}
                    {o.cliente_empresa && (
                      <span className="block text-xs text-muted fw-400">
                        {o.cliente_empresa}
                      </span>
                    )}
                  </td>
                  <td className="td text-base">{o.evento_nome}</td>
                  <td className="td mono text-sm">{fmtDate(o.evento_data)}</td>
                  <td className="td text-sm text-muted">{itensResumo(o.itens)}</td>
                  <td className="td mono text-base text-right fw-600">{fmt(o.valor_com_desconto)}</td>
                  <td className="td">
                    <span className={`pill ${sc.pill}`}>{sc.label}</span>
                  </td>
                  <td className="td mono text-sm">{fmtDate(o.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── View detail slide-over ── */}
      {viewing && (
        <SlideOver open={true} onClose={closePanel} title="Detalhes do orçamento">
          <div className="flex flex-col gap-5">
            <div>
              <p className="label mb-1">CLIENTE</p>
              <p className="fw-600 text-lg">{viewing.cliente_nome}</p>
              {viewing.cliente_empresa && <p className="text-base text-muted">{viewing.cliente_empresa}</p>}
              <p className="mono text-sm text-muted mt-0.5">{viewing.cliente_telefone}</p>
            </div>

            <div>
              <p className="label mb-1">EVENTO</p>
              <p className="fw-600 text-lg">{viewing.evento_nome}</p>
              <p className="text-base text-muted">{fmtDate(viewing.evento_data)} · {viewing.evento_local}</p>
              <p className="text-base text-muted">Público estimado: {viewing.evento_publico_estimado.toLocaleString('pt-BR')}</p>
            </div>

            <div>
              <p className="label mb-2">SERVIÇOS</p>
              {viewing.itens.map((item, idx) => {
                const descLabel = item.desconto > 0 ? ` (${(item.desconto * 100).toFixed(0)}% desc.)` : '';
                return (
                  <div key={idx} className={`py-2 ${idx < viewing.itens.length - 1 ? 'border-b-line' : ''}`}>
                    <p className="fw-600 text-base">{item.quantidade}× {tipoLabel[item.tipo]}</p>
                    <p className="text-sm text-muted">
                      {item.horas}h × <span className="mono">{fmt(item.valor_unitario)}</span>/h{descLabel}
                    </p>
                    <p className="mono text-md fw-600 mt-0.5">{fmt(item.subtotal)}</p>
                  </div>
                );
              })}
            </div>

            <div className="summary-card">
              <div className="summary-row">
                <span className="text-base text-muted">Total sem desconto</span>
                <span className="mono text-md">{fmt(viewing.valor_total)}</span>
              </div>
              {viewing.valor_total !== viewing.valor_com_desconto && (
                <div className="summary-row">
                  <span className="text-base text-green-d">Desconto aplicado</span>
                  <span className="mono text-md text-green-d">-{fmt(viewing.valor_total - viewing.valor_com_desconto)}</span>
                </div>
              )}
              <div className="summary-divider flex justify-between">
                <span className="font-display text-lg text-green-d">Total final</span>
                <span className="font-display text-4xl text-green-d">{fmt(viewing.valor_com_desconto)}</span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <span className={`pill ${statusConfig[viewing.status].pill}`}>{statusConfig[viewing.status].label}</span>
              <span className="text-sm text-muted">
                Criado em {fmtDate(viewing.created_at)} · Validade {viewing.validade_dias} dias
              </span>
            </div>
          </div>
        </SlideOver>
      )}

      {/* ── Create slide-over (multi-step) ── */}
      {creating && (
        <SlideOver
          open={true}
          onClose={closePanel}
          title={`Novo orçamento — ${step === 1 ? 'Cliente' : step === 2 ? 'Evento' : 'Serviços'}`}
          footer={
            <div className="slide-footer-between">
              <div>
                {step > 1 && (
                  <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Voltar</button>
                )}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={closePanel}>Cancelar</button>
                {step < 3 ? (
                  <button className="btn btn-green" onClick={() => setStep(step + 1)}>Próximo</button>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={() => { closePanel(); showToast('Rascunho salvo com sucesso', 'success'); }}>Salvar rascunho</button>
                    <button className="btn btn-green" onClick={() => { closePanel(); showToast('Orçamento enviado com sucesso', 'success'); }}>Enviar orçamento</button>
                  </>
                )}
              </div>
            </div>
          }
        >
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`step-dot ${s <= step ? 'step-dot-active' : 'step-dot-inactive'}`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`step-line ${s < step ? 'step-line-active' : 'step-line-inactive'}`} />
                )}
              </div>
            ))}
            <span className="mono text-xs text-muted ml-2">
              Passo {step} de 3
            </span>
          </div>

          {/* Step 1 — Cliente */}
          {step === 1 && (
            <div className="flex flex-col">
              <FormField label="Nome do cliente">
                <input className="form-input" value={form.cliente_nome} onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} placeholder="Nome completo" />
              </FormField>
              <FormField label="Empresa">
                <input className="form-input" value={form.cliente_empresa} onChange={(e) => setForm({ ...form, cliente_empresa: e.target.value })} placeholder="Opcional" />
              </FormField>
              <FormField label="Telefone">
                <input className="form-input" value={form.cliente_telefone} onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })} placeholder="(21) 99999-9999" />
              </FormField>
              <FormField label="Email">
                <input className="form-input" type="email" value={form.cliente_email} onChange={(e) => setForm({ ...form, cliente_email: e.target.value })} placeholder="email@empresa.com" />
              </FormField>
            </div>
          )}

          {/* Step 2 — Evento */}
          {step === 2 && (
            <div className="flex flex-col">
              <FormField label="Nome do evento">
                <input className="form-input" value={form.evento_nome} onChange={(e) => setForm({ ...form, evento_nome: e.target.value })} placeholder="Ex: SIPAT Petrobras 2026" />
              </FormField>
              <FormField label="Data">
                <input className="form-input" type="date" value={form.evento_data} onChange={(e) => setForm({ ...form, evento_data: e.target.value })} />
              </FormField>
              <FormField label="Local">
                <input className="form-input" value={form.evento_local} onChange={(e) => setForm({ ...form, evento_local: e.target.value })} placeholder="Endereço completo" />
              </FormField>
              <FormField label="Público estimado">
                <input className="form-input" type="number" value={form.evento_publico_estimado || ''} onChange={(e) => setForm({ ...form, evento_publico_estimado: parseInt(e.target.value) || 0 })} placeholder="Ex: 2000" />
              </FormField>
            </div>
          )}

          {/* Step 3 — Serviços (Calculator) */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              {form.itens.map((item, idx) => {
                const line = calcLine(item);
                return (
                  <div key={idx} className="panel p-3.5">
                    <div className="flex-between mb-3">
                      <span className="fw-700 text-base">Serviço {idx + 1}</span>
                      {form.itens.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="btn-icon-delete"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>

                    <FormField label="Tipo de serviço">
                      <select
                        className="form-select"
                        value={item.tipo}
                        onChange={(e) => updateItem(idx, { tipo: e.target.value as TipoServico })}
                      >
                        <option value="basica">Ambulância Básica</option>
                        <option value="uti">Ambulância UTI</option>
                        <option value="posto_medico">Posto Médico</option>
                      </select>
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Quantidade">
                        <input
                          className="form-input"
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(e) => updateItem(idx, { quantidade: parseInt(e.target.value) || 1 })}
                        />
                      </FormField>
                      <FormField label="Horas (mín. 4)">
                        <input
                          className="form-input"
                          type="number"
                          min={4}
                          value={item.horas}
                          onChange={(e) => updateItem(idx, { horas: parseInt(e.target.value) || 4 })}
                        />
                      </FormField>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted whitespace-nowrap">Valor/hora:</span>
                      <span className="mono text-base fw-600">{fmt(line.valorHora)}</span>
                    </div>

                    <FormField label={`Desconto: ${(item.desconto * 100).toFixed(0)}%`}>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={item.desconto * 100}
                        onChange={(e) => updateItem(idx, { desconto: parseInt(e.target.value) / 100 })}
                        className="w-full accent-green"
                      />
                      <div className="flex justify-between text-xs text-muted2">
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </FormField>

                    <div className="flex justify-between mt-2 pt-2 border-t-line">
                      <span className="text-base text-muted">Subtotal</span>
                      <span className="mono text-lg fw-700">{fmt(line.subtotalLiquido)}</span>
                    </div>
                  </div>
                );
              })}

              <button
                className="btn btn-outline self-start"
                onClick={addItem}
              >
                <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Adicionar serviço</span>
              </button>

              {/* ── Resumo ── */}
              <div className="summary-card mt-2">
                <div className="summary-row">
                  <span className="text-base text-muted">Total sem desconto</span>
                  <span className="mono text-lg">{fmt(totals.bruto)}</span>
                </div>
                {totals.desconto > 0 && (
                  <div className="summary-row">
                    <span className="text-base text-green-d">Desconto aplicado</span>
                    <span className="mono text-lg text-green-d">-{fmt(totals.desconto)}</span>
                  </div>
                )}
                <div className="summary-divider-lg flex justify-between">
                  <span className="font-display text-[15px] text-green-d self-center">Total final</span>
                  <span className="font-display text-5xl text-green-d">{fmt(totals.liquido)}</span>
                </div>
              </div>
            </div>
          )}
        </SlideOver>
      )}
    </div>
  );
}
