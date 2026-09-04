import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import ArtworkEditForm from "@/components/admin/ArtworkEditForm";

export default async function EditArtwork({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminUser()) redirect("/login");
  const { id } = await params;
  const supabase=await createClient();
  const {data:artwork}=await supabase.from("artworks").select("*").eq("id",id).single();
  if(!artwork) notFound();
  return <main className="max-w-4xl mx-auto px-6 py-10"><h1 className="text-3xl font-black mb-6">Edit Artwork</h1><ArtworkEditForm artwork={artwork}/></main>;
}