import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Send, Bot, User as UserIcon, Mic, Volume2, Square, Paperclip, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { learnCategories } from '@/lib/mockData';
import { usePoints, useLocation } from '@/lib/useStore';
import { useAccessibility } from '@/lib/accessibility';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const categoryPrompts: Record<string, string> = {
  synonyms: 'علّمني بعض المرادفات المحلية في نجد',
  proverbs: 'احكِ لي مثلاً شعبياً نجدياً ومعناه',
  stories: 'احكِ لي قصة تراثية من الرياض',
  culture: 'أخبرني عن التراث الثقافي في الرياض',
};

function getAIResponse(message: string, place?: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (place) {
        resolve(`${place} من أهم المعالم الثقافية في المنطقة. يعود تاريخه إلى عدة قرون ويمثل جزءًا أصيلاً من التراث السعودي.\n\nهل تريد معرفة المزيد عن تاريخه؟`);
      } else if (message.includes('مرادف')) {
        resolve('🔤 من المرادفات المحلية:\n\n• "يبّه" = يا أبي\n• "زقرت" = صراخ من الفرح\n• "مسيّر ومخيّر" = مُجبر وحُر');
      } else if (message.includes('مثل') || message.includes('أمثال')) {
        resolve('💬 "اللي ما يعرف الصقر يشويه"\nالمعنى: من لا يعرف قيمة الشيء يضيّعه.\n\n💬 "كل شارد وله وارد"\nالمعنى: كل غائب سيعود يومًا.');
      } else if (message.includes('قصة') || message.includes('قصص')) {
        resolve('📖 من القصص التراثية: حاتم الطائي اشتهر بكرمه الشديد، ويُحكى أنه ذبح فرسه الوحيد لإكرام ضيف جاءه في ليلة باردة.');
      } else if (message.includes('تراث') || message.includes('عادات') || message.includes('ثقاف')) {
        resolve('🎭 العرضة النجدية رقصة شعبية تقليدية تُؤدّى في المناسبات الوطنية. يصطف الرجال في صفّين متقابلين حاملين السيوف بمصاحبة الطبول والشعر الحماسي.');
      } else if (message.includes('متحف') || message.includes('معالم')) {
        resolve('من أبرز معالم الرياض:\n🏛️ المتحف الوطني السعودي\n🏰 حي الطريف بالدرعية\n🏯 قصر المصمك\n🏪 سوق الزل');
      } else if (message.includes('أكل') || message.includes('طعام')) {
        resolve('من أشهر الأكلات الشعبية في نجد:\n🍚 الكبسة\n🫓 الجريش\n🍖 المطازيز\n☕ القهوة السعودية');
      } else if (message.includes('لهج')) {
        resolve('لهجة أهل الرياض من اللهجات النجدية. تتميّز بنطق الجيم جيماً قاهرية، وكثرة استخدام كلمات مثل: "وش"، "زين"، "يبّه"، "هرج" بمعنى كلام.');
      } else {
        resolve('سؤال رائع! التراث السعودي غني ومتنوع.\n\nيمكنني مساعدتك في:\n• 🏰 المواقع التراثية\n• 📚 الأمثال والعادات\n• 🎭 الفنون الشعبية');
      }
    }, 800 + Math.random() * 500);
  });
}

export default function RawiPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeName = searchParams.get('place');
  const topic = searchParams.get('topic');
  const { addPoints } = usePoints();
  const location = useLocation();
  const { speak, stopSpeaking, isSpeaking } = useAccessibility();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: placeName
        ? `أهلًا وسهلًا 👋 أنا الراوي، مساعدك الذكي لاستكشاف ثقافة المنطقة.\nأراك مهتمًا بـ ${placeName} — اسألني أي شيء عنه!`
        : 'أهلًا وسهلًا 👋 أنا الراوي، مساعدك الذكي لاستكشاف ثقافة المنطقة. اختر موضوعًا أو اسألني مباشرة.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const dialectFired = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
    addPoints(2);
  };

  // Auto-trigger dialect prompt
  useEffect(() => {
    if (topic === 'dialect' && !dialectFired.current) {
      dialectFired.current = true;
      handleSend('أخبرني عن لهجة أهل الرياض وعاداتهم');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

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

  const handleSpeakMsg = (msg: Message) => {
    if (speakingId === msg.id && isSpeaking) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(msg.id);
    speak(msg.content);
  };

  return (
    <main className="min-h-screen pb-32 najdi-pattern flex flex-col" data-a11y-read>
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div />
          <button onClick={() => navigate(-1)} aria-label="رجوع">
            <ArrowRight size={22} className="text-heritage-brown" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-heritage-brown">الراوي</h1>
          <p className="text-muted-foreground text-sm mt-1">
            مساعدك الذكي لاستكشاف تراث {location.city}
          </p>
        </motion.div>
      </div>

      {/* Messages — welcome message first, category cards appear underneath */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-bl-sm'
                  : 'bg-card border border-border text-foreground rounded-br-sm'
              }`}
            >
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
                  <button onClick={() => handleSpeakMsg(msg)} aria-label="استمع">
                    <Volume2
                      size={14}
                      className={`${
                        speakingId === msg.id && isSpeaking ? 'text-primary' : 'text-heritage-brown/60'
                      }`}
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

        {/* Category prompts — appear under the welcome message */}
        {messages.length === 1 && !isTyping && (
          <div className="grid grid-cols-2 gap-2 pt-2" dir="rtl">
            {learnCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => handleSend(categoryPrompts[cat.id])}
                className="bg-card border border-border rounded-2xl p-3 text-right active:scale-[0.97] transition-transform shadow-sm flex items-center gap-2"
              >
                <span className="text-xl grayscale-[40%] flex-shrink-0">{cat.icon}</span>
                <div className="flex-1 text-right min-w-0">
                  <h3 className="font-heading font-semibold text-xs text-heritage-brown truncate">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate">{cat.description}</p>
                </div>
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
    </main>
  );
}
