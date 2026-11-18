import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BADGES, computeStats } from './lib/achievements';
import { todayKey } from './lib/dates';
import { RULES, doneDates, habitStreak, levelInfo, recomputeDay, rupees, totalXp, xpFor } from './lib/rules';
import type { Completion, Habit, HabitDraft, User } from './lib/types';

export interface Toast {
  id: number;
  kind: 'xp' | 'level' | 'badge' | 'info';
  title: string;
  body?: string;
}

export type CloudStatus = 'off' | 'connecting' | 'on' | 'error';

/** The part of the state that is saved (to the browser, and to the cloud backup if enabled). */
export interface Snapshot {
  user: User | null;
  habits: Habit[];
  completions: Completion[];
  unlocked: Record<string, string>;
  dailyCap: number;
}

interface State extends Snapshot {
  toasts: Toast[];
  cloud: CloudStatus;
  login: (name: string, phone: string, starters: HabitDraft[]) => void;
  addHabit: (draft: HabitDraft) => void;
  updateHabit: (id: string, draft: HabitDraft) => void;
  archiveHabit: (id: string) => void;
  toggle: (habitId: string) => void;
  setDailyCap: (cap: number) => void;
  setName: (name: string) => void;
  resetAll: () => void;
  hydrate: (snap: Snapshot) => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  setCloud: (status: CloudStatus) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
let toastId = 0;

const EMPTY: Snapshot = {
  user: null,
  habits: [],
  completions: [],
  unlocked: {},
  dailyCap: RULES.DEFAULT_DAILY_CAP,
};

export const snapshot = (s: Snapshot): Snapshot => ({
  user: s.user,
  habits: s.habits,
  completions: s.completions,
  unlocked: s.unlocked,
  dailyCap: s.dailyCap,
});

const makeHabit = (draft: HabitDraft, today: string): Habit => ({
  id: uid(),
  name: draft.name.trim(),
  icon: draft.icon,
  days: [...draft.days].sort(),
  rate: draft.rate,
  createdAt: today,
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      toasts: [],
      cloud: 'off',

      login: (name, phone, starters) => {
        const today = todayKey();
        set({
          user: { name: name.trim(), phone, joined: today },
          habits: starters.map((d) => makeHabit(d, today)),
          completions: [],
          unlocked: {},
          dailyCap: RULES.DEFAULT_DAILY_CAP,
        });
      },

      addHabit: (draft) => set((s) => ({ habits: [...s.habits, makeHabit(draft, todayKey())] })),

      updateHabit: (id, draft) =>
        set((s) => {
          const habits = s.habits.map((h) =>
            h.id === id ? { ...h, name: draft.name.trim(), icon: draft.icon, days: [...draft.days].sort(), rate: draft.rate } : h,
          );
          // A changed rate applies to today's contributions straight away.
          return { habits, completions: recomputeDay(s.completions, habits, todayKey(), s.dailyCap) };
        }),

      // History is kept so XP and wallet totals stay consistent.
      archiveHabit: (id) => set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) })),

      toggle: (habitId) => {
        const s = get();
        const habit = s.habits.find((h) => h.id === habitId);
        if (!habit) return;
        const today = todayKey();
        const existing = s.completions.find((c) => c.habitId === habitId && c.date === today);

        if (existing) {
          // Undo: remove today's completion and re-apply the cap to the rest of the day.
          const rest = s.completions.filter((c) => c.id !== existing.id);
          set({ completions: recomputeDay(rest, s.habits, today, s.dailyCap) });
          return;
        }

        const done = doneDates(habitId, s.completions);
        done.add(today);
        const streak = habitStreak(habit, done, today);
        const entry: Completion = { id: uid(), habitId, date: today, ts: Date.now(), xp: xpFor(streak), amount: 0, streak };
        const completions = recomputeDay([...s.completions, entry], s.habits, today, s.dailyCap);
        const saved = completions.find((c) => c.id === entry.id)!;

        const levelBefore = levelInfo(totalXp(s.completions)).level;
        const levelAfter = levelInfo(totalXp(completions)).level;

        const stats = computeStats(s.habits, completions, today);
        const unlocked = { ...s.unlocked };
        const fresh = BADGES.filter((b) => !unlocked[b.id] && b.test(stats));
        fresh.forEach((b) => (unlocked[b.id] = today));

        set({ completions, unlocked });

        const { pushToast } = get();
        pushToast({
          kind: 'xp',
          title: `+${saved.xp} XP`,
          body:
            saved.amount > 0
              ? `${rupees(saved.amount)} added to your wallet`
              : habit.rate > 0
                ? 'Daily cap reached, nothing added to the wallet'
                : undefined,
        });
        if (levelAfter > levelBefore) pushToast({ kind: 'level', title: `Level ${levelAfter}!`, body: 'You levelled up' });
        fresh.forEach((b) => pushToast({ kind: 'badge', title: `Badge unlocked: ${b.title}`, body: b.desc }));
      },

      setDailyCap: (cap) =>
        set((s) => ({ dailyCap: cap, completions: recomputeDay(s.completions, s.habits, todayKey(), cap) })),

      setName: (name) => set((s) => (s.user && name.trim() ? { user: { ...s.user, name: name.trim() } } : {})),

      resetAll: () => set({ ...EMPTY, toasts: [] }),

      hydrate: (snap) => set({ ...EMPTY, ...snapshot(snap) }),

      pushToast: (t) => set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id: ++toastId }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      setCloud: (cloud) => set({ cloud }),
    }),
    {
      name: 'wonga-v1',
      partialize: (s) => snapshot(s),
    },
  ),
);
