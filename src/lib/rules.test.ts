import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { dayStreak, habitStreak, levelInfo, recomputeDay, xpFor } from './rules';
import type { Completion, Habit } from './types';

const TODAY = '2026-11-18'; // a Wednesday
const habit = (over: Partial<Habit> = {}): Habit => ({
  id: 'h1', name: 'Read', icon: 'book', days: [0, 1, 2, 3, 4, 5, 6], rate: 10, createdAt: '2026-01-01', ...over,
});
const done = (...offsets: number[]) => new Set(offsets.map((o) => addDays(TODAY, o)));
const comp = (id: string, habitId: string, ts: number, date = TODAY): Completion => ({
  id, habitId, date, ts, xp: 10, amount: 0, streak: 1,
});

describe('habit streak', () => {
  it('is zero with no completions', () => {
    expect(habitStreak(habit(), done(), TODAY)).toBe(0);
  });
  it('counts consecutive days including today', () => {
    expect(habitStreak(habit(), done(0, -1, -2), TODAY)).toBe(3);
  });
  it('is not broken while today is still pending', () => {
    expect(habitStreak(habit(), done(-1, -2), TODAY)).toBe(2);
  });
  it('breaks on a missed scheduled day', () => {
    expect(habitStreak(habit(), done(0, -2, -3), TODAY)).toBe(1);
  });
  it('skips days the habit is not scheduled', () => {
    // Weekdays only: Wed, Tue, Mon, then the weekend is skipped, then Fri.
    const h = habit({ days: [1, 2, 3, 4, 5] });
    expect(habitStreak(h, done(0, -1, -2, -5), TODAY)).toBe(4);
  });
});

describe('xp and levels', () => {
  it('applies the streak multiplier and caps it at 2x', () => {
    expect(xpFor(1)).toBe(11);
    expect(xpFor(5)).toBe(15);
    expect(xpFor(10)).toBe(20);
    expect(xpFor(40)).toBe(20);
  });
  it('gains a level every 100 XP', () => {
    expect(levelInfo(0)).toMatchObject({ level: 1, into: 0 });
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100)).toMatchObject({ level: 2, into: 0 });
    expect(levelInfo(250)).toMatchObject({ level: 3, into: 50 });
  });
});

describe('daily contribution cap', () => {
  const habits = [habit({ id: 'a', rate: 20 }), habit({ id: 'b', rate: 20 }), habit({ id: 'c', rate: 20 })];
  it('gives each completion its rate until the cap is reached', () => {
    const out = recomputeDay([comp('1', 'a', 1), comp('2', 'b', 2), comp('3', 'c', 3)], habits, TODAY, 50);
    expect(out.map((c) => c.amount)).toEqual([20, 20, 10]);
  });
  it('frees up room when an earlier completion is undone', () => {
    const out = recomputeDay([comp('2', 'b', 2), comp('3', 'c', 3)], habits, TODAY, 50);
    expect(out.map((c) => c.amount)).toEqual([20, 20]);
  });
  it('leaves other days untouched', () => {
    const other = { ...comp('9', 'a', 1, addDays(TODAY, -1)), amount: 20 };
    const out = recomputeDay([other, comp('1', 'a', 5)], habits, TODAY, 10);
    expect(out.map((c) => c.amount)).toEqual([20, 10]);
  });
});

describe('day streak', () => {
  it('counts back from yesterday when today has nothing yet', () => {
    const cs = [comp('1', 'a', 1, addDays(TODAY, -1)), comp('2', 'a', 1, addDays(TODAY, -2))];
    expect(dayStreak(cs, TODAY)).toBe(2);
  });
});
