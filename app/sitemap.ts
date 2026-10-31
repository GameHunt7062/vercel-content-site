import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://rawme.vercel.app";

// Sitemap har 1 ghante me regenerate hoga (ISR) — naya article/art redeploy ke bina aa jaayega
export const revalidate = 3600;

type Row = { slug: string; updated_at: string | null; published_at: string | null };

const toDate = (r: Row) => new Date(r.updated_at ?? r.published_at ?? Date.now());
const latest = (dates: Date[]) =>
  dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : undefined;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cookies-free client: sitemap static/cacheable rehta hai, aur RLS ki wajah se sirf public data milta hai
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const [articlesRes, artworksRes] = await Promise.all([
    supabase.from("articles").select("slug, updated_at, published_at").eq("status", "published"),
    supabase.from("artworks").select("slug, updated_at, published_at"),
  ]);

  // Supabase error aaye to bhi sitemap bane (static pages ke saath), build fail nahi hoga
  const articles = (articlesRes.data ?? []) as Row[];
  const artworks = (artworksRes.data ?? []) as Row[];

  const articleDates = articles.map(toDate);
  const artworkDates = artworks.map(toDate);

  return [
    {
      url: SITE_URL,
      lastModified: latest([...articleDates, ...artworkDates]),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: latest(articleDates),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/art`,
      lastModified: latest(artworkDates),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articles.map((a, i) => ({
      url: `${SITE_URL}/article/${encodeURIComponent(a.slug)}`,
      lastModified: articleDates[i],
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...artworks.map((a, i) => ({
      url: `${SITE_URL}/art/${encodeURIComponent(a.slug)}`,
      lastModified: artworkDates[i],
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
