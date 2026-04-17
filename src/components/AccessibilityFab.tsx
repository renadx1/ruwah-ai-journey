import { useState } from 'react';
import { Accessibility, X, Type, Contrast, Mic, Volume2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '@/lib/accessibility';

export default function AccessibilityFab() {
  const [open, setOpen] = useState(false);
  const {
    largeText,
    highContrast,
    voiceControl,
    textScale,
    increaseText,
    decreaseText,
    toggleHighContrast,
    toggleVoiceControl,
    speak,
    isSpeaking,
    stopSpeaking,
  } = useAccessibility();

  const anyActive = largeText || highContrast || voiceControl || isSpeaking;

  const readPage = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const main = document.querySelector('[data-a11y-read], main, body');
    const text = main?.textContent?.slice(0, 1500) || '';
    speak(text);
  };

  return (
    <>
      {/* Floating top-right accessibility button — visible on every page */}
      <button
        onClick={() => setOpen(true)}
        aria-label="إعدادات إمكانية الوصول"
        className={`fixed top-3 right-3 z-[55] w-12 h-12 rounded-full shadow-lg backdrop-blur-md border flex items-center justify-center transition-colors ${
          anyActive
            ? 'bg-heritage-brown text-primary-foreground border-heritage-brown'
            : 'bg-card/95 text-heritage-brown border-border'
        }`}
      >
        <Accessibility size={22} strokeWidth={1.8} />
        {anyActive && (
          <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-5 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setOpen(false)} aria-label="إغلاق">
                  <X size={20} className="text-muted-foreground" />
                </button>
                <h2 className="font-heading font-bold text-heritage-brown">إمكانية الوصول</h2>
              </div>

              <div className="space-y-2">
                <Row
                  icon={<Volume2 size={18} className="text-heritage-brown" />}
                  title="القراءة الصوتية"
                  desc="استمع لمحتوى الصفحة"
                  active={isSpeaking}
                  actionLabel={isSpeaking ? 'إيقاف' : 'استمع'}
                  onAction={readPage}
                />
                <Row
                  icon={<Mic size={18} className="text-heritage-brown" />}
                  title="التحكم الصوتي"
                  desc="قل: الرئيسية، الخريطة، الراوي، حسابي، الدعم"
                  active={voiceControl}
                  onAction={toggleVoiceControl}
                />

                {/* Text size with +/- controls */}
                <div className="bg-secondary rounded-2xl p-3 flex items-center gap-3 text-right" dir="rtl">
                  <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                    <Type size={18} className="text-heritage-brown" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-heading font-semibold text-sm text-heritage-brown">حجم الخط</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      الحجم الحالي: {Math.round(textScale * 100)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={decreaseText}
                      aria-label="تصغير الخط"
                      className="w-8 h-8 rounded-full bg-card border border-border text-heritage-brown flex items-center justify-center active:scale-90 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={increaseText}
                      aria-label="تكبير الخط"
                      className="w-8 h-8 rounded-full bg-heritage-brown text-primary-foreground flex items-center justify-center active:scale-90 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <Row
                  icon={<Contrast size={18} className="text-heritage-brown" />}
                  title="تباين عالي"
                  desc="ألوان واضحة للرؤية الضعيفة"
                  active={highContrast}
                  onAction={toggleHighContrast}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Row({
  icon,
  title,
  desc,
  active,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  active: boolean;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="bg-secondary rounded-2xl p-3 flex items-center gap-3 text-right" dir="rtl">
      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 text-right">
        <h3 className="font-heading font-semibold text-sm text-heritage-brown">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onAction}
        className={`px-3 py-1.5 rounded-full text-xs font-heading transition-colors ${
          active
            ? 'bg-heritage-brown text-primary-foreground'
            : 'bg-card text-heritage-brown border border-border'
        }`}
      >
        {actionLabel || (active ? 'مُفعّل' : 'تفعيل')}
      </button>
    </div>
  );
}
