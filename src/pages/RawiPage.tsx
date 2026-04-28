import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Send, Bot, User as UserIcon, Mic, Volume2, Square, Paperclip, X, History, Plus, Trash2, BookOpen, MessageSquareQuote, ScrollText, Drama } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { learnCategories } from '@/lib/mockData';
import { usePoints, useLocation } from '@/lib/useStore';
import { useAccessibility } from '@/lib/accessibility';
import { AccessibilityButton } from '@/components/AccessibilityFab';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // data URLs for previewing user-uploaded images in the bubble
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STORAGE_KEY = 'ruwat_conversations';

const categoryPrompts: Record<string, string> = {
  synonyms: 'عرّفني على بعض الكلمات والمصطلحات المحلية المتداولة في هذه المنطقة',
  proverbs: 'اذكر لي بعض الأمثال الشعبية المشهورة في هذه المنطقة',
  stories: 'احكِ لي قصة تراثية من قصص هذه المنطقة',
  culture: 'عرّفني على أبرز التراث الثقافي الي موجود في هذه المنطقة',
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rawi-chat`;
const VISION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rawi-vision`;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function streamSSE(
  url: string,
  body: any,
  onDelta: (chunk: string, opts?: { replace?: boolean }) => void
) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) throw new Error('تم تجاوز حد الطلبات. حاول بعد قليل.');
    if (resp.status === 402) throw new Error('انتهى الرصيد. يرجى إضافة رصيد.');
    let errMsg = 'تعذّر الاتصال بالمساعد.';
    try {
      const j = await resp.json();
      if (j?.error) errMsg = j.error;
    } catch {}
    throw new Error(errMsg);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }
      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta;
        const replace = delta?.replace as string | undefined;
        const content = delta?.content as string | undefined;
        if (typeof replace === 'string') {
          onDelta(replace, { replace: true });
        } else if (content) {
          onDelta(content);
        }
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }
}

async function streamElmChat({
  messages,
  place,
  onDelta,
}: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  place?: string;
  onDelta: (chunk: string, opts?: { replace?: boolean }) => void;
}) {
  return streamSSE(CHAT_URL, { messages, place }, onDelta);
}

async function streamVision({
  images,
  prompt,
  place,
  onDelta,
}: {
  images: string[];
  prompt?: string;
  place?: string;
  onDelta: (chunk: string) => void;
}) {
  return streamSSE(VISION_URL, { images, prompt, place }, onDelta);
}

const categoryIconMap: Record<string, React.ReactNode> = {
  synonyms: <BookOpen size={18} className="text-heritage-brown" strokeWidth={1.6} />,
  proverbs: <MessageSquareQuote size={18} className="text-heritage-brown" strokeWidth={1.6} />,
  stories: <ScrollText size={18} className="text-heritage-brown" strokeWidth={1.6} />,
  culture: <Drama size={18} className="text-heritage-brown" strokeWidth={1.6} />,
};

const makeWelcome = (placeName: string | null): Message => ({
  id: '0',
  role: 'assistant',
  content: placeName
    ? `أهلًا وسهلًا، أنا الراوي، مساعدك الذكي لاستكشاف ثقافة ${placeName}، اختر موضوعًا أو اسألني مباشرة.`
    : 'أهلًا وسهلًا، أنا الراوي، مساعدك الذكي لاستكشاف ثقافة المنطقة، اختر موضوعًا أو اسألني مباشرة.',
});

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Conversation[];
    // Drop placeholder image markers so we never render broken <img> tags
    return list.map((c) => ({
      ...c,
      messages: (c.messages || []).map((m) => ({
        ...m,
        images: m.images?.filter((s) => s && s.startsWith('data:')) ,
      })),
    }));
  } catch {
    return [];
  }
}

// Strip heavy fields (base64 images, very long content) before persisting.
// localStorage has ~5MB quota; data-URL images blow past it instantly.
function sanitizeForStorage(list: Conversation[]): Conversation[] {
  return list.map((c) => ({
    ...c,
    messages: c.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content.length > 4000 ? m.content.slice(0, 4000) + '…' : m.content,
      images: m.images && m.images.length > 0
        ? m.images.map(() => '__image_omitted__')
        : undefined,
    })),
  }));
}

function saveConversations(list: Conversation[]) {
  let trimmed = sanitizeForStorage(list).slice(0, 20);
  // Retry-by-shrinking if quota is still exceeded
  while (trimmed.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return;
    } catch (err) {
      if ((err as any)?.name === 'QuotaExceededError' || String(err).includes('quota')) {
        trimmed = trimmed.slice(0, Math.max(1, Math.floor(trimmed.length / 2)));
      } else {
        return; // give up silently on other errors
      }
    }
  }
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export default function RawiPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeName = searchParams.get('place');
  const topic = searchParams.get('topic');
  const { addPoints } = usePoints();
  const location = useLocation();
  const { speak, stopSpeaking, isSpeaking } = useAccessibility();

  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([makeWelcome(placeName)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialectFired = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Persist current conversation whenever messages change (after first user msg)
  useEffect(() => {
    const hasUserMessage = messages.some((m) => m.role === 'user');
    if (!hasUserMessage) return;

    const id = currentId || Date.now().toString();
    const firstUser = messages.find((m) => m.role === 'user');
    const title = (firstUser?.content || 'محادثة').replace(/📎.*$/s, '').slice(0, 40).trim() || 'محادثة';
    const conv: Conversation = { id, title, messages, updatedAt: Date.now() };

    setConversations((prev) => {
      const others = prev.filter((c) => c.id !== id);
      const next = [conv, ...others].slice(0, 30);
      saveConversations(next);
      return next;
    });
    if (!currentId) setCurrentId(id);
  }, [messages, currentId]);

  const newChat = () => {
    setCurrentId(null);
    setMessages([makeWelcome(placeName)]);
    setInput('');
    setAttachments([]);
    setHistoryOpen(false);
  };

  const loadConversation = (c: Conversation) => {
    setCurrentId(c.id);
    setMessages(c.messages);
    setHistoryOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConversations(next);
      return next;
    });
    if (currentId === id) {
      setCurrentId(null);
      setMessages([makeWelcome(placeName)]);
    }
  };

  const handleSend = async (forced?: string) => {
    const text = (forced ?? input).trim();
    const filesToSend = attachments;
    const hasFiles = filesToSend.length > 0;
    if ((!text && !hasFiles) || isTyping) return;

    // Split: images go to vision, other files (pdf/doc) shown as note for now
    const imageFiles = filesToSend.filter((f) => f.type.startsWith('image/'));
    const otherFiles = filesToSend.filter((f) => !f.type.startsWith('image/'));

    let imageDataUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        imageDataUrls = await Promise.all(imageFiles.map(fileToDataUrl));
      } catch {
        imageDataUrls = [];
      }
    }

    const fileNote = otherFiles.length > 0
      ? `\n\n📎 ${otherFiles.map((f) => f.name).join('، ')}`
      : '';

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: (text || (imageDataUrls.length > 0 ? 'تعرّف على هذه الصورة' : 'أرسلت ملف للتحليل')) + fileNote,
      images: imageDataUrls.length > 0 ? imageDataUrls : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    const assistantId = (Date.now() + 1).toString();
    let acc = '';
    let firstChunk = true;

    const onDelta = (chunk: string) => {
      acc += chunk;
      if (firstChunk) {
        firstChunk = false;
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: acc }]);
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        );
      }
    };

    try {
      if (imageDataUrls.length > 0) {
        // Vision flow — uses Lovable AI Gateway (Gemini) for heritage element recognition
        await streamVision({
          images: imageDataUrls,
          prompt: text || undefined,
          place: placeName || undefined,
          onDelta,
        });
      } else {
        const historyForApi = [...messages, userMsg]
          .filter((m) => m.id !== '0')
          .map((m) => ({ role: m.role, content: m.content }));
        await streamElmChat({
          messages: historyForApi,
          place: placeName || undefined,
          onDelta,
        });
      }

      if (firstChunk) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: 'لم أتلقَّ ردًا. حاول مجددًا.' },
        ]);
      }
      addPoints(2);
    } catch (err) {
      setIsTyping(false);
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: `⚠️ ${msg}` },
      ]);
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 4));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

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
      try { recognitionRef.current?.stop(); } catch {}
      setIsRecording(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'ar-SA';
    rec.interimResults = true;
    rec.continuous = false;
    let finalTranscript = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      // Live update the input so the user sees the transcript as they speak
      setInput((finalTranscript + interim).trim());
    };
    rec.onend = () => {
      setIsRecording(false);
      const text = finalTranscript.trim();
      if (text) {
        // Auto-send the recognized text after a tiny tick so state has time to settle
        setTimeout(() => handleSend(text), 50);
      }
    };
    rec.onerror = () => setIsRecording(false);
    try { rec.start(); } catch {}
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
    <main className="relative min-h-screen pb-32 najdi-pattern flex flex-col" data-a11y-read>
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} aria-label="رجوع للرئيسية">
            <ArrowRight size={22} className="text-heritage-brown" />
          </button>
          <div className="flex items-center gap-2">
            <AccessibilityButton tone="light" />
            <button
              onClick={() => setHistoryOpen(true)}
              aria-label="سجل المحادثات"
              className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-heritage-brown active:scale-95 transition"
            >
              <History size={18} strokeWidth={1.8} />
            </button>
            <button
              onClick={newChat}
              aria-label="محادثة جديدة"
              className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-heritage-brown active:scale-95 transition"
            >
              <Plus size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-heritage-brown text-right">الراوي</h1>
          <p className="text-muted-foreground text-sm mt-1 text-right">
            مساعدك الذكي لاستكشاف تراث {location.city}
          </p>
        </motion.div>
      </div>

      {/* Messages */}
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
              {msg.images && msg.images.length > 0 && (
                <div className={`mb-2 grid gap-1.5 ${msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {msg.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="صورة مرفقة"
                      className="rounded-xl max-h-48 w-full object-cover border border-border/30"
                    />
                  ))}
                </div>
              )}
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

        {/* Category prompts under welcome message */}
        {messages.length === 1 && !isTyping && (
          <div className="grid grid-cols-2 gap-2 pt-2" dir="rtl">
            {learnCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => {
                  handleSend(categoryPrompts[cat.id]);
                }}
                className="bg-card border border-border rounded-2xl p-3 text-right active:scale-[0.97] transition-transform shadow-sm flex items-center gap-2"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  {categoryIconMap[cat.id]}
                </span>
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

      {/* Input bar with attachments + mic */}
      <div className="px-4 pt-2 pb-3 bg-card/95 backdrop-blur border-t border-border sticky bottom-24">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2" dir="rtl">
            {attachments.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-secondary rounded-full pr-3 pl-1 py-1 text-xs text-heritage-brown max-w-[180px]"
              >
                <Paperclip size={12} />
                <span className="truncate">{f.name}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="w-5 h-5 rounded-full bg-card flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition"
                  aria-label="إزالة"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && attachments.length === 0) || isTyping}
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
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.doc,.docx"
            onChange={handleFiles}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 border bg-card text-heritage-brown border-border active:scale-95"
            aria-label="إرفاق ملف"
          >
            <Paperclip size={16} strokeWidth={1.7} />
          </button>
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

      {/* Conversation history — inline panel within the mobile frame */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* Dim only the page area below header, inside the frame */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              aria-label="إغلاق"
              className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              dir="rtl"
              className="absolute top-0 bottom-0 right-0 z-40 w-[82%] max-w-xs bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
                <button onClick={() => setHistoryOpen(false)} aria-label="إغلاق">
                  <X size={18} className="text-muted-foreground" />
                </button>
                <h2 className="font-heading font-bold text-sm text-heritage-brown">المحادثات السابقة</h2>
              </div>

              <button
                onClick={newChat}
                className="m-3 flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-heritage-brown text-primary-foreground rounded-xl py-2 text-sm font-heading active:scale-[0.98] transition"
              >
                <Plus size={14} />
                محادثة جديدة
              </button>

              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                {conversations.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    لا توجد محادثات سابقة بعد
                  </p>
                )}
                {conversations.map((c) => {
                  const isActive = c.id === currentId;
                  return (
                    <div
                      key={c.id}
                      className={`group flex items-center gap-2 rounded-xl border p-2.5 transition ${
                        isActive
                          ? 'bg-secondary border-heritage-brown/40'
                          : 'bg-card border-border hover:bg-secondary/60'
                      }`}
                    >
                      <button
                        onClick={() => deleteConversation(c.id)}
                        aria-label="حذف"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => loadConversation(c)}
                        className="flex-1 text-right min-w-0"
                      >
                        <h3 className="font-heading text-sm font-semibold text-heritage-brown truncate">
                          {c.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(c.updatedAt).toLocaleDateString('ar-SA')} •{' '}
                          {c.messages.filter((m) => m.role === 'user').length} رسالة
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
