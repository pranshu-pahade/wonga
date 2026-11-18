import { Home, ListChecks, Trophy, User, Wallet } from 'lucide-react';
import type { Tab } from '../lib/types';

const ITEMS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Today', Icon: Home },
  { id: 'habits', label: 'Habits', Icon: ListChecks },
  { id: 'wallet', label: 'Wallet', Icon: Wallet },
  { id: 'ranks', label: 'Ranks', Icon: Trophy },
  { id: 'profile', label: 'Profile', Icon: User },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t border-line bg-card/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      <ul className="flex">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition ${
                  active ? 'bg-mint-soft text-deep' : 'text-muted'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.6 : 2} aria-hidden />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
