import Link from "next/link";
import EditButton from "@/components/admin/EditButton";
import ShareButton from "@/components/ShareButton";
import ArticleViewer from "@/components/articles/ArticleViewer";
import PublishedDate from "@/components/PublishedDate";
import type { ArticleRow } from "@/lib/articleDocs";

type ListItem = { id: string; slug: string; title: string };

export default function ArticleView({ article, list }: { article: ArticleRow | null; list: ListItem[] }) {
  if (!article) return <p className="docs-empty">No articles yet.</p>;

  const i = list.findIndex((x) => x.id === article.id);
  const newer = i > 0 ? list[i - 1] : undefined;
  const older = i >= 0 && i < list.length - 1 ? list[i + 1] : undefined;

  return (
    <article className="docs-article">
      {article.category && <p className="docs-cat">{article.category}</p>}
      <h1 className="docs-title">{article.title}</h1>
      {article.excerpt && <p className="docs-sub">{article.excerpt}</p>}
      <div className="docs-meta">
        <PublishedDate date={article.published_at ?? article.created_at} />
        <ShareButton title={article.title} />
        <EditButton href={`/admin/articles/${article.id}`} label="Edit Article" />
      </div>
      {article.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.cover_image} alt="" className="docs-cover" />
      )}
      <div className="docs-prose">
        <ArticleViewer content={article.content} />
      </div>
      {(newer || older) && (
        <nav className="docs-foot" aria-label="More articles">
          {older && (
            <Link href={`/article/${older.slug}`} className="prev">
              <small>← Older</small>
              <span>{older.title}</span>
            </Link>
          )}
          {newer && (
            <Link href={`/article/${newer.slug}`} className="next">
              <small>Newer →</small>
              <span>{newer.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
