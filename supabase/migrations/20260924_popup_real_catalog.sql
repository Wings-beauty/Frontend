-- 실제 팝업 참여 브랜드 카탈로그에 맞춰 퀴즈 카테고리 값을 바꾼다.
-- (고민/선택 기준 쪽은 20260925_popup_incheon_relaunch.sql에서 다룬다.)
-- 이미 20260920_popup.sql을 실행한 프로젝트에서 SQL Editor로 실행하세요.
-- 20260925보다 먼저 실행하든 나중에 실행하든 상관없다.

do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.popup_quiz_responses'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.popup_quiz_responses drop constraint %I', con.conname);
  end loop;
end $$;

-- 이전 카테고리(lip/blusher/eye)로 저장된 테스트 응답이 있다면 새 제약과 충돌하니
-- 제약을 걸기 전에 먼저 정리한다.
delete from public.popup_quiz_responses
where category not in ('skincare', 'makeup', 'hair', 'fragrance');

alter table public.popup_quiz_responses
  add constraint popup_quiz_responses_category_check
  check (category in ('skincare', 'makeup', 'hair', 'fragrance'));
