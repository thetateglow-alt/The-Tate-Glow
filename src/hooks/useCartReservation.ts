import { useState, useEffect, useCallback } from 'react';

const RESERVATION_MINUTES = 15;
const RESERVATION_SECONDS = RESERVATION_MINUTES * 60;
const STORAGE_KEY = 'tate_glow_cart_reservation_expiry';

export function useCartReservation(cartItemCount: number) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(RESERVATION_SECONDS);

  // Initialize or retrieve existing expiry from localStorage
  const getOrInitExpiry = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (stored) {
        const expiryTime = parseInt(stored, 10);
        if (!isNaN(expiryTime)) {
          const diffSeconds = Math.floor((expiryTime - now) / 1000);
          if (diffSeconds > 0) {
            return expiryTime;
          }
        }
      }
      // If none or expired, create new 15-minute window
      const newExpiry = now + RESERVATION_SECONDS * 1000;
      localStorage.setItem(STORAGE_KEY, newExpiry.toString());
      return newExpiry;
    } catch {
      return Date.now() + RESERVATION_SECONDS * 1000;
    }
  }, []);

  const resetTimer = useCallback(() => {
    const newExpiry = Date.now() + RESERVATION_SECONDS * 1000;
    try {
      localStorage.setItem(STORAGE_KEY, newExpiry.toString());
    } catch {
      // ignore
    }
    setSecondsRemaining(RESERVATION_SECONDS);
  }, []);

  useEffect(() => {
    if (cartItemCount === 0) {
      setSecondsRemaining(RESERVATION_SECONDS);
      return;
    }

    const expiryTime = getOrInitExpiry();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setSecondsRemaining(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [cartItemCount, getOrInitExpiry]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = secondsRemaining === 0 && cartItemCount > 0;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / RESERVATION_SECONDS) * 100));

  return {
    secondsRemaining,
    formattedTime,
    isExpired,
    progressPercent,
    resetTimer
  };
}
