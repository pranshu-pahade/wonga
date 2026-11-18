import { Flame, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { HabitForm } from '../components/HabitForm';
import { HabitIcon } from '../components/HabitIcon';
import { DAY_LETTERS, useToday } from '../lib/dates';
import { doneDates, habitStreak, rupees } from '../lib/rules';
import type { Habit } from '../lib/types';
import { useStore } from '../store';

const scheduleLabel = (days: number[]) => {
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  return null;
};

export function Habits() {
  const today = useToday();
  const { habits, completions, addHabit, updateHabit, archiveHabit } = useStore();
  const [editing, setEditing] = useState<Habit | 'new' | null>(null);
  const active = habits.filter((h) => !h.archived);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Your habits</h1>
          <p className="text-muted">{active.length} active</p>
        </div>
        <button className="btn-ghost !border-deep !bg-deep !text-mint" onClick={() => setEditing('new')}>
          <Plus size={20} strokeWidth={2.6} aria-hidden /> New
        </button>
      </header>

      {active.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="font-display text-xl font-medium">No habits yet</p>
          <p className="mt-1 text-muted">Add your first habit to start earning XP.</p>
          <button className="btn-primary mt-4" onClick={() => setEditing('new')}>Add a habit</button>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {active.map((h) => {
            const done = doneDates(h.id, completions);
            const streak = habitStreak(h, done, today);
            const label = scheduleLabel(h.days);
            return (
              <li key={h.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper text-sage-dark">
                    <HabitIcon icon={h.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-medium leading-tight">{h.name}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {h.rate > 0 ? `${rupees(h.rate)} per completion` : 'No contribution'} · {done.size} done
                    </p>
                  </div>
                  <button
                    onClick={() => setEditing(h)}
                    aria-label={`Edit ${h.name}`}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-paper"
                  >
                    <Pencil size={18} aria-hidden />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {label ? (
                    <span className="rounded-full bg-paper px-3 py-1 text-sm font-bold text-sage-dark">{label}</span>
                  ) : (
                    <span className="flex gap-1" aria-label="Scheduled days">
                      {DAY_LETTERS.map((letter, d) => (
                        <span
                          key={d}
                          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${
                            h.days.includes(d) ? 'bg-deep text-mint' : 'bg-paper text-muted/60'
                          }`}
                        >
                          {letter}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-bold">
                    <Flame size={16} className={streak > 0 ? 'text-[#C2571A]' : 'text-muted/50'} aria-hidden />
                    {streak} day{streak === 1 ? '' : 's'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <HabitForm
          habit={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addHabit(draft);
            else updateHabit(editing.id, draft);
            setEditing(null);
          }}
          onDelete={
            editing === 'new'
              ? undefined
              : () => {
                  archiveHabit(editing.id);
                  setEditing(null);
                }
          }
        />
      )}
    </div>
  );
}
