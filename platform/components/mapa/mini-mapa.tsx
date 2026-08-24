'use client';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MiniMapaProps {
  lat: number;
  lng: number;
  destLat?: number;
  destLng?: number;
}

export default function MiniMapa({ lat, lng, destLat, destLng }: MiniMapaProps) {
  return (
    <div className="mini-mapa-wrap">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        className="mini-mapa"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <CircleMarker center={[lat, lng]} radius={6} pathOptions={{ color: '#D9534F', fillColor: '#D9534F', fillOpacity: 0.9 }} />
        {destLat && destLng && (
          <CircleMarker center={[destLat, destLng]} radius={6} pathOptions={{ color: '#4A90D9', fillColor: '#4A90D9', fillOpacity: 0.9 }} />
        )}
      </MapContainer>
    </div>
  );
}
