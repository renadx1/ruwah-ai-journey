import { Home, Map, BookOpen, User, Headphones } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Side tabs (RTL): right side first, then left side. Center is Home (raised).
const sideTabs = [
  // Right side (appears first in RTL)
  { path: '/profile', icon: User, label: 'حسابي' },
  { path: '/rawi', icon: BookOpen, label: 'الراوي' },
  // Left side
  { path: '/map', icon: Map, label: 'الخريطة' },
  { path: '/support', icon: Headphones, label: 'الدعم' },
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
          className={`transition-colors ${
            active ? 'text-heritage-brown' : 'text-heritage-brown/60 group-active:text-heritage-brown'
          }`}
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto pointer-events-none">
      <div className="relative pointer-events-auto h-[88px]">
        {/* Curved background with notch for the elevated home button */}
        <svg
          viewBox="0 0 400 88"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 w-full h-full drop-shadow-[0_-4px_12px_rgba(60,30,10,0.10)]"
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
            d="M0,20 L150,20 C166,20 170,52 200,52 C230,52 234,20 250,20 L400,20 L400,88 L0,88 Z"
          />
        </svg>

        {/* Side tabs */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex items-end px-2 pb-2">
          <div className="flex flex-1 justify-around">
            {sideTabs.slice(0, 2).map(renderTab)}
          </div>
          <div className="w-20 flex-shrink-0" />
          <div className="flex flex-1 justify-around">
            {sideTabs.slice(2).map(renderTab)}
          </div>
        </div>

        {/* Center elevated Home button — fixed, no label, no movement */}
        <button
          onClick={() => navigate('/')}
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 flex flex-col items-center"
          aria-label="الرئيسية"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg ring-4 ring-background bg-gradient-to-br from-heritage-brown to-primary">
            <Home size={26} strokeWidth={1.8} className="text-primary-foreground" />
          </div>
        </button>
      </div>
      {/* Safe area fill */}
      <div className="bg-background h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
