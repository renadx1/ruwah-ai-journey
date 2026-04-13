import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { learnCategories } from '@/lib/mockData';
import { usePoints, useLocation } from '@/lib/useStore';

const mockResponses: Record<string, string[]> = {
  synonyms: [
    '🔤 **وش يعني "يبّه"؟**\nتُستخدم في نجد وتعني "يا أبي" أو للتعبير عن الدهشة.\n\n💡 مثال: "يبّه! وش هالشغل الحلو!"',
    '🔤 **كلمة "زقرت"**\nتعني الصراخ بصوت عالٍ من الفرح.\n\n💡 تُستخدم في الأعراس والمناسبات.',
    '🔤 **"مسيّر" و "مخيّر"**\nمسيّر = مُجبر، مخيّر = حر الاختيار.\n\n💡 "الإنسان بين مسيّر ومخيّر"',
  ],
  proverbs: [
    '💬 **"اللي ما يعرف الصقر يشويه"**\n\nالمعنى: من لا يعرف قيمة الشيء يضيّعه.\n\n📖 يُضرب هذا المثل لمن يجهل قدر ما بين يديه.',
    '💬 **"كل شارد وله وارد"**\n\nالمعنى: كل غائب سيعود يومًا.\n\n📖 يُقال للتسلية عند فراق الأحبة.',
  ],
  poetry: [
    '📜 **من شعر محسن الهزّاني:**\n\n*يا ناقتي لا تجزعين من السرى*\n*واصبري يا ناقتي ع المتاعب*\n\n🎯 الشاعر يخاطب ناقته طالبًا منها الصبر على مشقة السفر.',
  ],
  stories: [
    '📖 **قصة "حاتم الطائي"**\n\nكان حاتم مشهورًا بكرمه الشديد. يُحكى أنه ذبح فرسه الوحيد لإكرام ضيف جاءه في ليلة باردة.\n\n🌟 الدرس: الكرم من أعظم صفات العرب.',
  ],
  culture: [
    '🎭 **"العرضة النجدية"**\n\nرقصة شعبية تقليدية تُؤدّى في المناسبات الوطنية. يصطف الرجال في صفّين متقابلين حاملين السيوف، بمصاحبة الطبول والشعر الحماسي.\n\n🇸🇦 تُعتبر الرقصة الوطنية للمملكة.',
  ],
};

export default function LearnPage() {
  const navigate = useNavigate();
  const { addPoints } = usePoints();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setLoading(true);
    // Simulate AI response
    setTimeout(() => {
      const responses = mockResponses[categoryId] || ['محتوى قادم قريبًا...'];
      setContent(responses[Math.floor(Math.random() * responses.length)]);
      setLoading(false);
      addPoints(5);
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-24 heritage-pattern">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div />
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={22} className="text-foreground" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-foreground">تعلّم 📚</h1>
          <p className="text-muted-foreground text-sm mt-1">
            محتوى ذكي مخصص لمنطقة {location.city}
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 space-y-3"
          >
            {learnCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelect(cat.id)}
                className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 text-right active:scale-[0.97] transition-transform shadow-sm"
              >
                <Sparkles size={16} className="text-heritage-gold flex-shrink-0" />
                <div className="flex-1 text-right">
                  <h3 className="font-heading font-semibold text-sm">{cat.title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{cat.description}</p>
                </div>
                <span className="text-2xl">{cat.icon}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-5"
          >
            <button
              onClick={() => { setActiveCategory(null); setContent(''); }}
              className="flex items-center gap-2 text-primary text-sm font-heading mb-4"
            >
              <ArrowRight size={16} />
              <span>رجوع للأقسام</span>
            </button>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm min-h-[200px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles size={24} className="text-heritage-gold" />
                  </motion.div>
                  <span className="text-muted-foreground text-sm font-heading">جاري التوليد بالذكاء الاصطناعي...</span>
                </div>
              ) : (
                <div className="text-right">
                  <div className="prose prose-sm text-foreground leading-relaxed whitespace-pre-line text-sm">
                    {content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h3 key={i} className="font-heading font-bold text-base mt-2">{line.replace(/\*\*/g, '')}</h3>;
                      }
                      if (line.startsWith('*') && line.endsWith('*')) {
                        return <p key={i} className="italic text-heritage-terracotta">{line.replace(/\*/g, '')}</p>;
                      }
                      return <p key={i} className="my-1">{line.replace(/\*\*/g, '').replace(/\*/g, '')}</p>;
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border justify-center">
                    <span className="text-xs text-heritage-gold font-heading">+5 نقاط 🌟</span>
                  </div>
                  <button
                    onClick={() => handleSelect(activeCategory)}
                    className="w-full mt-3 bg-secondary text-secondary-foreground rounded-xl py-3 font-heading text-sm active:scale-[0.97] transition-transform"
                  >
                    محتوى آخر ✨
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
