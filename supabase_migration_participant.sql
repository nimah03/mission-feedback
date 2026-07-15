-- Supabase SQL Editor에서 실행하세요 (기존 테이블에 컬럼 추가)
alter table public.feedback_responses add column if not exists gender_team text;
alter table public.feedback_responses add column if not exists participation text;
