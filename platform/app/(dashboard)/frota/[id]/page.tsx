'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Wrench, Check, X, Minus, Circle,
  Fuel, AlertTriangle, FileText, Plus, Calendar,
} from 'lucide-react';
import {
  mockVtrs, mockVtrDetails, mockMultas, mockPneus, mockManutencoes,
  mockChecklistItems, mockEmployees,
  statusPill, statusLabel, tipoVtrPill,
  type Multa, type Pneu, type ManutencaoDetail, type ChecklistItem,
} from '@/lib/mock-data';

const tabs = ['Geral', 'Manutenções', 'Checklist', 'Pneus', 'Multas'] as const;
type Tab = (typeof tabs)[number];

function getRegiao(lat: number): string {
  return lat < -23.0 ? 'São Paulo' : 'Rio de Janeiro';
}

function fmtKm(n: number): string {
  return n.toLocaleString('pt-BR') + ' km';
}

function fmtBrl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: string): string {
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
}

const multaStatusLabel: Record<string, { label: string; pill: string }> = {
  penalty_or_nic_paid: { label: 'Paga', pill: 'pill-green' },
  penalty_or_nic_open: { label: 'Em aberto', pill: 'pill-red' },
  sent_to_payment: { label: 'Enviada p/ pgto', pill: 'pill-amber' },
};

const pneuStatusLabel: Record<string, { label: string; pill: string }> = {
  in_activity: { label: 'Em uso', pill: 'pill-green' },
  in_stock: { label: 'Estoque', pill: 'pill-blue' },
  discarded: { label: 'Descartado', pill: 'pill-slate' },
  retread: { label: 'Recapado', pill: 'pill-amber' },
};

const manutStatusLabel: Record<string, { label: string; pill: string }> = {
  agendada: { label: 'Agendada', pill: 'pill-blue' },
  em_andamento: { label: 'Em andamento', pill: 'pill-amber' },
  aguardando_peca: { label: 'Aguardando peça', pill: 'pill-violet' },
  concluida: { label: 'Concluída', pill: 'pill-green' },
};

const prioridadeLabel: Record<string, { label: string; pill: string }> = {
  baixa: { label: 'Baixa', pill: 'pill-slate' },
  media: { label: 'Média', pill: 'pill-blue' },
  alta: { label: 'Alta', pill: 'pill-amber' },
  critica: { label: 'Crítica', pill: 'pill-red' },
};

/* ================================================================== */

export default function VtrDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('Geral');

  const vtr = mockVtrs.find((v) => v.id === params.id);
  if (!vtr) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--muted)' }}>Veículo não encontrado</p>
        <Link href="/frota" style={{ marginTop: 16, fontSize: '12.5px', textDecoration: 'none', color: 'var(--green-d)' }}>
          Voltar para Frota
        </Link>
      </div>
    );
  }

  const tp = tipoVtrPill[vtr.tipo];
  const detail = mockVtrDetails[vtr.id];
  const vtrMultas = mockMultas.filter((m) => m.vtr_id === vtr.id).sort((a, b) => b.data.localeCompare(a.data));
  const vtrPneus = mockPneus.filter((p) => p.vtr_id === vtr.id);
  const vtrManut = mockManutencoes.filter((m) => m.vtr_id === vtr.id).sort((a, b) => b.data.localeCompare(a.data));
  const checklist = mockChecklistItems[vtr.id] || [];
  const manutAbertas = vtrManut.filter((m) => m.status !== 'concluida').length;
  const multaTotal = vtrMultas.reduce((s, m) => s + m.valor, 0);
  const reprovados = checklist.filter((c) => c.status === 'reprovado').length;

  // Find assigned driver (just pick from employees for demo)
  const motorista = vtr.status === 'em_atendimento'
    ? mockEmployees.find((e) => e.funcao === 'Motorista')
    : undefined;

  return (
    <div>
      {/* Back + breadcrumb */}
      <Link
        href="/frota"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12.5px', textDecoration: 'none', color: 'var(--muted)', marginBottom: 16 }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Voltar para Frota
      </Link>

      {/* Hero section */}
      <div style={{ marginBottom: 20 }}>
        <p className="breadcrumb" style={{ marginBottom: 4 }}>FROTA / VTR {vtr.nome}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <h1 className="font-display" style={{ fontSize: 28, letterSpacing: '-0.025em', margin: 0 }}>
            VTR {vtr.nome}
          </h1>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink2)' }}>
            {vtr.placa}
          </span>
          <span className={`pill ${statusPill[vtr.status]}`}>{statusLabel[vtr.status]}</span>
          <span className={`pill ${tp.pill}`}>{tp.label}</span>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: 4 }}>
          {vtr.modelo}{detail?.versao ? ` · ${detail.versao}` : ''}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">KM ATUAL</div>
          <div className="kpi-value mono" style={{ fontSize: 20, letterSpacing: '-0.01em' }}>
            {detail ? fmtKm(detail.km) : '--'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">MULTAS</div>
          <div className="kpi-value" style={{ fontSize: 20, color: vtrMultas.length > 0 ? 'var(--red)' : 'var(--ink)' }}>
            {vtrMultas.length}
          </div>
          {vtrMultas.length > 0 && (
            <div className="kpi-sub mono" style={{ fontSize: 9 }}>{fmtBrl(multaTotal)} total</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">MANUTENÇÕES ABERTAS</div>
          <div className="kpi-value" style={{ fontSize: 20, color: manutAbertas > 0 ? 'var(--amber)' : 'var(--ink)' }}>
            {manutAbertas}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">ULT. ABASTECIMENTO</div>
          <div className="kpi-value" style={{ fontSize: 16 }}>
            {detail?.ultimo_abastecimento ? fmtDate(detail.ultimo_abastecimento) : '--'}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
          >
            {tab}
            {tab === 'Multas' && vtrMultas.length > 0 && (
              <span className="mono" style={{ fontSize: 9, marginLeft: 4, opacity: 0.6 }}>({vtrMultas.length})</span>
            )}
            {tab === 'Checklist' && reprovados > 0 && (
              <span style={{ marginLeft: 6, width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Geral ───────────────────────────────────── */}
      {activeTab === 'Geral' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left: Identificacao */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Identificação</span></div>
            <div className="panel-body" style={{ padding: '8px 16px' }}>
              {([
                { label: 'Nome', value: `VTR ${vtr.nome}` },
                { label: 'Placa', value: vtr.placa, mono: true },
                { label: 'Chassi', value: detail?.chassi || '--', mono: true },
                { label: 'Renavam', value: detail?.renavam || '--', mono: true },
                { label: 'Modelo', value: vtr.modelo },
                { label: 'Versão', value: detail?.versao || '--' },
                { label: 'Ano Fab / Mod', value: detail ? `${detail.ano_fab} / ${detail.ano_mod}` : '--' },
                { label: 'Grupo', value: detail?.grupo || tp.label },
                { label: 'KM Atual', value: detail ? fmtKm(detail.km) : '--', mono: true },
                { label: 'Status', value: statusLabel[vtr.status] },
              ] as { label: string; value: string; mono?: boolean }[]).map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="label" style={{ alignSelf: 'center' }}>{row.label}</span>
                  <span className={row.mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Operacao */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Operação</span></div>
              <div className="panel-body" style={{ padding: '8px 16px' }}>
                {([
                  { label: 'Motorista', value: motorista ? motorista.nome : 'Sem motorista atribuído' },
                  { label: 'Ult. abastecimento', value: detail?.ultimo_abastecimento ? fmtDate(detail.ultimo_abastecimento) : '--' },
                  { label: 'Ult. apontamento', value: detail?.ultimo_apontamento ? fmtDate(detail.ultimo_apontamento) : '--' },
                  { label: 'Região', value: getRegiao(vtr.latitude) },
                  { label: 'SofitView ID', value: String(vtr.sofit_id), mono: true },
                ] as { label: string; value: string; mono?: boolean }[]).map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                    <span className="label" style={{ alignSelf: 'center' }}>{row.label}</span>
                    <span className={row.mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 600, color: row.value === 'Sem motorista atribuído' ? 'var(--muted)' : 'var(--ink)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentos */}
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Documentos</span></div>
              <div className="panel-body">
                {detail?.crlv_url ? (
                  <a
                    href={detail.crlv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--green-d)', textDecoration: 'none' }}
                  >
                    <FileText size={14} strokeWidth={1.5} />
                    CRLV 2025 (PDF)
                    <ExternalLink size={11} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                  </a>
                ) : (
                  <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Nenhum documento disponível</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Manutencoes ──────────────────────────────── */}
      {activeTab === 'Manutenções' && (
        <div>
          {/* Header with button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {vtrManut.length} {vtrManut.length === 1 ? 'ordem de serviço' : 'ordens de serviço'}
            </span>
            <button className="btn btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <Plus size={14} strokeWidth={2} />
              Nova OS
            </button>
          </div>

          {vtrManut.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <Wrench size={32} strokeWidth={1.2} style={{ color: 'var(--muted2)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Nenhuma manutenção registrada</p>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 8, top: 12, bottom: 12, width: 2, background: 'var(--line2)', borderRadius: 1 }} />

              {vtrManut.map((m, i) => {
                const st = manutStatusLabel[m.status];
                const pr = prioridadeLabel[m.prioridade];
                return (
                  <div key={m.id} style={{ position: 'relative', marginBottom: i < vtrManut.length - 1 ? 16 : 0 }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -20, top: 14,
                      width: 10, height: 10, borderRadius: '50%',
                      background: m.status === 'concluida' ? 'var(--green)' : m.status === 'em_andamento' ? 'var(--amber)' : m.status === 'aguardando_peca' ? 'var(--violet)' : 'var(--blue)',
                      border: '2px solid var(--card)',
                    }} />
                    <div className="panel" style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className={`pill ${st.pill}`}>{st.label}</span>
                        <span className={`pill ${pr.pill}`}>{pr.label}</span>
                        <span className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 'auto' }}>{m.id}</span>
                      </div>
                      <p className="font-display" style={{ fontSize: 15, marginBottom: 6 }}>{m.descricao}</p>
                      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--ink2)', flexWrap: 'wrap' }}>
                        <span>{m.fornecedor}</span>
                        <span className="mono" style={{ fontWeight: 600 }}>{fmtBrl(m.valor)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={11} strokeWidth={1.5} />
                          {fmtDate(m.data)}
                        </span>
                        <span className="pill pill-slate" style={{ fontSize: 7 }}>{m.tipo.toUpperCase()}</span>
                      </div>
                      {m.itens && m.itens.length > 0 && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                          <span className="label" style={{ marginBottom: 6, display: 'block' }}>ITENS</span>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {m.itens.map((item) => (
                              <li key={item} style={{ fontSize: 11.5, color: 'var(--ink2)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted2)', flexShrink: 0 }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Checklist ─────────────────────────────────── */}
      {activeTab === 'Checklist' && (
        <div>
          {checklist.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <Check size={32} strokeWidth={1.2} style={{ color: 'var(--muted2)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Nenhum checklist registrado</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>
                    Último checklist: 21/08/2026 · Motorista: Adilson Barbosa
                  </span>
                </div>
                {reprovados > 0 && (
                  <span className="pill pill-red">
                    {reprovados} {reprovados === 1 ? 'item reprovado' : 'itens reprovados'}
                  </span>
                )}
              </div>

              {/* Group by category */}
              {['Parte Externa', 'Parte Interna', 'Equipamentos Médicos', 'Documentação'].map((cat) => {
                const items = checklist.filter((c) => c.categoria === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="panel" style={{ marginBottom: 12 }}>
                    <div className="panel-header">
                      <span className="panel-title">{cat}</span>
                    </div>
                    <div>
                      {items.map((item) => (
                        <div
                          key={item.item}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px',
                            borderBottom: '1px solid var(--line)',
                            background: item.status === 'reprovado' ? 'var(--red-l)' : 'transparent',
                          }}
                        >
                          {item.status === 'aprovado' && <Check size={14} strokeWidth={2} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />}
                          {item.status === 'reprovado' && <X size={14} strokeWidth={2} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />}
                          {item.status === 'nao_verificado' && <Minus size={14} strokeWidth={2} style={{ color: 'var(--muted2)', flexShrink: 0, marginTop: 1 }} />}
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 12.5, fontWeight: item.status === 'reprovado' ? 600 : 400, color: item.status === 'reprovado' ? 'var(--red)' : 'var(--ink)' }}>
                              {item.item}
                            </span>
                            {item.observacao && (
                              <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 3, lineHeight: 1.3 }}>
                                {item.observacao}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Pneus ─────────────────────────────────────── */}
      {activeTab === 'Pneus' && (
        <div>
          {vtrPneus.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <Circle size={32} strokeWidth={1.2} style={{ color: 'var(--muted2)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Sem pneus cadastrados</p>
            </div>
          ) : (
            <>
              {/* Visual diagram */}
              <div className="panel" style={{ padding: 24, marginBottom: 16 }}>
                <div className="panel-title" style={{ marginBottom: 16 }}>Posições</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: 12, maxWidth: 500, margin: '0 auto' }}>
                  {/* Front left */}
                  <TireSlot pneu={vtrPneus[0]} position="Diant. Esq." />
                  {/* Center: vehicle icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>FRENTE</div>
                    <div style={{ width: 60, height: 80, border: '2px solid var(--line2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="mono" style={{ fontSize: 9, color: 'var(--muted2)' }}>{vtr.placa}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>TRAS</div>
                  </div>
                  {/* Front right */}
                  <TireSlot pneu={vtrPneus[1]} position="Diant. Dir." />
                  {/* Rear left */}
                  <TireSlot pneu={vtrPneus[2]} position="Tras. Esq." />
                  {/* Spare */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {vtrPneus[4] ? (
                      <TireSlot pneu={vtrPneus[4]} position="Estepe" />
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--muted2)' }}>Sem estepe</span>
                    )}
                  </div>
                  {/* Rear right */}
                  <TireSlot pneu={vtrPneus[3]} position="Tras. Dir." />
                </div>
              </div>

              {/* Table */}
              <div className="panel">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th className="th" style={{ textAlign: 'left' }}>Nome</th>
                      <th className="th" style={{ textAlign: 'left' }}>Dimensão</th>
                      <th className="th" style={{ textAlign: 'left' }}>Status</th>
                      <th className="th" style={{ textAlign: 'right' }}>Vida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vtrPneus.map((p) => {
                      const ps = pneuStatusLabel[p.status];
                      return (
                        <tr key={p.id}>
                          <td className="td" style={{ fontSize: 12.5 }}>{p.nome}</td>
                          <td className="td mono" style={{ fontSize: 12 }}>{p.dimensao}</td>
                          <td className="td"><span className={`pill ${ps.pill}`}>{ps.label}</span></td>
                          <td className="td mono" style={{ textAlign: 'right', fontSize: 12 }}>{p.vida_atual}a vida</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Multas ───────────────────────────────────── */}
      {activeTab === 'Multas' && (
        <div>
          {vtrMultas.length === 0 ? (
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <AlertTriangle size={32} strokeWidth={1.2} style={{ color: 'var(--muted2)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Nenhuma multa registrada</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>
                  {vtrMultas.length} {vtrMultas.length === 1 ? 'multa' : 'multas'}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {fmtBrl(multaTotal)} total
                </span>
              </div>

              <div className="panel">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th className="th" style={{ textAlign: 'left' }}>Data</th>
                      <th className="th" style={{ textAlign: 'left' }}>Código</th>
                      <th className="th" style={{ textAlign: 'left' }}>Descrição</th>
                      <th className="th" style={{ textAlign: 'right' }}>Valor</th>
                      <th className="th" style={{ textAlign: 'left' }}>Status</th>
                      <th className="th" style={{ textAlign: 'left' }}>Motorista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vtrMultas.map((m) => {
                      const ms = multaStatusLabel[m.status];
                      return (
                        <tr key={m.id}>
                          <td className="td mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDate(m.data)}</td>
                          <td className="td mono" style={{ fontSize: 11 }}>{m.codigo}</td>
                          <td className="td" style={{ fontSize: 12, maxWidth: 300 }}>{m.descricao}</td>
                          <td className="td mono" style={{ textAlign: 'right', fontSize: 12, fontWeight: 600 }}>{fmtBrl(m.valor)}</td>
                          <td className="td"><span className={`pill ${ms.pill}`}>{ms.label}</span></td>
                          <td className="td" style={{ fontSize: 11.5, color: m.motorista ? 'var(--ink2)' : 'var(--muted2)' }}>
                            {m.motorista || '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tire position component ──────────────────────────────────────── */

function TireSlot({ pneu, position }: { pneu?: Pneu; position: string }) {
  if (!pneu) {
    return (
      <div style={{ border: '1px dashed var(--line2)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--muted2)' }}>{position}</span>
        <br />
        <span style={{ fontSize: 10, color: 'var(--muted2)' }}>Vazio</span>
      </div>
    );
  }
  const ps = pneuStatusLabel[pneu.status];
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, textAlign: 'center', background: 'var(--card)' }}>
      <span className="label" style={{ marginBottom: 4, display: 'block' }}>{position}</span>
      <span className="mono" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>{pneu.dimensao}</span>
      <span className={`pill ${ps.pill}`} style={{ marginBottom: 4 }}>{ps.label}</span>
      <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{pneu.vida_atual}a vida</span>
    </div>
  );
}
