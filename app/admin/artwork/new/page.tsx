import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import ArtworkCreateForm from "@/components/admin/ArtworkCreateForm";

export default async function NewArtwork(){
  if(!await getAdminUser()) redirect("/login");
  return <main className="max-w-4xl mx-auto px-6 py-10"><h1 className="text-3xl font-black mb-6">Upload Artwork</h1><ArtworkCreateForm/></main>;
}