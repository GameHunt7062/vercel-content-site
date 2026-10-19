-- Run ONCE in Supabase SQL Editor BEFORE deploying the rich-description / published-date update.

-- 1) Artwork: rich (formatted) description + editable published date
alter table public.artworks add column if not exists description_json jsonb;
alter table public.artworks add column if not exists published_at timestamptz;

update public.artworks set published_at = created_at where published_at is null;

alter table public.artworks alter column published_at set default now();
alter table public.artworks alter column published_at set not null;

-- 2) Articles: published articles that somehow have no date get their created date
update public.articles set published_at = created_at where status = 'published' and published_at is null;
