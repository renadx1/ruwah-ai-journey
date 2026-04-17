import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserName, useLocation, usePoints } from '@/lib/useStore';
import { culturalPlaces, distanceKm } from '@/lib/mockData';

export default function Index() {
  const navigate = useNavigate();
  const { name } = useUserName();
  const location = useLocation();
  const { points } = usePoints();

  const displayName = name || 'ضيفنا';

  // Personalized suggestions: places sorted by distance from user
  const suggestions = [...culturalPlaces]
    .map((p) => ({ ...p, dist: distanceKm(location.lat, location.lng, p.lat, p.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);

  return (
    <div className="min-h-screen pb-32 najdi-pattern">
      {/* Header */}
      <div className="gradient-heritage px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-primary-foreground font-heading font-bold text-sm">
              {displayName.charAt(0)}
            </span>
          </button>
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

      {/* Personalized suggestions — moved ABOVE "اكتشف" */}
      <div className="px-5 mt-6">
        <div className="flex items-baseline justify-between mb-3" dir="rtl">
          <h2 className="font-heading font-bold text-foreground">اقتراحات أماكن سياحية في الرياض</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ direction: 'rtl' }}>
          {suggestions.map((place, i) => (
            <motion.button
              key={place.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              onClick={() => navigate(`/map?place=${place.id}`)}
              className="min-w-[180px] bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.97] transition-transform shadow-sm flex-shrink-0 text-right"
            >
              <div className="h-24 bg-heritage-sand overflow-hidden relative">
                <img
                  src={place.photos[0]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 bg-card/90 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1">
                  <span className="text-[10px] font-heading text-heritage-brown">
                    {place.dist.toFixed(1)} كم
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-heading text-xs font-semibold truncate text-heritage-brown">
                  {place.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{place.district}</p>
                <div className="flex items-center gap-1 mt-1.5 justify-end">
                  <span className="text-[10px] text-muted-foreground">{place.rating}</span>
                  <Star size={10} className="text-heritage-brown fill-heritage-brown" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Map Preview - الخريطة (اكتشف) */}
      <div className="px-5 mt-6">
        <h2 className="font-heading font-bold text-foreground mb-3">اكتشف</h2>
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/map')}
          className="w-full bg-card rounded-2xl overflow-hidden shadow-md border border-border active:scale-[0.98] transition-transform"
        >
          <div className="h-32 bg-heritage-sand relative flex items-center justify-center najdi-pattern-strong">
            <div className="relative z-10 flex flex-col items-center gap-2">
              <MapPin size={28} className="text-heritage-brown" strokeWidth={1.7} />
              <span className="text-heritage-brown font-heading text-sm font-semibold">{location.city}</span>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <ChevronLeft size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-heading">استكشف الخريطة</span>
          </div>
        </motion.button>
      </div>

      {/* Riyadh dialect & customs experience box */}
      <div className="px-5 mt-4">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/rawi?tab=chat&topic=dialect')}
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
    </div>
  );
}
