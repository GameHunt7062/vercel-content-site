import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleMetadata, getArticleBySlug, getArticleList } from "@/lib/articleDocs";
import ArticleView from "@/components/articles/ArticleView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return article ? articleMetadata(article) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, list] = await Promise.all([getArticleBySlug(slug), getArticleList()]);
  if (!article) notFound();
  return <ArticleView article={article} list={list} />;
}
