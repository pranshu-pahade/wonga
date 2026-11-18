import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { HabitIcon } from '../components/HabitIcon';
import { PRESETS } from '../lib/presets';
import { rupees } from '../lib/rules';
import { useStore } from '../store';

type Step = 'welcome' | 'otp' | 'name' | 'habits';

export function Onboarding() {
  const login = useStore((s) => s.login);
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<number[]>([0, 1]);

  const back: Record<Step, Step | null> = { welcome: null, otp: 'welcome', name: 'otp', habits: 'name' };
  const togglePick = (i: number) => setPicked((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  return (
    <div className="flex min-h-dvh flex-col">
      {step === 'welcome' ? (
        <div className="relative overflow-hidden bg-deep px-6 pb-10 pt-14 text-paper">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-forest" aria-hidden />
          <div className="absolute right-8 top-10 h-20 w-20 rounded-full bg-mint" aria-hidden />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.18em] text-mint">Habits that pay you back</p>
          <h1 className="relative mt-3 text-7xl font-semibold leading-none">Wonga</h1>
          <p className="relative mt-4 max-w-[19rem] text-lg leading-snug text-haze">
            Build daily habits, earn XP, and watch a savings wallet grow with every streak.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 pt-5">
          <button
            onClick={() => back[step] && setStep(back[step]!)}
            aria-label="Back"
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card"
          >
            <ArrowLeft size={20} aria-hidden />
          </button>
          <div className="flex flex-1 gap-1.5" aria-hidden>
            {(['otp', 'name', 'habits'] as Step[]).map((s, i) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= ['otp', 'name', 'habits'].indexOf(step) ? 'bg-sage-dark' : 'bg-line'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
        {step === 'welcome' && (
          <form
            className="flex flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              if (phone.length === 10) setStep('otp');
            }}
          >
            <h2 className="text-3xl font-semibold">Let’s get you in</h2>
            <label htmlFor="phone" className="label mt-6">Mobile number</label>
            <div className="mt-2 flex gap-2">
              <span className="grid min-h-[52px] place-items-center rounded-2xl border border-line bg-card px-4 text-lg font-semibold text-muted">+91</span>
              <input
                id="phone"
                className="input"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            <p className="mt-3 text-sm text-muted">Demo login: no SMS is sent and your number stays on this device.</p>
            <div className="flex-1" />
            <button className="btn-primary mt-8" disabled={phone.length !== 10}>Continue</button>
          </form>
        )}

        {step === 'otp' && (
          <form
            className="flex flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              if (otp.length === 4) setStep('name');
            }}
          >
            <h2 className="text-3xl font-semibold">Enter the code</h2>
            <p className="mt-2 text-muted">For +91 {phone}</p>
            <label htmlFor="otp" className="label mt-6">4-digit code</label>
            <input
              id="otp"
              className="input mt-2 text-center font-display text-3xl tracking-[0.5em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••"
              value={otp}
              autoFocus
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
            <p className="mt-3 rounded-2xl bg-mint-soft px-4 py-3 text-sm font-semibold text-deep">
              Demo mode: enter any 4 digits to continue.
            </p>
            <div className="flex-1" />
            <button className="btn-primary mt-8" disabled={otp.length !== 4}>Verify</button>
          </form>
        )}

        {step === 'name' && (
          <form
            className="flex flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setStep('habits');
            }}
          >
            <h2 className="text-3xl font-semibold">What should we call you?</h2>
            <label htmlFor="name" className="label mt-6">Your name</label>
            <input
              id="name"
              className="input mt-2"
              autoComplete="given-name"
              maxLength={24}
              placeholder="First name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex-1" />
            <button className="btn-primary mt-8" disabled={!name.trim()}>Continue</button>
          </form>
        )}

        {step === 'habits' && (
          <div className="flex flex-1 flex-col">
            <h2 className="text-3xl font-semibold">Pick your first habits</h2>
            <p className="mt-2 text-muted">Start small. You can add, edit or remove habits any time.</p>
            <ul className="mt-5 space-y-2">
              {PRESETS.map((p, i) => {
                const on = picked.includes(i);
                return (
                  <li key={p.name}>
                    <button
                      onClick={() => togglePick(i)}
                      aria-pressed={on}
                      className={`flex min-h-[60px] w-full items-center gap-3 rounded-2xl border-2 px-4 text-left ${
                        on ? 'border-deep bg-mint-soft' : 'border-line bg-card'
                      }`}
                    >
                      <HabitIcon icon={p.icon} className="shrink-0 text-sage-dark" />
                      <span className="flex-1 font-semibold">{p.name}</span>
                      <span className="text-sm text-muted">{rupees(p.rate)}</span>
                      <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${on ? 'border-deep bg-deep text-mint' : 'border-line'}`}>
                        {on && <Check size={14} strokeWidth={3.5} aria-hidden />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex-1" />
            <button
              className="btn-primary mt-8"
              disabled={picked.length === 0}
              onClick={() => login(name, phone, [...picked].sort((a, b) => a - b).map((i) => PRESETS[i]))}
            >
              Start with {picked.length} habit{picked.length === 1 ? '' : 's'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
