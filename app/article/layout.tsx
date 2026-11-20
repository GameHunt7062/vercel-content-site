import "@/components/articles/docs.css";
import "@/components/articles/article-type.css";
import { getArticleList } from "@/lib/articleDocs";
import ArticleSidebar from "@/components/articles/ArticleSidebar";
import ArticleDots from "@/components/articles/ArticleDots";
import SiteFooter from "@/components/home/SiteFooter";

export default async function ArticleLayout({ children }: { children: React.ReactNode }) {
  const list = await getArticleList();
  return (
    <>
      {/* the two pink balls and the navbar stay full size; the article area is 8% smaller (see article-type.css) */}
      <ArticleDots />
      <div className="article-zoom">
        <div className="docs">
          <ArticleSidebar articles={list} />
          <div className="docs-main">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
