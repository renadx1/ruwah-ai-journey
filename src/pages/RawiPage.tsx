import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Send, Bot, User as UserIcon, Mic, Volume2, Square } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { learnCategories } from '@/lib/mockData';
import { usePoints, useLocation } from '@/lib/useStore';

const mockResponses: Record<string, string[]> = {
  synonyms: [
    '🔤 **وش يعني "يبّه"؟**\nتُستخدم في نجد وتعني "يا أبي" أو للتعبير عن الدهشة.\n\n💡 مثال: "يبّه! وش هالشغل الحلو!"',
    '🔤 **كلمة "زقرت"**\nتعني الصراخ بصوت عالٍ من الفرح.\n\n💡 تُستخدم في الأعراس والمناسبات.',
  ],
  proverbs: [
    '💬 **"اللي ما يعرف الصقر يشويه"**\n\nالمعنى: من لا يعرف قيمة الشيء يضيّعه.',
    '💬 **"كل شارد وله وارد"**\n\nالمعنى: كل غائب سيعود يومًا.',
  ],
  stories: ['📖 **قصة "حاتم الطائي"**\n\nكان حاتم مشهورًا بكرمه الشديد.'],
  culture: ['🎭 **"العرضة النجدية"**\n\nرقصة شعبية تقليدية تُؤدّى في المناسبات الوطنية.'],
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const chatSuggestions = [
  '🏛️ أخبرني عن أهم المعالم في الرياض',
  '🍚 وش الأكلات الشعبية النجدية؟',
  '💬 علّمني أمثال شعبية',
  '🎭 احكِ لي عن العرضة النجدية',
];

function getAIResponse(message: string, place?: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (place) {
        resolve(`${place} هو من أهم المعالم الثقافية في المنطقة. يعود تاريخه إلى عدة قرون ويمثل جزءًا أصيلاً من التراث السعودي.\n\nهل تريد معرفة المزيد عن تاريخه؟`);
      } else if (message.includes('متحف') || message.includes('معالم')) {
        resolve('من أبرز معالم الرياض:\n🏛️ المتحف الوطني السعودي\n🏰 حي الطريف بالدرعية\n🏯 قصر المصمك\n🏪 سوق الزل');
      } else if (message.includes('أكل') || message.includes('طعام')) {
        resolve('من أشهر الأكلات الشعبية في نجد:\n🍚 الكبسة\n🫓 الجريش\n🍖 المطازيز\n☕ القهوة السعودية');
      } else if (message.includes('مثل') || message.includes('أمثال')) {
        resolve('💬 "اللي ما يعرف الصقر يشويه" — من لا يعرف قيمة الشيء يضيّعه.\n\n💬 "كل شارد وله وارد" — كل غائب سيعود يومًا.');
      } else {
        resolve('سؤال رائع! التراث السعودي غني ومتنوع.\n\nيمكنني مساعدتك في:\n- 🏰 المواقع التراثية\n- 📚 الأمثال والعادات\n- 🎭 الفنون الشعبية');
      }
    }, 900 + Math.random() * 600);
  });
}

type Tab = 'learn' | 'chat';

export default function RawiPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'learn';
  const placeName = searchParams.get('place');
  const { addPoints } = usePoints();
  const location = useLocation();

  const [tab, setTab] = useState<Tab>(placeName ? 'chat' : initialTab);

  // ---- Learn state ----
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setLoading(true);
    setTimeout(() => {
      const responses = mockResponses[categoryId] || ['محتوى قادم قريبًا...'];
      setContent(responses[Math.floor(Math.random() * responses.length)]);
      setLoading(false);
      addPoints(5);
    }, 1000);
  };

  // ---- Chat state ----
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: placeName
        ? `أهلًا وسهلًا! 👋 أنا الراوي، مساعدك الذكي لاستكشاف ثقافة المنطقة.\n\nأراك مهتمًا بـ **${placeName}** — اسألني أي شيء عنه!`
        : 'أهلًا وسهلًا! 👋 أنا الراوي، مساعدك الذكي لاستكشاف ثقافة المنطقة.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, tab]);

  const handleSend = async (forced?: string) => {
    const text = (forced ?? input).trim();
    if (!text || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    const response = await getAIResponse(text, placeName || undefined);
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  // Voice input via Web Speech API (graceful fallback)
  const toggleRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('متصفحك لا يدعم التسجيل الصوتي. جرّب Chrome.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'ar-SA';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  // Text-to-speech for assistant messages
  const speak = (msg: Message) => {
    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم تشغيل الصوت.');
      return;
    }
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(msg.content.replace(/\*\*/g, '').replace(/[🏛️🏰🏯🏪✈️📖💬🔤🎭🍚🫓🖖☕👋💡📝📜]/gu, ''));
    utter.lang = 'ar-SA';
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utter);
    setSpeakingId(msg.id);
  };

  return (
    <div className="min-h-screen pb-32 najdi-pattern flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div />
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={22} className="text-heritage-brown" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-heritage-brown">الراوي</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تعلّم وتحدّث عن تراث {location.city}
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="mt-4 bg-card/80 backdrop-blur border border-border rounded-2xl p-1 flex">
          {[
            { key: 'learn' as Tab, label: 'تعلّم' },
            { key: 'chat' as Tab, label: 'المحادثة' },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-heading transition-all ${
                  active
                    ? 'bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground shadow-sm'
                    : 'text-heritage-brown/70'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'learn' ? (
          <motion.div
            key="learn"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1"
          >
            {!activeCategory ? (
              <div className="px-5 space-y-3 mt-2">
                {learnCategories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleSelect(cat.id)}
                    className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 text-right active:scale-[0.97] transition-transform shadow-sm"
                  >
                    <Sparkles size={16} strokeWidth={1.6} className="text-heritage-brown flex-shrink-0" />
                    <div className="flex-1 text-right">
                      <h3 className="font-heading font-semibold text-sm text-heritage-brown">{cat.title}</h3>
                      <p className="text-muted-foreground text-xs mt-0.5">{cat.description}</p>
                    </div>
                    <span className="text-2xl grayscale-[40%]">{cat.icon}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="px-5">
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
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Sparkles size={24} className="text-heritage-brown" />
                      </motion.div>
                      <span className="text-muted-foreground text-sm font-heading">جاري التوليد بالذكاء الاصطناعي...</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-foreground leading-relaxed whitespace-pre-line text-sm">
                        {content.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <h3 key={i} className="font-heading font-bold text-base mt-2 text-heritage-brown">{line.replace(/\*\*/g, '')}</h3>;
                          }
                          return <p key={i} className="my-1">{line.replace(/\*\*/g, '').replace(/\*/g, '')}</p>;
                        })}
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border justify-center">
                        <span className="text-xs text-heritage-brown font-heading">+5 نقاط 🌟</span>
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
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 flex flex-col"
          >
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[calc(100vh-380px)]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-bl-sm'
                      : 'bg-card border border-border text-foreground rounded-br-sm'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1 justify-between">
                      <div className="flex items-center gap-1.5">
                        {msg.role === 'assistant' ? (
                          <Bot size={12} className="text-heritage-brown" />
                        ) : (
                          <UserIcon size={12} />
                        )}
                        <span className="text-[10px] opacity-70 font-heading">
                          {msg.role === 'user' ? 'أنت' : 'الراوي'}
                        </span>
                      </div>
                      {msg.role === 'assistant' && (
                        <button onClick={() => speak(msg)} aria-label="استمع">
                          <Volume2
                            size={14}
                            className={`${speakingId === msg.id ? 'text-primary' : 'text-heritage-brown/60'}`}
                          />
                        </button>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.content.replace(/\*\*/g, '')}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 rounded-br-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-heritage-brown/60 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggested prompts (ChatGPT-style) — show when only welcome message */}
              {messages.length === 1 && !isTyping && (
                <div className="grid grid-cols-2 gap-2 pt-3" dir="rtl">
                  {chatSuggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => handleSend(s)}
                      className="bg-card border border-border rounded-2xl p-3 text-right text-xs font-heading text-heritage-brown active:scale-[0.97] transition-transform shadow-sm leading-snug"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Input bar with mic */}
            <div className="px-4 pt-2 pb-3 bg-card/95 backdrop-blur border-t border-border sticky bottom-24">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform flex-shrink-0"
                  aria-label="إرسال"
                >
                  <Send size={16} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اسأل الراوي عن التراث..."
                  className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition text-right font-body"
                />
                <button
                  onClick={toggleRecording}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 border ${
                    isRecording
                      ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse'
                      : 'bg-card text-heritage-brown border-border'
                  }`}
                  aria-label="تسجيل صوتي"
                >
                  {isRecording ? <Square size={14} /> : <Mic size={16} strokeWidth={1.7} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
