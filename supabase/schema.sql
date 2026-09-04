create extension if not exists pgcrypto;

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  category text,
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image_url text not null,
  category text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.articles enable row level security;
alter table public.artworks enable row level security;

create policy "admins can read own admin row" on public.admins for select
using (auth.uid() = user_id);

create policy "public can read published articles" on public.articles for select
using (status = 'published' or exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admins can insert articles" on public.articles for insert
with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admins can update articles" on public.articles for update
using (exists (select 1 from public.admins where user_id = auth.uid()))
with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admins can delete articles" on public.articles for delete
using (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "public can read artwork" on public.artworks for select using (true);

create policy "admins can insert artwork" on public.artworks for insert
with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admins can update artwork" on public.artworks for update
using (exists (select 1 from public.admins where user_id = auth.uid()))
with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admins can delete artwork" on public.artworks for delete
using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', true)
on conflict (id) do nothing;

create policy "public can view artwork files"
on storage.objects for select
using (bucket_id = 'artwork');

create policy "admins can upload artwork files"
on storage.objects for insert
with check (
  bucket_id = 'artwork'
  and exists (select 1 from public.admins where user_id = auth.uid())
);

create policy "admins can update artwork files"
on storage.objects for update
using (
  bucket_id = 'artwork'
  and exists (select 1 from public.admins where user_id = auth.uid())
);

create policy "admins can delete artwork files"
on storage.objects for delete
using (
  bucket_id = 'artwork'
  and exists (select 1 from public.admins where user_id = auth.uid())
);

-- Optional realtime:
alter publication supabase_realtime add table public.articles;
alter publication supabase_realtime add table public.artworks;
