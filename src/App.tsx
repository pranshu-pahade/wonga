import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Toasts } from './components/Toasts';
import type { Tab } from './lib/types';
import { Habits } from './screens/Habits';
import { Home } from './screens/Home';
import { Leaderboard } from './screens/Leaderboard';
import { Onboarding } from './screens/Onboarding';
import { Profile } from './screens/Profile';
import { Wallet } from './screens/Wallet';
import { useStore } from './store';

export default function App() {
  const user = useStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[440px] bg-paper shadow-[0_0_60px_rgba(18,36,29,0.12)]">
      <Toasts />
      {!user ? (
        <Onboarding />
      ) : (
        <>
          <main className="px-5 pb-28 pt-6">
            {tab === 'home' && <Home go={setTab} />}
            {tab === 'habits' && <Habits />}
            {tab === 'wallet' && <Wallet />}
            {tab === 'ranks' && <Leaderboard />}
            {tab === 'profile' && <Profile />}
          </main>
          <BottomNav tab={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}
