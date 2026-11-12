"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";
import TvStage, { type StageItem } from "@/components/tv/TvStage";
import TvPanel from "@/components/tv/TvPanel";
import { useMediaQuery } from "@/components/tv/useMediaQuery";
import ArticleDetail from "@/components/articles/ArticleDetail";
import PublishedDate from "@/components/PublishedDate";
import { gridLayout } from "@/lib/tvLayout";

export type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
};

const CARD_W = 330;
const CARD_H = 300;
const GAP = 18;
const PANEL_W = 600;

const ArticleCard = memo(function ArticleCard({
  a, selected, onSelect,
}: {
  a: ArticleItem; selected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`tv-article${selected ? " is-sel" : ""}`}
      onClick={() => onSelect(a.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(a.id); } }}
      aria-label={a.title}
    >
      <div className="tv-article-band" style={a.cover_image ? { backgroundImage: `url("${a.cover_image}")` } : undefined} />
      <div className="tv-article-body">
        <div className="tv-article-meta">
          {a.status === "draft" && <b>Draft</b>}
          {a.category}
        </div>
        <div className="tv-article-title">{a.title}</div>
        <PublishedDate date={a.published_at ?? a.created_at} prefix="" className="text-xs text-zinc-500" />
        {a.excerpt && <div className="tv-article-excerpt">{a.excerpt}</div>}
      </div>
    </div>
  );
});

export default function ArticlesTv({ articles }: { articles: ArticleItem[] }) {
  const desktop = useMediaQuery("(min-width: 900px)");
  const [sel, setSel] = useState<string | null>(null);

  const layout = useMemo(() => {
    const n = articles.length;
    const cols = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(n * 1.4))));
    return gridLayout(n, cols, CARD_W, CARD_H, GAP);
  }, [articles]);
  const items = useMemo<StageItem[]>(
    () => layout.boxes.map((b, i) => ({ id: articles[i].id, ...b })),
    [layout, articles],
  );
  const byId = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);
  const article = sel ? byId.get(sel) : undefined;
  const close = useCallback(() => setSel(null), []);

  const renderItem = useCallback(
    (item: StageItem) => {
      const a = byId.get(item.id);
      return a ? <ArticleCard a={a} selected={sel === item.id} onSelect={setSel} /> : null;
    },
    [byId, sel],
  );

  return (
    <TvStage
      label="Articles"
      hint="drag to explore"
      items={items}
      bounds={layout.bounds}
      renderItem={renderItem}
      emptyText="NO ARTICLES YET"
      insetLeft={article && desktop ? PANEL_W : 0}
      focusId={sel}
      curve={0.28}
    >
      {article && (
        <TvPanel width={desktop ? PANEL_W : null} onClose={close} label={article.title}>
          <ArticleDetail key={article.id} a={article} />
        </TvPanel>
      )}
      <nav className="tv-sr" aria-label="All articles">
        <ul>
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/article/${a.slug}`} tabIndex={-1}>{a.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </TvStage>
  );
}
