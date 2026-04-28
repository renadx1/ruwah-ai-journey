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
  const audioUrlsRef = useRef<string[]>([]);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const playSeqRef = useRef(0);

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

  const cleanupAudioUrls = useCallback(() => {
    for (const u of audioUrlsRef.current) {
      try { URL.revokeObjectURL(u); } catch {}
    }
    audioUrlsRef.current = [];
  }, []);

  const stopSpeaking = useCallback(() => {
    playSeqRef.current += 1; // invalidate any in-flight playback loop
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    cleanupAudioUrls();
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    setIsSpeaking(false);
    setIsAudioLoading(false);
  }, [cleanupAudioUrls]);

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

  // Split text into short chunks (sentences / clauses) for streaming TTS
  const chunkText = (text: string): string[] => {
    // Split on sentence terminators while keeping reasonable chunk size
    const parts = text
      .split(/(?<=[\.\!\?\،\؛\:\n])\s+/u)
      .map((s) => s.trim())
      .filter(Boolean);
    const chunks: string[] = [];
    let buf = '';
    const MAX = 180; // chars per chunk (~1 sentence)
    for (const p of parts) {
      if ((buf + ' ' + p).trim().length <= MAX) {
        buf = (buf ? buf + ' ' : '') + p;
      } else {
        if (buf) chunks.push(buf);
        if (p.length <= MAX) buf = p;
        else {
          // very long sentence: hard split
          for (let i = 0; i < p.length; i += MAX) chunks.push(p.slice(i, i + MAX));
          buf = '';
        }
      }
    }
    if (buf) chunks.push(buf);
    return chunks;
  };

  const fetchChunkAudio = async (
    chunk: string,
    signal: AbortSignal
  ): Promise<string> => {
    const resp = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text: chunk }),
      signal,
    });
    if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
    const blob = await resp.blob();
    if (!blob.type.startsWith('audio')) throw new Error('Invalid audio response');
    const url = URL.createObjectURL(blob);
    audioUrlsRef.current.push(url);
    return url;
  };

  const speak = useCallback(async (text: string) => {
    const cleaned = text
      .replace(/\*\*/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .trim();
    if (!cleaned) return;

    // Stop any current playback first
    stopSpeaking();

    const mySeq = ++playSeqRef.current;
    setIsSpeaking(true);
    setIsAudioLoading(true);

    const controller = new AbortController();
    ttsAbortRef.current = controller;

    const chunks = chunkText(cleaned);
    if (chunks.length === 0) {
      setIsSpeaking(false);
      setIsAudioLoading(false);
      return;
    }

    // Kick off all chunk fetches in parallel — they'll resolve independently,
    // but we'll play them strictly in order.
    const promises: Promise<string>[] = chunks.map((c) =>
      fetchChunkAudio(c, controller.signal)
    );

    try {
      for (let i = 0; i < promises.length; i++) {
        const url = await promises[i];
        if (mySeq !== playSeqRef.current) return; // cancelled
        if (i === 0) setIsAudioLoading(false);

        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(url);
          audio.preload = 'auto';
          audioRef.current = audio;
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error('audio playback error'));
          audio.play().catch(reject);
        });

        if (mySeq !== playSeqRef.current) return;
      }
      setIsSpeaking(false);
      cleanupAudioUrls();
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        setIsSpeaking(false);
        setIsAudioLoading(false);
        return;
      }
      console.warn('Elm TTS failed, using browser fallback:', err);
      // Fallback: speak whatever remains via browser TTS so user still hears something
      if (mySeq === playSeqRef.current) speakBrowserFallback(cleaned);
    }
  }, [speakBrowserFallback, stopSpeaking, cleanupAudioUrls]);


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
