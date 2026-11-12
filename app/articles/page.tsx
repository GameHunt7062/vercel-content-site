import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import ArticlesTv, { type ArticleItem } from "@/components/articles/ArticlesTv";

export default async function Articles() {
  const supabase = await createClient();
  const admin = await getAdminUser();

  // Admin ko drafts bhi dikhte hain (RLS bhi sirf admin ko drafts deta hai); baaki sab ko sirf published.
  let query = supabase
    .from("articles")
    .select("id,slug,title,excerpt,category,status,cover_image,published_at,created_at");
  query = admin
    ? query.order("created_at", { ascending: false })
    : query.eq("status", "published").order("published_at", { ascending: false });
  const { data } = await query;

  return <ArticlesTv articles={(data ?? []) as ArticleItem[]} />;
}
