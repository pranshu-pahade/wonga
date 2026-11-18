# Wonga

A gamified habit-building and micro-savings web app. Complete your daily habits, build streaks, earn XP and badges, and watch a **simulated** savings wallet grow with every completion.

Built with React, TypeScript, Vite, Tailwind CSS and Zustand. Optional cloud backup with Firebase (Cloud Firestore).

## What the app does

- **Demo login**: mobile number + any 4-digit code (no SMS is sent), then name and starter habits.
- **Today**: today's habits, one tap to complete (tap again to undo), progress ring, day streak, level and XP bar.
- **Habits**: add, edit and remove habits; choose an icon, the days of the week, and how much each completion saves.
- **Wallet**: simulated balance, daily cap, 14-day chart and contribution history. No real money is involved.
- **Ranks**: weekly XP leaderboard preview. The other players are sample entries, labelled as such.
- **Profile**: stats, 12-week activity grid, 14 badges, daily cap setting, data download, and erase/log out.

### Reward rules (see `src/lib/rules.ts`)

| Rule | Value |
| --- | --- |
| Completions | 1 per habit per day |
| Base XP | 10 XP per completion |
| Streak bonus | +10% per streak day, capped at 2x |
| Levels | 1 level per 100 XP |
| Default contribution | ₹10 per completion (set per habit) |
| Daily cap | ₹50 by default (change it in Profile) |

Data is saved in the browser (localStorage), so it stays on the device it was entered on.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Other commands:

```bash
npm test         # checks the streak, XP and wallet rules
npm run build    # production build into the dist folder
npm run preview  # preview the production build
```

## Publish it (Vercel, free)

1. Create a new repository on GitHub and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Wonga web app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/wonga.git
   git push -u origin main
   ```
2. Go to https://vercel.com, sign in with GitHub, choose **Add New > Project** and import the repository.
3. Vercel detects Vite automatically (build command `npm run build`, output folder `dist`). Click **Deploy**.

You get a public link such as `https://wonga.vercel.app`. Every later `git push` republishes it.

Netlify works the same way (build command `npm run build`, publish directory `dist`).

## Optional: cloud backup with Firebase

The app works without this. To also back up each browser's data to Cloud Firestore:

1. Create a project at https://console.firebase.google.com and add a **Web app**.
2. Turn on **Authentication > Sign-in method > Anonymous**.
3. Create a **Firestore Database** and paste the contents of `firestore.rules` into its Rules tab.
4. Copy `.env.example` to `.env` and fill in the four values from the Firebase web app settings.
5. On Vercel, add the same four values under **Settings > Environment Variables**, then redeploy.

Each browser signs in anonymously and can read and write only its own backup document (`users/{uid}`).

## Project structure

```
src/
  lib/         reward rules, dates, badges, presets, optional cloud backup
  components/  habit card, habit form, bottom navigation, sheets, toasts
  screens/     Onboarding, Home, Habits, Wallet, Leaderboard, Profile
  store.ts     app state (Zustand), saved to the browser
```

## Limits of this version

- Login is a demo: any 4-digit code is accepted.
- The wallet is a simulation. Nothing is collected, moved or invested.
- Habit completion is self-reported.
- The leaderboard uses sample players; real friends and team habits are future work.
