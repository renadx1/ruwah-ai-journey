import { Home, Map, BookOpen, User, LifeBuoy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Side tabs (RTL): right side first, then left side. Center is Home (raised).
const sideTabs = [
  // Right side
  { path: '/profile', icon: User, label: 'حسابي' },
  { path: '/rawi', icon: BookOpen, label: 'الراوي' },
  // Left side
  { path: '/map', icon: Map, label: 'الخريطة' },
  { path: '/support', icon: LifeBuoy, label: 'الدعم' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const homeActive = location.pathname === '/';

  const renderTab = (tab: typeof sideTabs[number]) => {
    const active = location.pathname === tab.path;
    return (
      <button
        key={tab.path}
        onClick={() => navigate(tab.path)}
        className="flex flex-col items-center gap-1 flex-1 pt-3 pb-2 group"
      >
        <tab.icon
          size={22}
          strokeWidth={1.6}
          className={`transition-colors ${active ? 'text-heritage-brown' : 'text-heritage-brown/60 group-active:text-heritage-brown'}`}
        />
        <span
          className={`text-[10px] font-heading transition-colors ${
            active ? 'text-heritage-brown font-semibold' : 'text-heritage-brown/60'
          }`}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  // SVG with notch carved out of the top-center for the home circle
  const NOTCH_RADIUS = 38; // half-width of the notch
  const BAR_HEIGHT = 78;
  const VIEW_W = 400;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto pointer-events-none">
      <div className="relative pointer-events-auto">
        {/* Curved background using SVG */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${BAR_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full block drop-shadow-[0_-4px_12px_rgba(60,30,10,0.12)]"
          style={{ height: BAR_HEIGHT }}
        >
          <defs>
            <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--card))" />
              <stop offset="100%" stopColor="hsl(var(--background))" />
            </linearGradient>
          </defs>
          <path
            fill="url(#navGrad)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            d={`
              M0,12
              L${VIEW_W / 2 - NOTCH_RADIUS - 14},12
              C${VIEW_W / 2 - NOTCH_RADIUS},12 ${VIEW_W / 2 - NOTCH_RADIUS + 4},${NOTCH_RADIUS - 4} ${VIEW_W / 2},${NOTCH_RADIUS - 4}
              C${VIEW_W / 2 + NOTCH_RADIUS - 4},${NOTCH_RADIUS - 4} ${VIEW_W / 2 + NOTCH_RADIUS},12 ${VIEW_W / 2 + NOTCH_RADIUS + 14},12
              L${VIEW_W},12
              L${VIEW_W},${BAR_HEIGHT}
              L0,${BAR_HEIGHT}
              Z
            `}
          />
        </svg>

        {/* Tabs overlaid on the bar */}
        <div className="absolute inset-0 flex items-end px-2 pb-1">
          <div className="flex flex-1 justify-around">
            {sideTabs.slice(0, 2).map(renderTab)}
          </div>
          <div className="w-20" />
          <div className="flex flex-1 justify-around">
            {sideTabs.slice(2).map(renderTab)}
          </div>
        </div>

        {/* Center elevated Home button — fixed in the middle */}
        <motion.button
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.92 }}
          className="absolute left-1/2 -translate-x-1/2 -top-7"
          aria-label="الرئيسية"
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ring-4 ring-background bg-gradient-to-br from-heritage-brown to-primary transition-transform ${
              homeActive ? 'scale-105' : ''
            }`}
          >
            <Home size={26} strokeWidth={1.8} className="text-primary-foreground" />
          </div>
          <span className={`block text-center text-[10px] font-heading mt-1 ${homeActive ? 'font-bold text-heritage-brown' : 'font-semibold text-heritage-brown/80'}`}>
            الرئيسية
          </span>
        </motion.button>
      </div>
      {/* Safe area fill below */}
      <div className="bg-background h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
