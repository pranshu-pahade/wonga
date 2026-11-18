import { Info } from 'lucide-react';
import { useMemo } from 'react';
import { HabitIcon } from '../components/HabitIcon';
import { fromKey, lastNDays, prettyDate, useToday } from '../lib/dates';
import { balance, contributedOn, rupees } from '../lib/rules';
import { useStore } from '../store';

export function Wallet() {
  const today = useToday();
  const { habits, completions, dailyCap } = useStore();

  const total = balance(completions);
  const savedToday = contributedOn(completions, today);
  const days = useMemo(
    () => lastNDays(14, today).map((d) => ({ date: d, amount: contributedOn(completions, d) })),
    [completions, today],
  );
  const max = Math.max(dailyCap, ...days.map((d) => d.amount));
  const fortnight = days.reduce((s, d) => s + d.amount, 0);
  const perDay = fortnight / 14;

  const history = useMemo(() => {
    const entries = completions.filter((c) => c.amount > 0).sort((a, b) => b.ts - a.ts);
    const groups: { date: string; items: typeof entries }[] = [];
    for (const e of entries) {
      const last = groups[groups.length - 1];
      if (last && last.date === e.date) last.items.push(e);
      else groups.push({ date: e.date, items: [e] });
    }
    return groups;
  }, [completions]);
  const habitById = new Map(habits.map((h) => [h.id, h]));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Wallet</h1>

      <section className="rounded-[28px] bg-deep p-5 text-paper">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-mint">Simulated balance</p>
        <p className="mt-2 font-display text-6xl font-semibold leading-none">{rupees(total)}</p>
        <div className="mt-5">
          <div className="flex justify-between text-sm">
            <span className="font-bold">{rupees(savedToday)} saved today</span>
            <span className="text-haze">cap {rupees(dailyCap)}</span>
          </div>
          <div
            className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-forest"
            role="progressbar"
            aria-label="Today's contribution against the daily cap"
            aria-valuemin={0}
            aria-valuemax={dailyCap}
            aria-valuenow={savedToday}
          >
            <div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${Math.min(100, (savedToday / dailyCap) * 100)}%` }} />
          </div>
        </div>
      </section>

      <p className="flex gap-3 rounded-2xl border border-line bg-mint-soft px-4 py-3 text-sm leading-snug">
        <Info size={18} className="mt-0.5 shrink-0 text-sage-dark" aria-hidden />
        <span>
          <b>This wallet is a simulation.</b> No real money is collected, moved or invested, and no returns are promised.
        </span>
      </p>

      <section className="card p-4" aria-labelledby="chart-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="chart-heading" className="text-xl font-semibold">Last 14 days</h2>
          <p className="text-sm font-bold text-sage-dark">{rupees(fortnight)} saved</p>
        </div>
        <div className="mt-4 flex h-28 items-end gap-1.5" role="img" aria-label={`Daily contributions for the last 14 days, ${rupees(fortnight)} in total`}>
          {days.map((d) => (
            <div key={d.date} className="flex h-full flex-1 flex-col justify-end" title={`${prettyDate(d.date, today)}: ${rupees(d.amount)}`}>
              <div
                className={`w-full rounded-t-md ${d.amount > 0 ? (d.date === today ? 'bg-deep' : 'bg-sage') : 'bg-line'}`}
                style={{ height: d.amount > 0 ? `${Math.max(8, (d.amount / max) * 100)}%` : '4px' }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold text-muted">
          <span>{fromKey(days[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span>Today</span>
        </div>
        {perDay > 0 && (
          <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
            At this pace (about {rupees(Math.round(perDay))} a day) your contributions would add up to roughly{' '}
            <b className="text-deep">{rupees(Math.round((perDay * 365) / 10) * 10)}</b> in a year. This is a simple projection of contributions only.
          </p>
        )}
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-3 text-xl font-semibold">Contribution history</h2>
        {history.length === 0 ? (
          <div className="card p-6 text-center text-muted">Complete a habit to make your first contribution.</div>
        ) : (
          <div className="space-y-4">
            {history.map((g) => (
              <div key={g.date}>
                <div className="mb-1.5 flex justify-between text-sm font-bold text-muted">
                  <span>{prettyDate(g.date, today)}</span>
                  <span>{rupees(g.items.reduce((s, i) => s + i.amount, 0))}</span>
                </div>
                <ul className="card divide-y divide-line">
                  {g.items.map((item) => {
                    const h = habitById.get(item.habitId);
                    return (
                      <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <HabitIcon icon={h?.icon ?? 'book'} size={20} className="shrink-0 text-sage-dark" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{h?.name ?? 'Habit'}</span>
                          <span className="block text-sm text-muted">
                            {new Date(item.ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </span>
                        <span className="font-display text-lg font-semibold text-sage-dark">+{rupees(item.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
