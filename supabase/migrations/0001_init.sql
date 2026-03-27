-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  company     text,
  created_at  timestamptz not null default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PROPOSALS
-- ============================================================
create table if not exists public.proposals (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  slug                  text unique not null,
  status                text not null default 'draft'
                          check (status in ('draft', 'sent', 'signed', 'paid')),
  client_name           text not null,
  client_email          text not null,
  client_company        text,
  project_title         text not null,
  content               jsonb not null default '{}',
  brief_text            text,
  total_amount          numeric(10,2),
  deposit_amount        numeric(10,2),
  stripe_payment_intent text,
  stripe_session_id     text,
  sent_at               timestamptz,
  signed_at             timestamptz,
  paid_at               timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists proposals_user_id_idx on public.proposals(user_id);
create index if not exists proposals_slug_idx on public.proposals(slug);
create index if not exists proposals_status_idx on public.proposals(status);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists proposals_updated_at on public.proposals;
create trigger proposals_updated_at
  before update on public.proposals
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- SIGNATURES
-- ============================================================
create table if not exists public.signatures (
  id              uuid primary key default gen_random_uuid(),
  proposal_id     uuid not null references public.proposals(id) on delete cascade,
  signer_name     text not null,
  signer_email    text not null,
  signature_data  text,
  ip_address      text,
  user_agent      text,
  signed_at       timestamptz not null default now(),
  constraint signatures_proposal_id_unique unique (proposal_id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id                    uuid primary key default gen_random_uuid(),
  proposal_id           uuid not null references public.proposals(id) on delete cascade,
  stripe_session_id     text,
  stripe_payment_intent text,
  amount                numeric(10,2) not null,
  currency              text not null default 'usd',
  payment_type          text not null check (payment_type in ('deposit', 'full')),
  status                text not null default 'pending',
  created_at            timestamptz not null default now(),
  completed_at          timestamptz
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Proposals
alter table public.proposals enable row level security;

drop policy if exists "Users can view own proposals" on public.proposals;
drop policy if exists "Users can insert own proposals" on public.proposals;
drop policy if exists "Users can update own proposals" on public.proposals;
drop policy if exists "Users can delete own proposals" on public.proposals;
drop policy if exists "Public can view proposals by slug" on public.proposals;

create policy "Users can view own proposals"
  on public.proposals for select
  using (auth.uid() = user_id);

create policy "Users can insert own proposals"
  on public.proposals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own proposals"
  on public.proposals for update
  using (auth.uid() = user_id);

create policy "Users can delete own proposals"
  on public.proposals for delete
  using (auth.uid() = user_id);

-- Public can view proposals by slug (for client-facing page)
create policy "Public can view proposals by slug"
  on public.proposals for select
  using (true);

-- Signatures
alter table public.signatures enable row level security;

drop policy if exists "Anyone can sign a proposal" on public.signatures;
drop policy if exists "Proposal owner can view signatures" on public.signatures;

-- Anyone can insert a signature (public proposal page)
create policy "Anyone can sign a proposal"
  on public.signatures for insert
  with check (true);

-- Only proposal owner can read signatures
create policy "Proposal owner can view signatures"
  on public.signatures for select
  using (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_id and p.user_id = auth.uid()
    )
  );

-- Payments
alter table public.payments enable row level security;

drop policy if exists "Anyone can create payment record" on public.payments;
drop policy if exists "Proposal owner can view payments" on public.payments;

-- Service role handles inserts (via webhook), anon can also insert
create policy "Anyone can create payment record"
  on public.payments for insert
  with check (true);

-- Only proposal owner can read payments
create policy "Proposal owner can view payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_id and p.user_id = auth.uid()
    )
  );
