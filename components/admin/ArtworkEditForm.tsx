"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ArtworkEditForm({artwork}:{artwork:any}){
  const [title,setTitle]=useState(artwork.title); const [description,setDescription]=useState(artwork.description??""); const [category,setCategory]=useState(artwork.category??""); const [file,setFile]=useState<File|null>(null); const [busy,setBusy]=useState(false); const router=useRouter();

  async function save(){
    setBusy(true); const supabase=createClient(); let image_url=artwork.image_url;
    if(file){
      const path=`${crypto.randomUUID()}-${file.name}`;
      const {error}=await supabase.storage.from("artwork").upload(path,file);
      if(error){alert(error.message);setBusy(false);return;}
      image_url=supabase.storage.from("artwork").getPublicUrl(path).data.publicUrl;
    }
    const {error}=await supabase.from("artworks").update({title,description,category,image_url,updated_at:new Date().toISOString()}).eq("id",artwork.id);
    if(error){alert(error.message);setBusy(false);return;}
    router.push(`/art/${artwork.slug}`); router.refresh();
  }

  return <div className="space-y-4">
    <img src={artwork.image_url} alt="" className="w-full max-h-[500px] object-contain rounded-xl bg-zinc-100 dark:bg-zinc-800"/>
    <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-lg p-3"/>
    <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded-lg p-3"/>
    <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded-lg p-3"/>
    <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]??null)}/>
    <button disabled={busy} onClick={save} className="bg-black text-white rounded-lg px-5 py-3">{busy?"Saving...":"Save Changes"}</button>
  </div>;
}
