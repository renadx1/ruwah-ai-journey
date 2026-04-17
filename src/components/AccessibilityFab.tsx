import { useState } from 'react';
import { Accessibility, X, Type, Contrast, Mic, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '@/lib/accessibility';

export default function AccessibilityFab() {
  const [open, setOpen] = useState(false);
  const {
    largeText,
    highContrast,
    voiceControl,
    toggleLargeText,
    toggleHighContrast,
    toggleVoiceControl,
    speak,
    isSpeaking,
    stopSpeaking,
  } = useAccessibility();

  const readPage = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    // Read main heading + paragraphs
    const main = document.querySelector('main, [data-a11y-read], body');
    const text = main?.textContent?.slice(0, 1500) || '';
    speak(text);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-[55] w-11 h-11 rounded-full bg-card/95 backdrop-blur border border-border shadow-md flex items-center justify-center active:scale-95 transition-transform"
        aria-label="إعدادات إمكانية الوصول"
      >
        <Accessibility size={20} strokeWidth={1.7} className="text-heritage-brown" />
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
                <Row
                  icon={<Type size={18} className="text-heritage-brown" />}
                  title="تكبير الخط"
                  desc="حجم نص أكبر للقراءة المريحة"
                  active={largeText}
                  onAction={toggleLargeText}
                />
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
