"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/editor/ArticleEditor";
import { createClient } from "@/lib/supabase/client";

function slugify(v:string){return v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");}

export default function ArticleCreateForm(){
  const [title,setTitle]=useState(""); const [category,setCategory]=useState(""); const [excerpt,setExcerpt]=useState(""); const [status,setStatus]=useState<"draft"|"published">("published");
  const router=useRouter();

  async function save(content:any){
    const supabase=createClient();
    const slug=slugify(title);
    const {error}=await supabase.from("articles").insert({title,slug,category,excerpt,content,status,published_at:status==="published"?new Date().toISOString():null});
    if(error){alert(error.message);return;} router.push(`/article/${slug}`); router.refresh();
  }

  return <div>
    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Article title" className="w-full border rounded-lg p-3 mb-3 text-xl"/>
    <div className="grid md:grid-cols-2 gap-3 mb-3">
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="border rounded-lg p-3"/>
      <select value={status} onChange={e=>setStatus(e.target.value as any)} className="border rounded-lg p-3"><option value="published">Published</option><option value="draft">Draft</option></select>
    </div>
    <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} placeholder="Short excerpt" className="w-full border rounded-lg p-3 mb-5"/>
    <ArticleEditor onSave={save}/>
  </div>;
}