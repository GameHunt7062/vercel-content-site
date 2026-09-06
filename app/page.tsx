import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles").select("title,slug,excerpt,category,published_at")
    .eq("status", "published").order("published_at", { ascending: false }).limit(6);

  const { data: artworks } = await supabase
    .from("artworks").select("title,slug,image_url,category")
    .order("created_at", { ascending: false }).limit(6);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="mb-16">
        <p className="text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Welcome</p>
        <h1 className="text-5xl md:text-7xl font-black mt-3">Ideas, Articles & Art.</h1>
        <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">A personal space for writing, experiments and artwork.</p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Latest Articles</h2><Link href="/articles">View all →</Link></div>
        <div className="grid md:grid-cols-3 gap-6">
          {(articles ?? []).map((a) => <Link key={a.slug} href={`/article/${a.slug}`} className="border rounded-xl p-5 bg-white dark:bg-zinc-900 hover:shadow">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.category}</p><h3 className="font-bold text-xl mt-2">{a.title}</h3><p className="text-zinc-600 dark:text-zinc-400 mt-2">{a.excerpt}</p>
          </Link>)}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Artwork</h2><Link href="/art">View all →</Link></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {(artworks ?? []).map((a) => <Link key={a.slug} href={`/art/${a.slug}`}><img src={a.image_url} alt={a.title} className="aspect-square object-cover rounded-xl"/><h3 className="font-semibold mt-2">{a.title}</h3></Link>)}
        </div>
      </section>
    </main>
  );
}
