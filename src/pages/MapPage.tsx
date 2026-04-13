import { useState } from 'react';
import { ArrowRight, MapPin, Star, MessageCircle, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { culturalPlaces, CulturalPlace } from '@/lib/mockData';

const categoryIcons: Record<string, string> = {
  museum: '🏛️',
  heritage: '🏰',
  historical: '🏯',
};

const categoryLabels: Record<string, string> = {
  museum: 'متحف',
  heritage: 'تراثي',
  historical: 'تاريخي',
};

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('place');
  const [selected, setSelected] = useState<CulturalPlace | null>(
    preselected ? culturalPlaces.find(p => p.id === preselected) || null : null
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Map area */}
      <div className="relative h-[55vh] bg-heritage-sand overflow-hidden">
        {/* Decorative map background */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 30% 40%, hsl(38 35% 80%) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, hsl(30 30% 82%) 0%, transparent 50%),
            hsl(38 35% 85%)
          `
        }} />
        
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(10)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="currentColor" className="text-heritage-brown" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="currentColor" className="text-heritage-brown" />
          ))}
        </svg>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-5 pt-12 flex items-center justify-between">
          <div />
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-card/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
            <ArrowRight size={18} className="text-foreground" />
          </button>
        </div>

        {/* Pins */}
        {culturalPlaces.map((place, i) => {
          const x = 15 + (i % 3) * 30 + Math.random() * 10;
          const y = 20 + Math.floor(i / 3) * 35 + Math.random() * 10;
          return (
            <motion.button
              key={place.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
              onClick={() => setSelected(place)}
              className={`absolute z-10 flex flex-col items-center ${selected?.id === place.id ? 'scale-110' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                selected?.id === place.id ? 'bg-primary ring-2 ring-primary/30' : 'bg-card'
              }`}>
                <span className="text-lg">{place.image}</span>
              </div>
              <span className="text-[9px] font-heading mt-1 bg-card/80 backdrop-blur px-1.5 py-0.5 rounded-full text-foreground max-w-[80px] truncate">
                {place.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Place list or detail */}
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
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-heading">
                    {categoryLabels[selected.category]}
                  </span>
                  <h2 className="font-heading font-bold text-lg mt-1">{selected.name}</h2>
                </div>
                <span className="text-3xl">{selected.image}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed text-right mb-4">
                {selected.description}
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/chat?place=${selected.name}`)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-heading text-sm active:scale-[0.97] transition-transform"
                >
                  <MessageCircle size={16} />
                  <span>اسأل الذكاء الاصطناعي</span>
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-heading text-foreground">{selected.rating}</span>
                  <Star size={14} className="text-heritage-gold fill-heritage-gold" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 mt-4"
          >
            <h2 className="font-heading font-bold mb-3">المواقع الثقافية</h2>
            <div className="space-y-3">
              {culturalPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelected(place)}
                  className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-right"
                >
                  <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <h3 className="font-heading text-sm font-semibold">{place.name}</h3>
                    <span className="text-[11px] text-muted-foreground">{categoryLabels[place.category]}</span>
                  </div>
                  <span className="text-xl">{place.image}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
