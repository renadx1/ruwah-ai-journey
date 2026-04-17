import { useState, useMemo } from 'react';
import { ArrowRight, MapPin, Star, MessageCircle, X, Search, Clock, Ticket, Store, Plus, Volume2, Navigation, Landmark, Castle, Building2, ShoppingBag } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { culturalPlaces, CulturalPlace, distanceKm } from '@/lib/mockData';
import { useLocation } from '@/lib/useStore';
import { useAccessibility } from '@/lib/accessibility';
import StoreUploadModal from '@/components/StoreUploadModal';
import GoogleMapView from '@/components/GoogleMapView';

const categoryLabels: Record<string, string> = {
  museum: 'متحف',
  heritage: 'تراثي',
  historical: 'تاريخي',
  market: 'سوق شعبي',
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'museum':
      return <Landmark size={20} className="text-heritage-brown" strokeWidth={1.6} />;
    case 'heritage':
      return <Castle size={20} className="text-heritage-brown" strokeWidth={1.6} />;
    case 'historical':
      return <Building2 size={20} className="text-heritage-brown" strokeWidth={1.6} />;
    case 'market':
      return <ShoppingBag size={20} className="text-heritage-brown" strokeWidth={1.6} />;
    default:
      return <Landmark size={20} className="text-heritage-brown" strokeWidth={1.6} />;
  }
};

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

  const distance = selected
    ? distanceKm(userLoc.lat, userLoc.lng, selected.lat, selected.lng)
    : 0;

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Real Google Map area */}
      <div className="relative h-[42vh] bg-heritage-sand overflow-hidden">
        <GoogleMapView
          places={filtered}
          userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
          selectedId={selected?.id}
          onSelectPlace={(p) => setSelected(p)}
        />

        {/* Top overlay: back (left) + search bar (right) */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-3 flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            aria-label="رجوع للرئيسية"
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

        {/* Current city badge */}
        <div className="absolute bottom-3 right-3 z-10 bg-card/95 backdrop-blur rounded-full px-3 py-1.5 shadow-md border border-border flex items-center gap-1.5">
          <MapPin size={12} className="text-heritage-brown" />
          <span className="text-[11px] font-heading text-heritage-brown">{userLoc.city}</span>
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
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    {categoryIcon(place.category)}
                  </span>
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
