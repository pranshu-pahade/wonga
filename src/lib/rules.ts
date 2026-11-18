import { addDays, weekday } from './dates';
import type { Completion, Habit } from './types';

/** Reward rules. These match the parameters described in the project paper. */
export const RULES = {
  BASE_XP: 10,
  STREAK_FACTOR: 0.1,
  MAX_MULTIPLIER: 2,
  LEVEL_SIZE: 100,
  DEFAULT_RATE: 10,
  DEFAULT_DAILY_CAP: 50,
} as const;

export const isScheduled = (habit: Habit, date: string) => habit.days.includes(weekday(date));

export const doneDates = (habitId: string, completions: Completion[]) =>
  new Set(completions.filter((c) => c.habitId === habitId).map((c) => c.date));

/**
 * Consecutive scheduled days on which the habit was completed, counted back
 * from today. Days the habit is not scheduled neither extend nor break the
 * streak, and today does not break it while it is still pending.
 */
export function habitStreak(habit: Habit, done: Set<string>, today: string): number {
  let streak = 0;
  let day = today;
  for (let i = 0; i < 3660; i++) {
    if (done.has(day)) streak++;
    else if (day !== today && (day < habit.createdAt || isScheduled(habit, day))) break;
    day = addDays(day, -1);
  }
  return streak;
}

export const multiplier = (streak: number) =>
  Math.min(1 + RULES.STREAK_FACTOR * streak, RULES.MAX_MULTIPLIER);

export const xpFor = (streak: number) => Math.round(RULES.BASE_XP * multiplier(streak));

export function levelInfo(totalXp: number) {
  return {
    level: Math.floor(totalXp / RULES.LEVEL_SIZE) + 1,
    into: totalXp % RULES.LEVEL_SIZE,
    size: RULES.LEVEL_SIZE,
  };
}

/**
 * Re-applies the contribution rule to one day: completions are taken in the
 * order they happened and each gets its habit's rate until the daily cap is hit.
 */
export function recomputeDay(completions: Completion[], habits: Habit[], date: string, cap: number): Completion[] {
  const rates = new Map(habits.map((h) => [h.id, h.rate]));
  const order = completions.filter((c) => c.date === date).sort((a, b) => a.ts - b.ts);
  const amounts = new Map<string, number>();
  let used = 0;
  for (const c of order) {
    const amount = Math.max(0, Math.min(rates.get(c.habitId) ?? 0, cap - used));
    amounts.set(c.id, amount);
    used += amount;
  }
  return completions.map((c) => (amounts.has(c.id) ? { ...c, amount: amounts.get(c.id)! } : c));
}

export const contributedOn = (completions: Completion[], date: string) =>
  completions.reduce((sum, c) => (c.date === date ? sum + c.amount : sum), 0);

export const totalXp = (completions: Completion[]) => completions.reduce((s, c) => s + c.xp, 0);
export const balance = (completions: Completion[]) => completions.reduce((s, c) => s + c.amount, 0);

/** Consecutive days with at least one completion. Today may still be pending. */
export function dayStreak(completions: Completion[], today: string): number {
  const days = new Set(completions.map((c) => c.date));
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export const weeklyXp = (completions: Completion[], today: string) => {
  const from = addDays(today, -6);
  return completions.reduce((s, c) => (c.date >= from && c.date <= today ? s + c.xp : s), 0);
};

export const bestStreak = (completions: Completion[]) =>
  completions.reduce((m, c) => Math.max(m, c.streak), 0);

export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
