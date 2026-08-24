'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  MessageCircle, Phone, Globe, Mail, PenLine, MapPin, DollarSign, Truck, Send,
  User, Bot, AlertTriangle, CheckCircle2, Clock, Plus, Search, ChevronDown,
  X, Activity, CreditCard, ArrowRight,
} from 'lucide-react';
import {
  mockChamados, mockBotEvents, mockBotActionSteps, mockBotChatMessages,
  statusPill, statusLabel, servicoPill, prioridadePill, canalConfig, mockVtrs, vtrStats,
  slaLevel, slaColors,
} from '@/lib/mock-data';
import type { BotEvent, Chamado, ChatMessage } from '@/lib/mock-data';
import { SlideOver } from '@/components/ui/slide-over';
import { useToast } from '@/components/ui/toast';

// ── Helpers ──────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function canalIcon(canal: string) {
  switch (canal) {
    case 'whatsapp': return <MessageCircle size={11} />;
    case 'telefone': return <Phone size={11} />;
    case 'site': return <Globe size={11} />;
    case 'email': return <Mail size={11} />;
    default: return <PenLine size={11} />;
  }
}

function canalClass(canal: string) {
  return `ch-${canal}`;
}

function slaDisplay(chamado: Chamado): { text: string; cls: string } {
  if (chamado.status === 'concluido' || chamado.status === 'cancelado') {
    return { text: '', cls: '' };
  }
  if (chamado.eta_minutos && (chamado.status === 'em_transito' || chamado.status === 'despacho')) {
    return { text: `${chamado.eta_minutos} min`, cls: 'sla-route' };
  }
  const level = slaLevel(chamado.sla_minutos);
  const clsMap = { ok: 'sla-ok', warn: 'sla-warn', crit: 'sla-crit' };
  return { text: `${chamado.sla_minutos} min`, cls: clsMap[level] };
}

type PriorityGroup = 'urgente' | 'em_andamento' | 'aguardando' | 'concluido';

function chamadoGroup(c: Chamado): PriorityGroup {
  if (c.status === 'concluido' || c.status === 'cancelado') return 'concluido';
  if (c.prioridade === 'urgente' || c.status === 'aberto') return 'urgente';
  if (['em_transito', 'despacho', 'em_transporte', 'no_local'].includes(c.status)) return 'em_andamento';
  return 'aguardando';
}

const groupConfig: Record<PriorityGroup, { label: string; sqClass: string; nameClass: string }> = {
  urgente: { label: 'Urgente', sqClass: 'grp-sq-red', nameClass: 'grp-name-red' },
  em_andamento: { label: 'Em andamento', sqClass: 'grp-sq-amber', nameClass: 'grp-name-amber' },
  aguardando: { label: 'Aguardando', sqClass: 'grp-sq-blue', nameClass: 'grp-name-blue' },
  concluido: { label: 'Concluídos', sqClass: 'grp-sq-green', nameClass: 'grp-name-green' },
};

const groupOrder: PriorityGroup[] = ['urgente', 'em_andamento', 'aguardando', 'concluido'];

function getEventIcon(type: BotEvent['type']): string {
  switch (type) {
    case 'completed': return '\u2705';
    case 'intervention': return '\u26A0\uFE0F';
    case 'payment': return '\uD83D\uDCB0';
    default: return '\uD83E\uDD16';
  }
}

function getEventClass(type: BotEvent['type']): string {
  if (type === 'intervention') return 'intervention';
  if (type === 'completed') return 'success';
  return '';
}

type WorkspaceTab = 'atendimento' | 'historico' | 'financeiro';
type InboxSegment = 'chamados' | 'bot_feed';

// ── KPIs ─────────────────────────────────────────────────────────────

const chamadosHoje = mockChamados.length;
const emAndamento = mockChamados.filter(c => !['concluido', 'cancelado'].includes(c.status)).length;
const tempoMedio = 17; // minutes mock
const botAutoRate = Math.round((mockChamados.filter(c => c.bot_managed).length / chamadosHoje) * 100);

// ── Urgent timer hook ────────────────────────────────────────────────

function useUrgentTimer(chamado: Chamado | null) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!chamado || chamado.prioridade !== 'urgente' || chamado.status !== 'aberto') {
      setElapsed('');
      return;
    }

    function updateTimer() {
      const now = Date.now();
      const created = new Date(chamado!.created_at).getTime();
      const diffSec = Math.floor((now - created) / 1000);
      const min = Math.floor(diffSec / 60);
      const sec = diffSec % 60;
      setElapsed(`${min}m ${sec.toString().padStart(2, '0')}s`);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [chamado?.id, chamado?.prioridade, chamado?.status]);

  return elapsed;
}

// ── Inbox timer component ────────────────────────────────────────────

function InboxUrgentTimer({ chamado }: { chamado: Chamado }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (chamado.prioridade !== 'urgente' || chamado.status !== 'aberto') return;

    function update() {
      const now = Date.now();
      const created = new Date(chamado.created_at).getTime();
      const diffSec = Math.floor((now - created) / 1000);
      const min = Math.floor(diffSec / 60);
      const sec = diffSec % 60;
      setElapsed(`${min}m ${sec.toString().padStart(2, '0')}s`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [chamado.id, chamado.prioridade, chamado.status]);

  if (!elapsed) return null;
  return <span className="urgent-timer">{elapsed}</span>;
}

// ── Component ────────────────────────────────────────────────────────

export default function CentralPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [segment, setSegment] = useState<InboxSegment>('chamados');
  const [wsTab, setWsTab] = useState<WorkspaceTab>('atendimento');
  const [interventionMode, setInterventionMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<PriorityGroup>>(new Set(['concluido']));
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [showVtrPicker, setShowVtrPicker] = useState(false);

  const { showToast } = useToast();

  const selected = selectedId ? mockChamados.find(c => c.id === selectedId) ?? null : null;
  const selectedSteps = selected ? (mockBotActionSteps[selected.id] ?? []) : [];
  const selectedChat = selected ? (mockBotChatMessages[selected.id] ?? []) : [];
  const sv = selected ? servicoPill[selected.servico] : null;

  // Filter chamados by search
  const filteredChamados = useMemo(() => {
    if (!searchQuery.trim()) return mockChamados;
    const q = searchQuery.toLowerCase();
    return mockChamados.filter(c =>
      c.paciente_nome.toLowerCase().includes(q) ||
      c.numero.toString().includes(q) ||
      c.solicitante_nome.toLowerCase().includes(q) ||
      c.origem.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group chamados
  const grouped = useMemo(() => {
    const groups: Record<PriorityGroup, Chamado[]> = { urgente: [], em_andamento: [], aguardando: [], concluido: [] };
    filteredChamados.forEach(c => groups[chamadoGroup(c)].push(c));
    return groups;
  }, [filteredChamados]);

  // Urgent/open chamados awaiting assignment
  const urgentUnassigned = useMemo(() => {
    return mockChamados.filter(c =>
      (c.prioridade === 'urgente' || c.status === 'aberto') &&
      c.status !== 'concluido' && c.status !== 'cancelado' && !c.atendente
    );
  }, []);

  const toggleGroup = (g: PriorityGroup) => {
    const next = new Set(collapsedGroups);
    if (next.has(g)) next.delete(g); else next.add(g);
    setCollapsedGroups(next);
  };

  const handleSelectChamado = (id: string) => {
    setSelectedId(id);
    setInterventionMode(false);
    setWsTab('atendimento');
    setShowVtrPicker(false);
  };

  const handleEventClick = (event: BotEvent) => {
    setSelectedId(event.chamado_id);
    setInterventionMode(false);
    setSegment('chamados');
  };

  // Available VTRs for dashboard and VTR picker
  const availableVtrs = mockVtrs.filter(v => v.status === 'disponivel').slice(0, 6);
  const pickerVtrs = mockVtrs.filter(v => v.status === 'disponivel').slice(0, 5);

  // Action handlers with toast
  const handleAssumir = () => {
    setInterventionMode(true);
    showToast('Conversa assumida. Você está no controle.', 'success');
  };

  const handleDevolver = () => {
    setInterventionMode(false);
    showToast('Conversa devolvida ao bot.', 'info');
  };

  const handleDespachar = () => {
    showToast('VTR despachada com sucesso.', 'success');
  };

  const handleEnviarCotacao = () => {
    showToast('Cotação enviada ao solicitante.', 'success');
  };

  const handleCancelar = () => {
    showToast('Chamado cancelado.', 'error');
  };

  const handleCriarChamado = () => {
    const nextNum = Math.max(...mockChamados.map(c => c.numero)) + 1;
    setShowSlideOver(false);
    showToast(`Chamado #${nextNum} criado.`, 'success');
  };

  const handleSelectVtr = (vtr: typeof mockVtrs[0]) => {
    setShowVtrPicker(false);
    showToast(`VTR ${vtr.nome} (${vtr.placa}) atribuída.`, 'success');
  };

  return (
    <div className="central-grid">
      {/* ════════ LEFT: Inbox ════════ */}
      <div className="central-inbox">
        {/* Header — Line 1: Title + live dot + count */}
        <div className="inbox-header-top">
          <div className="flex items-center gap-[9px] mb-[10px]">
            <h2 className="font-display text-[19px] font-bold tracking-display">
              Central
            </h2>
            <span className="live-dot" />
            <span className="count-badge">{chamadosHoje}</span>
          </div>

          {/* Line 2: Search + Novo button */}
          <div className="flex items-center gap-2 mb-[10px]">
            <div className="flex-1 relative">
              <Search size={13} className="inbox-search-icon" />
              <input
                className="inbox-search pl-[30px]"
                placeholder="/ Buscar paciente, número, origem..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-sm btn-sm-green" onClick={() => setShowSlideOver(true)}>
              <Plus size={12} /> Novo
            </button>
          </div>

          {/* Segment toggle */}
          <div className="segment-toggle mb-[10px]">
            <button className={segment === 'chamados' ? 'seg-active' : ''} onClick={() => setSegment('chamados')}>
              Chamados
            </button>
            <button className={segment === 'bot_feed' ? 'seg-active' : ''} onClick={() => setSegment('bot_feed')}>
              Bot feed
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-[4px_0_24px]" >
          {segment === 'chamados' ? (
            /* ── Chamado inbox ── */
            <>
              {groupOrder.map(g => {
                const items = grouped[g];
                if (items.length === 0) return null;
                const cfg = groupConfig[g];
                const isCollapsed = collapsedGroups.has(g);

                return (
                  <div key={g} className={`grp${isCollapsed ? ' collapsed' : ''}`}>
                    <div className="grp-h" onClick={() => toggleGroup(g)}>
                      <span className={`grp-sq ${cfg.sqClass}`} />
                      <span className={`grp-name ${cfg.nameClass}`}>{cfg.label}</span>
                      <span className="grp-count">{items.length}</span>
                      <span className="grp-chev"><ChevronDown size={13} /></span>
                    </div>
                    <div className="grp-items px-2">
                      {items.map(c => {
                        const isSel = selectedId === c.id;
                        const needsIntervention = c.status === 'aberto' && c.prioridade === 'urgente';
                        const sla = slaDisplay(c);
                        const svPill = servicoPill[c.servico];

                        return (
                          <button
                            key={c.id}
                            className={`qi${isSel ? ' sel' : ''}${needsIntervention ? ' crit' : ''}`}
                            onClick={() => handleSelectChamado(c.id)}
                          >
                            <div className="qi-top">
                              <span className={`channel-icon ${canalClass(c.canal)}`}>
                                {canalIcon(c.canal)}
                              </span>
                              <span className="qi-name">{c.paciente_nome}</span>
                              {needsIntervention && <InboxUrgentTimer chamado={c} />}
                              {sla.text && (
                                <span className={`sla-badge ${sla.cls}`}>
                                  {sla.cls === 'sla-route' && <span className="live-dot sla-dot-sm" />}
                                  {sla.cls === 'sla-crit' && <span className="crit-dot crit-dot-sm" />}
                                  {sla.text}
                                </span>
                              )}
                            </div>
                            <div className="qi-bot">
                              <span className={`pill ${svPill.pill}`}>{svPill.label}</span>
                              <span className="qi-svc">{c.origem.split(' — ')[0]}</span>
                            </div>
                            <div className="qi-bot gap-[5px]">
                              <span className="qi-id">{canalConfig[c.canal].label}</span>
                              <span className="qi-id">{'\u00B7'}</span>
                              <span className="qi-id">
                                {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {c.valor_cotado && (
                                <>
                                  <span className="qi-id">{'\u00B7'}</span>
                                  <span className="qi-value">{formatCurrency(c.valor_cotado)}</span>
                                </>
                              )}
                              {c.bot_managed && <span className="text-xs">{'\uD83E\uDD16'}</span>}
                              {!c.bot_managed && <span className="text-xs">{'\uD83D\uDCDE'}</span>}
                            </div>
                            {needsIntervention && !isSel && (
                              <button
                                className="assume-btn mt-1 self-start"
                                onClick={e => { e.stopPropagation(); handleSelectChamado(c.id); handleAssumir(); }}
                              >
                                Assumir
                              </button>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            /* ── Bot feed ── */
            <>
              {mockBotEvents.map(event => {
                const isSelected = selectedId === event.chamado_id;
                return (
                  <div
                    key={event.id}
                    className={`feed-item ${getEventClass(event.type)} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="feed-time">{event.timestamp}</span>
                      <span className="feed-bot-icon">{getEventIcon(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="feed-desc">{event.description}</p>
                        {event.detail && (
                          <p className="feed-detail whitespace-pre-line">{event.detail}</p>
                        )}
                      </div>
                      {event.type === 'intervention' && !isSelected && (
                        <button
                          className="assume-btn"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedId(event.chamado_id);
                            handleAssumir();
                          }}
                        >
                          Assumir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ════════ RIGHT: Workspace ════════ */}
      <div className="central-workspace">
        {selected ? (
          <>
            {/* ── Workspace header ── */}
            <div className="ws-head">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-[9px] mb-[7px]">
                    <span className="mono text-sm fw-600 text-muted">
                      #{selected.numero}
                    </span>
                    {sv && <span className={`pill ${sv.pill}`}>{sv.label}</span>}
                    <span className={`pill ${statusPill[selected.status]}`}>{statusLabel[selected.status]}</span>
                    {selected.bot_managed ? (
                      <span className="pill pill-green ml-auto">
                        <Bot size={10} /> BOT GERENCIANDO
                      </span>
                    ) : (
                      <span className="pill pill-blue ml-auto">
                        <Phone size={10} /> ATENDIMENTO DIRETO
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-[22px] font-bold tracking-tight leading-none">
                    {selected.paciente_nome}
                  </h2>
                  <p className="ws-patient-meta">
                    {selected.paciente_idade > 0 && <><b>{selected.paciente_idade} anos</b> {'\u00B7'} </>}
                    Solicitante: <b>{selected.solicitante_nome}</b>
                    {' '}{'\u00B7'} {canalConfig[selected.canal].label}
                    {selected.atendente && <> {'\u00B7'} Atendente: <b>{selected.atendente}</b></>}
                  </p>
                </div>

                {selected.eta_minutos && (
                  <div className="text-right shrink-0">
                    <p className={`font-display text-[28px] font-bold leading-[0.9] tracking-display ${
                      slaLevel(selected.eta_minutos) === 'ok' ? 'text-green' : slaLevel(selected.eta_minutos) === 'warn' ? 'text-amber' : 'text-red'
                    }`}>
                      {selected.eta_minutos}<span className="text-sm">min</span>
                    </p>
                    <p className="label mt-[5px]">ETA ESTIMADO</p>
                  </div>
                )}
              </div>

              {/* Functional tabs */}
              <div className="flex gap-1 mt-[14px]">
                {(['atendimento', 'historico', 'financeiro'] as WorkspaceTab[]).map(t => (
                  <button
                    key={t}
                    className={`tab ${wsTab === t ? 'tab-active' : ''}`}
                    onClick={() => setWsTab(t)}
                  >
                    {t === 'atendimento' ? 'Atendimento' : t === 'historico' ? 'Histórico' : 'Financeiro'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab content ── */}
            <div className="ws-body flex-1">
              {wsTab === 'atendimento' && (
                <>
                  <div className="grid grid-cols-[1.2fr_1fr] gap-[18px]">
                    {/* LEFT: Paciente + Trajeto + Serviço */}
                    <div className="flex flex-col gap-4">
                      {/* Paciente */}
                      <div className="panel p-[18px]">
                        <p className="label panel-label">PACIENTE</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-muted2" />
                            <span className="text-md fw-600">{selected.paciente_nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-muted2" />
                            <span className="mono text-base">{selected.paciente_telefone}</span>
                          </div>
                          {selected.paciente_idade > 0 && (
                            <div className="ws-info-row">
                              <span className="ws-key">Idade</span>
                              <span className="ws-val">{selected.paciente_idade} anos</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Trajeto */}
                      <div className="panel p-[18px]">
                        <p className="label panel-label">TRAJETO</p>
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <MapPin size={14} className="text-green shrink-0 mt-[2px]" />
                            <div>
                              <p className="label text-green mb-[2px]">ORIGEM</p>
                              <p className="text-base text-ink">{selected.origem}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <MapPin size={14} className="text-red shrink-0 mt-[2px]" />
                            <div>
                              <p className="label text-red mb-[2px]">DESTINO</p>
                              <p className="text-base text-ink">{selected.destino}</p>
                            </div>
                          </div>
                          {selected.distancia_km && (
                            <div className="flex gap-4 pt-[6px] border-t border-[var(--line)]">
                              <span className="mono text-sm text-muted">
                                {selected.distancia_km} km
                              </span>
                              {selected.eta_minutos && (
                                <span className="mono text-sm text-green-d">
                                  ETA {selected.eta_minutos} min
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Serviço */}
                      <div className="panel p-[18px]">
                        <p className="label panel-label">SERVIÇO</p>
                        <div className="flex flex-col gap-1">
                          <div className="ws-info-row">
                            <span className="ws-key">Tipo</span>
                            <span className="ws-val">{sv && <span className={`pill ${sv.pill}`}>{sv.label}</span>}</span>
                          </div>
                          {selected.valor_cotado && (
                            <div className="ws-info-row">
                              <span className="ws-key">Valor</span>
                              <span className="ws-val mono text-sm font-bold">{formatCurrency(selected.valor_cotado)}</span>
                            </div>
                          )}
                          <div className="ws-info-row">
                            <span className="ws-key">Pagamento</span>
                            <span className="ws-val">
                              <span className={`pill ${selected.pagamento_status === 'pago' ? 'pill-green' : selected.pagamento_status === 'aprovado' ? 'pill-blue' : 'pill-slate'}`}>
                                {selected.pagamento_status === 'pago' ? 'Pago' : selected.pagamento_status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: VTR + Ações + Bot timeline */}
                    <div className="flex flex-col gap-4">
                      {/* VTR */}
                      <div className="panel p-[18px]">
                        <p className="label panel-label">VTR ATRIBUÍDA</p>
                        {selected.vtr_placa ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Truck size={14} className="text-muted2" />
                              <span className="mono text-sm font-bold">{selected.vtr_placa}</span>
                              {selected.vtr_nome && <span className="pill pill-slate text-[7px]">VTR {selected.vtr_nome}</span>}
                            </div>
                            {selected.equipe && <p className="text-sm text-muted">{selected.equipe}</p>}
                            {selected.eta_minutos && (
                              <span className={`sla-badge ${slaLevel(selected.eta_minutos) === 'ok' ? 'sla-ok' : slaLevel(selected.eta_minutos) === 'warn' ? 'sla-warn' : 'sla-crit'} self-start`}>
                                <span className="live-dot sla-dot-sm" />
                                ETA {selected.eta_minutos} min
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-base text-muted2 mb-[10px]">Nenhuma VTR atribuída</p>
                            <button
                              className="btn btn-outline btn-outline-sm"
                              onClick={() => setShowVtrPicker(!showVtrPicker)}
                            >
                              <MapPin size={12} /> Selecionar VTR
                            </button>
                            {/* VTR picker dropdown */}
                            {showVtrPicker && (
                              <div className="vtr-picker">
                                {pickerVtrs.map(v => (
                                  <div
                                    key={v.id}
                                    className="table-row-click vtr-picker-row"
                                    onClick={() => handleSelectVtr(v)}
                                  >
                                    <span className="mono text-sm fw-700">{v.nome}</span>
                                    <span className="mono text-xs text-muted">{v.placa}</span>
                                    <span className={`pill ${v.tipo === 'uti' ? 'pill-red' : v.tipo === 'moto' ? 'pill-amber' : 'pill-green'} text-[7px] ml-auto`}>
                                      {v.tipo.toUpperCase()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="panel p-[18px]">
                        <p className="label panel-label">AÇÕES</p>
                        <div className="action-panel">
                          {selected.bot_managed ? (
                            <>
                              {interventionMode ? (
                                <button className="btn btn-outline action-btn-inner" onClick={handleDevolver}>
                                  <Bot size={14} /> Devolver ao bot
                                </button>
                              ) : (
                                <button className="btn btn-outline action-btn-inner" onClick={handleAssumir}>
                                  <AlertTriangle size={14} /> Assumir conversa
                                </button>
                              )}
                              {selected.status === 'aprovado' && (
                                <button className="btn btn-green action-btn-inner" onClick={handleDespachar}>
                                  <CheckCircle2 size={14} /> Aprovar despacho
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {!selected.valor_cotado && (
                                <button className="btn btn-green action-btn-inner" onClick={handleEnviarCotacao}>
                                  <DollarSign size={14} /> Enviar cotação
                                </button>
                              )}
                              {selected.vtr_placa && selected.status !== 'em_transito' && selected.status !== 'concluido' && (
                                <button className="btn btn-green action-btn-inner" onClick={handleDespachar}>
                                  <Truck size={14} /> Despachar
                                </button>
                              )}
                              <button className="btn btn-outline action-btn-inner action-btn-cancel" onClick={handleCancelar}>
                                <X size={14} /> Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bot timeline (only for bot-managed) */}
                      {selected.bot_managed && selectedSteps.length > 0 && (
                        <div className="panel p-[18px]">
                          <p className="label panel-label">
                            <Bot size={11} className="inline align-middle mr-1" />
                            TIMELINE DO BOT
                          </p>
                          <div className="bot-timeline">
                            {selectedSteps.map((step, i) => {
                              const isFailed = step.action.startsWith('FALHA');
                              const dotClass = step.current ? 'current' : isFailed ? 'failed' : 'done';
                              const actionClass = step.current ? 'current' : isFailed ? 'failed' : '';
                              return (
                                <div key={i} className="bot-tl-step">
                                  <span className={`bot-tl-dot ${dotClass}`} />
                                  <span className="bot-tl-time">{step.time}</span>
                                  <span className={`bot-tl-action ${actionClass}`}>{step.action}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat section below */}
                  {(selected.canal === 'whatsapp' || selected.canal === 'site') && (
                    <div className="panel mt-[18px] overflow-hidden p-0">
                      <div className="panel-header flex items-center gap-2">
                        <MessageCircle size={14} className="text-green" />
                        <span className="panel-title">WhatsApp</span>
                        {selected.bot_managed && !interventionMode && (
                          <span className="pill pill-green ml-auto text-[7px]"><Bot size={9} /> BOT ATIVO</span>
                        )}
                        {interventionMode && (
                          <span className="pill pill-red ml-auto text-[7px]">SUPERVISORA</span>
                        )}
                      </div>
                      <div className="chat p-[14px_16px] max-h-[300px] overflow-y-auto">
                        {selectedChat.length > 0 ? (
                          selectedChat.map(msg => (
                            <div key={msg.id} className={msg.sender === 'operator' ? 'chat-bot' : 'chat-client'}>
                              <p className="whitespace-pre-line">{msg.text}</p>
                              <p className="cmsg-time">{msg.time}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-base text-muted2 text-center py-5">
                            Sem conversa vinculada
                          </p>
                        )}
                        {interventionMode && (
                          <div className="intervention-banner">
                            Supervisora assumiu a conversa
                          </div>
                        )}
                      </div>

                      {interventionMode && (
                        <div className="composer px-4 pb-[14px]">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <button className="quick-reply">Confirmar chegada</button>
                            <button className="quick-reply">Enviar cotação</button>
                            <button className="quick-reply">Atualizar ETA</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              className="chat-input"
                              placeholder="Responder como supervisora..."
                              value={chatInput}
                              onChange={e => setChatInput(e.target.value)}
                            />
                            <button className="chat-send"><Send size={17} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {wsTab === 'historico' && (
                <div className="panel p-[18px]">
                  <p className="label panel-label">HISTÓRICO DE EVENTOS</p>
                  {selectedSteps.length > 0 ? (
                    <div className="bot-timeline">
                      {selectedSteps.map((step, i) => {
                        const isFailed = step.action.startsWith('FALHA');
                        const dotClass = step.current ? 'current' : isFailed ? 'failed' : 'done';
                        const actionClass = step.current ? 'current' : isFailed ? 'failed' : '';
                        return (
                          <div key={i} className="bot-tl-step">
                            <span className={`bot-tl-dot ${dotClass}`} />
                            <span className="bot-tl-time">{step.time}</span>
                            <span className={`bot-tl-action ${actionClass}`}>
                              {step.action}
                              <span className="tl-actor">
                                {selected.bot_managed ? 'Bot' : selected.atendente ?? 'Atendente'}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-base text-muted2">Nenhum evento registrado</p>
                  )}
                </div>
              )}

              {wsTab === 'financeiro' && (
                <div className="panel p-[18px]">
                  <p className="label panel-label">FINANCEIRO</p>
                  <div className="flex flex-col gap-1">
                    <div className="ws-info-row">
                      <span className="ws-key">Valor cotado</span>
                      <span className="ws-val mono ws-val-lg">
                        {selected.valor_cotado ? formatCurrency(selected.valor_cotado) : '\u2014'}
                      </span>
                    </div>
                    <div className="ws-info-row">
                      <span className="ws-key">Desconto</span>
                      <span className="ws-val mono">{'\u2014'}</span>
                    </div>
                    <div className="ws-info-row">
                      <span className="ws-key">Valor final</span>
                      <span className="ws-val mono ws-val-green">
                        {selected.valor_cotado ? formatCurrency(selected.valor_cotado) : '\u2014'}
                      </span>
                    </div>
                    <div className="ws-info-row">
                      <span className="ws-key">Status pagamento</span>
                      <span className="ws-val">
                        <span className={`pill ${selected.pagamento_status === 'pago' ? 'pill-green' : selected.pagamento_status === 'aprovado' ? 'pill-blue' : 'pill-slate'}`}>
                          {selected.pagamento_status === 'pago' ? 'Pago' : selected.pagamento_status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                        </span>
                      </span>
                    </div>
                    {selected.pagamento_status === 'pendente' && (
                      <div className="payment-placeholder">
                        <CreditCard size={20} className="payment-placeholder-icon" />
                        <p className="payment-placeholder-text">
                          QR code será gerado após integração com gateway de pagamento
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Operational dashboard (empty state) ── */
          <div className="flex-1 p-[26px]">
            {/* Actionable hint */}
            <div className="mb-4">
              {urgentUnassigned.length > 0 ? (
                <div
                  className="actionable-hint"
                  onClick={() => handleSelectChamado(urgentUnassigned[0].id)}
                >
                  <AlertTriangle size={14} />
                  <span>
                    {urgentUnassigned.length} chamado{urgentUnassigned.length > 1 ? 's' : ''} aguardando atribuição.
                  </span>
                  <span className="dashboard-hint-cta">
                    Ver fila <ArrowRight size={12} />
                  </span>
                </div>
              ) : (
                <div className="actionable-hint all-clear">
                  <CheckCircle2 size={14} />
                  <span>Todos os chamados estão sendo atendidos.</span>
                </div>
              )}
            </div>

            {/* KPI cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <p className="kpi-label">CHAMADOS HOJE</p>
                <p className="kpi-value">{chamadosHoje}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">EM ANDAMENTO</p>
                <p className="kpi-value text-amber">{emAndamento}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">TEMPO MÉDIO</p>
                <p className="kpi-value">{tempoMedio}<span className="text-base fw-400 text-muted"> min</span></p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">BOT AUTOMÁTICO</p>
                <p className="kpi-value text-green">{botAutoRate}%</p>
              </div>
            </div>

            {/* Two columns */}
            <div className="dashboard-cols">
              {/* Chamados recentes */}
              <div className="panel">
                <div className="panel-header panel-header-flex">
                  <Activity size={14} className="text-muted2" />
                  <span className="panel-title">Chamados recentes</span>
                </div>
                <div className="panel-body p-0">
                  {mockChamados.filter(c => c.status !== 'concluido' && c.status !== 'cancelado').slice(0, 5).map(c => {
                    const svP = servicoPill[c.servico];
                    return (
                      <div
                        key={c.id}
                        className="table-row-click recent-row"
                        onClick={() => handleSelectChamado(c.id)}
                      >
                        <span className={`channel-icon ${canalClass(c.canal)} channel-icon-sm`}>
                          {canalIcon(c.canal)}
                        </span>
                        <span className="recent-name">{c.paciente_nome}</span>
                        <span className={`pill ${svP.pill} pill-xs`}>{svP.label}</span>
                        <span className={`pill ${statusPill[c.status]} pill-xs`}>{statusLabel[c.status]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Frota disponível */}
              <div className="panel">
                <div className="panel-header panel-header-flex">
                  <Truck size={14} className="text-muted2" />
                  <span className="panel-title">Frota disponível</span>
                  <span className="grp-count ml-auto">{vtrStats.disponivel}</span>
                </div>
                <div className="panel-body px-4 py-2">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="frota-stat-card bg-green-l">
                      <p className="mono frota-stat-value text-green-d">{vtrStats.disponivel}</p>
                      <p className="label frota-stat-label">DISPONÍVEL</p>
                    </div>
                    <div className="frota-stat-card bg-amber-l">
                      <p className="mono frota-stat-value text-amber">{vtrStats.em_atendimento}</p>
                      <p className="label frota-stat-label">ATENDIMENTO</p>
                    </div>
                    <div className="frota-stat-card bg-red-l">
                      <p className="mono frota-stat-value text-red">{vtrStats.manutencao}</p>
                      <p className="label frota-stat-label">MANUTENÇÃO</p>
                    </div>
                  </div>
                  {availableVtrs.map(v => (
                    <div key={v.id} className="vtr-list-row">
                      <span className="mono fw-700 text-sm">{v.placa}</span>
                      <span className="text-muted flex-1">VTR {v.nome}</span>
                      <span className={`pill ${v.tipo === 'uti' ? 'pill-red' : v.tipo === 'moto' ? 'pill-amber' : 'pill-green'} pill-xs`}>
                        {v.tipo.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════ Slide-over: Novo chamado ════════ */}
      <SlideOver
        open={showSlideOver}
        onClose={() => setShowSlideOver(false)}
        title="Novo chamado"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowSlideOver(false)}>Cancelar</button>
            <button className="btn btn-green" onClick={handleCriarChamado}>Criar chamado</button>
          </>
        }
      >
        <div>
          <label className="form-label">CANAL</label>
          <select className="form-select">
            <option value="telefone">Telefone</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="site">Site</option>
          </select>
        </div>
        <div>
          <label className="form-label">PACIENTE (NOME)</label>
          <input className="form-input" placeholder="Nome completo do paciente" />
        </div>
        <div>
          <label className="form-label">PACIENTE (TELEFONE)</label>
          <input className="form-input" placeholder="(21) 99999-9999" />
        </div>
        <div>
          <label className="form-label">SOLICITANTE</label>
          <input className="form-input" placeholder="Nome do solicitante ou convênio" />
        </div>
        <div>
          <label className="form-label">TIPO DE SERVIÇO</label>
          <select className="form-select">
            <option value="uti">UTI</option>
            <option value="basica">Básica</option>
            <option value="remocao">Remoção</option>
          </select>
        </div>
        <div>
          <label className="form-label">ENDEREÇO DE ORIGEM</label>
          <input className="form-input" placeholder="Hospital, rua, número, bairro" />
        </div>
        <div>
          <label className="form-label">ENDEREÇO DE DESTINO</label>
          <input className="form-input" placeholder="Hospital, rua, número, bairro" />
        </div>
        <div>
          <label className="form-label">OBSERVAÇÕES</label>
          <textarea className="form-textarea" placeholder="Quadro clínico, observações..." />
        </div>
      </SlideOver>
    </div>
  );
}
