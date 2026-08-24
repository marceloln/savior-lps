'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { mockFuncionariosDetail, mockAlocacoes, mockOcorrencias } from '@/lib/mock-data';
import type { FuncionarioDetail, FuncionarioStatus, Alocacao, Ocorrencia } from '@/lib/mock-data';

const funcaoPillCls: Record<string, string> = {
  Motorista: 'pill-green',
  Compras: 'pill-blue',
  'Auxiliar de Frota': 'pill-amber',
  Enfermeiro: 'pill-violet',
  'Técnico de Enfermagem': 'pill-violet',
  Médico: 'pill-red',
  Administrativo: 'pill-slate',
};

function isHealthPro(funcao: string) {
  return funcao === 'Médico' || funcao === 'Enfermeiro' || funcao === 'Técnico de Enfermagem';
}

const statusPillCls: Record<FuncionarioStatus, { cls: string; label: string }> = {
  ativo: { cls: 'pill-green', label: 'ATIVO' },
  ferias: { cls: 'pill-blue', label: 'FÉRIAS' },
  afastado: { cls: 'pill-amber', label: 'AFASTADO' },
  desligado: { cls: 'pill-red', label: 'DESLIGADO' },
};

const tipoPillCls: Record<string, { cls: string; label: string }> = {
  checklist: { cls: 'pill-blue', label: 'CHECKLIST' },
  multa: { cls: 'pill-red', label: 'MULTA' },
  atendimento: { cls: 'pill-green', label: 'ATENDIMENTO' },
  falta: { cls: 'pill-red', label: 'FALTA' },
  elogio: { cls: 'pill-green', label: 'ELOGIO' },
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
        <Link href="/equipe" className="back-link mb-4">
          <ArrowLeft size={14} /> Voltar
        </Link>
        <p className="text-muted text-md">Funcionário não encontrado.</p>
      </div>
    );
  }

  const alocacoes: Alocacao[] = mockAlocacoes[sofitId] ?? [];
  const ocorrencias: Ocorrencia[] = (mockOcorrencias[sofitId] ?? []).sort((a, b) => b.data.localeCompare(a.data));
  const alocacaoAtual = alocacoes.find((a) => !a.data_fim);
  const fpCls = funcaoPillCls[emp.funcao] ?? 'pill-slate';
  const sp = statusPillCls[emp.status] ?? statusPillCls.ativo;
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
        <Link href="/equipe" className="back-link">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Voltar para Equipe
        </Link>
      </div>
      <p className="breadcrumb mb-2">
        EQUIPE / {emp.nome.toUpperCase()}
      </p>

      {/* Hero */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="detail-name">{emp.nome}</h1>
          <span className={`pill ${fpCls}`}>{emp.funcao}</span>
          {emp.especialidade && (
            <span className={`pill ${fpCls} opacity-80`}>{emp.especialidade}</span>
          )}
          <span className={`pill ${sp.cls}`}>{sp.label}</span>
        </div>
        <p className="text-muted text-base">
          {emp.filial ?? 'Filial não informada'}
          {emp.centro_custo ? ` \u00B7 ${emp.centro_custo}` : ''}
        </p>
      </div>

      {/* Stats row — all standardized to 20px */}
      <div className="kpi-row mb-5">
        <div className="kpi-card">
          <div className="kpi-label">Matrícula</div>
          <div className="kpi-value-lg mono">{emp.matricula ?? '\u2014'}</div>
        </div>
        {isHealthPro(emp.funcao) ? (
          <div className="kpi-card">
            <div className="kpi-label">{emp.conselho_tipo === 'CRM' ? 'CRM' : 'COREN'}</div>
            <div className="kpi-value-lg mono">{emp.conselho_numero ?? '\u2014'}</div>
            {emp.conselho_uf && (
              <div className="kpi-sub mono text-muted">
                {emp.conselho_uf}
              </div>
            )}
          </div>
        ) : (
          <div className="kpi-card">
            <div className="kpi-label">CNH</div>
            <div className="kpi-value-lg mono">{emp.cnh ?? '\u2014'}</div>
            {emp.cnh_vencimento && (
              <div className={`kpi-sub mono ${cnhExpiring ? 'text-red fw-700' : 'text-muted'}`}>
                Venc. {fmtDateBR(emp.cnh_vencimento!)}
              </div>
            )}
          </div>
        )}
        <div className="kpi-card">
          <div className="kpi-label">Alocação atual</div>
          {alocacaoAtual ? (
            <>
              <div className="kpi-value-lg">VTR {alocacaoAtual.vtr_nome}</div>
              <div className="kpi-sub mono">{alocacaoAtual.vtr_placa}</div>
            </>
          ) : (
            <div className="kpi-value-sm text-muted2">Sem alocação</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Região</div>
          <div className="kpi-value-lg">{emp.regiao}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-5">
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
          <div key={i} className={`cols2 ${i < rows.length - 1 ? 'mb-4 pb-4 border-b-line' : ''}`}>
            {row.map((cell, j) => (
              <div key={j}>
                <div className="label mb-1">{cell.label}</div>
                <div className={`text-md fw-500 ${cell.alert ? 'text-red' : 'text-ink'} ${cell.mono ? 'mono' : ''}`}>
                  {cell.value}
                  {cell.alert && (
                    <span className="pill pill-red ml-2">VENCE EM BREVE</span>
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
          <p className="text-muted text-md">Sem alocações registradas</p>
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
              <div key={i} className="bot-tl-step py-2.5">
                <div className={`bot-tl-dot ${isCurrent ? 'current' : 'done'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display fw-700 text-lg text-ink">
                      VTR {a.vtr_nome}
                    </span>
                    <span className="mono text-xs text-muted">{a.vtr_placa}</span>
                    {isCurrent && <span className="pill pill-green">Atual</span>}
                  </div>
                  <div className="text-base text-ink2 mb-0.5">
                    Turno: {a.turno}
                  </div>
                  <div className="mono text-xs text-muted2">
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
          <p className="text-muted text-md">Sem ocorrências registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-body flex-col">
        {ocorrencias.map((o, i) => {
          const tp = tipoPillCls[o.tipo] ?? { cls: 'pill-slate', label: o.tipo.toUpperCase() };
          return (
            <div
              key={i}
              className={`flex items-start gap-3 py-3 ${i < ocorrencias.length - 1 ? 'border-b-line' : ''}`}
            >
              <span className="mono text-sm text-muted2 shrink-0 min-w-[80px] pt-0.5">
                {fmtDateBR(o.data)}
              </span>
              <span className={`pill ${tp.cls} shrink-0`}>
                {tp.label}
              </span>
              <span className="text-base-1 text-ink leading-snug">
                {o.descricao}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
