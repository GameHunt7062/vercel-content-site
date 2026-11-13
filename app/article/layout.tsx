import "@/components/articles/docs.css";
import { getArticleList } from "@/lib/articleDocs";
import ArticleSidebar from "@/components/articles/ArticleSidebar";
import ArticleDots from "@/components/articles/ArticleDots";

export default async function ArticleLayout({ children }: { children: React.ReactNode }) {
  const list = await getArticleList();
  return (
    <div className="art-dots-root">
      <ArticleDots />
      <div className="docs">
        <ArticleSidebar articles={list} />
        <div className="docs-main">{children}</div>
      </div>
    </div>
  );
}
