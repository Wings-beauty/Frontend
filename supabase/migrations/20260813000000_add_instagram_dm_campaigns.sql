-- Instagram comment keyword campaigns and webhook delivery idempotency records.
create extension if not exists pgcrypto;

create table if not exists public.instagram_dm_campaigns (
  id uuid primary key default gen_random_uuid(),
  media_id text not null,
  keyword text not null,
  dm_message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (media_id, keyword)
);

create table if not exists public.instagram_dm_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.instagram_dm_campaigns(id) on delete set null,
  comment_id text not null unique,
  media_id text,
  instagram_user_id text,
  comment_text text,
  status text not null check (status in ('processing', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists instagram_dm_campaigns_active_media_id_idx
  on public.instagram_dm_campaigns (media_id)
  where active = true;

create index if not exists instagram_dm_logs_campaign_id_idx
  on public.instagram_dm_logs (campaign_id);

-- Keep timestamps correct for dashboard edits as well as webhook updates.
create or replace function public.set_instagram_dm_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_instagram_dm_campaigns_updated_at on public.instagram_dm_campaigns;
create trigger set_instagram_dm_campaigns_updated_at
before update on public.instagram_dm_campaigns
for each row execute function public.set_instagram_dm_updated_at();

drop trigger if exists set_instagram_dm_logs_updated_at on public.instagram_dm_logs;
create trigger set_instagram_dm_logs_updated_at
before update on public.instagram_dm_logs
for each row execute function public.set_instagram_dm_updated_at();

-- These operational tables are accessed only by the server webhook using the
-- Supabase service-role key. Dashboard users can manage campaigns directly.
alter table public.instagram_dm_campaigns enable row level security;
alter table public.instagram_dm_logs enable row level security;
