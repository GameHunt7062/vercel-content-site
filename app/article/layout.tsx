import "@/components/articles/docs.css";
import { getArticleList } from "@/lib/articleDocs";
import ArticleSidebar from "@/components/articles/ArticleSidebar";

export default async function ArticleLayout({ children }: { children: React.ReactNode }) {
  const list = await getArticleList();
  return (
    <div className="docs">
      <ArticleSidebar articles={list} />
      <div className="docs-main">{children}</div>
    </div>
  );
}
