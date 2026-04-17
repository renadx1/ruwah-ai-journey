import { useState } from 'react';
import { ArrowRight, Star, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserName, usePoints } from '@/lib/useStore';
import { AccessibilityButton } from '@/components/AccessibilityFab';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { name, saveName } = useUserName();
  const { points } = usePoints();
  const [input, setInput] = useState(name);

  const handleSave = () => {
    if (input.trim()) {
      saveName(input.trim());
    }
  };

  return (
    <div className="min-h-screen pb-32 najdi-pattern">
      <div className="gradient-heritage px-5 pt-12 pb-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <AccessibilityButton tone="dark" />
          <button onClick={() => navigate('/')} aria-label="رجوع للرئيسية">
            <ArrowRight size={22} className="text-primary-foreground" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <span className="text-primary-foreground font-heading text-3xl font-bold">
              {(name || '؟').charAt(0)}
            </span>
          </div>
          <h1 className="text-primary-foreground font-heading text-xl font-bold">
            {name || 'أدخل اسمك'}
          </h1>
        </motion.div>
      </div>

      <div className="px-5 -mt-5">
        {/* Stats — without "دروس" */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-md border border-border grid grid-cols-2 gap-3 text-center mb-6"
        >
          <div>
            <Star size={20} className="text-heritage-brown mx-auto mb-1" />
            <p className="font-heading font-bold text-foreground">{points}</p>
            <span className="text-[10px] text-muted-foreground">نقطة</span>
          </div>
          <div>
            <Trophy size={20} className="text-heritage-brown mx-auto mb-1" />
            <p className="font-heading font-bold text-foreground">مبتدئ</p>
            <span className="text-[10px] text-muted-foreground">المستوى</span>
          </div>
        </motion.div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-sm border border-border"
        >
          <h2 className="font-heading font-semibold text-foreground mb-3">اسم المستخدم</h2>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="أدخل اسمك هنا..."
            className="w-full bg-secondary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition text-right font-body"
          />
          <button
            onClick={handleSave}
            className="w-full mt-3 bg-primary text-primary-foreground rounded-xl py-3 font-heading font-semibold text-sm active:scale-[0.97] transition-transform"
          >
            حفظ
          </button>
        </motion.div>
      </div>
    </div>
  );
}
