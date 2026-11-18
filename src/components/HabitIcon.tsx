import {
  Apple, BookOpen, Code2, Droplets, Dumbbell, Flower2, Footprints, GraduationCap, Heart, Moon, Music, PenLine,
  type LucideIcon,
} from 'lucide-react';
import type { IconKey } from '../lib/types';

export const HABIT_ICONS: Record<IconKey, { Icon: LucideIcon; label: string }> = {
  book: { Icon: BookOpen, label: 'Reading' },
  dumbbell: { Icon: Dumbbell, label: 'Workout' },
  study: { Icon: GraduationCap, label: 'Study' },
  meditate: { Icon: Flower2, label: 'Meditation' },
  water: { Icon: Droplets, label: 'Water' },
  sleep: { Icon: Moon, label: 'Sleep' },
  walk: { Icon: Footprints, label: 'Walking' },
  journal: { Icon: PenLine, label: 'Journal' },
  music: { Icon: Music, label: 'Music' },
  code: { Icon: Code2, label: 'Coding' },
  heart: { Icon: Heart, label: 'Health' },
  food: { Icon: Apple, label: 'Food' },
};

export function HabitIcon({ icon, size = 22, className = '' }: { icon: IconKey; size?: number; className?: string }) {
  const { Icon } = HABIT_ICONS[icon] ?? HABIT_ICONS.book;
  return <Icon size={size} className={className} aria-hidden />;
}
