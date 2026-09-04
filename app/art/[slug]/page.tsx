import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import EditButton from "@/components/admin/EditButton";

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: artwork } = await supabase.from("artworks").select("*").eq("slug", slug).single();
  if (!artwork) notFound();

  const admin = await getAdminUser();

  return <main className="max-w-5xl mx-auto px-6 py-12">
    <div className="flex justify-between items-start gap-5 mb-8">
      <div><p className="text-sm text-zinc-500">{artwork.category}</p><h1 className="text-4xl font-black mt-2">{artwork.title}</h1><p className="mt-3 text-zinc-600">{artwork.description}</p></div>
      {admin && <EditButton href={`/admin/artwork/${artwork.id}`} label="Edit Artwork" />}
    </div>
    <img src={artwork.image_url} alt={artwork.title} className="w-full max-h-[75vh] object-contain rounded-2xl bg-zinc-100"/>
  </main>;
}