-- Run ONCE in Supabase SQL Editor (existing projects) BEFORE deploying the bulk-upload/slides update.
alter table public.artworks
  add column if not exists images text[] not null default '{}';

-- Existing artworks: their single image becomes slide #1
update public.artworks
set images = array[image_url]
where coalesce(array_length(images, 1), 0) = 0;
