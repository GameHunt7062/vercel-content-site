"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EditButton from "@/components/admin/EditButton";
import PublishedDate from "@/components/PublishedDate";
import ArticleViewer from "@/components/articles/ArticleViewer";
import type { ArticleItem } from "@/components/articles/ArticlesTv";

export default function ArticleDetail({ a }: { a: ArticleItem }) {
  const [content, setContent] = useState<unknown>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [msg, setMsg] = useState("");

  // the list only carries the card info; the full text is fetched when you open it
  useEffect(() => {
    let alive = true;
    createClient()
      .from("articles")
      .select("content")
      .eq("id", a.id)
      .maybeSingle()
      .then(({ data, error }: { data: { content: unknown } | null; error: unknown }) => {
        if (!alive) return;
        if (error || !data) setState("error");
        else { setContent(data.content); setState("ready"); }
      });
    return () => { alive = false; };
  }, [a.id]);

  const share = async () => {
    const url = `${window.location.origin}/article/${a.slug}`;
    try {
      if (navigator.share) { await navigator.share({ title: a.title, url }); return; }
    } catch { /* cancelled */ }
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copied");
      setTimeout(() => setMsg(""), 1800);
    } catch { /* ignore */ }
  };

  return (
    <div>
      {a.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover_image} alt="" className="mb-5 w-full rounded-xl object-cover" style={{ maxHeight: 260 }} />
      )}
      {a.category && <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{a.category}</p>}
      <h2 className="mt-1 text-3xl font-extrabold leading-tight">{a.title}</h2>
      <PublishedDate date={a.published_at ?? a.created_at} className="mt-2" />
      {a.excerpt && <p className="mt-3 text-zinc-500">{a.excerpt}</p>}

      <div className="tv-actions">
        <button type="button" className="tv-btn" onClick={share}>{msg || "Share"}</button>
        <Link href={`/article/${a.slug}`} className="tv-btn">Open page ↗</Link>
        <EditButton href={`/admin/articles/${a.id}`} label="Edit Article" />
      </div>

      {state === "loading" && <p className="mt-8 text-sm text-zinc-500">Loading…</p>}
      {state === "error" && <p className="mt-8 text-sm text-zinc-500">Couldn&apos;t load this article. Try “Open page”.</p>}
      {state === "ready" && Boolean(content) && <ArticleViewer content={content} className="mt-8" />}
    </div>
  );
}
