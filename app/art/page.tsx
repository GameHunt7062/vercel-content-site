import { createClient } from "@/lib/supabase/server";
import ArtworkGrid from "@/components/artwork/ArtworkGrid";

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

  return <main className="max-w-6xl mx-auto px-6 py-12">
    <h1 className="text-4xl font-black mb-8 text-rawme-blue">Artwork<span className="text-rawme-pink">.</span></h1>
    <ArtworkGrid artworks={data ?? []} />
  </main>;
}
