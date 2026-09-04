import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import ArticleEditForm from "@/components/admin/ArticleEditForm";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminUser()) redirect("/login");
  const { id } = await params;
  const supabase=await createClient();
  const {data:article}=await supabase.from("articles").select("*").eq("id",id).single();
  if(!article) notFound();
  return <main className="max-w-5xl mx-auto px-6 py-10"><h1 className="text-3xl font-black mb-6">Edit Article</h1><ArticleEditForm article={article}/></main>;
}