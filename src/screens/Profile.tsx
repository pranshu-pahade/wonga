import { Check, Coins, Download, Flame, LayoutGrid, Lock, LogOut, Pencil, Sparkles, Star, Zap, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Sheet } from '../components/Sheet';
import { BADGES, type Badge } from '../lib/achievements';
import { cloudConfigured } from '../lib/cloud';
import { addDays, fromKey, useToday, weekday } from '../lib/dates';
import { RULES, balance, bestStreak, dayStreak, levelInfo, rupees, totalXp } from '../lib/rules';
import { snapshot, useStore } from '../store';

const BADGE_ICONS: Record<Badge['icon'], LucideIcon> = {
  spark: Sparkles, flame: Flame, check: Check, zap: Zap, coins: Coins, star: Star, grid: LayoutGrid,
};
const CAPS = [20, 50, 100, 200];
const WEEKS = 12;
const HEAT = ['bg-line', 'bg-[#B7DFC3]', 'bg-sage', 'bg-deep'];

export function Profile() {
  const today = useToday();
  const state = useStore();
  const { user, completions, unlocked, dailyCap, cloud, setDailyCap, setName, resetAll } = state;
  const [sheet, setSheet] = useState<'name' | 'reset' | null>(null);
  const [draftName, setDraftName] = useState(user?.name ?? '');

  const xp = totalXp(completions);
  const level = levelInfo(xp);
  const stats = [
    { label: 'Habits done', value: String(completions.length) },
    { label: 'Best streak', value: `${bestStreak(completions)} d` },
    { label: 'Day streak', value: `${dayStreak(completions, today)} d` },
    { label: 'Saved', value: rupees(balance(completions)) },
  ];

  // 12 full weeks ending with the current week, one column per week (Sun to Sat).
  const heat = useMemo(() => {
    const counts = new Map<string, number>();
    completions.forEach((c) => counts.set(c.date, (counts.get(c.date) ?? 0) + 1));
    const start = addDays(today, -(weekday(today) + 7 * (WEEKS - 1)));
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = addDays(start, w * 7 + d);
        return { date, count: counts.get(date) ?? 0, future: date > today };
      }),
    );
  }, [completions, today]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(snapshot(state), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wonga-data-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const earned = BADGES.filter((b) => unlocked[b.id]).length;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-deep p-5 text-paper">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-mint font-display text-3xl font-semibold text-deep">
            {user?.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold">{user?.name}</h1>
            <p className="text-sm text-haze">
              Joined {user && fromKey(user.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => {
              setDraftName(user?.name ?? '');
              setSheet('name');
            }}
            aria-label="Edit name"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-mint"
          >
            <Pencil size={18} aria-hidden />
          </button>
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-xl font-semibold text-mint">Level {level.level}</span>
            <span className="text-sm text-haze">{xp} XP total</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-forest">
            <div className="h-full rounded-full bg-mint" style={{ width: `${(level.into / level.size) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-sm text-haze">{level.size - level.into} XP to level {level.level + 1}</p>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <dt className="label">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="card p-4" aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="text-xl font-semibold">Activity</h2>
        <p className="text-sm text-muted">Last {WEEKS} weeks</p>
        <div className="mt-3 flex gap-1.5" role="img" aria-label={`Activity for the last ${WEEKS} weeks: ${completions.length} habits completed in total`}>
          {heat.map((week, w) => (
            <div key={w} className="flex flex-1 flex-col gap-1.5">
              {week.map((cell) => (
                <span
                  key={cell.date}
                  title={cell.future ? undefined : `${cell.date}: ${cell.count} done`}
                  className={`aspect-square w-full rounded-[5px] ${cell.future ? 'bg-transparent' : HEAT[Math.min(3, cell.count)]} ${
                    cell.date === today ? 'ring-2 ring-sage-dark ring-offset-1 ring-offset-card' : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs font-semibold text-muted">
          Less
          {HEAT.map((c) => (
            <span key={c} className={`h-3 w-3 rounded-[3px] ${c}`} />
          ))}
          More
        </div>
      </section>

      <section aria-labelledby="badges-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="badges-heading" className="text-xl font-semibold">Badges</h2>
          <p className="text-sm font-bold text-sage-dark">
            {earned} of {BADGES.length}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2.5">
          {BADGES.map((b) => {
            const got = Boolean(unlocked[b.id]);
            const Icon = got ? BADGE_ICONS[b.icon] : Lock;
            return (
              <li key={b.id} className={`rounded-3xl border p-4 ${got ? 'border-mint bg-mint-soft' : 'border-line bg-card'}`}>
                <span className={`grid h-10 w-10 place-items-center rounded-full ${got ? 'bg-deep text-mint' : 'bg-paper text-muted'}`}>
                  <Icon size={18} aria-hidden />
                </span>
                <p className={`mt-2 font-display text-base font-semibold leading-tight ${got ? '' : 'text-muted'}`}>{b.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted">{b.desc}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-sage-dark">{got ? 'Unlocked' : 'Locked'}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-4">
        <h2 className="text-xl font-semibold">Daily savings cap</h2>
        <p className="text-sm text-muted">The most your habits can add to the simulated wallet in one day.</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {CAPS.map((c) => (
            <button
              key={c}
              onClick={() => setDailyCap(c)}
              aria-pressed={dailyCap === c}
              className={`min-h-[48px] rounded-2xl border-2 font-display text-lg font-semibold ${
                dailyCap === c ? 'border-deep bg-mint text-deep' : 'border-line bg-card text-muted'
              }`}
            >
              {rupees(c)}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-xl font-semibold">How Wonga works</h2>
        <ul className="mt-2 space-y-2 text-sm leading-snug text-muted">
          <li><b className="text-deep">One reward per habit per day.</b> Tap again to undo a mistake.</li>
          <li><b className="text-deep">{RULES.BASE_XP} XP per completion,</b> plus {RULES.STREAK_FACTOR * 100}% for each day of your streak, up to {RULES.MAX_MULTIPLIER}x.</li>
          <li><b className="text-deep">A new level every {RULES.LEVEL_SIZE} XP.</b></li>
          <li><b className="text-deep">Each completion adds its amount</b> to the simulated wallet until the daily cap is reached.</li>
          <li><b className="text-deep">Missing a day costs nothing</b> except the streak.</li>
        </ul>
      </section>

      <section className="card divide-y divide-line">
        <div className="px-4 py-3 text-sm">
          <p className="font-semibold">Your data</p>
          <p className="text-muted">
            {cloudConfigured
              ? cloud === 'on'
                ? 'Saved on this device and backed up to the cloud.'
                : cloud === 'connecting'
                  ? 'Saved on this device. Connecting to cloud backup…'
                  : 'Saved on this device. Cloud backup is not reachable right now.'
              : 'Saved in this browser on this device only.'}
          </p>
        </div>
        <button onClick={exportData} className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left font-semibold">
          <Download size={18} className="text-sage-dark" aria-hidden /> Download my data
        </button>
        <button onClick={() => setSheet('reset')} className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left font-semibold text-[#A63A1A]">
          <LogOut size={18} aria-hidden /> Log out and erase data
        </button>
      </section>

      <p className="pb-2 text-center text-xs text-muted">Wonga 1.0 · Demo login · Simulated wallet, no real money</p>

      {sheet === 'name' && (
        <Sheet title="Edit name" onClose={() => setSheet(null)}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (draftName.trim()) {
                setName(draftName);
                setSheet(null);
              }
            }}
          >
            <label htmlFor="edit-name" className="label">Your name</label>
            <input id="edit-name" className="input" value={draftName} maxLength={24} autoFocus onChange={(e) => setDraftName(e.target.value)} />
            <button className="btn-primary" disabled={!draftName.trim()}>Save</button>
          </form>
        </Sheet>
      )}

      {sheet === 'reset' && (
        <Sheet title="Erase everything?" onClose={() => setSheet(null)}>
          <p className="text-muted">
            This logs you out and permanently deletes your habits, streaks, XP, badges and wallet history from this device. It cannot be undone.
          </p>
          <div className="mt-5 flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setSheet(null)}>Cancel</button>
            <button className="btn-ghost flex-1 !border-[#A63A1A] !bg-[#A63A1A] !text-white" onClick={resetAll}>Erase and log out</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
