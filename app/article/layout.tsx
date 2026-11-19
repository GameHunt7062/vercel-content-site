import "@/components/articles/docs.css";
import { getArticleList } from "@/lib/articleDocs";
import ArticleSidebar from "@/components/articles/ArticleSidebar";
import ArticleDots from "@/components/articles/ArticleDots";
import SiteFooter from "@/components/home/SiteFooter";

export default async function ArticleLayout({ children }: { children: React.ReactNode }) {
  const list = await getArticleList();
  return (
    <>
      <ArticleDots />
      <div className="docs">
        <ArticleSidebar articles={list} />
        <div className="docs-main">{children}</div>
      </div>
      <SiteFooter />
    </>
  );
}
