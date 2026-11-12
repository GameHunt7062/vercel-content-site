import { createClient } from "@/lib/supabase/server";
import ArtCanvas, { type ArtItem } from "@/components/artwork/ArtCanvas";

export default async function Art() {
  const supabase = await createClient();

  // 1) manual order first (artworks you have not placed yet, e.g. new uploads, come first), then newest published date
  let { data, error } = await supabase
    .from("artworks").select("*")
    .order("sort_order", { ascending: true, nullsFirst: true })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    // sort_order column not created yet (layout SQL not run) -> newest published date first
    ({ data, error } = await supabase
      .from("artworks").select("*")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false }));
  }
  if (error) {
    // published_at column not created yet either -> oldest setup: newest upload first
    ({ data } = await supabase.from("artworks").select("*").order("created_at", { ascending: false }));
  }

  // only send what the canvas needs
  const artworks: ArtItem[] = (data ?? []).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: a.category ?? null,
    image_url: a.image_url,
    images: a.images ?? null,
    description: a.description ?? null,
    description_json: a.description_json ?? null,
    published_at: a.published_at ?? null,
    created_at: a.created_at,
  }));

  return <ArtCanvas artworks={artworks} />;
}
