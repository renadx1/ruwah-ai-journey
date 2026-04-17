import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { culturalPlaces } from '@/lib/mockData';

interface Props {
  userLocation: { lat: number; lng: number; city: string };
}

// Heritage pin — warm brown teardrop with cream center
const heritageIcon = L.divIcon({
  className: 'heritage-pin',
  html: `<div style="filter: drop-shadow(0 2px 3px rgba(107,68,35,0.35));">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="26" height="32">
      <path d="M12 0C6.5 0 2 4.3 2 9.6c0 6.8 10 20.4 10 20.4s10-13.6 10-20.4C22 4.3 17.5 0 12 0z"
        fill="#8b5a2b" stroke="#fdf6e6" stroke-width="2"/>
      <circle cx="12" cy="9.5" r="3.2" fill="#fdf6e6"/>
      <circle cx="12" cy="9.5" r="1.4" fill="#8b5a2b"/>
    </svg>
  </div>`,
  iconSize: [26, 32],
  iconAnchor: [13, 32],
});

// User location — teal pulse
const userIcon = L.divIcon({
  className: 'user-pin',
  html: `<div style="position:relative;width:18px;height:18px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:#2d8a9e;opacity:0.25;animation:pulse 2s infinite;"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:#2d8a9e;border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>
  </div>
  <style>@keyframes pulse{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.2);opacity:0}}</style>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function HomeMapPreview({ userLocation }: Props) {
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
      {/* Warm watercolor basemap that matches the sand/heritage palette */}
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
        className="heritage-tiles"
      />
      {/* Soft labels overlay */}
      <TileLayer url="https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.png" />

      {/* User location */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />

      {/* Cultural place pins */}
      {places.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={heritageIcon}>
          <Tooltip
            direction="top"
            offset={[0, -28]}
            opacity={1}
            className="heritage-tooltip"
          >
            {p.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
