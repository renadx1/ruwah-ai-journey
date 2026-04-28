import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { culturalPlaces } from '@/lib/mockData';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB__li1XnzJU765wUSkUiWai-p5G2h1UEk';

const containerStyle = { width: '100%', height: '100%' };

// EXACT same style as the main /map page
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

interface Props {
  userLocation: { lat: number; lng: number; city: string };
}

function StaticMapFallback({ userLocation }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-secondary">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px), linear-gradient(0deg, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-heritage-sand/40 via-transparent to-primary/10" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary border-[3px] border-card shadow-md flex items-center justify-center">
        <MapPin size={17} className="text-primary-foreground" />
      </div>
      {culturalPlaces.slice(0, 5).map((place, index) => (
        <div
          key={place.id}
          className="absolute w-7 h-7 rounded-full bg-heritage-brown border-2 border-card shadow-sm flex items-center justify-center"
          style={{
            right: `${18 + (index % 3) * 26}%`,
            top: `${22 + Math.floor(index / 3) * 34}%`,
          }}
          title={place.name}
        >
          <MapPin size={13} className="text-primary-foreground" />
        </div>
      ))}
      <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-card/90 px-3 py-2 text-right shadow-sm">
        <p className="text-xs font-heading text-heritage-brown">خريطة {userLocation.city}</p>
        <p className="text-[10px] text-muted-foreground">تعذر تحميل الخريطة الحية مؤقتًا</p>
      </div>
    </div>
  );
}

export default function HomeMapPreview({ userLocation }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    return <StaticMapFallback userLocation={userLocation} />;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-heritage-sand">
        <div className="w-5 h-5 rounded-full border-2 border-heritage-brown/30 border-t-heritage-brown animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: userLocation.lat, lng: userLocation.lng }}
      zoom={11}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
        keyboardShortcuts: false,
      }}
    >
      {/* User location pin (teal) — same as /map */}
      <MarkerF
        position={{ lat: userLocation.lat, lng: userLocation.lng }}
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

      {/* All cultural place pins — same as /map */}
      {culturalPlaces.map((place) => (
        <MarkerF
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          icon={{
            path: 'M12 0C7.5 0 4 3.5 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.5-3.5-8-8-8z',
            fillColor: '#a0522d',
            fillOpacity: 1,
            strokeColor: '#fdf6e6',
            strokeWeight: 2,
            scale: 1.6,
            anchor: new google.maps.Point(12, 24),
          }}
        />
      ))}
    </GoogleMap>
  );
}
