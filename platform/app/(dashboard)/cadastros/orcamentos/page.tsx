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
      // enforce minimum hours
      const preco = tabelaPrecos.find((p) => p.tipo_servico === updated.tipo);
      if (preco && updated.horas < preco.minimo_horas) updated.horas = preco.minimo_horas;
      // enforce max discount
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
        <Link href="/cadastros" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>CADASTROS</p>
          <h1 className="page-title">Orçamentos de Eventos</h1>
        </div>
        <button className="btn btn-green" onClick={openCreate}>
          <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Novo orçamento</span>
        </button>
      </div>

      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <Search size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted2)' }} />
        <input
          className="table-search"
          placeholder="Buscar por cliente ou evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th className="th">Cliente</th>
              <th className="th">Evento</th>
              <th className="th">Data</th>
              <th className="th">Itens</th>
              <th className="th" style={{ textAlign: 'right' }}>Valor total</th>
              <th className="th">Status</th>
              <th className="th">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const sc = statusConfig[o.status];
              return (
                <tr key={o.id} className="table-row-click" onClick={() => openView(o)}>
                  <td className="td" style={{ fontWeight: 600 }}>
                    {o.cliente_nome}
                    {o.cliente_empresa && (
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>
                        {o.cliente_empresa}
                      </span>
                    )}
                  </td>
                  <td className="td" style={{ fontSize: 12 }}>{o.evento_nome}</td>
                  <td className="td mono" style={{ fontSize: 11 }}>{fmtDate(o.evento_data)}</td>
                  <td className="td" style={{ fontSize: 11, color: 'var(--muted)' }}>{itensResumo(o.itens)}</td>
                  <td className="td mono" style={{ fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{fmt(o.valor_com_desconto)}</td>
                  <td className="td">
                    <span className={`pill ${sc.pill}`}>{sc.label}</span>
                  </td>
                  <td className="td mono" style={{ fontSize: 11 }}>{fmtDate(o.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── View detail slide-over ── */}
      {viewing && (
        <SlideOver open={true} onClose={closePanel} title="Detalhes do orçamento">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p className="label" style={{ marginBottom: 4 }}>CLIENTE</p>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{viewing.cliente_nome}</p>
              {viewing.cliente_empresa && <p style={{ fontSize: 12, color: 'var(--muted)' }}>{viewing.cliente_empresa}</p>}
              <p className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{viewing.cliente_telefone}</p>
            </div>

            <div>
              <p className="label" style={{ marginBottom: 4 }}>EVENTO</p>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{viewing.evento_nome}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(viewing.evento_data)} · {viewing.evento_local}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Público estimado: {viewing.evento_publico_estimado.toLocaleString('pt-BR')}</p>
            </div>

            <div>
              <p className="label" style={{ marginBottom: 8 }}>SERVIÇOS</p>
              {viewing.itens.map((item, idx) => {
                const descLabel = item.desconto > 0 ? ` (${(item.desconto * 100).toFixed(0)}% desc.)` : '';
                return (
                  <div key={idx} style={{ padding: '8px 0', borderBottom: idx < viewing.itens.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <p style={{ fontWeight: 600, fontSize: 12 }}>{item.quantidade}× {tipoLabel[item.tipo]}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {item.horas}h × <span className="mono">{fmt(item.valor_unitario)}</span>/h{descLabel}
                    </p>
                    <p className="mono" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{fmt(item.subtotal)}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'var(--green-l)', borderRadius: 'var(--r)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total sem desconto</span>
                <span className="mono" style={{ fontSize: 13 }}>{fmt(viewing.valor_total)}</span>
              </div>
              {viewing.valor_total !== viewing.valor_com_desconto && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--green-d)' }}>Desconto aplicado</span>
                  <span className="mono" style={{ fontSize: 13, color: 'var(--green-d)' }}>-{fmt(viewing.valor_total - viewing.valor_com_desconto)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--green)' }}>
                <span className="font-display" style={{ fontSize: 14, color: 'var(--green-d)' }}>Total final</span>
                <span className="font-display" style={{ fontSize: 22, color: 'var(--green-d)' }}>{fmt(viewing.valor_com_desconto)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`pill ${statusConfig[viewing.status].pill}`}>{statusConfig[viewing.status].label}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>
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
            <div className="flex gap-2" style={{ width: '100%', justifyContent: 'space-between' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)',
                  background: s <= step ? 'var(--green)' : 'var(--bg)',
                  color: s <= step ? 'oklch(0.24 0.05 168)' : 'var(--muted2)',
                  border: s <= step ? 'none' : '1px solid var(--line2)',
                }}>
                  {s}
                </div>
                {s < 3 && (
                  <div style={{ width: 32, height: 2, background: s < step ? 'var(--green)' : 'var(--line2)', borderRadius: 1 }} />
                )}
              </div>
            ))}
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>
              Passo {step} de 3
            </span>
          </div>

          {/* Step 1 — Cliente */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {form.itens.map((item, idx) => {
                const line = calcLine(item);
                return (
                  <div key={idx} className="panel" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>Serviço {idx + 1}</span>
                      {form.itens.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Valor/hora:</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{fmt(line.valorHora)}</span>
                    </div>

                    <FormField label={`Desconto: ${(item.desconto * 100).toFixed(0)}%`}>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={item.desconto * 100}
                        onChange={(e) => updateItem(idx, { desconto: parseInt(e.target.value) / 100 })}
                        style={{ width: '100%', accentColor: 'var(--green)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted2)' }}>
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </FormField>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Subtotal</span>
                      <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{fmt(line.subtotalLiquido)}</span>
                    </div>
                  </div>
                );
              })}

              <button
                className="btn btn-outline"
                onClick={addItem}
                style={{ alignSelf: 'flex-start' }}
              >
                <span className="flex items-center gap-2"><Plus size={14} strokeWidth={2} /> Adicionar serviço</span>
              </button>

              {/* ── Resumo ── */}
              <div style={{ background: 'var(--green-l)', borderRadius: 'var(--r)', padding: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total sem desconto</span>
                  <span className="mono" style={{ fontSize: 14 }}>{fmt(totals.bruto)}</span>
                </div>
                {totals.desconto > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--green-d)' }}>Desconto aplicado</span>
                    <span className="mono" style={{ fontSize: 14, color: 'var(--green-d)' }}>-{fmt(totals.desconto)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--green)' }}>
                  <span className="font-display" style={{ fontSize: 15, color: 'var(--green-d)', alignSelf: 'center' }}>Total final</span>
                  <span className="font-display" style={{ fontSize: 28, color: 'var(--green-d)' }}>{fmt(totals.liquido)}</span>
                </div>
              </div>
            </div>
          )}
        </SlideOver>
      )}
    </div>
  );
}
