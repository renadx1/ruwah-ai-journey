import { useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { CulturalPlace } from '@/lib/mockData';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB__li1XnzJU765wUSkUiWai-p5G2h1UEk';

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Light, airy heritage map style — soft sand tones
const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#fdf6e6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a6a45' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#e0cba6' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#f0e4cc' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f5dca8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe4ec' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#fdf6e6' }] },
];

interface GoogleMapViewProps {
  places: CulturalPlace[];
  userLocation: { lat: number; lng: number };
  selectedId?: string | null;
  onSelectPlace: (place: CulturalPlace) => void;
}

function StaticMapFallback({
  places,
  userLocation,
  selectedId,
  onSelectPlace,
}: GoogleMapViewProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-secondary">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px), linear-gradient(0deg, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '38px 38px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-heritage-sand/50 via-transparent to-primary/10" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-[3px] border-card shadow-md flex items-center justify-center z-10" title="موقعك">
        <MapPin size={18} className="text-primary-foreground" />
      </div>
      {places.map((place, index) => {
        const selected = selectedId === place.id;
        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className={`absolute rounded-full border-2 border-card shadow-sm flex items-center justify-center active:scale-95 transition-transform ${selected ? 'w-10 h-10 bg-primary z-20' : 'w-8 h-8 bg-heritage-brown z-10'}`}
            style={{
              right: `${14 + (index % 3) * 28}%`,
              top: `${24 + Math.floor(index / 3) * 26}%`,
            }}
            title={place.name}
          >
            <MapPin size={selected ? 17 : 14} className="text-primary-foreground" />
          </button>
        );
      })}
      <div className="absolute bottom-3 left-3 rounded-xl bg-card/90 px-3 py-2 text-right shadow-sm">
        <p className="text-xs font-heading text-heritage-brown">خريطة احتياطية</p>
        <p className="text-[10px] text-muted-foreground">تعذر تحميل الخريطة الحية مؤقتًا</p>
      </div>
    </div>
  );
}

export default function GoogleMapView({
  places,
  userLocation,
  selectedId,
  onSelectPlace,
}: GoogleMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(() => {
    if (selectedId) {
      const sel = places.find((p) => p.id === selectedId);
      if (sel) return { lat: sel.lat, lng: sel.lng };
    }
    return { lat: userLocation.lat, lng: userLocation.lng };
  }, [selectedId, places, userLocation]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      if (places.length === 0) return;
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
      places.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 60);
    },
    [places, userLocation]
  );

  if (loadError) {
    return <StaticMapFallback places={places} userLocation={userLocation} selectedId={selectedId} onSelectPlace={onSelectPlace} />;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-heritage-sand">
        <div className="w-6 h-6 rounded-full border-2 border-heritage-brown/30 border-t-heritage-brown animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onMapLoad}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
      }}
    >
      {/* User location pin (blue) */}
      <MarkerF
        position={{ lat: userLocation.lat, lng: userLocation.lng }}
        title="موقعك"
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2d8a9e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }}
        zIndex={999}
      />

      {/* Cultural place pins */}
      {places.map((place) => {
        const isSel = selectedId === place.id;
        return (
          <MarkerF
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
            onClick={() => onSelectPlace(place)}
            icon={{
              path: 'M12 0C7.5 0 4 3.5 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.5-3.5-8-8-8z',
              fillColor: isSel ? '#6b4423' : '#a0522d',
              fillOpacity: 1,
              strokeColor: '#fdf6e6',
              strokeWeight: 2,
              scale: isSel ? 2 : 1.6,
              anchor: new google.maps.Point(12, 24),
            }}
          />
        );
      })}
    </GoogleMap>
  );
}
