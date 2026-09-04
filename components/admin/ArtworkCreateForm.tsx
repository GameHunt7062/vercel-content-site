"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(v:string){return v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");}

export default function ArtworkCreateForm(){
  const [title,setTitle]=useState(""); const [description,setDescription]=useState(""); const [category,setCategory]=useState(""); const [file,setFile]=useState<File|null>(null); const [busy,setBusy]=useState(false); const router=useRouter();

  async function upload(){
    if(!file || !title){alert("Title and image are required.");return;}
    setBusy(true);
    const supabase=createClient();
    const path=`${crypto.randomUUID()}-${file.name}`;
    const {error:uploadError}=await supabase.storage.from("artwork").upload(path,file);
    if(uploadError){alert(uploadError.message);setBusy(false);return;}
    const {data}=supabase.storage.from("artwork").getPublicUrl(path);
    const slug=slugify(title);
    const {error}=await supabase.from("artworks").insert({title,slug,description,category,image_url:data.publicUrl});
    if(error){alert(error.message);setBusy(false);return;}
    router.push(`/art/${slug}`); router.refresh();
  }

  return <div className="space-y-4">
    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Artwork title" className="w-full border rounded-lg p-3"/>
    <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="w-full border rounded-lg p-3"/>
    <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full border rounded-lg p-3"/>
    <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]??null)} />
    <button disabled={busy} onClick={upload} className="bg-black text-white rounded-lg px-5 py-3">{busy?"Uploading...":"Upload & Publish"}</button>
  </div>;
}