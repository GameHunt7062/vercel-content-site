import Link from "next/link";
import { EditLink } from "@/components/admin/EditButton";
import { createClient } from "@/lib/supabase/server";
import PublishedDate from "@/components/PublishedDate";
import { getAdminUser } from "@/lib/admin";

export default async function Articles() {
  const supabase = await createClient();
  const admin = await getAdminUser();

  // Admin ko drafts bhi dikhte hain (RLS bhi sirf admin ko drafts deta hai); baaki sab ko sirf published.
  let query = supabase.from("articles").select("*");
  query = admin
    ? query.order("created_at", { ascending: false })
    : query.eq("status", "published").order("published_at", { ascending: false });
  const { data } = await query;

  return <main className="max-w-5xl mx-auto px-6 py-12">
    <h1 className="text-4xl font-black mb-8 text-rawme-blue">Articles<span className="text-rawme-pink">.</span></h1>
    <div className="stagger grid md:grid-cols-2 gap-5">
      {(data ?? []).map(a => <div key={a.id} className="relative">
        <Link href={`/article/${a.slug}`} className="card block bg-white border rounded-xl p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{a.status === "draft" && <span className="mr-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">DRAFT</span>}{a.category}</p><h2 className="text-2xl font-bold mt-2">{a.title}</h2><PublishedDate date={a.published_at ?? a.created_at} prefix="" className="mt-1" /><p className="mt-2 text-zinc-600 dark:text-zinc-400">{a.excerpt}</p>
        </Link>
        <EditLink href={`/admin/articles/${a.id}`} />
      </div>)}
    </div>
  </main>;
}
