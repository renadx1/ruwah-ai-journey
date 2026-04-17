import { MapContainer, TileLayer, Marker, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { culturalPlaces } from '@/lib/mockData';

interface Props {
  userLocation: { lat: number; lng: number; city: string };
}

// Custom heritage pin icon (SVG, sand + brown)
const heritageIcon = L.divIcon({
  className: 'heritage-pin',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28" width="22" height="26">
    <path d="M12 0C7.5 0 4 3.5 4 8c0 5.5 8 20 8 20s8-14.5 8-20c0-4.5-3.5-8-8-8z"
      fill="#a0522d" stroke="#fdf6e6" stroke-width="1.5"/>
    <circle cx="12" cy="8" r="2.6" fill="#fdf6e6"/>
  </svg>`,
  iconSize: [22, 26],
  iconAnchor: [11, 26],
});

export default function HomeMapPreview({ userLocation }: Props) {
  // Show all cultural places on the home preview (same as map page)
  const places = culturalPlaces;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={11}
      style={{ width: '100%', height: '100%', background: '#fdf6e6' }}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
    >
      {/* Light, airy basemap (CartoDB Positron) */}
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {/* User location (teal dot) */}
      <CircleMarker
        center={[userLocation.lat, userLocation.lng]}
        radius={7}
        pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#2d8a9e', fillOpacity: 1 }}
      />

      {/* Cultural place pins */}
      {places.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={heritageIcon} />
      ))}
    </MapContainer>
  );
}
