import { Users } from 'lucide-react';
import { useToday } from '../lib/dates';
import { weeklyXp } from '../lib/rules';
import { SAMPLE_PLAYERS } from '../lib/sample';
import { useStore } from '../store';

export function Leaderboard() {
  const today = useToday();
  const { user, completions } = useStore();
  const mine = weeklyXp(completions, today);

  const rows = [...SAMPLE_PLAYERS.map((p) => ({ ...p, me: false })), { name: user?.name ?? 'You', weeklyXp: mine, me: true }].sort(
    (a, b) => b.weeklyXp - a.weeklyXp || (a.me ? 1 : -1),
  );
  const rank = rows.findIndex((r) => r.me) + 1;
  const ahead = rank > 1 ? rows[rank - 2] : null;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold">Leaderboard</h1>
        <p className="text-muted">XP earned in the last 7 days</p>
      </header>

      <section className="rounded-[28px] bg-deep p-5 text-paper">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-mint">Your rank this week</p>
        <p className="mt-2 font-display text-6xl font-semibold leading-none">
          #{rank}
          <span className="ml-3 text-2xl font-medium text-haze">{mine} XP</span>
        </p>
        <p className="mt-3 text-haze">
          {ahead ? `${ahead.weeklyXp - mine + 1} XP more to pass ${ahead.name}.` : 'You are in the lead. Keep the streak going!'}
        </p>
      </section>

      <p className="flex gap-3 rounded-2xl border border-line bg-mint-soft px-4 py-3 text-sm leading-snug">
        <Users size={18} className="mt-0.5 shrink-0 text-sage-dark" aria-hidden />
        <span>
          <b>Preview with sample players.</b> The other names are demo entries. Real friends and team habits are planned next.
        </span>
      </p>

      <ol className="card divide-y divide-line">
        {rows.map((r, i) => (
          <li key={r.name + i} className={`flex items-center gap-3 px-4 py-3 ${r.me ? 'bg-mint-soft first:rounded-t-3xl last:rounded-b-3xl' : ''}`}>
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-lg font-semibold ${
                i === 0 ? 'bg-deep text-mint' : 'bg-paper text-muted'
              }`}
            >
              {i + 1}
            </span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage font-display text-lg font-semibold text-white">
              {r.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{r.me ? `${r.name} (you)` : r.name}</span>
              {!r.me && <span className="block text-xs font-bold uppercase tracking-wider text-muted">Sample</span>}
            </span>
            <span className="font-display text-lg font-semibold">{r.weeklyXp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
