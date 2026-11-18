import { Award, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useStore, type Toast } from '../store';

const ICONS = { xp: Zap, level: TrendingUp, badge: Award, info: Sparkles };

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const id = setTimeout(() => dismiss(toast.id), 3200);
    return () => clearTimeout(id);
  }, [toast.id, dismiss]);
  const Icon = ICONS[toast.kind];
  return (
    <div className="pointer-events-auto flex animate-toast items-center gap-3 rounded-2xl bg-deep px-4 py-3 text-paper shadow-lg">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-deep">
        <Icon size={18} strokeWidth={2.6} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base font-semibold leading-tight">{toast.title}</span>
        {toast.body && <span className="block text-sm leading-snug text-haze">{toast.body}</span>}
      </span>
    </div>
  );
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-3 z-50 flex w-full max-w-[440px] -translate-x-1/2 flex-col gap-2 px-4"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
