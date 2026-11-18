import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DAY_LETTERS, DAY_NAMES } from '../lib/dates';
import { EVERY_DAY_LIST } from '../lib/presets';
import { RULES, rupees } from '../lib/rules';
import type { Habit, HabitDraft, IconKey } from '../lib/types';
import { HABIT_ICONS, HabitIcon } from './HabitIcon';
import { Sheet } from './Sheet';

const RATES = [0, 5, 10, 20, 50];

interface Props {
  habit?: Habit;
  onSave: (draft: HabitDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function HabitForm({ habit, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(habit?.name ?? '');
  const [icon, setIcon] = useState<IconKey>(habit?.icon ?? 'book');
  const [days, setDays] = useState<number[]>(habit?.days ?? EVERY_DAY_LIST);
  const [rate, setRate] = useState<number>(habit?.rate ?? RULES.DEFAULT_RATE);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const valid = name.trim().length > 0 && days.length > 0;
  const toggleDay = (d: number) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <Sheet title={habit ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave({ name, icon, days, rate });
        }}
      >
        <div>
          <label htmlFor="habit-name" className="label">Habit name</label>
          <input
            id="habit-name"
            className="input mt-2"
            value={name}
            maxLength={40}
            placeholder="e.g. Read 20 minutes"
            onChange={(e) => setName(e.target.value)}
            autoFocus={!habit}
          />
        </div>

        <fieldset>
          <legend className="label">Icon</legend>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {(Object.keys(HABIT_ICONS) as IconKey[]).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => setIcon(key)}
                aria-pressed={icon === key}
                aria-label={HABIT_ICONS[key].label}
                className={`grid aspect-square place-items-center rounded-2xl border-2 ${
                  icon === key ? 'border-deep bg-mint text-deep' : 'border-line bg-card text-sage-dark'
                }`}
              >
                <HabitIcon icon={key} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Repeat on</legend>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {DAY_LETTERS.map((letter, d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggleDay(d)}
                aria-pressed={days.includes(d)}
                aria-label={DAY_NAMES[d]}
                className={`grid aspect-square place-items-center rounded-full border-2 font-display text-lg font-semibold ${
                  days.includes(d) ? 'border-deep bg-deep text-mint' : 'border-line bg-card text-muted'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
          {days.length === 0 && <p className="mt-2 text-sm font-semibold text-[#A63A1A]">Pick at least one day.</p>}
        </fieldset>

        <fieldset>
          <legend className="label">Save per completion (simulated)</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {RATES.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRate(r)}
                aria-pressed={rate === r}
                className={`min-h-[48px] rounded-2xl border-2 font-display text-lg font-semibold ${
                  rate === r ? 'border-deep bg-mint text-deep' : 'border-line bg-card text-muted'
                }`}
              >
                {r === 0 ? 'None' : rupees(r)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">Added to your simulated wallet each time you complete this habit, up to your daily cap.</p>
        </fieldset>

        <button type="submit" className="btn-primary" disabled={!valid}>
          {habit ? 'Save changes' : 'Add habit'}
        </button>

        {habit && onDelete && (
          confirmDelete ? (
            <div className="rounded-2xl border border-[#E5B8A8] bg-[#FBEDE7] p-4">
              <p className="font-semibold">Remove “{habit.name}”?</p>
              <p className="mt-1 text-sm text-muted">The XP and savings you already earned from it stay.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => setConfirmDelete(false)}>Keep it</button>
                <button type="button" className="btn-ghost flex-1 !border-[#A63A1A] !bg-[#A63A1A] !text-white" onClick={onDelete}>Remove</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-ghost w-full !text-[#A63A1A]" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={18} aria-hidden /> Remove habit
            </button>
          )
        )}
      </form>
    </Sheet>
  );
}
