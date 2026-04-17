import { useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { CulturalPlace } from '@/lib/mockData';

const GOOGLE_MAPS_API_KEY = 'AIzaSyD4tjY0IBi2fHDKTgeH0FMun1moPepPHv8';

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Subtle warm/heritage map style — sand toned to match app
const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5ecd9' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b4423' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fdf6e6' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9a878' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8d9b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8c98f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8c8d8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

interface GoogleMapViewProps {
  places: CulturalPlace[];
  userLocation: { lat: number; lng: number };
  selectedId?: string | null;
  onSelectPlace: (place: CulturalPlace) => void;
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
    return (
      <div className="w-full h-full flex items-center justify-center bg-heritage-sand text-heritage-brown text-sm font-heading p-4 text-center">
        تعذر تحميل الخريطة
      </div>
    );
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
