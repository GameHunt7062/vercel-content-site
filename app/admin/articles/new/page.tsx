import ArticleCreateForm from "@/components/admin/ArticleCreateForm";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";

export default async function NewArticle() {
  if (!await getAdminUser()) redirect("/login");
  return <main className="max-w-5xl mx-auto px-6 py-10"><h1 className="text-3xl font-black mb-6">New Article</h1><ArticleCreateForm /></main>;
}