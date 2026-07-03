# Revisio

Spaced repetition app — users add topics, get auto-scheduled revisions at days 1/3/7/15/30/60, and review them daily on the Today dashboard.

## Run & Operate

- `pnpm --filter @workspace/revisio run dev` — run the Revisio frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- React + Vite (static site, no backend)
- Supabase for auth (email/password) and database (PostgreSQL with RLS)
- TailwindCSS, wouter routing, lucide-react icons
- Inter font, dark design (#0F1117 bg, #1A1D27 cards, #6C63FF accent)

## Required Env Vars

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Supabase Database Setup

Run `artifacts/revisio/SUPABASE_SETUP.sql` in the Supabase SQL Editor to create:
- `topics` table with RLS
- `revisions` table with RLS

## Where things live

- `artifacts/revisio/src/pages/` — TodayPage, TopicsPage, CalendarPage, StatsPage, AuthPage
- `artifacts/revisio/src/hooks/useRevisions.ts` — all Supabase data hooks
- `artifacts/revisio/src/contexts/AuthContext.tsx` — Supabase auth provider
- `artifacts/revisio/src/lib/supabase.ts` — Supabase client init
- `artifacts/revisio/SUPABASE_SETUP.sql` — DB schema to run in Supabase dashboard

## Deployment (Vercel)

1. Connect the `artifacts/revisio` directory as root
2. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Build command: `pnpm build`, output: `dist/public`
4. `vercel.json` handles SPA routing rewrites

## Features

- Email/password auth via Supabase Auth
- Add topics with subject tags (Math, Science, History, Language, Programming, Literature, Art, Music, Other)
- Auto-schedules revisions at +1, +3, +7, +15, +30, +60 days
- Today dashboard: Done / Postpone buttons; missed revisions rescheduled from today (not original date)
- Topics page: list with delete
- Calendar page: month view with colored dots per revision status
- Stats page: streak counter, accuracy %, heatmap of last 12 weeks

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
