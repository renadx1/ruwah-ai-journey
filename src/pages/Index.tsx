import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserName, useLocation, usePoints } from '@/lib/useStore';
import { culturalPlaces, distanceKm } from '@/lib/mockData';
import { AccessibilityButton } from '@/components/AccessibilityFab';

export default function Index() {
  const navigate = useNavigate();
  const { name } = useUserName();
  const location = useLocation();
  const { points } = usePoints();

  const displayName = name || 'ضيفنا';

  const suggestions = [...culturalPlaces]
    .map((p) => ({ ...p, dist: distanceKm(location.lat, location.lng, p.lat, p.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6);

  return (
    <main className="min-h-screen pb-32 najdi-pattern" data-a11y-read>
      {/* Header */}
      <div className="gradient-heritage px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center"
            >
              <span className="text-primary-foreground font-heading font-bold text-sm">
                {displayName.charAt(0)}
              </span>
            </button>
            <AccessibilityButton tone="dark" />
          </div>
          <div className="flex items-center gap-1.5 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-primary-foreground text-xs">{location.city}</span>
            <MapPin size={14} className="text-primary-foreground" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-primary-foreground font-heading text-2xl font-bold">
            مرحبًا، {displayName} 👋
          </h1>
        </motion.div>

        {/* Points badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 flex items-center justify-between"
        >
          <ChevronLeft size={16} className="text-primary-foreground/60" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-primary-foreground text-xs">نقاطك</span>
              <p className="text-primary-foreground font-heading font-bold text-lg">{points}</p>
            </div>
            <Star size={20} className="text-primary-foreground fill-primary-foreground" />
          </div>
        </motion.div>
      </div>

      {/* 1) Map preview card — matches reference design exactly */}
      <div className="px-5 -mt-4 relative z-10">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/map')}
          className="w-full bg-heritage-sand rounded-2xl overflow-hidden shadow-md border border-border active:scale-[0.98] transition-transform"
        >
          <div className="h-32 relative flex items-center justify-center">
            {/* Subtle scattered dots */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <div className="absolute w-1.5 h-1.5 rounded-full bg-heritage-brown/40" style={{ top: '40%', left: '25%' }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-heritage-brown/40" style={{ top: '65%', left: '55%' }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-heritage-brown/40" style={{ top: '30%', right: '30%' }} />
            </div>
            {/* Crescent decoration top-left */}
            <div className="absolute top-3 left-4 w-8 h-8 rounded-full border-2 border-heritage-brown/15" />
            {/* Centered pin + city */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <MapPin size={26} className="text-heritage-brown" strokeWidth={1.7} />
              <span className="text-heritage-brown font-heading text-sm font-semibold">
                {location.city}
              </span>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between bg-card">
            <ChevronLeft size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-heading">استكشف الخريطة</span>
          </div>
        </motion.button>
      </div>


      {/* 2) Suggestions — text only, no photos */}
      <div className="px-5 mt-6">
        <h2 className="font-heading font-bold text-heritage-brown mb-3 text-right">
          اقتراحات أماكن سياحية لك في الرياض
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ direction: 'rtl' }}>
          {suggestions.map((place, i) => (
            <motion.button
              key={place.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => navigate(`/map?place=${place.id}`)}
              className="min-w-[200px] bg-card border border-border rounded-2xl p-4 active:scale-[0.97] transition-transform shadow-sm flex-shrink-0 text-right"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {place.dist.toFixed(1)} كم
                </span>
                <MapPin size={16} className="text-heritage-brown" strokeWidth={1.7} />
              </div>
              <h3 className="font-heading text-sm font-bold text-heritage-brown leading-snug">
                {place.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">{place.district}</p>
              <div className="flex items-center gap-1 mt-2 justify-end">
                <span className="text-[10px] text-muted-foreground">{place.rating}</span>
                <Star size={10} className="text-heritage-brown fill-heritage-brown" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 3) Riyadh dialect & customs experience */}
      <div className="px-5 mt-6">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/rawi?topic=dialect')}
          className="w-full bg-gradient-to-br from-heritage-brown to-primary rounded-2xl p-4 text-right active:scale-[0.98] transition-transform shadow-md flex items-center gap-3"
        >
          <ChevronLeft size={18} className="text-primary-foreground/70 flex-shrink-0" />
          <div className="flex-1 text-right">
            <h3 className="font-heading font-bold text-sm text-primary-foreground">
              تبي تعرف عن لهجة أهل الرياض وعاداتهم؟
            </h3>
            <p className="text-[11px] text-primary-foreground/80 mt-0.5">
              تعال خُض التجربة مع الراوي
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-primary-foreground" strokeWidth={1.7} />
          </div>
        </motion.button>
      </div>
    </main>
  );
}
