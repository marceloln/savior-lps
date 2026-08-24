'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, X } from 'lucide-react';
import { mockVtrs, mockChamados, tipoVtrPill, statusLabel, statusPill } from '@/lib/mock-data';
import type { Vtr, Chamado, VtrStatus, VtrTipo } from '@/lib/mock-data';
import { useToast } from '@/components/ui/toast';

const MapaLeaflet = dynamic(() => import('@/components/mapa/mapa-leaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" style={{ background: '#1a1a2e' }}>
      <p style={{ fontSize: '12.5px', color: '#666' }}>Carregando mapa...</p>
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
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
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
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 336,
          zIndex: 1000,
          background: 'oklch(0.16 0.03 256 / 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '8px 14px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700 }}>
          {mockVtrs.length} veículos
        </span>
        <span style={{ opacity: 0.35 }}>&middot;</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600, color: '#1FD29A' }}>
          {availableCount} disponíveis
        </span>
        <span style={{ opacity: 0.35 }}>&middot;</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600, color: 'oklch(0.75 0.13 65)' }}>
          {activeCount} chamados ativos
        </span>
      </div>

      {/* ── Top-right VTR type filter chips (dark variant) ── */}
      <div style={{ position: 'absolute', top: 14, right: selectedChamadoId ? 376 : 14, zIndex: 1000, display: 'flex', gap: 5, transition: 'right 0.2s ease' }}>
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
              <span style={{ marginLeft: 4, opacity: 0.7, fontFamily: 'var(--mono)', fontSize: '8px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-display" style={{ fontSize: '14px' }}>Mapa Operacional</span>
            <div className="live-dot" />
            <span className="mono" style={{ fontSize: '9px', color: 'var(--muted2)' }}>
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
              <span style={{
                marginLeft: 5,
                fontFamily: 'var(--mono)',
                fontSize: '8px',
                background: 'var(--red-l)',
                color: 'var(--red)',
                padding: '1px 5px',
                borderRadius: 4,
                fontWeight: 700,
              }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        {sidebarTab === 'frota' ? (
          <>
            {/* Search */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg)',
                borderRadius: 8,
                padding: '6px 10px',
                border: '1px solid var(--line)',
              }}>
                <Search size={12} style={{ color: 'var(--muted2)', flexShrink: 0 }} />
                <input
                  type="text"
                  className="inbox-search"
                  placeholder="Buscar placa ou VTR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontSize: '11px',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Status filter chips */}
            <div style={{ padding: '8px 12px', display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--line)' }}>
              {filterButtons.map((f) => {
                const count = f.value === 'todas' ? mockVtrs.length : countByStatus(f.value);
                const isActive = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    className={`chip ${isActive ? 'chip-active' : ''}`}
                    onClick={() => setStatusFilter(f.value)}
                    style={{ fontSize: '10px', padding: '3px 8px' }}
                  >
                    {f.label}
                    <span style={{ marginLeft: 3, fontFamily: 'var(--mono)', fontSize: '8px', opacity: 0.7 }}>
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
                return (
                  <div
                    key={vtr.id}
                    onClick={() => handleVtrClick(vtr.id)}
                    className={isSelected ? '' : 'table-row-click'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 12px',
                      borderBottom: '1px solid var(--line)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--green-l)' : undefined,
                    }}
                  >
                    {/* Status dot */}
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: vtr.status === 'disponivel' ? '#1FD29A' :
                                  vtr.status === 'em_atendimento' ? '#F59E0B' : '#D9534F',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="font-display" style={{ fontSize: '13px' }}>
                          VTR {vtr.nome}
                        </span>
                        <span className={`pill ${tp.pill}`} style={{ fontSize: '6px' }}>{tp.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="mono" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>
                          {vtr.placa}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>
                          {vtr.modelo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sidebarVtrs.length === 0 && (
                <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--muted2)' }}>
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
              const slaCrit = chamado.sla_minutos <= 5;
              const slaWarn = chamado.sla_minutos <= 15 && chamado.sla_minutos > 5;
              return (
                <div
                  key={chamado.id}
                  onClick={() => handleChamadoClick(chamado.id)}
                  className={isSelected ? '' : 'table-row-click'}
                  style={{
                    padding: '9px 12px',
                    borderBottom: '1px solid var(--line)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--green-l)' : undefined,
                  }}
                >
                  {/* Top row: number + status + SLA + channel */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--green-d)', fontWeight: 700 }}>
                      #{chamado.numero}
                    </span>
                    <span className={`pill ${pillClass}`} style={{ fontSize: '6px' }}>{statusLabel[chamado.status]}</span>
                    <span
                      className="mono"
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: slaCrit ? 'var(--red-l)' : slaWarn ? 'var(--amber-l)' : 'transparent',
                        color: slaCrit ? 'var(--red)' : slaWarn ? 'var(--amber)' : 'var(--muted2)',
                      }}
                    >
                      {chamado.sla_minutos}min
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px' }}>
                      {canalIcons[chamado.canal] ?? ''}
                    </span>
                  </div>

                  {/* Patient name */}
                  <div className="font-display" style={{ fontSize: '12px', marginBottom: 2 }}>
                    {chamado.paciente_nome}
                  </div>

                  {/* Origin → Destination */}
                  <div style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.3 }}>
                    {truncate(chamado.origem.split(' — ')[0] ?? chamado.origem, 30)}
                    <span style={{ margin: '0 3px', color: 'var(--muted2)' }}>&rarr;</span>
                    {truncate(chamado.destino.split(' — ')[0] ?? chamado.destino, 30)}
                  </div>
                </div>
              );
            })}
            {activeChamados.length === 0 && (
              <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--muted2)' }}>
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
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: '13px', color: 'var(--green-d)', fontWeight: 700 }}>
                #{selectedChamado.numero}
              </span>
              <span className={`pill ${statusPill[selectedChamado.status]}`}>
                {statusLabel[selectedChamado.status]}
              </span>
            </div>
            <button
              onClick={handleCloseDispatch}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Patient info */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div className="font-display" style={{ fontSize: '15px', marginBottom: 4 }}>
              {selectedChamado.paciente_nome}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {selectedChamado.paciente_idade} anos &middot; {selectedChamado.paciente_telefone}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>
              Solicitante: {selectedChamado.solicitante_nome}
            </div>
          </div>

          {/* Origin → Destination */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                <div style={{ width: 1, height: 24, background: 'var(--line2)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 2 }}>
                  <div className="label" style={{ fontSize: '7px', marginBottom: 2 }}>ORIGEM</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink)', lineHeight: 1.3 }}>
                    {selectedChamado.origem}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div className="label" style={{ fontSize: '7px', marginBottom: 2 }}>DESTINO</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink)', lineHeight: 1.3 }}>
                    {selectedChamado.destino}
                  </div>
                </div>
              </div>
            </div>
            {selectedChamado.distancia_km && (
              <div className="mono" style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 8 }}>
                {selectedChamado.distancia_km} km estimados
              </div>
            )}
          </div>

          {/* Nearby VTRs */}
          <div style={{ padding: '14px 16px' }}>
            <div className="label" style={{ marginBottom: 10 }}>VTRs PRÓXIMAS</div>

            {nearbyVtrs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {nearbyVtrs.map((vtr) => {
                  const tp = tipoVtrPill[vtr.tipo];
                  const etaMin = Math.ceil(vtr.dist * 3);
                  return (
                    <div
                      key={vtr.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--r)',
                        background: 'var(--card)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span className="font-display" style={{ fontSize: '12px' }}>VTR {vtr.nome}</span>
                          <span className={`pill ${tp.pill}`} style={{ fontSize: '6px' }}>{tp.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                          <span className="mono" style={{ fontSize: '9px', fontWeight: 600, color: 'var(--muted)' }}>
                            {vtr.placa}
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--muted2)' }}>
                            ~{vtr.dist.toFixed(1)} km &middot; ~{etaMin} min
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-sm btn-sm-green"
                        style={{ fontSize: '10px', padding: '5px 10px' }}
                        onClick={() => handleDespachar(vtr)}
                      >
                        Despachar
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--muted2)', textAlign: 'center', padding: '12px 0' }}>
                Nenhuma VTR disponível próxima
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
