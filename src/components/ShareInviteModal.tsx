import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, MessageCircle, Mail, Send, Twitter, Megaphone } from 'lucide-react';
import { useReferral, usePoints } from '@/lib/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHARE_MESSAGE = 'انضم لي في تطبيق "رواة" وخلّنا نستكشف معالم وأماكن المملكة سوا بطريقة ممتعة وتفاعلية! استخدم رمز دعوتي:';

export default function ShareInviteModal({ open, onClose }: Props) {
  const { code, link, hasClaimedShareBonus, recordShare, claimShareBonus } = useReferral();
  const { addPoints } = usePoints();
  const [copied, setCopied] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  const fullText = `${SHARE_MESSAGE} ${code}\n${link}`;

  const grantShareBonus = () => {
    const bonus = claimShareBonus();
    if (bonus > 0) {
      addPoints(bonus);
      setJustClaimed(true);
      setTimeout(() => setJustClaimed(false), 2500);
    }
    recordShare();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      grantShareBonus();
    } catch {}
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'رواة', text: SHARE_MESSAGE + ' ' + code, url: link });
        grantShareBonus();
      } catch {}
    } else {
      copyLink();
    }
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    grantShareBonus();
  };

  const enc = encodeURIComponent(fullText);
  const channels = [
    {
      name: 'واتساب',
      icon: MessageCircle,
      bg: 'bg-[#25D366]',
      onClick: () => openExternal(`https://wa.me/?text=${enc}`),
    },
    {
      name: 'تويتر',
      icon: Twitter,
      bg: 'bg-[#1DA1F2]',
      onClick: () => openExternal(`https://twitter.com/intent/tweet?text=${enc}`),
    },
    {
      name: 'تيليجرام',
      icon: Send,
      bg: 'bg-[#229ED9]',
      onClick: () => openExternal(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${enc}`),
    },
    {
      name: 'البريد',
      icon: Mail,
      bg: 'bg-heritage-brown',
      onClick: () => openExternal(`mailto:?subject=${encodeURIComponent('جرّب رواة')}&body=${enc}`),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="إغلاق"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            dir="rtl"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-card rounded-t-3xl shadow-2xl border-t border-border mx-auto w-full max-w-[440px]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur px-5 pt-3 pb-3 border-b border-border z-10">
              <div className="mx-auto w-10 h-1 rounded-full bg-muted mb-3" />
              <div className="flex items-center justify-between">
                <button onClick={onClose} aria-label="إغلاق" className="text-muted-foreground">
                  <X size={20} />
                </button>
                <h2 className="font-heading font-bold text-heritage-brown">رمز الدعوة</h2>
                <div className="w-5" />
              </div>
            </div>

            {/* Hero */}
            <div className="px-5 pt-5">
              <div className="rounded-3xl bg-gradient-to-br from-secondary via-card to-secondary p-6 text-center relative overflow-hidden border border-border">
                <div className="absolute -top-6 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-heritage-brown/10 blur-2xl" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <Megaphone size={28} className="text-heritage-brown" strokeWidth={1.7} />
                  </div>
                  <h3 className="font-heading font-bold text-heritage-brown text-lg">
                    شارك رواة، واكسب نقاطك
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
                    احصل على <span className="font-bold text-heritage-brown">٣٠ نقطة</span> أول ما تشارك التطبيق،
                    و<span className="font-bold text-heritage-brown">٢٠ نقطة إضافية</span> عن كل صديق ينضم بدعوتك.
                  </p>
                </div>
              </div>
            </div>

            {/* Code box */}
            <div className="px-5 mt-4">
              <button
                onClick={copyLink}
                className="w-full bg-secondary border border-border rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-2">
                  {copied ? (
                    <Check size={16} className="text-heritage-brown" />
                  ) : (
                    <Copy size={16} className="text-heritage-brown" />
                  )}
                  <span className="text-xs font-heading text-heritage-brown">
                    {copied ? 'تم النسخ' : 'انسخ'}
                  </span>
                </div>
                <span className="font-heading font-bold text-lg text-heritage-brown tracking-wider">
                  @{code}
                </span>
              </button>
            </div>

            {/* Stats removed — points now reflect directly in the profile page */}

            {/* Bonus banner */}
            {justClaimed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-5 mt-3 bg-primary/10 border border-primary/30 rounded-xl p-3 text-center"
              >
                <p className="text-xs font-heading text-heritage-brown">
                  +٣٠ نقطة! شكراً لمشاركتك 🎉
                </p>
              </motion.div>
            )}

            {/* Share channels */}
            <div className="px-5 mt-5">
              <p className="text-xs text-muted-foreground mb-2 text-right">شارك عبر</p>
              <div className="grid grid-cols-4 gap-3">
                {channels.map((c) => (
                  <button
                    key={c.name}
                    onClick={c.onClick}
                    className="flex flex-col items-center gap-1.5 active:scale-95 transition"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center text-white shadow-md`}>
                      <c.icon size={20} strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] text-foreground/80">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Native share */}
            <div className="px-5 mt-5 pb-8">
              <button
                onClick={nativeShare}
                className="w-full bg-gradient-to-br from-heritage-brown to-primary text-primary-foreground rounded-2xl py-3.5 font-heading font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md"
              >
                <Share2 size={16} />
                شارك التطبيق
              </button>
              {!hasClaimedShareBonus && (
                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  بمجرد مشاركتك أول مرة تحصل على ٣٠ نقطة فوراً
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
