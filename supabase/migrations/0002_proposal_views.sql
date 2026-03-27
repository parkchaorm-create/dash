-- ============================================================
-- PROPOSAL VIEWS (조회 추적)
-- ============================================================
create table if not exists public.proposal_views (
  id           uuid primary key default gen_random_uuid(),
  proposal_id  uuid not null references public.proposals(id) on delete cascade,
  viewed_at    timestamptz not null default now(),
  ip_address   text,
  user_agent   text
);

create index if not exists proposal_views_proposal_id_idx on public.proposal_views(proposal_id);

-- RLS
alter table public.proposal_views enable row level security;

-- 누구나 조회 기록 INSERT 가능 (공개 페이지)
create policy "Anyone can record a view"
  on public.proposal_views for insert
  with check (true);

-- 제안서 소유자만 조회 기록 열람 가능
create policy "Proposal owner can view analytics"
  on public.proposal_views for select
  using (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_id and p.user_id = auth.uid()
    )
  );
