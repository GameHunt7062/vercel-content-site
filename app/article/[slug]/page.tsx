import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import EditButton from "@/components/admin/EditButton";
import ArticleViewer from "@/components/articles/ArticleViewer";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("*").eq("slug", slug).single();
  if (!article) notFound();

  const admin = await getAdminUser();

  return <main className="max-w-4xl mx-auto px-6 py-12">
    <div className="flex justify-between gap-5 items-start mb-8">
      <div><p className="text-sm text-zinc-500">{article.category}</p><h1 className="text-5xl font-black mt-2">{article.title}</h1><p className="text-zinc-500 mt-3">{article.excerpt}</p></div>
      {admin && <EditButton href={`/admin/articles/${article.id}`} label="Edit Article" />}
    </div>
    {article.cover_image && <img src={article.cover_image} alt="" className="w-full rounded-2xl mb-10" />}
    <ArticleViewer content={article.content} />
  </main>;
}