'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Wrench, Check, X, Minus, Circle,
  Fuel, AlertTriangle, FileText, Plus, Calendar, Pencil,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
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
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('Geral');

  const vtr = mockVtrs.find((v) => v.id === params.id);
  if (!vtr) {
    return (
      <div className="not-found">
        <p className="not-found-text">Veículo não encontrado</p>
        <Link href="/frota" className="not-found-link">
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
      <Link href="/frota" className="back-link-styled">
        <ArrowLeft size={14} strokeWidth={1.5} />
        Voltar para Frota
      </Link>

      {/* Hero section */}
      <div className="detail-hero-section">
        <p className="breadcrumb mb-1">FROTA / VTR {vtr.nome}</p>
        <div className="detail-hero-row">
          <h1 className="font-display detail-hero-title">
            VTR {vtr.nome}
          </h1>
          <span className="mono detail-hero-placa">
            {vtr.placa}
          </span>
          <span className={`pill ${statusPill[vtr.status]}`}>{statusLabel[vtr.status]}</span>
          <span className={`pill ${tp.pill}`}>{tp.label}</span>
          <button className="btn btn-outline detail-edit-btn" onClick={() => showToast('Edição de veículo em desenvolvimento', 'info')}>
            <Pencil size={13} strokeWidth={1.8} />
            Editar
          </button>
        </div>
        <p className="detail-hero-sub">
          {vtr.modelo}{detail?.versao ? ` · ${detail.versao}` : ''}
        </p>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="kpi-card">
          <div className="kpi-label">KM ATUAL</div>
          <div className="kpi-value mono kpi-value-20">
            {detail ? fmtKm(detail.km) : '--'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">MULTAS</div>
          <div className={`kpi-value kpi-value-20 ${vtrMultas.length > 0 ? 'text-red' : ''}`}>
            {vtrMultas.length}
          </div>
          {vtrMultas.length > 0 && (
            <div className="kpi-sub mono kpi-sub-9">{fmtBrl(multaTotal)} total</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">MANUTENÇÕES ABERTAS</div>
          <div className={`kpi-value kpi-value-20 ${manutAbertas > 0 ? 'text-amber' : ''}`}>
            {manutAbertas}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">ULT. ABASTECIMENTO</div>
          <div className="kpi-value kpi-value-20">
            {detail?.ultimo_abastecimento ? fmtDate(detail.ultimo_abastecimento) : '--'}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
          >
            {tab}
            {tab === 'Multas' && vtrMultas.length > 0 && (
              <span className="mono tab-count">({vtrMultas.length})</span>
            )}
            {tab === 'Checklist' && reprovados > 0 && (
              <span className="tab-reprovado-dot" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Geral ───────────────────────────────────── */}
      {activeTab === 'Geral' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Identificacao */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Identificação</span></div>
            <div className="panel-body panel-body-compact">
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
                <div key={row.label} className="info-row-styled">
                  <span className="label self-center">{row.label}</span>
                  <span className={`${row.mono ? 'mono' : ''} info-val`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Operacao */}
          <div className="flex flex-col gap-4">
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Operação</span></div>
              <div className="panel-body panel-body-compact">
                {([
                  { label: 'Motorista', value: motorista ? motorista.nome : 'Sem motorista atribuído' },
                  { label: 'Ult. abastecimento', value: detail?.ultimo_abastecimento ? fmtDate(detail.ultimo_abastecimento) : '--' },
                  { label: 'Ult. apontamento', value: detail?.ultimo_apontamento ? fmtDate(detail.ultimo_apontamento) : '--' },
                  { label: 'Região', value: getRegiao(vtr.latitude) },
                  { label: 'SofitView ID', value: String(vtr.sofit_id), mono: true },
                ] as { label: string; value: string; mono?: boolean }[]).map((row) => (
                  <div key={row.label} className="info-row-styled">
                    <span className="label self-center">{row.label}</span>
                    <span className={`${row.mono ? 'mono' : ''} ${row.value === 'Sem motorista atribuído' ? 'info-val-muted' : 'info-val'}`}>{row.value}</span>
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
                    className="doc-link"
                  >
                    <FileText size={14} strokeWidth={1.5} />
                    CRLV 2025 (PDF)
                    <ExternalLink size={11} strokeWidth={1.5} className="doc-link-icon" />
                  </a>
                ) : (
                  <span className="doc-empty">Nenhum documento disponível</span>
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
          <div className="manut-header">
            <span className="manut-count">
              {vtrManut.length} {vtrManut.length === 1 ? 'ordem de serviço' : 'ordens de serviço'}
            </span>
            <button className="btn btn-green btn-inline-flex text-base" onClick={() => showToast('Módulo de OS em desenvolvimento', 'info')}>
              <Plus size={14} strokeWidth={2} />
              Nova OS
            </button>
          </div>

          {vtrManut.length === 0 ? (
            <div className="panel panel-empty">
              <Wrench size={32} strokeWidth={1.2} className="panel-empty-icon" />
              <p className="panel-empty-text">Nenhuma manutenção registrada</p>
            </div>
          ) : (
            <div className="manut-timeline">
              {/* Vertical line */}
              <div className="manut-timeline-line" />

              {vtrManut.map((m, i) => {
                const st = manutStatusLabel[m.status];
                const pr = prioridadeLabel[m.prioridade];
                return (
                  <div key={m.id} className={`manut-card-wrap ${i < vtrManut.length - 1 ? 'mb-4' : ''}`}>
                    {/* Dot */}
                    <div className={`manut-dot manut-dot-${m.status}`} />
                    <div className="panel manut-card-inner">
                      <div className="manut-pills">
                        <span className={`pill ${st.pill}`}>{st.label}</span>
                        <span className={`pill ${pr.pill}`}>{pr.label}</span>
                        <span className="mono manut-id">{m.id}</span>
                      </div>
                      <p className="font-display manut-desc">{m.descricao}</p>
                      <div className="manut-meta">
                        <span>{m.fornecedor}</span>
                        <span className="mono fw-600">{fmtBrl(m.valor)}</span>
                        <span className="manut-date">
                          <Calendar size={11} strokeWidth={1.5} />
                          {fmtDate(m.data)}
                        </span>
                        <span className="pill pill-slate pill-xs">{m.tipo.toUpperCase()}</span>
                      </div>
                      {m.itens && m.itens.length > 0 && (
                        <div className="manut-items">
                          <span className="label block mb-[6px]">ITENS</span>
                          <ul className="list-none p-0 m-0">
                            {m.itens.map((item) => (
                              <li key={item} className="manut-item-li">
                                <span className="manut-item-dot" />
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
            <div className="panel panel-empty">
              <Check size={32} strokeWidth={1.2} className="panel-empty-icon" />
              <p className="panel-empty-text">Nenhum checklist registrado</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="checklist-header">
                <div>
                  <span className="checklist-info">
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
                  <div key={cat} className="panel mb-3">
                    <div className="panel-header">
                      <span className="panel-title">{cat}</span>
                    </div>
                    <div>
                      {items.map((item) => (
                        <div
                          key={item.item}
                          className={`checklist-item-row ${item.status === 'reprovado' ? 'reprovado' : ''}`}
                        >
                          {item.status === 'aprovado' && <Check size={14} strokeWidth={2} className="checklist-icon checklist-icon-green" />}
                          {item.status === 'reprovado' && <X size={14} strokeWidth={2} className="checklist-icon checklist-icon-red" />}
                          {item.status === 'nao_verificado' && <Minus size={14} strokeWidth={2} className="checklist-icon checklist-icon-muted" />}
                          <div className="flex-1">
                            <span className={`checklist-item-name ${item.status === 'reprovado' ? 'fail' : ''}`}>
                              {item.item}
                            </span>
                            {item.observacao && (
                              <p className="checklist-obs">
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
            <div className="panel panel-empty">
              <Circle size={32} strokeWidth={1.2} className="panel-empty-icon" />
              <p className="panel-empty-text">Sem pneus cadastrados</p>
            </div>
          ) : (
            <>
              {/* Visual diagram */}
              <div className="panel pneu-diagram">
                <div className="panel-title panel-title-mb">Posições</div>
                <div className="pneu-grid">
                  {/* Front left */}
                  <TireSlot pneu={vtrPneus[0]} position="Diant. Esq." />
                  {/* Center: vehicle icon */}
                  <div className="pneu-vehicle-icon">
                    <div className="pneu-vehicle-label">FRENTE</div>
                    <div className="pneu-vehicle-box">
                      <span className="mono pneu-vehicle-placa">{vtr.placa}</span>
                    </div>
                    <div className="pneu-vehicle-label">TRASEIRA</div>
                  </div>
                  {/* Front right */}
                  <TireSlot pneu={vtrPneus[1]} position="Diant. Dir." />
                  {/* Rear left */}
                  <TireSlot pneu={vtrPneus[2]} position="Tras. Esq." />
                  {/* Spare */}
                  <div className="pneu-spare-wrap">
                    {vtrPneus[4] ? (
                      <TireSlot pneu={vtrPneus[4]} position="Estepe" />
                    ) : (
                      <span className="pneu-spare-empty">Sem estepe</span>
                    )}
                  </div>
                  {/* Rear right */}
                  <TireSlot pneu={vtrPneus[3]} position="Tras. Dir." />
                </div>
              </div>

              {/* Table */}
              <div className="panel">
                <table className="table-full">
                  <thead>
                    <tr>
                      <th className="th text-left">Nome</th>
                      <th className="th text-left">Dimensão</th>
                      <th className="th text-left">Status</th>
                      <th className="th text-right">Vida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vtrPneus.map((p) => {
                      const ps = pneuStatusLabel[p.status];
                      return (
                        <tr key={p.id}>
                          <td className="td text-base-1">{p.nome}</td>
                          <td className="td mono text-base">{p.dimensao}</td>
                          <td className="td"><span className={`pill ${ps.pill}`}>{ps.label}</span></td>
                          <td className="td mono td-vida">{p.vida_atual}a vida</td>
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
            <div className="panel panel-empty">
              <AlertTriangle size={32} strokeWidth={1.2} className="panel-empty-icon" />
              <p className="panel-empty-text">Nenhuma multa registrada</p>
            </div>
          ) : (
            <>
              <div className="multas-header">
                <span className="multas-count">
                  {vtrMultas.length} {vtrMultas.length === 1 ? 'multa' : 'multas'}
                </span>
                <span className="mono multas-total">
                  {fmtBrl(multaTotal)} total
                </span>
              </div>

              <div className="panel">
                <table className="table-full">
                  <thead>
                    <tr>
                      <th className="th text-left">Data</th>
                      <th className="th text-left">Código</th>
                      <th className="th text-left">Descrição</th>
                      <th className="th text-right">Valor</th>
                      <th className="th text-left">Status</th>
                      <th className="th text-left">Motorista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vtrMultas.map((m) => {
                      const ms = multaStatusLabel[m.status];
                      return (
                        <tr key={m.id}>
                          <td className="td mono td-date">{fmtDate(m.data)}</td>
                          <td className="td mono td-code">{m.codigo}</td>
                          <td className="td td-desc">{m.descricao}</td>
                          <td className="td mono td-valor">{fmtBrl(m.valor)}</td>
                          <td className="td"><span className={`pill ${ms.pill}`}>{ms.label}</span></td>
                          <td className={`td td-motorista ${m.motorista ? 'td-motorista-filled' : 'td-motorista-empty'}`}>
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
      <div className="tire-slot-empty">
        <span className="tire-slot-empty-text">{position}</span>
        <br />
        <span className="tire-slot-empty-text">Vazio</span>
      </div>
    );
  }
  const ps = pneuStatusLabel[pneu.status];
  return (
    <div className="tire-slot-filled">
      <span className="label tire-slot-label">{position}</span>
      <span className="mono tire-slot-dim">{pneu.dimensao}</span>
      <span className={`pill ${ps.pill} tire-slot-pill`}>{ps.label}</span>
      <span className="tire-slot-vida">{pneu.vida_atual}a vida</span>
    </div>
  );
}
