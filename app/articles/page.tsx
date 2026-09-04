import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Articles() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("status","published").order("published_at",{ascending:false});

  return <main className="max-w-5xl mx-auto px-6 py-12">
    <h1 className="text-4xl font-black mb-8">Articles</h1>
    <div className="grid md:grid-cols-2 gap-5">
      {(data ?? []).map(a => <Link key={a.id} href={`/article/${a.slug}`} className="bg-white border rounded-xl p-6 hover:shadow">
        <p className="text-sm text-zinc-500">{a.category}</p><h2 className="text-2xl font-bold mt-2">{a.title}</h2><p className="mt-2 text-zinc-600">{a.excerpt}</p>
      </Link>)}
    </div>
  </main>;
}