import { useState } from 'react';
import { ArrowRight, Mail, MessageCircle, Phone, HelpCircle, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AccessibilityButton } from '@/components/AccessibilityFab';

const channels = [
  { icon: Mail, title: 'البريد الإلكتروني', value: 'support@ruwat.sa', href: 'mailto:support@ruwat.sa' },
  { icon: Phone, title: 'اتصال مباشر', value: '+966 11 000 0000', href: 'tel:+966110000000' },
  { icon: MessageCircle, title: 'واتساب', value: 'ابدأ محادثة', href: 'https://wa.me/966500000000' },
];

const faqs = [
  { q: 'كيف أغيّر اسمي؟', a: 'من صفحة "حسابي" في الأسفل، أدخل اسمًا جديدًا واحفظه.' },
  {
    q: 'النقاط: كيف أكسبها وش أستفيد منها؟',
    a: 'تتراكم نقاطك عبر تفاعلك اليومي مع التطبيق:\n• محادثة الراوي وطرح الأسئلة\n• استكشاف المعالم والمواقع على الخريطة\n• مشاركة التطبيق مع أصدقائك (٣٠ نقطة)\n• انضمام صديقك عبر دعوتك (٢٠ نقطة إضافية)\n\nكل ما وصلت لـ ١٠٠ نقطة، تنفتح لك مكافأة من اختيارك:\n• كود خصم من المتاجر والمحلات المتعاونة معنا\n• تذكرة دخول مجانية لأحد المعالم أو الأماكن السياحية الشريكة\n\nكل ما زادت نقاطك، زادت مكافآتك.',
  },
  {
    q: 'كيف أرفع متجري الثقافي على الخريطة؟',
    a: 'عن طريق التسجيل في خانة "رفع المتاجر" في صفحة الخريطة، ثم تعبئة المعلومات الكاملة:\n• اسم المكان والحي\n• نبذة تعريفية عن الخدمات\n• رابط الموقع على قوقل ماب\n• رسوم الدخول (إن وُجدت)\n• هل يدعم الاحتياجات الخاصة\n• إرسال الطلب',
  },
];

export default function SupportPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen pb-32 najdi-pattern" data-a11y-read>
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} aria-label="رجوع للرئيسية">
            <ArrowRight size={22} className="text-heritage-brown" />
          </button>
          <AccessibilityButton tone="light" />
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

    </main>
  );
}
