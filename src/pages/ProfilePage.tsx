import { useEffect, useState } from 'react';
import { ArrowRight, Star, Trophy, Megaphone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserName, usePoints, useReferral } from '@/lib/useStore';
import { AccessibilityButton } from '@/components/AccessibilityFab';
import ShareInviteModal from '@/components/ShareInviteModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { name, saveName } = useUserName();
  const { points, addPoints } = usePoints();
  const { addReferral } = useReferral();
  const [input, setInput] = useState(name);
  const [shareOpen, setShareOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // If user came in via a referral link (?ref=...), grant the inviter's bonus once
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref) return;
    const seen = localStorage.getItem('ruwat_referred_by');
    if (seen) return;
    localStorage.setItem('ruwat_referred_by', ref);
    const bonus = addReferral();
    addPoints(bonus);
  }, [searchParams, addReferral, addPoints]);

  const handleSave = () => {
    if (input.trim()) {
      saveName(input.trim());
    }
  };

  return (
    <div className="min-h-screen pb-32 najdi-pattern">
      <div className="gradient-heritage px-5 pt-12 pb-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} aria-label="رجوع للرئيسية">
            <ArrowRight size={22} className="text-primary-foreground" />
          </button>
          <AccessibilityButton tone="dark" />
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
          className="bg-card rounded-2xl p-4 shadow-md border border-border grid grid-cols-2 gap-3 text-center mb-4"
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
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-4"
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

        {/* Share/invite — warm terracotta CTA, distinct from the brown header */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShareOpen(true)}
          className="w-full rounded-2xl p-4 flex items-center gap-4 text-right text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
          style={{ backgroundImage: 'linear-gradient(135deg, #8A5128, #6E4125)' }}
        >
          <div className="w-11 h-11 rounded-2xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Megaphone size={20} strokeWidth={1.7} />
          </div>
          <div className="flex-1 text-right">
            <h3 className="font-heading font-bold text-sm">انشر التطبيق واكسب نقاط</h3>
            <p className="text-[11px] opacity-90 mt-0.5">
              ٣٠ نقطة عند المشاركة + ٢٠ عن كل صديق ينضم
            </p>
          </div>
          <ArrowRight size={16} className="rotate-180 opacity-90" />
        </motion.button>
      </div>

      <ShareInviteModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
