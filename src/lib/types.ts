export type IconKey =
  | 'book' | 'dumbbell' | 'study' | 'meditate' | 'water' | 'sleep'
  | 'walk' | 'journal' | 'music' | 'code' | 'heart' | 'food';

export interface Habit {
  id: string;
  name: string;
  icon: IconKey;
  /** Scheduled weekdays, 0 = Sunday ... 6 = Saturday. */
  days: number[];
  /** Simulated rupees added to the wallet per completion. */
  rate: number;
  /** Date key (YYYY-MM-DD) on which the habit was created. */
  createdAt: string;
  archived?: boolean;
}

export type HabitDraft = Pick<Habit, 'name' | 'icon' | 'days' | 'rate'>;

export interface Completion {
  id: string;
  habitId: string;
  /** Date key (YYYY-MM-DD). One completion per habit per date. */
  date: string;
  ts: number;
  xp: number;
  /** Simulated contribution recorded for this completion, after the daily cap. */
  amount: number;
  /** Habit streak right after this completion. */
  streak: number;
}

export interface User {
  name: string;
  phone: string;
  joined: string;
}

export type Tab = 'home' | 'habits' | 'wallet' | 'ranks' | 'profile';
