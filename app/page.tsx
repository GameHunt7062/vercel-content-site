import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";
import { EditLink } from "@/components/admin/EditButton";

export default async function Home() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles").select("id,title,slug,excerpt,category,published_at")
    .eq("status", "published").order("published_at", { ascending: false }).limit(6);

  const { data: artworks } = await supabase
    .from("artworks").select("id,title,slug,image_url,category,images")
    .order("created_at", { ascending: false }).limit(6);

  return (
    <>
      <Hero />
      <main className="max-w-6xl mx-auto px-6 py-16">

      <section>
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Latest Articles</h2><Link href="/articles">View all →</Link></div>
        <div className="grid md:grid-cols-3 gap-6">
          {(articles ?? []).map((a) => <div key={a.slug} className="relative">
            <Link href={`/article/${a.slug}`} className="block border rounded-xl p-5 bg-white dark:bg-zinc-900 hover:shadow">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.category}</p><h3 className="font-bold text-xl mt-2">{a.title}</h3><p className="text-zinc-600 dark:text-zinc-400 mt-2">{a.excerpt}</p>
            </Link>
            <EditLink href={`/admin/articles/${a.id}`} />
          </div>)}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Artwork</h2><Link href="/art">View all →</Link></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {(artworks ?? []).map((a) => <div key={a.slug} className="relative">
            <Link href={`/art/${a.slug}`}><img src={a.image_url} alt={a.title} className="aspect-square object-cover rounded-xl"/><h3 className="font-semibold mt-2">{a.title}</h3></Link>
            <EditLink href={`/admin/artwork/${a.id}`} />
          </div>)}
        </div>
      </section>
      </main>
    </>
  );
}
