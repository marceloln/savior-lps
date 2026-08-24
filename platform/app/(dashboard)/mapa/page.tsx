'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, X } from 'lucide-react';
import { mockVtrs, mockChamados, tipoVtrPill, statusLabel, statusPill, slaLevel } from '@/lib/mock-data';
import type { Vtr, Chamado, VtrStatus, VtrTipo } from '@/lib/mock-data';
import { useToast } from '@/components/ui/toast';

const MapaLeaflet = dynamic(() => import('@/components/mapa/mapa-leaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center map-loading">
      <p className="map-loading-text">Carregando mapa...</p>
    </div>
  ),
});

type FilterStatus = 'todas' | VtrStatus;
type FilterTipo = 'todas' | VtrTipo;
type SidebarTab = 'frota' | 'chamados';

const filterButtons: { label: string; value: FilterStatus }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Disponível', value: 'disponivel' },
  { label: 'Em uso', value: 'em_atendimento' },
  { label: 'Manutenção', value: 'manutencao' },
];

const tipoButtons: { label: string; value: FilterTipo }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'UTI', value: 'uti' },
  { label: 'Básica', value: 'basica' },
  { label: 'Moto', value: 'moto' },
];

const canalIcons: Record<string, string> = {
  whatsapp: '\uD83E\uDD16',
  telefone: '\uD83D\uDCDE',
  site: '\uD83C\uDF10',
  email: '\uD83D\uDCE7',
  manual: '\u270F\uFE0F',
};

/* ── Helpers ── */
function countByStatus(status: VtrStatus) {
  return mockVtrs.filter((v) => v.status === status).length;
}

function countByTipo(tipo: VtrTipo) {
  return mockVtrs.filter((v) => v.tipo === tipo).length;
}

function estimateDistance(vtr: Vtr, lat: number, lng: number): number {
  const dlat = vtr.latitude - lat;
  const dlng = vtr.longitude - lng;
  return Math.sqrt(dlat * dlat + dlng * dlng) * 111; // rough km
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

/* ── Rough coords for chamado origins ── */
const coordMap: Record<string, [number, number]> = {
  'Botafogo': [-22.9519, -43.1806],
  'Copacabana': [-22.9711, -43.1823],
  'Bonsucesso': [-22.8624, -43.2533],
  'Barra da Tijuca': [-22.9995, -43.3650],
  'Laranjeiras': [-22.9376, -43.1785],
  'Tijuca': [-22.9231, -43.2315],
  'Centro': [-22.9068, -43.1729],
  'Maracanã': [-22.9121, -43.2302],
  'Méier': [-22.9022, -43.2819],
  'Jacarepaguá': [-22.9547, -43.3553],
  'Flamengo': [-22.9321, -43.1750],
  'São Cristóvão': [-22.8981, -43.2211],
  'Cosme Velho': [-22.9422, -43.1862],
  'Saúde': [-22.8989, -43.1876],
  'Riocentro': [-22.9777, -43.4064],
};

function findOriginCoord(text: string): [number, number] | null {
  for (const [key, coord] of Object.entries(coordMap)) {
    if (text.includes(key)) return coord;
  }
  return null;
}

/* ── Component ── */
export default function MapaPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todas');
  const [tipoFilter, setTipoFilter] = useState<FilterTipo>('todas');
  const [search, setSearch] = useState('');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('frota');
  const [selectedChamadoId, setSelectedChamadoId] = useState<string | null>(null);
  const [selectedVtrId, setSelectedVtrId] = useState<string | null>(null);
  const [panToVtr, setPanToVtr] = useState<string | null>(null);

  const { showToast } = useToast();

  // Filter VTRs
  const filtered = useMemo(() => {
    let result = mockVtrs;
    if (statusFilter !== 'todas') result = result.filter((v) => v.status === statusFilter);
    if (tipoFilter !== 'todas') result = result.filter((v) => v.tipo === tipoFilter);
    return result;
  }, [statusFilter, tipoFilter]);

  // Sidebar VTR list (with search)
  const sidebarVtrs = useMemo(() => {
    if (!search) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (v) => v.nome.toLowerCase().includes(q) || v.placa.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q)
    );
  }, [filtered, search]);

  // Active chamados
  const activeChamados = useMemo(
    () => mockChamados.filter((c) => !['concluido', 'cancelado'].includes(c.status)),
    []
  );

  // Selected chamado
  const selectedChamado = selectedChamadoId
    ? mockChamados.find((c) => c.id === selectedChamadoId)
    : null;

  // Nearby VTRs for selected chamado
  const nearbyVtrs = useMemo(() => {
    if (!selectedChamado) return [];
    const coord = findOriginCoord(selectedChamado.origem);
    if (!coord) return [];
    return mockVtrs
      .filter((v) => v.status === 'disponivel')
      .map((v) => ({ ...v, dist: estimateDistance(v, coord[0], coord[1]) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
  }, [selectedChamado]);

  const availableCount = countByStatus('disponivel');
  const activeCount = activeChamados.length;

  function handleVtrClick(vtrId: string) {
    setSelectedVtrId(vtrId);
    setPanToVtr(vtrId);
    // Reset pan trigger after a tick
    setTimeout(() => setPanToVtr(null), 100);
  }

  function handleChamadoClick(chamadoId: string) {
    setSelectedChamadoId(chamadoId);
    setSidebarTab('chamados');
  }

  function handleCloseDispatch() {
    setSelectedChamadoId(null);
  }

  function handleDespachar(vtr: typeof nearbyVtrs[0]) {
    if (!selectedChamado) return;
    showToast(`VTR ${vtr.nome} despachada para chamado #${selectedChamado.numero}`, 'success');
  }

  return (
    <div className="map-container">
      {/* Map fills everything */}
      <MapaLeaflet
        vtrs={filtered}
        chamados={mockChamados}
        selectedChamadoId={selectedChamadoId}
        selectedVtrId={selectedVtrId}
        onSelectVtr={handleVtrClick}
        panToVtr={panToVtr}
      />

      {/* ── Top-left stats badge ── */}
      <div className="map-stats-badge">
        <span className="map-stats-item">
          {mockVtrs.length} veículos
        </span>
        <span className="map-stats-sep">&middot;</span>
        <span className="map-stats-avail">
          {availableCount} disponíveis
        </span>
        <span className="map-stats-sep">&middot;</span>
        <span className="map-stats-active">
          {activeCount} chamados ativos
        </span>
      </div>

      {/* ── Top-right VTR type filter chips (dark variant) ── */}
      <div className={`map-type-filters${selectedChamadoId ? ' dispatch-open' : ''}`}>
        {tipoButtons.map((f) => {
          const count = f.value === 'todas' ? mockVtrs.length : countByTipo(f.value);
          const isActive = tipoFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setTipoFilter(f.value)}
              className={`chip-dark${isActive ? ' on' : ''}`}
            >
              {f.label}
              <span className="chip-count">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Left sidebar ── */}
      <div className="map-sidebar">
        {/* Header */}
        <div className="map-sidebar-header">
          <div className="map-sidebar-title-row">
            <span className="font-display text-sm">Mapa Operacional</span>
            <div className="live-dot" />
            <span className="mono text-[9px] text-muted2">
              {mockVtrs.length} VTRs
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="map-sidebar-tabs">
          <button
            className={`map-sidebar-tab ${sidebarTab === 'frota' ? 'active' : ''}`}
            onClick={() => setSidebarTab('frota')}
          >
            Frota
          </button>
          <button
            className={`map-sidebar-tab ${sidebarTab === 'chamados' ? 'active' : ''}`}
            onClick={() => setSidebarTab('chamados')}
          >
            Chamados
            {activeCount > 0 && (
              <span className="sidebar-count-badge">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        {sidebarTab === 'frota' ? (
          <>
            {/* Search */}
            <div className="sidebar-search-wrap">
              <div className="sidebar-search-inner">
                <Search size={12} className="text-muted2 shrink-0" />
                <input
                  type="text"
                  className="inbox-search sidebar-search-input"
                  placeholder="Buscar placa ou VTR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status filter chips */}
            <div className="sidebar-filter-row">
              {filterButtons.map((f) => {
                const count = f.value === 'todas' ? mockVtrs.length : countByStatus(f.value);
                const isActive = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    className={`chip chip-sm ${isActive ? 'chip-active' : ''}`}
                    onClick={() => setStatusFilter(f.value)}
                  >
                    {f.label}
                    <span className="chip-count-3">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* VTR list */}
            <div className="map-sidebar-list">
              {sidebarVtrs.map((vtr) => {
                const tp = tipoVtrPill[vtr.tipo];
                const isSelected = vtr.id === selectedVtrId;
                const dotClass = `vtr-status-dot vtr-dot-${vtr.status}`;
                return (
                  <div
                    key={vtr.id}
                    onClick={() => handleVtrClick(vtr.id)}
                    className={`vtr-sidebar-row${isSelected ? ' selected' : ''} ${isSelected ? '' : 'table-row-click'}`}
                  >
                    {/* Status dot */}
                    <span className={dotClass} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[5px]">
                        <span className="font-display text-md">
                          VTR {vtr.nome}
                        </span>
                        <span className={`pill ${tp.pill} pill-6`}>{tp.label}</span>
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <span className="mono text-xs fw-600 text-muted">
                          {vtr.placa}
                        </span>
                        <span className="text-xs text-muted2">
                          {vtr.modelo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sidebarVtrs.length === 0 && (
                <div className="sidebar-empty">
                  Nenhum veículo encontrado
                </div>
              )}
            </div>
          </>
        ) : (
          /* Tab Chamados */
          <div className="map-sidebar-list">
            {activeChamados.map((chamado) => {
              const isSelected = chamado.id === selectedChamadoId;
              const pillClass = statusPill[chamado.status] ?? 'pill-slate';
              const level = slaLevel(chamado.sla_minutos);
              return (
                <div
                  key={chamado.id}
                  onClick={() => handleChamadoClick(chamado.id)}
                  className={`chamado-sidebar-row${isSelected ? ' selected' : ''} ${isSelected ? '' : 'table-row-click'}`}
                >
                  {/* Top row: number + status + SLA + channel */}
                  <div className="chamado-top-row">
                    <span className="mono text-sm text-green-d fw-700">
                      #{chamado.numero}
                    </span>
                    <span className={`pill ${pillClass} pill-6`}>{statusLabel[chamado.status]}</span>
                    <span
                      className={`mono chamado-sla-badge ${level === 'crit' ? 'chamado-sla-crit' : level === 'warn' ? 'chamado-sla-warn' : 'chamado-sla-ok'}`}
                    >
                      {chamado.sla_minutos}min
                    </span>
                    <span className="ml-auto text-sm">
                      {canalIcons[chamado.canal] ?? ''}
                    </span>
                  </div>

                  {/* Patient name */}
                  <div className="font-display text-base mb-[2px]">
                    {chamado.paciente_nome}
                  </div>

                  {/* Origin → Destination */}
                  <div className="chamado-route">
                    {truncate(chamado.origem.split(' — ')[0] ?? chamado.origem, 30)}
                    <span className="chamado-arrow">&rarr;</span>
                    {truncate(chamado.destino.split(' — ')[0] ?? chamado.destino, 30)}
                  </div>
                </div>
              );
            })}
            {activeChamados.length === 0 && (
              <div className="sidebar-empty">
                Nenhum chamado ativo
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right dispatch panel (when chamado selected) ── */}
      {selectedChamado && (
        <div className="map-dispatch-panel">
          {/* Header */}
          <div className="dispatch-header">
            <div className="dispatch-header-left">
              <span className="mono text-md text-green-d fw-700">
                #{selectedChamado.numero}
              </span>
              <span className={`pill ${statusPill[selectedChamado.status]}`}>
                {statusLabel[selectedChamado.status]}
              </span>
            </div>
            <button
              onClick={handleCloseDispatch}
              className="dispatch-close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Patient info */}
          <div className="dispatch-section">
            <div className="font-display text-[15px] mb-1">
              {selectedChamado.paciente_nome}
            </div>
            <div className="dispatch-patient-age">
              {selectedChamado.paciente_idade} anos &middot; {selectedChamado.paciente_telefone}
            </div>
            <div className="dispatch-patient-solic">
              Solicitante: {selectedChamado.solicitante_nome}
            </div>
          </div>

          {/* Origin → Destination */}
          <div className="dispatch-section">
            <div className="dispatch-route-wrap">
              <div className="dispatch-route-dots">
                <div className="dispatch-dot-red" />
                <div className="dispatch-route-line" />
                <div className="dispatch-dot-blue" />
              </div>
              <div className="flex-1">
                <div className="mb-[2px]">
                  <div className="label dispatch-route-label">ORIGEM</div>
                  <div className="dispatch-route-addr">
                    {selectedChamado.origem}
                  </div>
                </div>
                <div className="mt-[10px]">
                  <div className="label dispatch-route-label">DESTINO</div>
                  <div className="dispatch-route-addr">
                    {selectedChamado.destino}
                  </div>
                </div>
              </div>
            </div>
            {selectedChamado.distancia_km && (
              <div className="mono text-xs text-muted mt-2">
                {selectedChamado.distancia_km} km estimados
              </div>
            )}
          </div>

          {/* Nearby VTRs */}
          <div className="dispatch-nearby">
            <div className="label mb-[10px]">VTRs PRÓXIMAS</div>

            {nearbyVtrs.length > 0 ? (
              <div className="flex flex-col gap-[6px]">
                {nearbyVtrs.map((vtr) => {
                  const tp = tipoVtrPill[vtr.tipo];
                  const etaMin = Math.ceil(vtr.dist * 3);
                  return (
                    <div
                      key={vtr.id}
                      className="nearby-vtr-card"
                    >
                      <div className="flex-1">
                        <div className="nearby-vtr-info-row">
                          <span className="font-display text-base">VTR {vtr.nome}</span>
                          <span className={`pill ${tp.pill} pill-6`}>{tp.label}</span>
                        </div>
                        <div className="nearby-vtr-meta">
                          <span className="mono text-[9px] fw-600 text-muted">
                            {vtr.placa}
                          </span>
                          <span className="nearby-vtr-dist">
                            ~{vtr.dist.toFixed(1)} km &middot; ~{etaMin} min
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-sm btn-sm-green btn-sm-dispatch"
                        onClick={() => handleDespachar(vtr)}
                      >
                        Despachar
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sidebar-empty">
                Nenhuma VTR disponível próxima
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
