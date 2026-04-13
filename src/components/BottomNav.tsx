import { Home, Map, BookOpen, MessageCircle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/profile', icon: User, label: 'حسابي' },
  { path: '/chat', icon: MessageCircle, label: 'المحادثة' },
  { path: '/learn', icon: BookOpen, label: 'تعلّم' },
  { path: '/map', icon: Map, label: 'الخريطة' },
  { path: '/', icon: Home, label: 'الرئيسية' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative"
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                className={active ? 'text-primary relative z-10' : 'text-muted-foreground relative z-10'}
              />
              <span
                className={`text-[10px] font-heading relative z-10 ${
                  active ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
