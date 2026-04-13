import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Send, Bot, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const mockAIResponses: Record<string, string> = {
  default: 'أهلاً! أنا مساعدك الذكي في رُواة. يمكنني مساعدتك في استكشاف التراث والثقافة السعودية. اسألني عن أي مكان تاريخي أو ثقافي!',
};

function getAIResponse(message: string, place?: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (place) {
        resolve(`${place} هو من أهم المعالم الثقافية في المنطقة. يعود تاريخه إلى عدة قرون ويمثل جزءًا أصيلاً من التراث السعودي.\n\nيمكنك زيارته والاستمتاع بالعمارة التقليدية والتعرف على القصص المرتبطة به. هل تريد معرفة المزيد عن تاريخه أو أماكن مشابهة؟`);
      } else if (message.includes('متحف') || message.includes('museum')) {
        resolve('المتحف الوطني السعودي في الرياض هو أكبر متاحف المملكة، يحتوي على 8 قاعات عرض تروي تاريخ الجزيرة العربية من عصور ما قبل التاريخ حتى العصر الحديث. 🏛️\n\nأنصحك أيضًا بزيارة قصر المصمك القريب منه.');
      } else if (message.includes('أكل') || message.includes('طعام') || message.includes('food')) {
        resolve('من أشهر الأكلات الشعبية في نجد:\n\n🍚 **الكبسة** - الطبق الوطني\n🫓 **الجريش** - من القمح المجروش\n🍖 **المطازيز** - عجينة مع لحم وخضار\n☕ **القهوة السعودية** - مع الهيل والزعفران\n\nهل تريد معرفة طريقة تحضير أي منها؟');
      } else {
        resolve('سؤال رائع! التراث السعودي غني ومتنوع. تتميز منطقة نجد بعمارتها الطينية الفريدة وأمثالها الشعبية العميقة.\n\nيمكنني مساعدتك في:\n- 🏰 استكشاف المواقع التراثية\n- 📚 تعلم الأمثال والشعر النجدي\n- 🎭 فهم العادات والتقاليد\n\nماذا تفضل؟');
      }
    }, 1000 + Math.random() * 1000);
  });
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeName = searchParams.get('place');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: placeName
        ? `أهلاً! 👋 أنت تسأل عن **${placeName}**. هذا مكان رائع! كيف أقدر أساعدك؟`
        : 'أهلاً وسهلاً! 👋 أنا رُواة، مساعدك الذكي لاستكشاف التراث السعودي. كيف أقدر أساعدك اليوم؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await getAIResponse(input, placeName || undefined);
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="gradient-heritage px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary-foreground" />
          <span className="text-primary-foreground font-heading font-semibold text-sm">رُواة AI</span>
        </div>
        <button onClick={() => navigate(-1)}>
          <ArrowRight size={22} className="text-primary-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 heritage-pattern">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-bl-sm'
                : 'bg-card border border-border text-foreground rounded-br-sm'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {msg.role === 'assistant' ? (
                  <Bot size={12} className="text-heritage-gold" />
                ) : (
                  <User size={12} />
                )}
                <span className="text-[10px] opacity-70 font-heading">
                  {msg.role === 'user' ? 'أنت' : 'رُواة'}
                </span>
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
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform flex-shrink-0"
          >
            <Send size={16} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن التراث والثقافة..."
            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition text-right font-body"
          />
        </div>
      </div>
    </div>
  );
}
