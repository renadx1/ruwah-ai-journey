import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type AccessibilityState = {
  largeText: boolean;
  highContrast: boolean;
  voiceControl: boolean;
  textScale: number;
  increaseText: () => void;
  decreaseText: () => void;
  toggleHighContrast: () => void;
  toggleVoiceControl: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
};

const Ctx = createContext<AccessibilityState | null>(null);

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.5;
const STEP = 0.1;

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textScale, setTextScale] = useState<number>(() => {
    const v = parseFloat(localStorage.getItem('a11y_scale') || '1');
    return isNaN(v) ? 1 : Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
  });
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('a11y_contrast') === '1');
  const [voiceControl, setVoiceControl] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const largeText = textScale > 1.001;

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${textScale * 16}px`;
    root.classList.toggle('a11y-large-text', largeText);
    root.classList.toggle('a11y-high-contrast', highContrast);
    localStorage.setItem('a11y_scale', String(textScale));
    localStorage.setItem('a11y_contrast', highContrast ? '1' : '0');
  }, [textScale, largeText, highContrast]);

  const increaseText = useCallback(
    () => setTextScale((v) => Math.min(MAX_SCALE, +(v + STEP).toFixed(2))),
    []
  );
  const decreaseText = useCallback(
    () => setTextScale((v) => Math.max(MIN_SCALE, +(v - STEP).toFixed(2))),
    []
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم القراءة الصوتية');
      return;
    }
    window.speechSynthesis.cancel();
    const cleaned = text
      .replace(/\*\*/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .trim();
    if (!cleaned) return;
    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.lang = 'ar-SA';
    utter.rate = 0.95;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  }, []);

  // Voice control via Web Speech Recognition
  useEffect(() => {
    if (!voiceControl) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('متصفحك لا يدعم التحكم الصوتي. جرّب Chrome.');
      setVoiceControl(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      const t = transcript.toLowerCase();
      if (t.includes('رئيسية') || t.includes('البيت')) window.location.assign('/');
      else if (t.includes('خريطة')) window.location.assign('/map');
      else if (t.includes('راوي') || t.includes('تعلم')) window.location.assign('/rawi');
      else if (t.includes('حساب')) window.location.assign('/profile');
      else if (t.includes('دعم')) window.location.assign('/support');
    };
    rec.onerror = () => {};
    try { rec.start(); } catch {}
    return () => { try { rec.stop(); } catch {} };
  }, [voiceControl]);

  return (
    <Ctx.Provider
      value={{
        largeText,
        highContrast,
        voiceControl,
        textScale,
        increaseText,
        decreaseText,
        toggleHighContrast: () => setHighContrast((v) => !v),
        toggleVoiceControl: () => setVoiceControl((v) => !v),
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAccessibility must be inside AccessibilityProvider');
  return ctx;
}
