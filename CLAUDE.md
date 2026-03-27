# ProposalFlow — Proposal Generation Platform

## Tech Stack
- Next.js 14 (App Router)
- Supabase (Auth + Postgres + RLS)
- Claude API (claude-sonnet-4-6) for AI generation
- Stripe Checkout + Webhooks
- Tailwind CSS + shadcn/ui

## Key Routes
- `/login` — Magic link auth
- `/dashboard` — Proposal list + stats
- `/dashboard/proposals/new` — Create proposal (AI generation)
- `/dashboard/proposals/[id]` — Proposal detail, copy link, mark sent
- `/p/[slug]` — Public proposal page (sign + pay)

## API Routes
- `POST /api/generate` — AI generates proposal from brief
- `PATCH /api/proposals/[id]` — Update status/fields
- `POST /api/sign` — Save signature, set status = signed
- `POST /api/stripe/checkout` — Create Stripe session
- `POST /api/stripe/webhook` — Handle payment completion

## Setup Steps
1. Install deps: `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in keys
3. Run Supabase migration: paste `supabase/migrations/0001_init.sql` in Supabase SQL editor
4. Set Stripe webhook endpoint to `https://yourdomain.com/api/stripe/webhook`
5. Run dev: `npm run dev`

## Proposal Template
Edit `templates/default-proposal.ts` to customize the section structure and AI guidance.
The `styling` object controls colors used in the proposal renderer.
