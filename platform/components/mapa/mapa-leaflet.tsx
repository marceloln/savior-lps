'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { statusLabel, tipoVtrPill, statusPill } from '@/lib/mock-data';
import type { Vtr, Chamado } from '@/lib/mock-data';

/* ── Chamado origin icon (pulsing red dot) ── */
function chamadoOriginIcon() {
  return L.divIcon({
    className: 'chamado-origin-icon',
    html: '<div class="chamado-origin-dot"><div class="chamado-origin-ring"></div></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/* ── Chamado destination icon (blue pin) ── */
function chamadoDestIcon() {
  return L.divIcon({
    className: 'chamado-dest-icon',
    html: '<div class="chamado-dest-pin"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 14],
  });
}

/* ── Custom VTR marker icon ── */
/* NOTE: Leaflet renders marker HTML outside React DOM tree.
   Inline styles in the template string are required — CSS classes
   defined in globals.css handle what they can, but layout styles
   inside the tooltip HTML must remain inline. */
function createVtrIcon(vtr: Vtr, isHighlighted: boolean, isSelected: boolean) {
  let displayNum = vtr.nome;
  if (vtr.tipo === 'moto') {
    displayNum = vtr.nome.replace('MOTO ', 'M');
  }
  if (vtr.nome === 'SERVICO') {
    displayNum = 'SVC';
  }

  const tipoClass = vtr.tipo === 'uti' ? 'vtr-marker-uti' :
                     vtr.tipo === 'moto' ? 'vtr-marker-moto' : 'vtr-marker-basica';

  const highlightClass = isHighlighted ? 'vtr-marker-highlight' : '';
  const selectedClass = isSelected ? 'vtr-marker-selected' : '';

  const stLabel = statusLabel[vtr.status] ?? vtr.status;
  const pillClass = statusPill[vtr.status] ?? 'pill-slate';
  const tp = tipoVtrPill[vtr.tipo];

  const html = `
    <div class="vtr-marker vtr-marker-${vtr.status} ${tipoClass} ${highlightClass} ${selectedClass}">
      <span class="vtr-marker-num">${displayNum}</span>
      <div class="vtr-tooltip">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span class="font-display" style="font-size:14px;font-weight:700;color:var(--ink)">VTR ${vtr.nome}</span>
          <span class="pill ${pillClass}">${stLabel}</span>
        </div>
        <div class="mono" style="font-size:11px;font-weight:700;color:var(--ink);letter-spacing:0.02em">${vtr.placa}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:2px">${vtr.modelo}</div>
        <div style="display:flex;gap:4px;margin-top:6px;align-items:center">
          <span class="pill ${tp.pill}" style="font-size:6px">${tp.label}</span>
        </div>
      </div>
    </div>
  `;

  const width = displayNum.length > 3 ? 90 : 80;

  return L.divIcon({
    html,
    className: 'vtr-div-icon',
    iconSize: [width, 28],
    iconAnchor: [width / 2, 14],
  });
}

/* ── Map controller for programmatic pan/zoom ── */
function MapController({ target, bounds }: {
  target: [number, number] | null;
  bounds: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else if (target) {
      map.flyTo(target, 14, { duration: 0.6 });
    }
  }, [map, target, bounds]);
  return null;
}

/* ── Props ── */
export interface MapaLeafletProps {
  vtrs: Vtr[];
  chamados: Chamado[];
  selectedChamadoId: string | null;
  selectedVtrId: string | null;
  onSelectVtr: (vtrId: string) => void;
  panToVtr: string | null;
}

/* ── Approximate coordinates for chamados (based on known RJ locations) ── */
function getChamadoCoords(chamado: Chamado): { origin: [number, number]; dest: [number, number] } | null {
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

  function findCoord(text: string): [number, number] | null {
    for (const [key, coord] of Object.entries(coordMap)) {
      if (text.includes(key)) return coord;
    }
    return null;
  }

  const origin = findCoord(chamado.origem);
  const dest = findCoord(chamado.destino);
  if (!origin) return null;
  return { origin, dest: dest || [origin[0] + 0.008, origin[1] + 0.01] };
}

export default function MapaLeaflet({
  vtrs,
  chamados,
  selectedChamadoId,
  selectedVtrId,
  onSelectVtr,
  panToVtr,
}: MapaLeafletProps) {
  let panTarget: [number, number] | null = null;
  let panBounds: L.LatLngBoundsExpression | null = null;

  if (panToVtr) {
    const vtr = vtrs.find((v) => v.id === panToVtr);
    if (vtr) panTarget = [vtr.latitude, vtr.longitude];
  }

  const activeChamados = chamados
    .filter((c) => !['concluido', 'cancelado'].includes(c.status))
    .map((c) => ({ ...c, coords: getChamadoCoords(c) }))
    .filter((c) => c.coords !== null);

  const selectedChamado = selectedChamadoId
    ? activeChamados.find((c) => c.id === selectedChamadoId)
    : null;

  if (selectedChamado?.coords) {
    const { origin, dest } = selectedChamado.coords;
    panBounds = L.latLngBounds([origin, dest]);
  }

  const nearbyVtrIds = new Set<string>();
  if (selectedChamado?.coords) {
    const { origin } = selectedChamado.coords;
    const available = vtrs
      .filter((v) => v.status === 'disponivel')
      .map((v) => ({
        ...v,
        dist: Math.sqrt(
          Math.pow(v.latitude - origin[0], 2) + Math.pow(v.longitude - origin[1], 2)
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
    available.forEach((v) => nearbyVtrIds.add(v.id));
  }

  return (
    <MapContainer
      center={[-22.9068, -43.1729]}
      zoom={12}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapController target={panTarget} bounds={panBounds} />

      {/* VTR markers */}
      {vtrs.map((vtr) => {
        const isNearby = nearbyVtrIds.has(vtr.id);
        const isSelected = vtr.id === selectedVtrId;

        return (
          <Marker
            key={vtr.id}
            position={[vtr.latitude, vtr.longitude]}
            icon={createVtrIcon(vtr, isNearby, isSelected)}
            eventHandlers={{
              click: () => onSelectVtr(vtr.id),
            }}
          />
        );
      })}

      {/* Chamado markers — Leaflet popup HTML uses inline styles by necessity */}
      {activeChamados.map((chamado) => {
        if (!chamado.coords) return null;
        const { origin, dest } = chamado.coords;
        const isSelected = chamado.id === selectedChamadoId;

        return (
          <span key={`chamado-${chamado.id}`}>
            <Marker position={origin} icon={chamadoOriginIcon()}>
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-header">
                    <span className="mono text-sm text-green-d fw-700">
                      #{chamado.numero}
                    </span>
                    <span className={`pill ${statusPill[chamado.status]}`}>
                      {statusLabel[chamado.status]}
                    </span>
                  </div>
                  <div className="text-base fw-600 mt-1">
                    {chamado.paciente_nome}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {chamado.origem}
                  </div>
                </div>
              </Popup>
            </Marker>

            <Marker position={dest} icon={chamadoDestIcon()} />

            <Polyline
              positions={[origin, dest]}
              pathOptions={{
                color: isSelected ? '#1FD29A' : '#888',
                weight: isSelected ? 2.5 : 1.5,
                dashArray: '8, 6',
                opacity: isSelected ? 0.9 : 0.5,
              }}
            />
          </span>
        );
      })}
    </MapContainer>
  );
}
