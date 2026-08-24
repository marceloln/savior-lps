'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { mockFuncionariosDetail, mockAlocacoes, mockOcorrencias } from '@/lib/mock-data';
import type { FuncionarioDetail, FuncionarioStatus, Alocacao, Ocorrencia } from '@/lib/mock-data';

const funcaoPill: Record<string, { bg: string; color: string }> = {
  Motorista: { bg: 'var(--green-l)', color: 'var(--green-d)' },
  Compras: { bg: 'var(--blue-l)', color: 'var(--blue)' },
  'Auxiliar de Frota': { bg: 'var(--amber-l)', color: 'var(--amber)' },
  Enfermeiro: { bg: 'var(--violet-l)', color: 'var(--violet)' },
  'Técnico de Enfermagem': { bg: 'var(--violet-l)', color: 'var(--violet)' },
  Médico: { bg: 'var(--red-l)', color: 'var(--red)' },
  Administrativo: { bg: 'var(--slate-l)', color: 'var(--slate)' },
};

function isHealthPro(funcao: string) {
  return funcao === 'Médico' || funcao === 'Enfermeiro' || funcao === 'Técnico de Enfermagem';
}

const statusPill: Record<FuncionarioStatus, { bg: string; color: string; label: string }> = {
  ativo: { bg: 'var(--green-l)', color: 'var(--green-d)', label: 'ATIVO' },
  ferias: { bg: 'var(--blue-l)', color: 'var(--blue)', label: 'FÉRIAS' },
  afastado: { bg: 'var(--amber-l)', color: 'var(--amber)', label: 'AFASTADO' },
  desligado: { bg: 'var(--red-l)', color: 'var(--red)', label: 'DESLIGADO' },
};

const tipoPill: Record<string, { bg: string; color: string; label: string }> = {
  checklist: { bg: 'var(--blue-l)', color: 'var(--blue)', label: 'CHECKLIST' },
  multa: { bg: 'var(--red-l)', color: 'var(--red)', label: 'MULTA' },
  atendimento: { bg: 'var(--green-l)', color: 'var(--green-d)', label: 'ATENDIMENTO' },
  falta: { bg: 'var(--red-l)', color: 'var(--red)', label: 'FALTA' },
  elogio: { bg: 'var(--green-l)', color: 'var(--green-d)', label: 'ELOGIO' },
};

function isCnhExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  return new Date(dateStr) < sixMonths;
}

function fmtDateBR(d: string): string {
  return new Date(d).toLocaleDateString('pt-BR');
}

export default function FuncionarioDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'info' | 'alocacoes' | 'historico'>('info');

  const sofitId = Number(params.id);
  const emp = mockFuncionariosDetail.find((e) => e.sofit_id === sofitId);

  if (!emp) {
    return (
      <div>
        <Link href="/equipe" className="btn btn-outline mb-4" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Voltar
        </Link>
        <p className="text-muted" style={{ fontSize: '13px' }}>Funcionário não encontrado.</p>
      </div>
    );
  }

  const alocacoes: Alocacao[] = mockAlocacoes[sofitId] ?? [];
  const ocorrencias: Ocorrencia[] = (mockOcorrencias[sofitId] ?? []).sort((a, b) => b.data.localeCompare(a.data));
  const alocacaoAtual = alocacoes.find((a) => !a.data_fim);
  const fp = funcaoPill[emp.funcao] ?? { bg: 'var(--slate-l)', color: 'var(--slate)' };
  const sp = statusPill[emp.status] ?? statusPill.ativo;
  const cnhExpiring = isCnhExpiringSoon(emp.cnh_vencimento);

  const tabs = [
    { key: 'info' as const, label: 'Informações' },
    { key: 'alocacoes' as const, label: 'Alocações' },
    { key: 'historico' as const, label: 'Histórico' },
  ];

  return (
    <div>
      {/* Back + Breadcrumb */}
      <div className="mb-4 flex items-center gap-3">
        <Link href="/equipe" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12.5px', textDecoration: 'none', color: 'var(--muted)' }}>
          <ArrowLeft size={14} strokeWidth={1.5} />
          Voltar para Equipe
        </Link>
      </div>
      <p className="breadcrumb" style={{ marginBottom: 8 }}>
        EQUIPE / {emp.nome.toUpperCase()}
      </p>

      {/* Hero */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="page-title" style={{ fontSize: '28px' }}>{emp.nome}</h1>
          <span className="pill" style={{ background: fp.bg, color: fp.color }}>{emp.funcao}</span>
          {emp.especialidade && (
            <span className="pill" style={{ background: fp.bg, color: fp.color, opacity: 0.8 }}>{emp.especialidade}</span>
          )}
          <span className="pill" style={{ background: sp.bg, color: sp.color }}>{sp.label}</span>
        </div>
        <p className="text-muted" style={{ fontSize: '12px' }}>
          {emp.filial ?? 'Filial não informada'}
          {emp.centro_custo ? ` \u00B7 ${emp.centro_custo}` : ''}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="mb-5">
        <div className="kpi-card">
          <div className="kpi-label">Matrícula</div>
          <div className="kpi-value mono" style={{ fontSize: '18px' }}>{emp.matricula ?? '\u2014'}</div>
        </div>
        {isHealthPro(emp.funcao) ? (
          <div className="kpi-card">
            <div className="kpi-label">{emp.conselho_tipo === 'CRM' ? 'CRM' : 'COREN'}</div>
            <div className="kpi-value mono" style={{ fontSize: '16px' }}>{emp.conselho_numero ?? '\u2014'}</div>
            {emp.conselho_uf && (
              <div className="kpi-sub mono" style={{ color: 'var(--muted)' }}>
                {emp.conselho_uf}
              </div>
            )}
          </div>
        ) : (
          <div className="kpi-card">
            <div className="kpi-label">CNH</div>
            <div className="kpi-value mono" style={{ fontSize: '16px' }}>{emp.cnh ?? '\u2014'}</div>
            {emp.cnh_vencimento && (
              <div className="kpi-sub mono" style={{ color: cnhExpiring ? 'var(--red)' : 'var(--muted)', fontWeight: cnhExpiring ? 700 : 400 }}>
                Venc. {fmtDateBR(emp.cnh_vencimento!)}
              </div>
            )}
          </div>
        )}
        <div className="kpi-card">
          <div className="kpi-label">Alocação atual</div>
          {alocacaoAtual ? (
            <>
              <div className="kpi-value" style={{ fontSize: '18px' }}>VTR {alocacaoAtual.vtr_nome}</div>
              <div className="kpi-sub mono">{alocacaoAtual.vtr_placa}</div>
            </>
          ) : (
            <div className="kpi-value text-muted2" style={{ fontSize: '14px' }}>Sem alocação</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Região</div>
          <div className="kpi-value" style={{ fontSize: '22px' }}>{emp.regiao}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 20, display: 'flex', gap: 0 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && <TabInfo emp={emp} cnhExpiring={cnhExpiring} />}
      {activeTab === 'alocacoes' && <TabAlocacoes alocacoes={alocacoes} />}
      {activeTab === 'historico' && <TabHistorico ocorrencias={ocorrencias} />}
    </div>
  );
}

/* ─── Tab: Informações ──────────────────────────────────────────── */

function TabInfo({ emp, cnhExpiring }: { emp: FuncionarioDetail; cnhExpiring: boolean }) {
  interface InfoCell {
    label: string;
    value: string;
    mono?: boolean;
    alert?: boolean;
  }

  const healthPro = isHealthPro(emp.funcao);

  const rows: InfoCell[][] = [
    [
      { label: 'Nome', value: emp.nome },
      healthPro
        ? { label: emp.conselho_tipo === 'CRM' ? 'CRM' : 'COREN', value: emp.conselho_numero ?? '\u2014', mono: true }
        : { label: 'CNH', value: emp.cnh ?? '\u2014', mono: true },
    ],
    healthPro
      ? [
          { label: 'Matrícula', value: emp.matricula ?? '\u2014', mono: true },
          { label: 'UF do Conselho', value: emp.conselho_uf ?? '\u2014' },
        ]
      : [
          { label: 'Matrícula', value: emp.matricula ?? '\u2014', mono: true },
          { label: 'CNH Vencimento', value: emp.cnh_vencimento ? fmtDateBR(emp.cnh_vencimento) : '\u2014', mono: true, alert: cnhExpiring },
        ],
    healthPro
      ? [
          { label: 'Especialidade', value: emp.especialidade ?? '\u2014' },
          { label: 'Validade do Conselho', value: emp.conselho_validade ?? '\u2014', mono: true },
        ]
      : [
          { label: 'Função', value: emp.funcao },
          { label: 'Email', value: emp.email ?? '\u2014' },
        ],
    [
      { label: healthPro ? 'Função' : 'Filial', value: healthPro ? emp.funcao : (emp.filial ?? '\u2014') },
      { label: healthPro ? 'Email' : 'SofitView ID', value: healthPro ? (emp.email ?? '\u2014') : String(emp.sofit_id), mono: !healthPro },
    ],
    [
      { label: healthPro ? 'Filial' : 'Centro de Custo', value: healthPro ? (emp.filial ?? '\u2014') : (emp.centro_custo ?? '\u2014') },
      { label: healthPro ? 'SofitView ID' : 'Região', value: healthPro ? String(emp.sofit_id) : emp.regiao, mono: healthPro },
    ],
  ];

  return (
    <div className="panel">
      <div className="panel-body">
        {rows.map((row, i) => (
          <div key={i} className="cols2" style={{ marginBottom: i < rows.length - 1 ? 16 : 0, paddingBottom: i < rows.length - 1 ? 16 : 0, borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            {row.map((cell, j) => (
              <div key={j}>
                <div className="label" style={{ marginBottom: 4 }}>{cell.label}</div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: cell.alert ? 'var(--red)' : 'var(--ink)',
                  fontFamily: cell.mono ? 'var(--mono)' : 'var(--sans)',
                }}>
                  {cell.value}
                  {cell.alert && (
                    <span className="pill pill-red" style={{ marginLeft: 8 }}>VENCE EM BREVE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tab: Alocações ──────────────────────────────────────────── */

function TabAlocacoes({ alocacoes }: { alocacoes: Alocacao[] }) {
  if (alocacoes.length === 0) {
    return (
      <div className="panel">
        <div className="panel-body">
          <p className="text-muted" style={{ fontSize: '13px' }}>Sem alocações registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-body">
        <div className="bot-timeline">
          {alocacoes.map((a, i) => {
            const isCurrent = !a.data_fim;
            return (
              <div key={i} className="bot-tl-step" style={{ padding: '10px 0' }}>
                <div className={`bot-tl-dot ${isCurrent ? 'current' : 'done'}`} style={{ top: 14 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                      VTR {a.vtr_nome}
                    </span>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--muted)' }}>{a.vtr_placa}</span>
                    {isCurrent && <span className="pill pill-green">Atual</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink2)', marginBottom: 2 }}>
                    Turno: {a.turno}
                  </div>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--muted2)' }}>
                    {isCurrent
                      ? `Desde ${fmtDateBR(a.data_inicio)}`
                      : `${fmtDateBR(a.data_inicio)} até ${fmtDateBR(a.data_fim!)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Histórico ──────────────────────────────────────────── */

function TabHistorico({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  if (ocorrencias.length === 0) {
    return (
      <div className="panel">
        <div className="panel-body">
          <p className="text-muted" style={{ fontSize: '13px' }}>Sem ocorrências registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ocorrencias.map((o, i) => {
          const tp = tipoPill[o.tipo] ?? { bg: 'var(--slate-l)', color: 'var(--slate)', label: o.tipo.toUpperCase() };
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 0',
                borderBottom: i < ocorrencias.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <span className="mono" style={{ fontSize: '11px', color: 'var(--muted2)', flexShrink: 0, minWidth: 80, paddingTop: 2 }}>
                {fmtDateBR(o.data)}
              </span>
              <span className="pill" style={{ background: tp.bg, color: tp.color, flexShrink: 0 }}>
                {tp.label}
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.4 }}>
                {o.descricao}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
