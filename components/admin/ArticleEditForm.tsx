"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { removeFromStorage } from "@/lib/artwork";
import ArticleEditor from "@/components/editor/ArticleEditor";
import DateTimeField from "@/components/admin/DateTimeField";
import CoverImageField from "@/components/admin/CoverImageField";
import DeleteButton from "@/components/admin/DeleteButton";

const input = "w-full border rounded-lg p-3 bg-transparent";

export default function ArticleEditForm({ article }: { article: any }) {
  const [title, setTitle] = useState<string>(article.title);
  const [category, setCategory] = useState<string>(article.category ?? "");
  const [excerpt, setExcerpt] = useState<string>(article.excerpt ?? "");
  const [status, setStatus] = useState<"draft" | "published">(article.status ?? "published");
  const [publishedAt, setPublishedAt] = useState<string>(article.published_at ?? "");
  const [cover, setCover] = useState<string>(article.cover_image ?? "");
  const router = useRouter();

  async function save(content: any) {
    if (!title.trim()) { alert("Please enter a title."); return; }
    const supabase = createClient();
    const published_at = publishedAt || (status === "published" ? new Date().toISOString() : null);
    const { error } = await supabase
      .from("articles")
      .update({
        title: title.trim(), category: category.trim() || null, excerpt: excerpt.trim() || null,
        content, status, published_at, cover_image: cover || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);
    if (error) { alert(error.message); return; }
    if (article.cover_image && article.cover_image !== cover) await removeFromStorage([article.cover_image]); // old cover no longer used
    router.push(`/article/${article.slug}`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={`${input} text-xl`} />
      <div className="grid md:grid-cols-2 gap-3">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={input} />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={`${input} dark:bg-zinc-900`}>
          <option value="published">Published</option>
          <option value="draft">Draft (hidden from visitors)</option>
        </select>
      </div>
      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt" className={input} />
      <DateTimeField value={publishedAt} onChange={setPublishedAt} />
      <CoverImageField value={cover} onChange={setCover} />
      <div className="pt-3">
        <ArticleEditor initialContent={article.content} onSave={save} />
      </div>
      <div className="pt-6 mt-8 border-t">
        <DeleteButton table="articles" id={article.id} name={article.title} kind="article" redirectTo="/articles" storageUrls={article.cover_image ? [article.cover_image] : []} />
      </div>
    </div>
  );
}
