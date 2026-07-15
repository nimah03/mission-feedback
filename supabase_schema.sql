-- =====================================================================
-- 성결대 유학생 단기선교 피드백 - Supabase 테이블 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 [Run] 하세요.
-- =====================================================================

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  respondent_name text not null,
  ratings jsonb not null default '{}'::jsonb,        -- 항목별 점수/좋았던점/개선점
  comprehensive jsonb not null default '{}'::jsonb,  -- 종합평가 서술형
  pros_cons jsonb not null default '{}'::jsonb       -- 웰컴파티/팀/개인 평가
);

-- 최신순 조회를 빠르게 하기 위한 인덱스
create index if not exists feedback_responses_created_at_idx
  on public.feedback_responses (created_at desc);

-- =====================================================================
-- RLS(Row Level Security) 설정
-- 소규모 내부용 도구이므로 익명 사용자에게 "제출(insert)"과 "조회(select)"를 허용합니다.
-- 필요하다면 아래 정책을 조정해 보안을 강화할 수 있습니다.
-- =====================================================================
alter table public.feedback_responses enable row level security;

-- 누구나 피드백을 제출할 수 있음
drop policy if exists "anyone can insert feedback" on public.feedback_responses;
create policy "anyone can insert feedback"
  on public.feedback_responses
  for insert
  to anon, authenticated
  with check (true);

-- 누구나 결과(대시보드)를 조회할 수 있음
-- 결과를 관리자만 보게 하려면 이 정책을 지우고 인증 기반으로 바꾸세요.
drop policy if exists "anyone can read feedback" on public.feedback_responses;
create policy "anyone can read feedback"
  on public.feedback_responses
  for select
  to anon, authenticated
  using (true);
