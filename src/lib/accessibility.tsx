import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rawi-tts`;

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
  isAudioLoading: boolean;
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
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    setIsSpeaking(false);
    setIsAudioLoading(false);
  }, []);

  const speakBrowserFallback = useCallback((cleaned: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.lang = 'ar-SA';
    utter.rate = 1.0;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
    setIsAudioLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    const cleaned = text
      .replace(/\*\*/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .trim();
    if (!cleaned) return;

    // Stop any current playback first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // INSTANT FEEDBACK: start browser TTS immediately so user hears voice without delay
    setIsSpeaking(true);
    setIsAudioLoading(true);
    let browserStarted = false;
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.lang = 'ar-SA';
      utter.rate = 1.0;
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => {};
      window.speechSynthesis.speak(utter);
      browserStarted = true;
    }

    // In parallel try Elm TTS; if it returns quickly we swap to higher-quality voice
    const controller = new AbortController();
    ttsAbortRef.current = controller;
    try {
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: cleaned }),
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
      const blob = await resp.blob();
      if (!blob.type.startsWith('audio')) throw new Error('Invalid audio response');

      // Swap browser TTS for the high-quality audio
      if (browserStarted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
      };
      audio.onerror = () => {
        setIsSpeaking(false);
      };
      setIsAudioLoading(false);
      await audio.play();
    } catch (err) {
      // If browser TTS already running, just let it finish
      if (!browserStarted) {
        speakBrowserFallback(cleaned);
      } else {
        setIsAudioLoading(false);
      }
      if ((err as any)?.name !== 'AbortError') {
        console.warn('Elm TTS failed, using browser fallback:', err);
      }
    }
  }, [speakBrowserFallback]);

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
        isAudioLoading,
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
