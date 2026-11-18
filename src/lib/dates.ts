import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. Keys sort correctly as plain strings. */
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toKey(new Date());

export const addDays = (key: string, n: number) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

export const weekday = (key: string) => fromKey(key).getDay();

/** The last n date keys ending at `end`, oldest first. */
export const lastNDays = (n: number, end: string) =>
  Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));

export const prettyDate = (key: string, today: string) => {
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  return fromKey(key).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Today's date key, refreshed so the app rolls over at midnight. */
export function useToday() {
  const [today, setToday] = useState(todayKey());
  useEffect(() => {
    const tick = () => setToday(todayKey());
    const id = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return today;
}
