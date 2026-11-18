import { balance, bestStreak, isScheduled, levelInfo, totalXp } from './rules';
import type { Completion, Habit } from './types';

export interface Stats {
  completions: number;
  bestStreak: number;
  level: number;
  balance: number;
  activeHabits: number;
  perfectDay: boolean;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: 'spark' | 'flame' | 'check' | 'zap' | 'coins' | 'star' | 'grid';
  test: (s: Stats) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-step', title: 'First step', desc: 'Complete your first habit', icon: 'spark', test: (s) => s.completions >= 1 },
  { id: 'streak-3', title: 'Warming up', desc: 'Reach a 3-day streak', icon: 'flame', test: (s) => s.bestStreak >= 3 },
  { id: 'streak-7', title: 'One full week', desc: 'Reach a 7-day streak', icon: 'flame', test: (s) => s.bestStreak >= 7 },
  { id: 'streak-30', title: 'Unstoppable', desc: 'Reach a 30-day streak', icon: 'flame', test: (s) => s.bestStreak >= 30 },
  { id: 'done-10', title: 'Getting serious', desc: 'Complete 10 habits', icon: 'check', test: (s) => s.completions >= 10 },
  { id: 'done-50', title: 'Half century', desc: 'Complete 50 habits', icon: 'check', test: (s) => s.completions >= 50 },
  { id: 'done-100', title: 'Centurion', desc: 'Complete 100 habits', icon: 'check', test: (s) => s.completions >= 100 },
  { id: 'level-5', title: 'Level 5', desc: 'Reach level 5', icon: 'zap', test: (s) => s.level >= 5 },
  { id: 'level-10', title: 'Level 10', desc: 'Reach level 10', icon: 'zap', test: (s) => s.level >= 10 },
  { id: 'saver-100', title: 'First hundred', desc: 'Grow your wallet to ₹100', icon: 'coins', test: (s) => s.balance >= 100 },
  { id: 'saver-500', title: 'Steady saver', desc: 'Grow your wallet to ₹500', icon: 'coins', test: (s) => s.balance >= 500 },
  { id: 'saver-1000', title: 'Four figures', desc: 'Grow your wallet to ₹1,000', icon: 'coins', test: (s) => s.balance >= 1000 },
  { id: 'perfect-day', title: 'Perfect day', desc: 'Finish every habit due in a day (2 or more)', icon: 'star', test: (s) => s.perfectDay },
  { id: 'collector', title: 'Full plate', desc: 'Keep 5 habits going', icon: 'grid', test: (s) => s.activeHabits >= 5 },
];

export function computeStats(habits: Habit[], completions: Completion[], today: string): Stats {
  const active = habits.filter((h) => !h.archived);
  const due = active.filter((h) => isScheduled(h, today));
  const doneToday = new Set(completions.filter((c) => c.date === today).map((c) => c.habitId));
  return {
    completions: completions.length,
    bestStreak: bestStreak(completions),
    level: levelInfo(totalXp(completions)).level,
    balance: balance(completions),
    activeHabits: active.length,
    perfectDay: due.length >= 2 && due.every((h) => doneToday.has(h.id)),
  };
}
