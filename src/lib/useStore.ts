import { useState, useEffect, useCallback } from 'react';

export function useUserName() {
  const [name, setName] = useState(() => localStorage.getItem('ruwat_username') || '');

  const saveName = useCallback((newName: string) => {
    localStorage.setItem('ruwat_username', newName);
    setName(newName);
  }, []);

  return { name, saveName };
}

export function usePoints() {
  const [points, setPoints] = useState(() => Number(localStorage.getItem('ruwat_points') || '0'));

  const addPoints = useCallback((amount: number) => {
    setPoints(prev => {
      const next = prev + amount;
      localStorage.setItem('ruwat_points', String(next));
      return next;
    });
  }, []);

  return { points, addPoints };
}

// ---- Referral system ----
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function useReferral() {
  const [code] = useState<string>(() => {
    let c = localStorage.getItem('ruwat_referral_code');
    if (!c) {
      c = generateReferralCode();
      localStorage.setItem('ruwat_referral_code', c);
    }
    return c;
  });
  const [shareCount, setShareCount] = useState<number>(
    () => Number(localStorage.getItem('ruwat_referral_shares') || '0')
  );
  const [referralCount, setReferralCount] = useState<number>(
    () => Number(localStorage.getItem('ruwat_referral_completed') || '0')
  );
  const [hasClaimedShareBonus, setHasClaimedShareBonus] = useState<boolean>(
    () => localStorage.getItem('ruwat_referral_share_bonus') === '1'
  );

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${code}`
    : `?ref=${code}`;

  const recordShare = useCallback(() => {
    setShareCount(prev => {
      const next = prev + 1;
      localStorage.setItem('ruwat_referral_shares', String(next));
      return next;
    });
  }, []);

  const claimShareBonus = useCallback(() => {
    if (hasClaimedShareBonus) return 0;
    localStorage.setItem('ruwat_referral_share_bonus', '1');
    setHasClaimedShareBonus(true);
    return 30;
  }, [hasClaimedShareBonus]);

  const addReferral = useCallback(() => {
    setReferralCount(prev => {
      const next = prev + 1;
      localStorage.setItem('ruwat_referral_completed', String(next));
      return next;
    });
    return 20;
  }, []);

  return {
    code,
    link,
    shareCount,
    referralCount,
    hasClaimedShareBonus,
    recordShare,
    claimShareBonus,
    addReferral,
  };
}

export function useLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string }>({
    lat: 24.7136,
    lng: 46.6753,
    city: 'الرياض',
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
        },
        () => { /* keep default */ }
      );
    }
  }, []);

  return location;
}
