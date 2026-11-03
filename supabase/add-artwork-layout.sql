-- Run ONCE in Supabase SQL Editor BEFORE using the live "Arrange layout" mode on /art.
--  sort_order  = manual position in the gallery (empty = newest first, by published date)
--  grid_col    = pinned start column on desktop, 0-3 (empty = placed automatically)
--  image_ratio = width / height of the cover image (filled in automatically when you open /art as admin;
--                it lets the page reserve the right space so nothing jumps while images load)
alter table public.artworks add column if not exists sort_order integer;
alter table public.artworks add column if not exists grid_col smallint;
alter table public.artworks add column if not exists image_ratio real;

alter table public.artworks drop constraint if exists artworks_grid_col_check;
alter table public.artworks add constraint artworks_grid_col_check check (grid_col is null or grid_col between 0 and 3);

alter table public.artworks drop constraint if exists artworks_image_ratio_check;
alter table public.artworks add constraint artworks_image_ratio_check check (image_ratio is null or image_ratio > 0);
