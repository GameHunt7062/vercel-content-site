"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ArticleEditor from "@/components/editor/ArticleEditor";
import { useState } from "react";

export default function ArticleEditForm({article}: {article:any}){
  const [title,setTitle]=useState(article.title); const [category,setCategory]=useState(article.category??""); const [excerpt,setExcerpt]=useState(article.excerpt??""); const router=useRouter();

  async function save(content:any){
    const supabase=createClient();
    const {error}=await supabase.from("articles").update({title,category,excerpt,content,updated_at:new Date().toISOString()}).eq("id",article.id);
    if(error){alert(error.message);return;}
    router.push(`/article/${article.slug}`); router.refresh();
  }

  return <div>
    <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-lg p-3 mb-3 text-xl"/>
    <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded-lg p-3 mb-3"/>
    <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full border rounded-lg p-3 mb-5"/>
    <ArticleEditor initialContent={article.content} onSave={save}/>
  </div>;
}