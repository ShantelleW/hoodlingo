# Plan: Hoodlingo Competition Leaderboard (iOS)

Add a Competition feature inside the existing Hoodlingo Capacitor iOS app. Shares the current auth, backend, and design system — no new project. After web changes, user runs `npm run build && npx cap sync ios` to ship to iOS.

## 1. Scoring model

Each player's total competition points = sum of:

| Source | Points | Data source |
|---|---|---|
| Quiz play | raw score | `scores.score` |
| Approved submission | +10 each | `questions` where `submitted_by = user` and `is_approved = true` |
| OG vote cast | +1 each | `og_votes` where `og_user_id = user` |
| Challenge win | +5 each | `challenge_responses` vs `challenges.challenger_score` |

Computed server-side via a Postgres view + RPC so totals stay consistent.

## 2. Database changes (migration)

- `public.v_player_points` — view aggregating per-user points by source.
- `public.get_leaderboard(_timeframe text, _category text default null)` — SECURITY DEFINER function returning `{user_id, display_name, initials, avatar_id, points, rank, games_played, accuracy}` for `'all_time' | 'weekly' | 'monthly'`, optionally filtered by category.
- `public.get_player_stats(_user_id uuid)` — returns totals, breakdown by source, games played, accuracy %, approved submissions list, recent activity (last 20 events across scores/submissions/votes).
- GRANT EXECUTE to `authenticated` and `anon` (leaderboard is public-readable, matching existing `scores` policy).

No new tables required.

## 3. New routes & components

```text
src/pages/Competition.tsx              - tabs: All-Time | Weekly | Monthly, optional category filter
src/pages/PlayerProfile.tsx            - /player/:userId
src/components/competition/
  ├── LeaderboardTable.tsx             - rank, avatar, initials, points, games
  ├── LeaderboardRow.tsx               - tap → PlayerProfile
  ├── TimeframeTabs.tsx
  ├── CategoryFilter.tsx               - Rap / Streets / Flicks / Stores / All
  ├── PointsBreakdownCard.tsx          - quiz / submissions / votes / challenges
  ├── ApprovedSubmissionsList.tsx
  └── ActivityFeed.tsx                 - recent scores, approvals, votes
src/hooks/useLeaderboard.tsx           - react-query wrapper over RPC
src/hooks/usePlayerStats.tsx
```

Routes added in `src/App.tsx`:
- `/competition`
- `/player/:userId`

## 4. Navigation integration

- Add "Competition" entry to `SideMenu.tsx` with trophy icon.
- Add a "View Leaderboard" CTA on `GameOverScreen.tsx` linking to `/competition`.
- Existing arcade leaderboard (post-game initials) stays unchanged.

## 5. UI/UX

- Reuses existing design tokens (`quiz-card`, display font, primary/secondary colors).
- Top 3 ranks get gold/silver/bronze accent treatment.
- Current user's row highlighted and pinned visible.
- Mobile-first; safe-area padding for iOS notch.
- Pull-to-refresh on leaderboard.

## 6. iOS shipping steps (user runs locally after merge)

```bash
git pull
npm install
npm run build
npx cap sync ios
npx cap open ios
```
Then archive in Xcode and submit via App Store Connect.

## File changes summary

| File | Action |
|---|---|
| DB migration | New view + 2 RPC functions |
| `src/App.tsx` | Add 2 routes |
| `src/pages/Competition.tsx` | New |
| `src/pages/PlayerProfile.tsx` | New |
| `src/components/competition/*` | New (7 files) |
| `src/hooks/useLeaderboard.tsx` | New |
| `src/hooks/usePlayerStats.tsx` | New |
| `src/components/SideMenu.tsx` | Add nav link |
| `src/components/GameOverScreen.tsx` | Add CTA |

## Out of scope

- Push notifications for rank changes
- Seasons/resets with archived snapshots
- Friend-only leaderboards
