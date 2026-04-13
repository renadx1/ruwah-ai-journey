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
