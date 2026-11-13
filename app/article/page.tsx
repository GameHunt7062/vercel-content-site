import type { Metadata } from "next";
import { articleMetadata, getArticleBySlug, getArticleList } from "@/lib/articleDocs";
import ArticleView from "@/components/articles/ArticleView";

// /article = the latest article (same layout as /article/<slug>)
export async function generateMetadata(): Promise<Metadata> {
  const list = await getArticleList();
  const latest = list[0] ? await getArticleBySlug(list[0].slug) : null;
  return latest ? articleMetadata(latest) : {};
}

export default async function LatestArticle() {
  const list = await getArticleList();
  const latest = list[0] ? await getArticleBySlug(list[0].slug) : null;
  return <ArticleView article={latest} list={list} />;
}
