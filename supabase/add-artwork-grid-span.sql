-- Run ONCE in Supabase SQL Editor BEFORE using the new "Size on the Artwork page" option.
-- grid_span = how many columns of the /art grid an artwork crosses (1 = normal ... 4 = full width).
alter table public.artworks
  add column if not exists grid_span smallint not null default 1;

alter table public.artworks
  drop constraint if exists artworks_grid_span_check;
alter table public.artworks
  add constraint artworks_grid_span_check check (grid_span between 1 and 4);
