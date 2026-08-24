'use client';

import { useState, useMemo } from 'react';
import {
  MessageCircle, Phone, Globe, Mail, PenLine, MapPin, DollarSign, Truck, Send,
  User, Bot, AlertTriangle, CheckCircle2, Clock, Plus, Search, ChevronDown,
  X, Activity,
} from 'lucide-react';
import {
  mockChamados, mockBotEvents, mockBotActionSteps, mockBotChatMessages,
  statusPill, statusLabel, servicoPill, prioridadePill, canalConfig, mockVtrs, vtrStats,
} from '@/lib/mock-data';
import type { BotEvent, Chamado, ChatMessage } from '@/lib/mock-data';

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
  const elapsed = chamado.sla_minutos;
  if (elapsed > 20) return { text: `${elapsed} min`, cls: 'sla-crit' };
  if (elapsed > 15) return { text: `${elapsed} min`, cls: 'sla-warn' };
  return { text: `${elapsed} min`, cls: 'sla-ok' };
}

type PriorityGroup = 'urgente' | 'em_andamento' | 'aguardando' | 'concluido';

function chamadoGroup(c: Chamado): PriorityGroup {
  if (c.status === 'concluido' || c.status === 'cancelado') return 'concluido';
  if (c.prioridade === 'urgente' || c.status === 'aberto') return 'urgente';
  if (['em_transito', 'despacho', 'em_transporte', 'no_local'].includes(c.status)) return 'em_andamento';
  return 'aguardando';
}

const groupConfig: Record<PriorityGroup, { label: string; color: string }> = {
  urgente: { label: 'Urgente', color: 'var(--red)' },
  em_andamento: { label: 'Em andamento', color: 'var(--amber)' },
  aguardando: { label: 'Aguardando', color: 'var(--blue)' },
  concluido: { label: 'Concluídos', color: 'var(--green)' },
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

  const toggleGroup = (g: PriorityGroup) => {
    const next = new Set(collapsedGroups);
    if (next.has(g)) next.delete(g); else next.add(g);
    setCollapsedGroups(next);
  };

  const handleSelectChamado = (id: string) => {
    setSelectedId(id);
    setInterventionMode(false);
    setWsTab('atendimento');
  };

  const handleEventClick = (event: BotEvent) => {
    setSelectedId(event.chamado_id);
    setInterventionMode(false);
    setSegment('chamados');
  };

  // Available VTRs for dashboard
  const availableVtrs = mockVtrs.filter(v => v.status === 'disponivel').slice(0, 6);

  return (
    <div className="central-grid">
      {/* ════════ LEFT: Inbox ════════ */}
      <div className="central-inbox">
        {/* Header */}
        <div style={{ padding: '16px 18px 0', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <h2 className="font-display" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Central
            </h2>
            <span className="count-badge">{chamadosHoje}</span>
            <span className="live-dot" />
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-sm btn-sm-green" onClick={() => setShowSlideOver(true)}>
                <Plus size={12} /> Novo
              </button>
            </div>
          </div>

          {/* Segment toggle */}
          <div className="segment-toggle" style={{ marginTop: 12 }}>
            <button className={segment === 'chamados' ? 'seg-active' : ''} onClick={() => setSegment('chamados')}>
              Chamados
            </button>
            <button className={segment === 'bot_feed' ? 'seg-active' : ''} onClick={() => setSegment('bot_feed')}>
              Bot feed
            </button>
          </div>

          {/* Search */}
          <div style={{ marginTop: 10, marginBottom: 10, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted2)' }} />
            <input
              className="inbox-search"
              style={{ paddingLeft: 30 }}
              placeholder="Buscar paciente, n\u00FAmero, origem..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 24px' }}>
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
                      <span className="grp-sq" style={{ background: cfg.color }} />
                      <span className="grp-name" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span className="grp-count">{items.length}</span>
                      <span className="grp-chev"><ChevronDown size={13} /></span>
                    </div>
                    <div className="grp-items" style={{ padding: '0 8px' }}>
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
                              {sla.text && (
                                <span className={`sla-badge ${sla.cls}`}>
                                  {sla.cls === 'sla-route' && <span className="live-dot" style={{ width: 5, height: 5 }} />}
                                  {sla.cls === 'sla-crit' && <span className="crit-dot" style={{ width: 5, height: 5, boxShadow: 'none' }} />}
                                  {sla.text}
                                </span>
                              )}
                            </div>
                            <div className="qi-bot">
                              <span className={`pill ${svPill.pill}`}>{svPill.label}</span>
                              <span className="qi-svc">{c.origem.split(' — ')[0]}</span>
                            </div>
                            <div className="qi-bot" style={{ gap: 5 }}>
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
                              {c.bot_managed && <span style={{ fontSize: 10 }}>{'\uD83E\uDD16'}</span>}
                              {!c.bot_managed && <span style={{ fontSize: 10 }}>{'\uD83D\uDCDE'}</span>}
                            </div>
                            {needsIntervention && !isSel && (
                              <button
                                className="assume-btn"
                                style={{ marginTop: 4, alignSelf: 'flex-start' }}
                                onClick={e => { e.stopPropagation(); handleSelectChamado(c.id); setInterventionMode(true); }}
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
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span className="feed-time">{event.timestamp}</span>
                      <span className="feed-bot-icon">{getEventIcon(event.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="feed-desc">{event.description}</p>
                        {event.detail && (
                          <p className="feed-detail" style={{ whiteSpace: 'pre-line' }}>{event.detail}</p>
                        )}
                      </div>
                      {event.type === 'intervention' && !isSelected && (
                        <button
                          className="assume-btn"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedId(event.chamado_id);
                            setInterventionMode(true);
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                      #{selected.numero}
                    </span>
                    {sv && <span className={`pill ${sv.pill}`}>{sv.label}</span>}
                    <span className={`pill ${statusPill[selected.status]}`}>{statusLabel[selected.status]}</span>
                    {selected.bot_managed ? (
                      <span className="pill pill-green" style={{ marginLeft: 'auto' }}>
                        <Bot size={10} /> BOT GERENCIANDO
                      </span>
                    ) : (
                      <span className="pill pill-blue" style={{ marginLeft: 'auto' }}>
                        <Phone size={10} /> ATENDIMENTO DIRETO
                      </span>
                    )}
                  </div>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>
                    {selected.paciente_nome}
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    {selected.paciente_idade > 0 && <><b style={{ color: 'var(--ink2)', fontWeight: 600 }}>{selected.paciente_idade} anos</b> {'\u00B7'} </>}
                    Solicitante: <b style={{ color: 'var(--ink2)', fontWeight: 600 }}>{selected.solicitante_nome}</b>
                    {' '}{'\u00B7'} {canalConfig[selected.canal].label}
                    {selected.atendente && <> {'\u00B7'} Atendente: <b style={{ color: 'var(--ink2)', fontWeight: 600 }}>{selected.atendente}</b></>}
                  </p>
                </div>

                {selected.eta_minutos && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="font-display" style={{
                      fontSize: 28, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em',
                      color: selected.eta_minutos <= 10 ? 'var(--green)' : selected.eta_minutos <= 20 ? 'var(--amber)' : 'var(--red)',
                    }}>
                      {selected.eta_minutos}<span style={{ fontSize: 14 }}>min</span>
                    </p>
                    <p className="label" style={{ marginTop: 5 }}>ETA ESTIMADO</p>
                  </div>
                )}
              </div>

              {/* Functional tabs */}
              <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                {(['atendimento', 'historico', 'financeiro'] as WorkspaceTab[]).map(t => (
                  <button
                    key={t}
                    className={`tab ${wsTab === t ? 'tab-active' : ''}`}
                    onClick={() => setWsTab(t)}
                  >
                    {t === 'atendimento' ? 'Atendimento' : t === 'historico' ? 'Hist\u00F3rico' : 'Financeiro'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab content ── */}
            <div className="ws-body" style={{ flex: 1 }}>
              {wsTab === 'atendimento' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
                    {/* LEFT: Paciente + Trajeto + Serviço */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Paciente */}
                      <div className="panel" style={{ padding: 18 }}>
                        <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>PACIENTE</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <User size={14} style={{ color: 'var(--muted2)' }} />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.paciente_nome}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Phone size={14} style={{ color: 'var(--muted2)' }} />
                            <span className="mono" style={{ fontSize: 12 }}>{selected.paciente_telefone}</span>
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
                      <div className="panel" style={{ padding: 18 }}>
                        <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>TRAJETO</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <MapPin size={14} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <p className="label" style={{ color: 'var(--green)', marginBottom: 2 }}>ORIGEM</p>
                              <p style={{ fontSize: 12, color: 'var(--ink)' }}>{selected.origem}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <MapPin size={14} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <p className="label" style={{ color: 'var(--red)', marginBottom: 2 }}>DESTINO</p>
                              <p style={{ fontSize: 12, color: 'var(--ink)' }}>{selected.destino}</p>
                            </div>
                          </div>
                          {selected.distancia_km && (
                            <div style={{ display: 'flex', gap: 16, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
                              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {selected.distancia_km} km
                              </span>
                              {selected.eta_minutos && (
                                <span className="mono" style={{ fontSize: 11, color: 'var(--green-d)' }}>
                                  ETA {selected.eta_minutos} min
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Serviço */}
                      <div className="panel" style={{ padding: 18 }}>
                        <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>SERVI\u00C7O</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div className="ws-info-row">
                            <span className="ws-key">Tipo</span>
                            <span className="ws-val">{sv && <span className={`pill ${sv.pill}`}>{sv.label}</span>}</span>
                          </div>
                          {selected.valor_cotado && (
                            <div className="ws-info-row">
                              <span className="ws-key">Valor</span>
                              <span className="ws-val mono" style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(selected.valor_cotado)}</span>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* VTR */}
                      <div className="panel" style={{ padding: 18 }}>
                        <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>VTR ATRIBU\u00CDDA</p>
                        {selected.vtr_placa ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Truck size={14} style={{ color: 'var(--muted2)' }} />
                              <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{selected.vtr_placa}</span>
                              {selected.vtr_nome && <span className="pill pill-slate" style={{ fontSize: 7 }}>VTR {selected.vtr_nome}</span>}
                            </div>
                            {selected.equipe && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{selected.equipe}</p>}
                            {selected.eta_minutos && (
                              <span className={`sla-badge ${selected.eta_minutos <= 10 ? 'sla-ok' : selected.eta_minutos <= 20 ? 'sla-warn' : 'sla-crit'}`} style={{ alignSelf: 'flex-start' }}>
                                <span className="live-dot" style={{ width: 5, height: 5 }} />
                                ETA {selected.eta_minutos} min
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 10 }}>Nenhuma VTR atribu\u00EDda</p>
                            <button className="btn btn-outline" style={{ fontSize: 11, padding: '8px 14px' }}>
                              <MapPin size={12} /> Selecionar VTR
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="panel" style={{ padding: 18 }}>
                        <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>A\u00C7\u00D5ES</p>
                        <div className="action-panel">
                          {selected.bot_managed ? (
                            <>
                              {interventionMode ? (
                                <button className="btn btn-outline" onClick={() => setInterventionMode(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                  <Bot size={14} /> Devolver ao bot
                                </button>
                              ) : (
                                <button className="btn btn-outline" onClick={() => setInterventionMode(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                  <AlertTriangle size={14} /> Assumir conversa
                                </button>
                              )}
                              {selected.status === 'aprovado' && (
                                <button className="btn btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                  <CheckCircle2 size={14} /> Aprovar despacho
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {!selected.valor_cotado && (
                                <button className="btn btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                  <DollarSign size={14} /> Enviar cota\u00E7\u00E3o
                                </button>
                              )}
                              {selected.vtr_placa && selected.status !== 'em_transito' && selected.status !== 'concluido' && (
                                <button className="btn btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                  <Truck size={14} /> Despachar
                                </button>
                              )}
                              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--red)', borderColor: 'var(--red-l)' }}>
                                <X size={14} /> Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bot timeline (only for bot-managed) */}
                      {selected.bot_managed && selectedSteps.length > 0 && (
                        <div className="panel" style={{ padding: 18 }}>
                          <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>
                            <Bot size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
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
                    <div className="panel" style={{ marginTop: 18, overflow: 'hidden', padding: 0 }}>
                      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageCircle size={14} style={{ color: 'var(--green)' }} />
                        <span className="panel-title">WhatsApp</span>
                        {selected.bot_managed && !interventionMode && (
                          <span className="pill pill-green" style={{ marginLeft: 'auto', fontSize: 7 }}><Bot size={9} /> BOT ATIVO</span>
                        )}
                        {interventionMode && (
                          <span className="pill pill-red" style={{ marginLeft: 'auto', fontSize: 7 }}>SUPERVISORA</span>
                        )}
                      </div>
                      <div className="chat" style={{ padding: '14px 16px', maxHeight: 300, overflowY: 'auto' }}>
                        {selectedChat.length > 0 ? (
                          selectedChat.map(msg => (
                            <div key={msg.id} className={msg.sender === 'operator' ? 'chat-bot' : 'chat-client'}>
                              <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                              <p className="cmsg-time">{msg.time}</p>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: 12, color: 'var(--muted2)', textAlign: 'center', padding: '20px 0' }}>
                            Sem conversa vinculada
                          </p>
                        )}
                        {interventionMode && (
                          <div style={{
                            padding: '8px 12px', borderRadius: 10, background: 'var(--amber-l)',
                            fontSize: 11, fontWeight: 600, color: 'var(--amber)', textAlign: 'center', marginTop: 4,
                          }}>
                            Supervisora assumiu a conversa
                          </div>
                        )}
                      </div>

                      {interventionMode && (
                        <div className="composer" style={{ padding: '0 16px 14px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            <button className="quick-reply">Confirmar chegada</button>
                            <button className="quick-reply">Enviar cota\u00E7\u00E3o</button>
                            <button className="quick-reply">Atualizar ETA</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                <div className="panel" style={{ padding: 18 }}>
                  <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>HIST\u00D3RICO DE EVENTOS</p>
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
                              <span style={{ display: 'block', fontSize: 10, color: 'var(--muted2)', marginTop: 2 }}>
                                {selected.bot_managed ? 'Bot' : selected.atendente ?? 'Atendente'}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--muted2)' }}>Nenhum evento registrado</p>
                  )}
                </div>
              )}

              {wsTab === 'financeiro' && (
                <div className="panel" style={{ padding: 18 }}>
                  <p className="label" style={{ marginBottom: 14, color: 'var(--muted2)' }}>FINANCEIRO</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="ws-info-row">
                      <span className="ws-key">Valor cotado</span>
                      <span className="ws-val mono" style={{ fontSize: 16, fontWeight: 700 }}>
                        {selected.valor_cotado ? formatCurrency(selected.valor_cotado) : '\u2014'}
                      </span>
                    </div>
                    <div className="ws-info-row">
                      <span className="ws-key">Desconto</span>
                      <span className="ws-val mono">{'\u2014'}</span>
                    </div>
                    <div className="ws-info-row">
                      <span className="ws-key">Valor final</span>
                      <span className="ws-val mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-d)' }}>
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
                      <div style={{ marginTop: 14, padding: 20, background: 'var(--bg)', borderRadius: 'var(--r)', border: '1px dashed var(--line2)', textAlign: 'center' }}>
                        <p className="label" style={{ color: 'var(--muted2)' }}>PIX QR CODE</p>
                        <div style={{ width: 120, height: 120, margin: '12px auto', background: 'var(--line)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--muted2)' }}>Placeholder</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Operational dashboard (empty state) ── */
          <div style={{ flex: 1, padding: 26 }}>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
              <div className="kpi-card">
                <p className="kpi-label">CHAMADOS HOJE</p>
                <p className="kpi-value">{chamadosHoje}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">EM ANDAMENTO</p>
                <p className="kpi-value" style={{ color: 'var(--amber)' }}>{emAndamento}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">TEMPO M\u00C9DIO</p>
                <p className="kpi-value">{tempoMedio}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}> min</span></p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">BOT AUTOM\u00C1TICO</p>
                <p className="kpi-value" style={{ color: 'var(--green)' }}>{botAutoRate}%</p>
              </div>
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* Chamados recentes */}
              <div className="panel">
                <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={14} style={{ color: 'var(--muted2)' }} />
                  <span className="panel-title">Chamados recentes</span>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  {mockChamados.filter(c => c.status !== 'concluido' && c.status !== 'cancelado').slice(0, 5).map(c => {
                    const svP = servicoPill[c.servico];
                    return (
                      <div
                        key={c.id}
                        style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onClick={() => handleSelectChamado(c.id)}
                      >
                        <span className={`channel-icon ${canalClass(c.canal)}`} style={{ width: 18, height: 18, fontSize: 9 }}>
                          {canalIcon(c.canal)}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>{c.paciente_nome}</span>
                        <span className={`pill ${svP.pill}`} style={{ fontSize: 7 }}>{svP.label}</span>
                        <span className={`pill ${statusPill[c.status]}`} style={{ fontSize: 7 }}>{statusLabel[c.status]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Frota disponível */}
              <div className="panel">
                <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={14} style={{ color: 'var(--muted2)' }} />
                  <span className="panel-title">Frota dispon\u00EDvel</span>
                  <span className="grp-count" style={{ marginLeft: 'auto' }}>{vtrStats.disponivel}</span>
                </div>
                <div className="panel-body" style={{ padding: '8px 16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ textAlign: 'center', padding: 8, background: 'var(--green-l)', borderRadius: 8 }}>
                      <p className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-d)' }}>{vtrStats.disponivel}</p>
                      <p className="label" style={{ fontSize: 7 }}>DISPON\u00CDVEL</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: 8, background: 'var(--amber-l)', borderRadius: 8 }}>
                      <p className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)' }}>{vtrStats.em_atendimento}</p>
                      <p className="label" style={{ fontSize: 7 }}>ATENDIMENTO</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: 8, background: 'var(--red-l)', borderRadius: 8 }}>
                      <p className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)' }}>{vtrStats.manutencao}</p>
                      <p className="label" style={{ fontSize: 7 }}>MANUTEN\u00C7\u00C3O</p>
                    </div>
                  </div>
                  {availableVtrs.map(v => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 11 }}>{v.placa}</span>
                      <span style={{ color: 'var(--muted)', flex: 1 }}>VTR {v.nome}</span>
                      <span className={`pill ${v.tipo === 'uti' ? 'pill-red' : v.tipo === 'moto' ? 'pill-amber' : 'pill-green'}`} style={{ fontSize: 7 }}>
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
      {showSlideOver && (
        <>
          <div className="slide-over-backdrop" onClick={() => setShowSlideOver(false)} />
          <div className="slide-over">
            <div className="slide-over-header">
              <span className="slide-over-title">Novo chamado</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setShowSlideOver(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="slide-over-body">
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
                <input className="form-input" placeholder="Nome do solicitante ou conv\u00EAnio" />
              </div>
              <div>
                <label className="form-label">TIPO DE SERVI\u00C7O</label>
                <select className="form-select">
                  <option value="uti">UTI</option>
                  <option value="basica">B\u00E1sica</option>
                  <option value="remocao">Remo\u00E7\u00E3o</option>
                </select>
              </div>
              <div>
                <label className="form-label">ENDERE\u00C7O DE ORIGEM</label>
                <input className="form-input" placeholder="Hospital, rua, n\u00FAmero, bairro" />
              </div>
              <div>
                <label className="form-label">ENDERE\u00C7O DE DESTINO</label>
                <input className="form-input" placeholder="Hospital, rua, n\u00FAmero, bairro" />
              </div>
              <div>
                <label className="form-label">OBSERVA\u00C7\u00D5ES</label>
                <textarea className="form-textarea" placeholder="Quadro cl\u00EDnico, observa\u00E7\u00F5es..." />
              </div>
            </div>
            <div className="slide-over-footer">
              <button className="btn btn-outline" onClick={() => setShowSlideOver(false)}>Cancelar</button>
              <button className="btn btn-green" onClick={() => setShowSlideOver(false)}>Criar chamado</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
