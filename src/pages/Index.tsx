import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserName, useLocation, usePoints } from '@/lib/useStore';
import { culturalPlaces } from '@/lib/mockData';

export default function Index() {
  const navigate = useNavigate();
  const { name } = useUserName();
  const location = useLocation();
  const { points } = usePoints();

  const displayName = name || 'ضيفنا';

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
          <p className="text-primary-foreground/80 text-sm mt-1">اكتشف تراث وثقافة المملكة</p>
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

      {/* Map Preview */}
      <div className="px-5 -mt-4">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/map')}
          className="w-full bg-card rounded-2xl overflow-hidden shadow-md border border-border active:scale-[0.98] transition-transform"
        >
          <div className="h-36 bg-heritage-sand relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23c4a265'/%3E%3Cstop offset='1' stop-color='%23a08050'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='200'/%3E%3Ccircle cx='200' cy='100' r='60' fill='%23d4b87a' opacity='0.3'/%3E%3Ccircle cx='150' cy='80' r='4' fill='%23704020'/%3E%3Ccircle cx='220' cy='110' r='4' fill='%23704020'/%3E%3Ccircle cx='180' cy='130' r='4' fill='%23704020'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover'
            }} />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <MapPin size={28} className="text-primary" />
              <span className="text-foreground font-heading text-sm font-semibold">{location.city}</span>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <ChevronLeft size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-heading">استكشف الخريطة</span>
          </div>
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-6">
        <h2 className="font-heading font-bold text-foreground mb-3">اكتشف</h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/rawi')}
            className="bg-card border border-border rounded-2xl p-4 text-right active:scale-[0.97] transition-transform shadow-sm"
          >
            <span className="text-3xl grayscale-[60%]">📚</span>
            <h3 className="font-heading font-semibold text-sm mt-2 text-heritage-brown">الراوي</h3>
            <p className="text-muted-foreground text-[11px] mt-1">تعلّم وحوار ذكي</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/rawi?tab=chat')}
            className="bg-card border border-border rounded-2xl p-4 text-right active:scale-[0.97] transition-transform shadow-sm"
          >
            <span className="text-3xl grayscale-[60%]">💬</span>
            <h3 className="font-heading font-semibold text-sm mt-2 text-heritage-brown">حدّث الراوي</h3>
            <p className="text-muted-foreground text-[11px] mt-1">محادثة ذكية</p>
          </motion.button>
        </div>
      </div>

      {/* Personalized suggestions */}
      <div className="px-5 mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[10px] text-muted-foreground font-heading">مختارة بناءً على اهتماماتك</span>
          <h2 className="font-heading font-bold text-foreground">اقتراحات مخصصة لك</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ direction: 'rtl' }}>
          {(() => {
            // Simple personalization: rotate suggestions based on a stable seed (user name length + day of month)
            const seed = (displayName.length + new Date().getDate()) % culturalPlaces.length;
            const ordered = [...culturalPlaces.slice(seed), ...culturalPlaces.slice(0, seed)];
            return ordered.slice(0, 4).map((place, i) => (
              <motion.button
                key={place.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => navigate(`/map?place=${place.id}`)}
                className="min-w-[160px] bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.97] transition-transform shadow-sm flex-shrink-0"
              >
                <div className="h-20 bg-heritage-sand flex items-center justify-center text-3xl">
                  {place.image}
                </div>
                <div className="p-3 text-right">
                  <h3 className="font-heading text-xs font-semibold truncate">{place.name}</h3>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className="text-[10px] text-muted-foreground">{place.rating}</span>
                    <Star size={10} className="text-heritage-gold fill-heritage-gold" />
                  </div>
                </div>
              </motion.button>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
