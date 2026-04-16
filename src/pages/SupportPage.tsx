import { ArrowRight, Mail, MessageCircle, Phone, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  { q: 'لا تظهر الخريطة بشكل صحيح', a: 'تأكد من إدخال مفتاح Google Maps API في صفحة الخريطة.' },
  { q: 'كيف أكسب نقاطًا؟', a: 'تفاعل مع الراوي واستكشف المحتوى — كل تفاعل يضيف لك نقاطًا.' },
];

export default function SupportPage() {
  const navigate = useNavigate();

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-heritage-brown">تواصل مع الدعم</h1>
          <p className="text-muted-foreground text-sm mt-1">نحن هنا لمساعدتك في أي وقت</p>
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
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
