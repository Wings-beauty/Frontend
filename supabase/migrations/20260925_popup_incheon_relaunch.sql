-- 인천대 학산도서관 플리마켓으로 행사가 바뀌면서 퀴즈가 3문항(카테고리/고민/가격대)에서
-- 5문항(카테고리/선택 기준/사용감/가격대/구매 시 필요한 정보)으로 늘었다.
-- event_key는 앱 코드에서 "2026-10-01-incheon"으로 바뀌므로 기존 "2026-10-01-seongsu" 데이터는
-- 자동으로 분리되고 별도 정리가 필요 없다.
-- 20260920_popup.sql, 20260924_popup_real_catalog.sql을 실행한 프로젝트에서 SQL Editor로 실행하세요.
-- 이 파일은 여러 번 실행해도 안전하다.

-- 1) concern 컬럼을 criteria로 이름을 바꾸고 값 종류를 새로 정의한다.
--    이미 바뀐 상태면(재실행) 건너뛴다.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'popup_quiz_responses' and column_name = 'concern'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'popup_quiz_responses' and column_name = 'criteria'
  ) then
    alter table public.popup_quiz_responses rename column concern to criteria;
  end if;
end $$;

do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.popup_quiz_responses'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%criteria%'
  loop
    execute format('alter table public.popup_quiz_responses drop constraint %I', con.conname);
  end loop;
end $$;

-- 이름만 바뀌었을 뿐 예전 값(soothing/moisture/brightening/scent 등)을 그대로 가진
-- 테스트 응답이 있으면 새 체크 제약과 충돌하니 먼저 지운다.
delete from public.popup_quiz_responses
where criteria not in ('ingredient', 'price', 'brand', 'review');

alter table public.popup_quiz_responses
  add constraint popup_quiz_responses_criteria_check
  check (criteria in ('ingredient', 'price', 'brand', 'review'));

-- 2) 사용감(texture), 구매 시 필요한 정보(info_need) 컬럼을 추가한다.
alter table public.popup_quiz_responses
  add column if not exists texture text,
  add column if not exists info_need text;

update public.popup_quiz_responses set texture = 'light' where texture is null;
update public.popup_quiz_responses set info_need = 'reviews' where info_need is null;

alter table public.popup_quiz_responses
  alter column texture set not null,
  alter column info_need set not null;

do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.popup_quiz_responses'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%texture%'
  loop
    execute format('alter table public.popup_quiz_responses drop constraint %I', con.conname);
  end loop;

  for con in
    select conname from pg_constraint
    where conrelid = 'public.popup_quiz_responses'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%info_need%'
  loop
    execute format('alter table public.popup_quiz_responses drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.popup_quiz_responses
  add constraint popup_quiz_responses_texture_check
  check (texture in ('light', 'rich', 'matte'));

alter table public.popup_quiz_responses
  add constraint popup_quiz_responses_info_need_check
  check (info_need in ('ingredients_list', 'reviews', 'price_compare', 'try_in_person'));

-- 3) 행사 시간이 11:00-20:00에서 10:00-16:00으로 바뀌면서 방문 예정 시간대도 바뀐다.
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.popup_visit_slots'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%time_slot%'
  loop
    execute format('alter table public.popup_visit_slots drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.popup_visit_slots
  add constraint popup_visit_slots_time_slot_check
  check (time_slot in ('10-12', '12-14', '14-16'));
