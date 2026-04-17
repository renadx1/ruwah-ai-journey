import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreUploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
      setSubmitted(false);
      setForm({ name: '', district: '', description: '', fee: '', accessible: false, photos: '' });
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-border"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-5 py-3 flex items-center justify-between">
              <button onClick={onClose} aria-label="إغلاق">
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
