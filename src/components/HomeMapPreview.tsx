import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { culturalPlaces } from '@/lib/mockData';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB__li1XnzJU765wUSkUiWai-p5G2h1UEk';

const containerStyle = { width: '100%', height: '100%' };

// Light, airy heritage map style — much lighter than the full map page
const lightStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#fdf6e6' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
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

export default function HomeMapPreview({ userLocation }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
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
        styles: lightStyles,
        disableDefaultUI: true,
        gestureHandling: 'none',
        clickableIcons: false,
        keyboardShortcuts: false,
      }}
    >
      <MarkerF
        position={{ lat: userLocation.lat, lng: userLocation.lng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#2d8a9e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }}
        zIndex={999}
      />
      {culturalPlaces.slice(0, 6).map((p) => (
        <MarkerF
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          icon={{
            path: 'M12 0C7.5 0 4 3.5 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.5-3.5-8-8-8z',
            fillColor: '#a0522d',
            fillOpacity: 0.9,
            strokeColor: '#fdf6e6',
            strokeWeight: 1.5,
            scale: 1.1,
            anchor: new google.maps.Point(12, 24),
          }}
        />
      ))}
    </GoogleMap>
  );
}
