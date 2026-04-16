import { useState, useMemo, useEffect } from 'react';
import { ArrowRight, MapPin, Star, MessageCircle, X, Search, KeyRound } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { culturalPlaces, CulturalPlace } from '@/lib/mockData';
import { useLocation } from '@/lib/useStore';

const categoryLabels: Record<string, string> = {
  museum: 'متحف',
  heritage: 'تراثي',
  historical: 'تاريخي',
};

// Najdi-inspired map style: warm sand tones
const najdiMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f1e6d0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a3a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fbf3e1' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#c9a877' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8d4a8' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#c9a877' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dcb87a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8c4c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3a5a5e' }] },
];

export default function MapPage() {
  const navigate = useNavigate();
  const userLoc = useLocation();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('place');
  const [selected, setSelected] = useState<CulturalPlace | null>(
    preselected ? culturalPlaces.find((p) => p.id === preselected) || null : null
  );
  const [search, setSearch] = useState('');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('ruwat_gmaps_key') || '');
  const [keyInput, setKeyInput] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'ruwat-gmaps',
  });

  const filtered = useMemo(
    () =>
      culturalPlaces.filter(
        (p) => !search.trim() || p.name.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const center = useMemo(
    () => (selected ? { lat: selected.lat, lng: selected.lng } : { lat: userLoc.lat, lng: userLoc.lng }),
    [selected, userLoc]
  );

  const saveKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem('ruwat_gmaps_key', keyInput.trim());
      setApiKey(keyInput.trim());
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Map area */}
      <div className="relative h-[58vh] bg-heritage-sand overflow-hidden">
        {apiKey && isLoaded && !loadError ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={12}
            options={{
              styles: najdiMapStyle,
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
          >
            {filtered.map((place) => (
              <MarkerF
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelected(place)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: selected?.id === place.id ? 14 : 10,
                  fillColor: selected?.id === place.id ? '#5a3a1a' : '#8b5a2b',
                  fillOpacity: 1,
                  strokeColor: '#fbf3e1',
                  strokeWeight: 3,
                }}
              />
            ))}
            {selected && (
              <InfoWindowF
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ direction: 'rtl', minWidth: 140 }}>
                  <strong style={{ color: '#5a3a1a' }}>{selected.name}</strong>
                  <div style={{ fontSize: 11, color: '#8b5a2b' }}>{categoryLabels[selected.category]}</div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="absolute inset-0 najdi-pattern-strong flex items-center justify-center p-6">
            <div className="bg-card/95 backdrop-blur rounded-2xl p-5 shadow-lg border border-border max-w-sm w-full text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <h3 className="font-heading font-bold text-heritage-brown">مفتاح Google Maps</h3>
                <KeyRound size={18} className="text-heritage-brown" />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                لعرض الخريطة بدقة، أدخل مفتاح Google Maps API الخاص بك. يُحفظ محليًا على جهازك فقط.
              </p>
              <input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-primary/30 mb-2 font-body"
                dir="ltr"
              />
              <button
                onClick={saveKey}
                disabled={!keyInput.trim()}
                className="w-full bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground rounded-xl py-2.5 font-heading text-sm disabled:opacity-50"
              >
                حفظ وعرض الخريطة
              </button>
              {loadError && (
                <p className="text-xs text-destructive mt-2">فشل تحميل الخريطة. تحقق من المفتاح.</p>
              )}
            </div>
          </div>
        )}

        {/* Top overlay: back + search bar */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-card/95 backdrop-blur rounded-full flex items-center justify-center shadow-md border border-border flex-shrink-0"
          >
            <ArrowRight size={18} className="text-heritage-brown" />
          </button>
          <div className="flex-1 bg-card/95 backdrop-blur rounded-full shadow-md border border-border flex items-center gap-2 px-4 py-2.5">
            <Search size={16} className="text-heritage-brown/70 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن موقع ثقافي..."
              className="flex-1 bg-transparent text-sm outline-none text-right font-body text-foreground placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} className="text-heritage-brown/60" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom sheet: list or detail */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-5 -mt-6 relative z-20"
          >
            <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <button onClick={() => setSelected(null)}>
                  <X size={18} className="text-muted-foreground" />
                </button>
                <div className="text-right flex-1 mr-3">
                  <span className="text-xs bg-secondary text-heritage-brown px-2 py-0.5 rounded-full font-heading">
                    {categoryLabels[selected.category]}
                  </span>
                  <h2 className="font-heading font-bold text-lg mt-1 text-heritage-brown">{selected.name}</h2>
                </div>
                <span className="text-3xl grayscale-[40%]">{selected.image}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed text-right mb-4">
                {selected.description}
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/rawi?tab=chat&place=${encodeURIComponent(selected.name)}`)}
                  className="flex items-center gap-2 bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground px-4 py-2.5 rounded-xl font-heading text-sm active:scale-[0.97] transition-transform"
                >
                  <MessageCircle size={16} />
                  <span>اسأل الراوي</span>
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-heading text-foreground">{selected.rating}</span>
                  <Star size={14} className="text-heritage-brown fill-heritage-brown" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 mt-4">
            <h2 className="font-heading font-bold mb-3 text-heritage-brown">المواقع الثقافية</h2>
            <div className="space-y-3">
              {filtered.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelected(place)}
                  className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-right"
                >
                  <MapPin size={14} className="text-heritage-brown/70 flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <h3 className="font-heading text-sm font-semibold text-heritage-brown">{place.name}</h3>
                    <span className="text-[11px] text-muted-foreground">{categoryLabels[place.category]}</span>
                  </div>
                  <span className="text-xl grayscale-[40%]">{place.image}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">لا توجد نتائج</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
