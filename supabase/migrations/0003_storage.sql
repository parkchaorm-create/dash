-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- signatures: 서명 이미지 파일 (비공개)
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

-- briefs: 브리프 업로드 파일 (비공개)
insert into storage.buckets (id, name, public)
values ('briefs', 'briefs', false)
on conflict (id) do nothing;

-- ============================================================
-- STORAGE RLS POLICIES — signatures
-- ============================================================

-- service_role(서버)이 서명 이미지 업로드
drop policy if exists "Service role can upload signatures" on storage.objects;
create policy "Service role can upload signatures"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'signatures');

-- service_role이 서명 이미지 읽기
drop policy if exists "Service role can read signatures" on storage.objects;
create policy "Service role can read signatures"
  on storage.objects for select
  to service_role
  using (bucket_id = 'signatures');

-- 제안서 소유자만 서명 이미지 읽기 (인증 사용자)
drop policy if exists "Proposal owner can read signature files" on storage.objects;
create policy "Proposal owner can read signature files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'signatures' and
    exists (
      select 1 from public.proposals p
      where p.id::text = (storage.foldername(name))[1]
        and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE RLS POLICIES — briefs
-- ============================================================

-- 인증된 사용자가 자신의 브리프 업로드 (경로: {userId}/...)
drop policy if exists "Users can upload own briefs" on storage.objects;
create policy "Users can upload own briefs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'briefs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 인증된 사용자가 자신의 브리프 읽기
drop policy if exists "Users can read own briefs" on storage.objects;
create policy "Users can read own briefs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'briefs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 인증된 사용자가 자신의 브리프 삭제
drop policy if exists "Users can delete own briefs" on storage.objects;
create policy "Users can delete own briefs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'briefs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
