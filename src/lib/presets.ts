import type { HabitDraft } from './types';

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

export const PRESETS: HabitDraft[] = [
  { name: 'Read 20 minutes', icon: 'book', days: EVERY_DAY, rate: 10 },
  { name: 'Workout', icon: 'dumbbell', days: [1, 2, 3, 4, 5, 6], rate: 10 },
  { name: 'Study 1 hour', icon: 'study', days: WEEKDAYS, rate: 10 },
  { name: 'Meditate', icon: 'meditate', days: EVERY_DAY, rate: 5 },
  { name: 'Drink 8 glasses of water', icon: 'water', days: EVERY_DAY, rate: 5 },
  { name: 'Sleep by 11 pm', icon: 'sleep', days: EVERY_DAY, rate: 10 },
  { name: 'Walk 5,000 steps', icon: 'walk', days: EVERY_DAY, rate: 10 },
  { name: 'Journal', icon: 'journal', days: EVERY_DAY, rate: 5 },
];

export const EVERY_DAY_LIST = EVERY_DAY;
