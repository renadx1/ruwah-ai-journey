import { Home, Map, BookOpen, User, LifeBuoy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// 5 equal tabs (RTL order). Home is centered as a normal tab — no raised pill.
const tabs = [
  { path: '/profile', icon: User, label: 'حسابي' },
  { path: '/rawi', icon: BookOpen, label: 'الراوي' },
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/map', icon: Map, label: 'الخريطة' },
  { path: '/support', icon: LifeBuoy, label: 'الدعم' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
      <div className="bg-card border-t border-border shadow-[0_-4px_12px_rgba(60,30,10,0.08)]">
        <div className="flex items-stretch justify-around px-2 pt-2 pb-2">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 flex-1 py-1.5 group"
              >
                <tab.icon
                  size={22}
                  strokeWidth={1.7}
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
          })}
        </div>
        <div className="bg-card h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}
