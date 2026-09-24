-- WINGS 팝업 랜딩 MVP
-- Supabase SQL Editor에서 실행하세요.
-- 사전 작업: Authentication > Sign In / Providers 에서 "Allow anonymous sign-ins"를 켜야 합니다.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 방문자: 최초 유입(first-touch)만 저장하고 수정하지 않는다.
create table if not exists public.popup_visitors (
  event_key text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_path text,
  created_at timestamptz not null default now(),
  primary key (event_key, user_id)
);

-- 퀴즈 응답: 방문자당 1건, 다시 풀면 갱신한다.
create table if not exists public.popup_quiz_responses (
  event_key text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in ('lip', 'blusher', 'eye')),
  concern text not null check (
    concern in ('long_lasting', 'natural_flush', 'vivid_color', 'tone_match')
  ),
  budget text not null check (
    budget in ('under_15000', '15000_25000', 'over_25000')
  ),
  recommended_keys text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_key, user_id)
);

-- 제품 이벤트: 매번 append 한다.
create table if not exists public.popup_product_events (
  id bigint generated always as identity primary key,
  event_key text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_key text not null,
  event_type text not null check (
    event_type in ('recommend', 'view', 'like', 'unlike')
  ),
  created_at timestamptz not null default now()
);

create index if not exists popup_product_events_lookup_idx
  on public.popup_product_events (event_key, product_key, event_type);

create table if not exists public.popup_wishlist (
  event_key text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_key text not null,
  created_at timestamptz not null default now(),
  primary key (event_key, user_id, product_key)
);

create table if not exists public.popup_visit_slots (
  event_key text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  time_slot text not null check (
    time_slot in ('11-13', '13-15', '15-17', '17-20')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_key, user_id)
);

create table if not exists public.popup_purchase_surveys (
  event_key text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_keys text[] not null default '{}',
  reasons text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_key, user_id)
);

alter table public.popup_visitors enable row level security;
alter table public.popup_quiz_responses enable row level security;
alter table public.popup_product_events enable row level security;
alter table public.popup_wishlist enable row level security;
alter table public.popup_visit_slots enable row level security;
alter table public.popup_purchase_surveys enable row level security;

-- popup_visitors: 본인 insert/select, 관리자 select
create policy "popup_visitors_insert_own" on public.popup_visitors
  for insert to authenticated with check (user_id = auth.uid());
create policy "popup_visitors_select_own" on public.popup_visitors
  for select to authenticated using (user_id = auth.uid());
create policy "popup_visitors_select_admin" on public.popup_visitors
  for select to authenticated using (public.is_admin());

-- popup_quiz_responses: 본인 insert/select/update, 관리자 select
create policy "popup_quiz_insert_own" on public.popup_quiz_responses
  for insert to authenticated with check (user_id = auth.uid());
create policy "popup_quiz_select_own" on public.popup_quiz_responses
  for select to authenticated using (user_id = auth.uid());
create policy "popup_quiz_update_own" on public.popup_quiz_responses
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "popup_quiz_select_admin" on public.popup_quiz_responses
  for select to authenticated using (public.is_admin());

-- popup_product_events: 본인 insert/select, 관리자 select (수정·삭제 불가)
create policy "popup_events_insert_own" on public.popup_product_events
  for insert to authenticated with check (user_id = auth.uid());
create policy "popup_events_select_own" on public.popup_product_events
  for select to authenticated using (user_id = auth.uid());
create policy "popup_events_select_admin" on public.popup_product_events
  for select to authenticated using (public.is_admin());

-- popup_wishlist: 본인 insert/select/delete, 관리자 select
create policy "popup_wishlist_insert_own" on public.popup_wishlist
  for insert to authenticated with check (user_id = auth.uid());
create policy "popup_wishlist_select_own" on public.popup_wishlist
  for select to authenticated using (user_id = auth.uid());
create policy "popup_wishlist_delete_own" on public.popup_wishlist
  for delete to authenticated using (user_id = auth.uid());
create policy "popup_wishlist_select_admin" on public.popup_wishlist
  for select to authenticated using (public.is_admin());

-- popup_visit_slots: 본인 insert/select/update, 관리자 select
create policy "popup_slots_insert_own" on public.popup_visit_slots
  for insert to authenticated with check (user_id = auth.uid());
create policy "popup_slots_select_own" on public.popup_visit_slots
  for select to authenticated using (user_id = auth.uid());
create policy "popup_slots_update_own" on public.popup_visit_slots
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "popup_slots_select_admin" on public.popup_visit_slots
  for select to authenticated using (public.is_admin());

-- popup_purchase_surveys: 본인 insert/select/update, 관리자 select
create policy "popup_surveys_insert_own" on public.popup_purchase_surveys
  for insert to authenticated with check (user_id = auth.uid());
create policy "popup_surveys_select_own" on public.popup_purchase_surveys
  for select to authenticated using (user_id = auth.uid());
create policy "popup_surveys_update_own" on public.popup_purchase_surveys
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "popup_surveys_select_admin" on public.popup_purchase_surveys
  for select to authenticated using (public.is_admin());
