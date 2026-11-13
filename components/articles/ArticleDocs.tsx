"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TvStage, { type StageItem } from "@/components/tv/TvStage";
import TvPanel from "@/components/tv/TvPanel";
import { useMediaQuery } from "@/components/tv/useMediaQuery";
import EditButton from "@/components/admin/EditButton";
import ShareButton from "@/components/ShareButton";
import PublishedDate from "@/components/PublishedDate";
import ArticleViewer from "@/components/articles/ArticleViewer";

export type SideArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  published_at: string | null;
  created_at: string;
};
export type FullArticle = SideArticle & { cover_image: string | null; content: unknown };

const SIDE_W = 316;
const SIDE_HEAD = 84;
const SIDE_ITEM = 92;
const TOP_PAD = 56;
const BOTTOM_PAD = 120;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Part = { kind: "head" | "blk" | "foot"; top: number; bottom: number; html?: string };

function useWindowSize() {
  const [s, setS] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const read = () =>
      setS((p) => {
        const w = window.innerWidth, h = window.innerHeight;
        return p.w === w && p.h === h ? p : { w, h };
      });
    const on = () => { clearTimeout(t); t = setTimeout(read, 100); };
    read();
    window.addEventListener("resize", on);
    return () => { clearTimeout(t); window.removeEventListener("resize", on); };
  }, []);
  return s;
}

function ArticleHeader({ a }: { a: FullArticle }) {
  return (
    <div>
      {a.category && <p className="tv-doc-cat">{a.category}</p>}
      <h1 className="tv-doc-title">{a.title}</h1>
      {a.excerpt && <p className="tv-doc-sub">{a.excerpt}</p>}
      <div className="tv-doc-meta">
        <PublishedDate date={a.published_at ?? a.created_at} />
        <ShareButton title={a.title} />
        <EditButton href={`/admin/articles/${a.id}`} label="Edit Article" />
      </div>
      {a.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover_image} alt="" className="tv-doc-cover" />
      )}
    </div>
  );
}

function ArticleFooter({ newer, older }: { newer?: SideArticle; older?: SideArticle }) {
  if (!newer && !older) return <div style={{ height: 1 }} />;
  return (
    <nav className="tv-doc-foot" aria-label="More articles">
      {older ? (
        <Link href={`/article/${older.slug}`} className="prev">
          <small>← Older</small>
          <span>{older.title}</span>
        </Link>
      ) : <i />}
      {newer ? (
        <Link href={`/article/${newer.slug}`} className="next">
          <small>Newer →</small>
          <span>{newer.title}</span>
        </Link>
      ) : <i />}
    </nav>
  );
}

function SideLink({ a, active, onClick }: { a: SideArticle; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={`/article/${a.slug}`}
      className={`tv-side-item${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <span className="t">{a.status === "draft" && <b>Draft </b>}{a.title}</span>
      {a.excerpt && <span className="s">{a.excerpt}</span>}
    </Link>
  );
}

export default function ArticleDocs({
  articles, article,
}: {
  articles: SideArticle[];
  article: FullArticle | null;
}) {
  const desktop = useMediaQuery("(min-width: 900px)");
  const size = useWindowSize();
  const [parts, setParts] = useState<Part[]>([]);
  const [menu, setMenu] = useState(false);

  const idx = article ? articles.findIndex((x) => x.id === article.id) : -1;
  const newer = idx > 0 ? articles[idx - 1] : undefined;
  const older = idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : undefined;

  // ---- sizes ---------------------------------------------------------------------------
  const sideW = desktop && articles.length > 0 ? SIDE_W : 0;
  const free = size.w - sideW;
  const paperW = desktop ? clamp(free - 48, 320, 820) : Math.max(280, size.w);
  const padX = size.w < 600 ? 20 : 44;
  const colW = Math.max(220, paperW - 2 * padX);
  const paperL = sideW + (free - paperW) / 2;

  // ---- measure: the article is rendered once, hidden, so we know how tall every block is ----
  const mRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const sig = useRef("");

  useEffect(() => {
    const c = mRef.current;
    if (!c || !article) { setParts([]); return; }
    let raf = 0;
    sig.current = "";
    const measure = () => {
      const head = headRef.current, body = bodyRef.current, foot = footRef.current;
      if (!head || !body || !foot) return;
      const base = c.getBoundingClientRect().top;
      const rel = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { top: r.top - base, bottom: r.bottom - base };
      };
      const out: Part[] = [{ kind: "head", ...rel(head) }];

      // find the element whose children are the article's top-level blocks (paragraphs, headings, ...)
      let p: HTMLElement = body;
      while (p.children.length === 1 && p.firstElementChild instanceof HTMLElement && p.firstElementChild.children.length > 0) {
        p = p.firstElementChild;
      }
      for (const el of Array.from(p.children)) {
        if (!(el instanceof HTMLElement)) continue;
        const r = rel(el);
        if (r.bottom - r.top < 0.5) continue;
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.margin = "0"; // spacing is already encoded in the positions
        let node: HTMLElement = clone;
        for (let a = el.parentElement; a && a !== body; a = a.parentElement) {
          const w = a.cloneNode(false) as HTMLElement;
          w.appendChild(node);
          node = w;
        }
        out.push({ kind: "blk", ...r, html: node.outerHTML });
      }
      out.push({ kind: "foot", ...rel(foot) });

      const s = out.map((x) => `${x.kind}${Math.round(x.top)}-${Math.round(x.bottom)}-${x.html?.length ?? 0}`).join("|");
      if (s === sig.current) return;
      sig.current = s;
      setParts(out);
    };
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(c);
    const mo = new MutationObserver(schedule);
    mo.observe(c, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); };
  }, [article, colW, newer?.id, older?.id]);

  // ---- world: contiguous white tiles (one per block) so every piece bends with the glass --------
  const doc = useMemo(() => {
    const tiles = new Map<string, { part: Part; innerTop: number }>();
    const items: StageItem[] = [];
    let total = 0;
    parts.forEach((pt, i) => {
      const start = i === 0 ? 0 : (parts[i - 1].bottom + pt.top) / 2;
      const end = i === parts.length - 1 ? pt.bottom + BOTTOM_PAD : (pt.bottom + parts[i + 1].top) / 2;
      const y = i === 0 ? 0 : start + TOP_PAD;
      const h = end + TOP_PAD - y + (i === parts.length - 1 ? 0 : 1); // +1px overlap hides hairline seams
      const id = `d${i}`;
      items.push({ id, x: 0, y, w: paperW, h });
      tiles.set(id, { part: pt, innerTop: pt.top + TOP_PAD - y });
      total = Math.max(total, y + h);
    });
    return { items, tiles, total };
  }, [parts, paperW]);

  const side = useMemo(() => {
    if (!sideW) return { items: [] as StageItem[], height: 0 };
    const items: StageItem[] = [{ id: "side-h", x: 0, y: 0, w: SIDE_W, h: SIDE_HEAD, fixed: true }];
    articles.forEach((a, i) =>
      items.push({ id: `side-${a.id}`, x: 0, y: SIDE_HEAD + i * SIDE_ITEM, w: SIDE_W, h: SIDE_ITEM, fixed: true }),
    );
    return { items, height: SIDE_HEAD + articles.length * SIDE_ITEM + 24 };
  }, [articles, sideW]);

  const items = useMemo(() => [...side.items, ...doc.items], [side.items, doc.items]);
  const byId = useMemo(() => new Map(articles.map((a) => [`side-${a.id}`, a])), [articles]);

  // camera: only up/down, the paper sits where paperL says
  const bounds = useMemo(() => {
    const cx = size.w / 2;
    return { x: cx - paperL, y: size.h / 2, w: 0, h: Math.max(0, doc.total - size.h) };
  }, [size.w, size.h, paperL, doc.total]);

  const renderItem = useCallback(
    (item: StageItem) => {
      if (item.id === "side-h") {
        return (
          <div className="tv-side-head">
            <span>Articles</span>
            <b>{articles.length}</b>
          </div>
        );
      }
      const a = byId.get(item.id);
      if (a) return <SideLink a={a} active={a.id === article?.id} />;
      const t = doc.tiles.get(item.id);
      if (!t || !article) return null;
      return (
        <div className="tv-paper">
          <div className="tv-paper-in" style={{ left: padX, top: t.innerTop, width: colW }}>
            {t.part.kind === "head" ? (
              <ArticleHeader a={article} />
            ) : t.part.kind === "foot" ? (
              <ArticleFooter newer={newer} older={older} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: t.part.html ?? "" }} />
            )}
          </div>
        </div>
      );
    },
    [articles.length, byId, doc.tiles, article, padX, colW, newer, older],
  );

  const reveal = useMemo(
    () => (idx >= 0 ? { y: SIDE_HEAD + idx * SIDE_ITEM, h: SIDE_ITEM } : null),
    [idx],
  );

  return (
    <TvStage
      label="Articles"
      items={items}
      bounds={bounds}
      renderItem={renderItem}
      curve={0.22}
      drift={false}
      mouseDrag={false}
      selectable
      keys
      startAtTop
      progress
      resetKey={article?.id ?? ""}
      fixedWidth={sideW}
      fixedHeight={side.height}
      fixedReveal={reveal}
      loading={!!article && parts.length === 0}
      emptyText="NO ARTICLES YET"
    >
      {/* hidden copy of the article: only used to measure block heights */}
      {article && (
        <div ref={mRef} className="tv-measure" style={{ width: colW }} aria-hidden inert>
          <div ref={headRef}><ArticleHeader a={article} /></div>
          <div ref={bodyRef}><ArticleViewer content={article.content} /></div>
          <div ref={footRef}><ArticleFooter newer={newer} older={older} /></div>
        </div>
      )}

      {!desktop && articles.length > 0 && (
        <button type="button" className="tv-menu-btn" onClick={() => setMenu(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Articles
        </button>
      )}
      {!desktop && menu && (
        <TvPanel width={null} onClose={() => setMenu(false)} label="All articles">
          <nav className="tv-nav-list">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                className={a.id === article?.id ? "is-active" : ""}
                onClick={() => setMenu(false)}
              >
                <span className="t">{a.title}</span>
                {a.excerpt && <span className="s">{a.excerpt}</span>}
              </Link>
            ))}
          </nav>
        </TvPanel>
      )}

      <nav className="tv-sr" aria-label="All articles">
        <ul>
          {articles.map((a) => (
            <li key={a.id}><Link href={`/article/${a.slug}`} tabIndex={-1}>{a.title}</Link></li>
          ))}
        </ul>
      </nav>
    </TvStage>
  );
}
