import { useState } from 'react';
import { ArrowRight, Mail, MessageCircle, Phone, HelpCircle, Headset, Store, Plus, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const channels = [
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    value: 'support@ruwat.sa',
    href: 'mailto:support@ruwat.sa',
  },
  {
    icon: Phone,
    title: 'اتصال مباشر',
    value: '+966 11 000 0000',
    href: 'tel:+966110000000',
  },
  {
    icon: MessageCircle,
    title: 'واتساب',
    value: 'ابدأ محادثة',
    href: 'https://wa.me/966500000000',
  },
];

const faqs = [
  { q: 'كيف أغيّر اسمي؟', a: 'من صفحة "حسابي" في الأسفل، أدخل اسمًا جديدًا واحفظه.' },
  { q: 'كيف أكسب نقاطًا؟', a: 'تفاعل مع الراوي واستكشف المحتوى — كل تفاعل يضيف لك نقاطًا.' },
  {
    q: 'كيف أرفع متجري الثقافي على الخريطة؟',
    a: 'عن طريق التسجيل في خانة "رفع المتاجر" في صفحة الخريطة، ثم تعبئة المعلومات الكاملة:\n• اسم المكان والحي\n• صور حديثة وواضحة للمكان\n• نبذة تعريفية عن الخدمات\n• رسوم الدخول (إن وُجدت)\n• هل يدعم الاحتياجات الخاصة\n• إتمام رسوم الدفع للنشر',
  },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    district: '',
    description: '',
    fee: '',
    accessible: false,
    photos: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.district.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setForm({ name: '', district: '', description: '', fee: '', accessible: false, photos: '' });
    }, 1800);
  };

  return (
    <div className="min-h-screen pb-32 najdi-pattern">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div />
          <button onClick={() => navigate(-1)} aria-label="رجوع">
            <ArrowRight size={22} className="text-heritage-brown" />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
            <Headset size={24} strokeWidth={1.6} className="text-heritage-brown" />
          </div>
          <div className="text-right">
            <h1 className="font-heading text-2xl font-bold text-heritage-brown">الدعم</h1>
            <p className="text-muted-foreground text-xs mt-0.5">نحن هنا لمساعدتك في أي وقت</p>
          </div>
        </motion.div>
      </div>

      {/* Channels */}
      <div className="px-5 space-y-3">
        {channels.map((c, i) => (
          <motion.a
            key={c.title}
            href={c.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 text-right active:scale-[0.97] transition-transform shadow-sm"
          >
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <c.icon size={20} strokeWidth={1.6} className="text-heritage-brown" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-heading font-semibold text-sm text-heritage-brown">{c.title}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{c.value}</p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* FAQ */}
      <div className="px-5 mt-7">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle size={18} className="text-heritage-brown" strokeWidth={1.7} />
          <h2 className="font-heading font-bold text-heritage-brown">الأسئلة الشائعة</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 text-right"
            >
              <h3 className="font-heading font-semibold text-sm text-heritage-brown">{f.q}</h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed whitespace-pre-line">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upload store CTA */}
      <div className="px-5 mt-7">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-br from-heritage-brown to-primary rounded-2xl p-4 flex items-center gap-3 text-right shadow-md active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Store size={20} strokeWidth={1.7} className="text-primary-foreground" />
          </div>
          <div className="flex-1 text-right">
            <h3 className="font-heading font-bold text-sm text-primary-foreground">رفع المتاجر الثقافية</h3>
            <p className="text-[11px] text-primary-foreground/80 mt-0.5">سجّل متجرك وظهر في الخريطة</p>
          </div>
          <Plus size={18} className="text-primary-foreground" />
        </motion.button>
      </div>

      {/* Modal: Upload store form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-border"
            >
              <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-5 py-3 flex items-center justify-between">
                <button onClick={() => setShowForm(false)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
                <h2 className="font-heading font-bold text-heritage-brown">رفع متجر ثقافي</h2>
              </div>

              {submitted ? (
                <div className="p-10 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                    <Check size={32} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-heritage-brown">تم استلام طلبك</h3>
                  <p className="text-muted-foreground text-sm">سنراجع المعلومات ونتواصل معك قريبًا.</p>
                </div>
              ) : (
                <div className="p-5 space-y-3 text-right">
                  <Field label="اسم المكان">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="مثل: متحف التراث النجدي"
                      className="ruwat-input"
                    />
                  </Field>
                  <Field label="الحي">
                    <input
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder="مثل: حي الديرة"
                      className="ruwat-input"
                    />
                  </Field>
                  <Field label="نبذة عن المكان">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="اكتب نبذة موجزة..."
                      className="ruwat-input resize-none"
                    />
                  </Field>
                  <Field label="صور للمكان (روابط مفصولة بفاصلة)">
                    <input
                      value={form.photos}
                      onChange={(e) => setForm({ ...form, photos: e.target.value })}
                      placeholder="https://..."
                      className="ruwat-input"
                      dir="ltr"
                    />
                  </Field>
                  <Field label="رسوم الدخول">
                    <input
                      value={form.fee}
                      onChange={(e) => setForm({ ...form, fee: e.target.value })}
                      placeholder="مثل: 20 ريال أو مجاني"
                      className="ruwat-input"
                    />
                  </Field>
                  <label className="flex items-center justify-between gap-3 bg-secondary rounded-xl px-4 py-3">
                    <span className="text-sm font-heading text-heritage-brown">يدعم الاحتياجات الخاصة ♿</span>
                    <input
                      type="checkbox"
                      checked={form.accessible}
                      onChange={(e) => setForm({ ...form, accessible: e.target.checked })}
                      className="w-5 h-5 accent-primary"
                    />
                  </label>

                  <button
                    onClick={handleSubmit}
                    disabled={!form.name.trim() || !form.district.trim()}
                    className="w-full mt-2 bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground rounded-xl py-3 font-heading font-semibold text-sm active:scale-[0.97] transition-transform disabled:opacity-50"
                  >
                    إرسال الطلب
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-heading text-heritage-brown mb-1.5">{label}</label>
      {children}
    </div>
  );
}
