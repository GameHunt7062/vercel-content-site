import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditButton from "@/components/admin/EditButton";
import ShareButton from "@/components/ShareButton";
import ArtworkSlider from "@/components/artwork/ArtworkSlider";
import ArticleViewer from "@/components/articles/ArticleViewer";
import PublishedDate from "@/components/PublishedDate";

const SITE_URL = "https://rawme.vercel.app";

// one DB query shared by generateMetadata + the page
const getArtwork = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("artworks").select("*").eq("slug", slug).maybeSingle();
  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) return {};

  // The #2 / #3 part of a URL never reaches the server, so link previews always show the cover (first) image.
  const image: string = artwork.images?.[0] ?? artwork.image_url;
  const url = `${SITE_URL}/art/${artwork.slug}`;
  const description: string = artwork.description?.trim() || (artwork.category ? `${artwork.category} — artwork on RAWME` : "Artwork on RAWME");

  return {
    title: artwork.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: "RAWME",
      title: artwork.title,
      description,
      images: [{ url: image, alt: artwork.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: artwork.title,
      description,
      images: [image],
    },
  };
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) notFound();

  return <main className="max-w-5xl mx-auto px-6 py-12">
    <div className="flex justify-between items-start gap-5 mb-8">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{artwork.category}</p>
        <h1 className="text-4xl font-black mt-2">{artwork.title}</h1>
        <PublishedDate date={artwork.published_at ?? artwork.created_at} className="mt-3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <ShareButton title={artwork.title} />
        <EditButton href={`/admin/artwork/${artwork.id}`} label="Edit Artwork" />
      </div>
    </div>
    <ArtworkSlider images={artwork.images?.length ? artwork.images : [artwork.image_url]} title={artwork.title} />
    {artwork.description_json ? (
      <ArticleViewer content={artwork.description_json} className="mt-10 max-w-3xl" />
    ) : artwork.description ? (
      <p className="mt-10 max-w-3xl whitespace-pre-line text-zinc-600 dark:text-zinc-400">{artwork.description}</p>
    ) : null}
  </main>;
}
