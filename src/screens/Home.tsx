import { ChevronRight, Flame, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { HabitCard } from '../components/HabitCard';
import { ProgressRing } from '../components/ProgressRing';
import { fromKey, useToday } from '../lib/dates';
import {
  balance, contributedOn, dayStreak, doneDates, habitStreak, isScheduled, levelInfo, rupees, totalXp, xpFor,
} from '../lib/rules';
import type { Tab } from '../lib/types';
import { useStore } from '../store';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export function Home({ go }: { go: (t: Tab) => void }) {
  const today = useToday();
  const { user, habits, completions, dailyCap, toggle } = useStore();

  const due = useMemo(() => habits.filter((h) => !h.archived && isScheduled(h, today)), [habits, today]);
  const todays = completions.filter((c) => c.date === today);
  const doneCount = due.filter((h) => todays.some((c) => c.habitId === h.id)).length;
  const level = levelInfo(totalXp(completions));
  const streak = dayStreak(completions, today);
  const savedToday = contributedOn(completions, today);
  const room = Math.max(0, dailyCap - savedToday);
  const allDone = due.length > 0 && doneCount === due.length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-muted">
          {fromKey(today).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          {greeting()}, {user?.name}
        </h1>
      </header>

      <section className="rounded-[28px] bg-deep p-5 text-paper" aria-label="Today's progress">
        <div className="flex items-center gap-5">
          <ProgressRing value={due.length ? doneCount / due.length : 0}>
            <div>
              <p className="font-display text-3xl font-semibold leading-none">
                {doneCount}
                <span className="text-xl text-haze">/{due.length}</span>
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-haze">done</p>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="flex items-center gap-2 font-display text-xl font-medium">
              <Flame size={22} className="shrink-0 text-[#F2A65A]" aria-hidden />
              {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
            </p>
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="inline-flex items-center gap-1 font-bold text-mint">
                  <Zap size={15} aria-hidden /> Level {level.level}
                </span>
                <span className="text-haze">
                  {level.into}/{level.size} XP
                </span>
              </div>
              <div
                className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-forest"
                role="progressbar"
                aria-label="XP towards next level"
                aria-valuemin={0}
                aria-valuemax={level.size}
                aria-valuenow={level.into}
              >
                <div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${(level.into / level.size) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <button onClick={() => go('wallet')} className="card flex w-full items-center gap-4 p-4 text-left">
        <div className="flex-1">
          <p className="label">Simulated wallet</p>
          <p className="mt-1 font-display text-3xl font-semibold">{rupees(balance(completions))}</p>
        </div>
        <div className="text-right text-sm text-muted">
          <p className="font-bold text-deep">{rupees(savedToday)} today</p>
          <p>of {rupees(dailyCap)} daily cap</p>
        </div>
        <ChevronRight size={20} className="text-muted" aria-hidden />
      </button>

      <section aria-labelledby="today-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="today-heading" className="text-2xl font-semibold">Today’s habits</h2>
          <button onClick={() => go('habits')} className="min-h-[44px] px-1 text-sm font-bold text-sage-dark underline underline-offset-4">
            Manage
          </button>
        </div>

        {due.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="font-display text-xl font-medium">Nothing scheduled today</p>
            <p className="mt-1 text-muted">Enjoy the rest day, or add a habit for today.</p>
            <button className="btn-primary mt-4" onClick={() => go('habits')}>Add a habit</button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {due.map((h) => {
              const completion = todays.find((c) => c.habitId === h.id);
              const done = doneDates(h.id, completions);
              const current = habitStreak(h, done, today);
              return (
                <HabitCard
                  key={h.id}
                  habit={h}
                  completion={completion}
                  streak={current}
                  nextXp={xpFor(current + 1)}
                  nextAmount={Math.min(h.rate, room)}
                  onToggle={() => toggle(h.id)}
                />
              );
            })}
          </ul>
        )}

        {allDone && (
          <p className="mt-4 animate-rise rounded-2xl bg-mint-soft px-4 py-3 text-center font-semibold">
            All done for today. See you tomorrow!
          </p>
        )}
      </section>
    </div>
  );
}
