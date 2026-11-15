-- Home page "profile cards" (under the hero). One row (id = 1) holding a json document.
-- Run this once in Supabase -> SQL Editor.

create table if not exists public.home_profile (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.home_profile enable row level security;

drop policy if exists "public can read home profile" on public.home_profile;
create policy "public can read home profile" on public.home_profile for select using (true);

drop policy if exists "admins can insert home profile" on public.home_profile;
create policy "admins can insert home profile" on public.home_profile for insert
with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "admins can update home profile" on public.home_profile;
create policy "admins can update home profile" on public.home_profile for update
using (exists (select 1 from public.admins where user_id = auth.uid()))
with check (exists (select 1 from public.admins where user_id = auth.uid()));
