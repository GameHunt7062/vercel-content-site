import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditButton from "@/components/admin/EditButton";
import ShareButton from "@/components/ShareButton";
import ArticleViewer from "@/components/articles/ArticleViewer";
import PublishedDate from "@/components/PublishedDate";

const SITE_URL = "https://rawme.vercel.app";

// one DB query shared by generateMetadata + the page
const getArticle = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return <main className="max-w-4xl mx-auto px-6 py-12">
    <div className="flex justify-between gap-5 items-start mb-8">
      <div><p className="text-sm text-zinc-500 dark:text-zinc-400">{article.category}</p><h1 className="text-5xl font-black mt-2">{article.title}</h1><PublishedDate date={article.published_at ?? article.created_at} className="mt-3" /><p className="text-zinc-500 dark:text-zinc-400 mt-3">{article.excerpt}</p></div>
      <div className="flex gap-2 shrink-0">
        <ShareButton title={article.title} />
        <EditButton href={`/admin/articles/${article.id}`} label="Edit Article" />
      </div>
    </div>
    {article.cover_image && <img src={article.cover_image} alt="" className="w-full rounded-2xl mb-10" />}
    <ArticleViewer content={article.content} />
  </main>;
}
