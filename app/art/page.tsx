import { createClient } from "@/lib/supabase/server";
import ArtworkCard from "@/components/artwork/ArtworkCard";

export default async function Art() {
  const supabase = await createClient();
  const { data } = await supabase.from("artworks").select("*").order("created_at",{ascending:false});

  return <main className="max-w-6xl mx-auto px-6 py-12">
    <h1 className="text-4xl font-black mb-8">Artwork</h1>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{(data ?? []).map(a => <ArtworkCard key={a.id} artwork={a}/>)}</div>
  </main>;
}