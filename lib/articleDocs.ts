import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";

export const SITE_URL = "https://rawme.vercel.app";

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  cover_image: string | null;
  content: unknown;
  published_at: string | null;
  created_at: string;
};

/** Sidebar list: newest first. Admin also sees drafts (RLS only gives drafts to the admin anyway). */
export const getArticleList = cache(async () => {
  const supabase = await createClient();
  const admin = await getAdminUser();
  let query = supabase
    .from("articles")
    .select("id,slug,title,excerpt,category,status,published_at,created_at");
  query = admin
    ? query.order("created_at", { ascending: false })
    : query.eq("status", "published").order("published_at", { ascending: false });
  const { data } = await query;
  return (data ?? []) as Omit<ArticleRow, "cover_image" | "content">[];
});

// one DB query shared by generateMetadata + the page
export const getArticleBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
  return (data ?? null) as ArticleRow | null;
});

export function articleMetadata(article: ArticleRow): Metadata {
  const image: string = article.cover_image || `${SITE_URL}/og-image.jpg`;
  const url = `${SITE_URL}/article/${article.slug}`;
  const description: string = article.excerpt?.trim() || "Article on RAWME";
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "en_US",
      url,
      siteName: "RAWME",
      title: article.title,
      description,
      images: [{ url: image, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [image],
    },
  };
}
