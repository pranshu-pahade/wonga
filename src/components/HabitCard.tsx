import { Check, Flame } from 'lucide-react';
import { rupees } from '../lib/rules';
import type { Completion, Habit } from '../lib/types';
import { HabitIcon } from './HabitIcon';

interface Props {
  habit: Habit;
  completion?: Completion;
  streak: number;
  /** XP and contribution the next tap would earn. */
  nextXp: number;
  nextAmount: number;
  onToggle: () => void;
}

export function HabitCard({ habit, completion, streak, nextXp, nextAmount, onToggle }: Props) {
  const done = Boolean(completion);
  return (
    <li
      className={`flex items-center gap-3 rounded-3xl border p-3 pl-4 transition-colors ${
        done ? 'border-mint bg-mint-soft' : 'border-line bg-card'
      }`}
    >
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${done ? 'bg-mint text-deep' : 'bg-paper text-sage-dark'}`}>
        <HabitIcon icon={habit.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-medium leading-tight">{habit.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted">
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 font-bold text-deep">
              <Flame size={15} className="text-[#C2571A]" aria-hidden />
              {streak} day{streak === 1 ? '' : 's'}
            </span>
          )}
          {done ? (
            <span>
              Earned +{completion!.xp} XP{completion!.amount > 0 ? ` · ${rupees(completion!.amount)} saved` : ''}
            </span>
          ) : (
            <span>
              +{nextXp} XP{nextAmount > 0 ? ` · ${rupees(nextAmount)}` : ''}
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Undo ${habit.name}` : `Complete ${habit.name}`}
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 transition active:scale-90 ${
          done ? 'animate-pop border-deep bg-deep text-mint' : 'border-sage bg-card text-sage'
        }`}
      >
        <Check size={26} strokeWidth={3} aria-hidden />
      </button>
    </li>
  );
}
