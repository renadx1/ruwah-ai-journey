import { useState, useMemo } from 'react';
import { ArrowRight, MapPin, Star, MessageCircle, X, Search, Clock, Ticket, Store, Plus, Volume2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { culturalPlaces, CulturalPlace, distanceKm } from '@/lib/mockData';
import { useLocation } from '@/lib/useStore';
import { useAccessibility } from '@/lib/accessibility';
import StoreUploadModal from '@/components/StoreUploadModal';

const categoryLabels: Record<string, string> = {
  museum: 'متحف',
  heritage: 'تراثي',
  historical: 'تاريخي',
  market: 'سوق شعبي',
};

// Google Maps API key — set by developer (not visible in UI).
// TODO: After enabling Lovable Cloud, move this to a secret + edge function.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
];

export default function MapPage() {
  const navigate = useNavigate();
  const userLoc = useLocation();
  const { speak, isSpeaking, stopSpeaking } = useAccessibility();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('place');
  const [selected, setSelected] = useState<CulturalPlace | null>(
    preselected ? culturalPlaces.find((p) => p.id === preselected) || null : null
  );
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: 'ruwat-gmaps',
  });

  const filtered = useMemo(
    () =>
      culturalPlaces.filter(
        (p) =>
          !search.trim() ||
          p.name.includes(search) ||
          p.district.includes(search) ||
          p.nameEn.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const center = useMemo(
    () => (selected ? { lat: selected.lat, lng: selected.lng } : { lat: userLoc.lat, lng: userLoc.lng }),
    [selected, userLoc]
  );

  const distance = selected
    ? distanceKm(userLoc.lat, userLoc.lng, selected.lat, selected.lng)
    : 0;

  const showMap = GOOGLE_MAPS_API_KEY && isLoaded && !loadError;

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Map area */}
      <div className="relative h-[52vh] bg-heritage-sand overflow-hidden">
        {showMap ? (
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
                  <div style={{ fontSize: 11, color: '#8b5a2b' }}>{selected.district}</div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          // Fallback Najdi-pattern map view
          <div className="absolute inset-0 najdi-pattern-strong">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-heritage-brown/70 text-xs font-heading">
                {loadError ? 'تعذّر تحميل الخريطة' : 'جاري تجهيز الخريطة...'}
              </div>
            </div>
            {/* Show place pins as cards on the pattern */}
            <div className="absolute inset-x-0 bottom-4 px-4 flex gap-2 overflow-x-auto" dir="rtl">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="min-w-[120px] bg-card/95 backdrop-blur rounded-xl p-2 shadow border border-border text-right flex-shrink-0"
                >
                  <span className="text-lg grayscale-[40%]">{p.image}</span>
                  <p className="text-[10px] font-heading text-heritage-brown truncate">{p.name}</p>
                </button>
              ))}
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
              placeholder="ابحث عن موقع أو حي..."
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
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              {/* Photo gallery */}
              {selected.photos.length > 0 && (
                <div className="flex gap-1 overflow-x-auto h-40 bg-heritage-sand" dir="ltr">
                  {selected.photos.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${selected.name} ${i + 1}`}
                      className="h-full w-auto object-cover flex-shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <button onClick={() => setSelected(null)} aria-label="إغلاق">
                    <X size={18} className="text-muted-foreground" />
                  </button>
                  <div className="text-right flex-1 mr-3">
                    <span className="text-xs bg-secondary text-heritage-brown px-2 py-0.5 rounded-full font-heading">
                      {categoryLabels[selected.category]}
                    </span>
                    <h2 className="font-heading font-bold text-lg mt-1.5 text-heritage-brown">
                      {selected.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{selected.district}</p>
                  </div>
                </div>

                <p className="text-foreground/80 text-sm leading-relaxed text-right mb-4">
                  {selected.description}
                </p>

                {/* Info chips */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-right" dir="rtl">
                  <InfoChip icon={<MapPin size={14} />} label={`${distance.toFixed(1)} كم عنك`} />
                  <InfoChip icon={<Star size={14} className="fill-heritage-brown" />} label={`تقييم ${selected.rating}`} />
                  <InfoChip icon={<Ticket size={14} />} label={selected.entryFee} />
                  <InfoChip icon={<Clock size={14} />} label={selected.openingHours} />
                </div>

                {/* Accessibility section */}
                <div className="bg-secondary/60 rounded-2xl p-3 mb-4 text-right" dir="rtl">
                  <h3 className="font-heading font-semibold text-xs text-heritage-brown mb-2">
                    معلومات إمكانية الوصول
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <AccessRow
                      label="كراسي متحركة"
                      icon="♿"
                      ok={selected.accessible}
                    />
                    <AccessRow
                      label="مواقف خاصة"
                      icon="🅿️"
                      ok={selected.accessible}
                    />
                    <AccessRow
                      label="مرافق مناسبة (دورات مياه)"
                      icon="🚻"
                      ok={selected.accessible}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = `${selected.name}. ${selected.district}. ${selected.description}`;
                      if (isSpeaking) stopSpeaking();
                      else speak(text);
                    }}
                    aria-label="استمع"
                    className="w-12 h-12 bg-secondary text-heritage-brown rounded-xl flex items-center justify-center active:scale-95 transition-transform border border-border flex-shrink-0"
                  >
                    <Volume2 size={18} className={isSpeaking ? 'text-primary' : ''} />
                  </button>
                  <button
                    onClick={() => navigate(`/rawi?place=${encodeURIComponent(selected.name)}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground px-4 py-3 rounded-xl font-heading text-sm active:scale-[0.97] transition-transform"
                  >
                    <MessageCircle size={16} />
                    <span>اسأل الراوي عن هذا المكان</span>
                  </button>
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
                    <span className="text-[11px] text-muted-foreground">{place.district}</span>
                  </div>
                  <span className="text-xl grayscale-[40%]">{place.image}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">لا توجد نتائج</p>
              )}
            </div>

            {/* Upload store entry — opens modal directly */}
            <button
              onClick={() => setShowUpload(true)}
              className="w-full mt-5 bg-gradient-to-br from-heritage-brown to-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 text-right shadow-md active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                <Store size={18} strokeWidth={1.7} />
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-heading font-bold text-sm">رفع المتاجر الثقافية</h3>
                <p className="text-[11px] opacity-80 mt-0.5">سجّل متجرك ليظهر على الخريطة</p>
              </div>
              <Plus size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <StoreUploadModal open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}

function InfoChip({
  icon,
  label,
  highlight,
  full,
}: {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-heading ${
        highlight ? 'bg-primary/10 text-heritage-brown' : 'bg-secondary text-heritage-brown'
      } ${full ? 'col-span-2' : ''}`}
    >
      <span className="text-heritage-brown flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function AccessRow({ label, icon, ok }: { label: string; icon: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[11px] font-heading ${ok ? 'text-heritage-brown' : 'text-muted-foreground line-through'}`}>
        {ok ? 'متوفر' : 'غير متوفر'}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-heritage-brown text-xs">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
    </div>
  );
}
