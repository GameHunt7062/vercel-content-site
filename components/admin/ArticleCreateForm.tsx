"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/editor/ArticleEditor";
import DateTimeField from "@/components/admin/DateTimeField";
import CoverImageField from "@/components/admin/CoverImageField";
import { createClient } from "@/lib/supabase/client";

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const input = "w-full border rounded-lg p-3 bg-transparent";

export default function ArticleCreateForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [publishedAt, setPublishedAt] = useState(""); // "" = now
  const [cover, setCover] = useState("");
  const router = useRouter();

  async function save(content: any) {
    if (!title.trim()) { alert("Please enter a title."); return; }
    const supabase = createClient();
    const base = slugify(title) || "article"; // e.g. titles written only in Hindi have no latin letters
    const published_at = publishedAt || (status === "published" ? new Date().toISOString() : null);

    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${crypto.randomUUID().slice(0, 6)}`;
      const { error } = await supabase.from("articles").insert({
        title: title.trim(), slug, category: category.trim() || null, excerpt: excerpt.trim() || null,
        content, status, published_at, cover_image: cover || null,
      });
      if (!error) { router.push(`/article/${slug}`); router.refresh(); return; }
      if (error.code !== "23505") { alert(error.message); return; } // 23505 = slug already used -> retry with a suffix
    }
    alert("Could not generate a unique link for this article.");
  }

  return (
    <div className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" className={`${input} text-xl`} />
      <div className="grid md:grid-cols-2 gap-3">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={input} />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={`${input} dark:bg-zinc-900`}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt" className={input} />
      <DateTimeField value={publishedAt} onChange={setPublishedAt} />
      <CoverImageField value={cover} onChange={setCover} />
      <div className="pt-3">
        <ArticleEditor onSave={save} />
      </div>
    </div>
  );
}
