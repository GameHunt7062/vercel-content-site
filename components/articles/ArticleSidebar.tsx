"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type SideArticle = { id: string; slug: string; title: string; excerpt: string | null; status: string | null };

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

/** Left article list, like docs sites. Lives in app/article/layout.tsx so it stays put while you switch articles. */
export default function ArticleSidebar({ articles }: { articles: SideArticle[] }) {
  const path = usePathname() || "";
  const m = path.match(/^\/article\/([^/]+)/);
  const activeSlug = m ? decodeURIComponent(m[1]) : articles[0]?.slug; // /article = latest
  const [open, setOpen] = useState(false);
  const sideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sideRef.current?.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  }, [activeSlug]);

  const list = (onNav?: () => void) => (
    <nav className="docs-list" aria-label="Articles">
      {articles.map((a) => {
        const active = a.slug === activeSlug;
        return (
          <Link
            key={a.id}
            href={`/article/${a.slug}`}
            className={`docs-item${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={onNav}
          >
            <span className="t">{a.status === "draft" && <b>Draft</b>}{a.title}</span>
            {a.excerpt && <span className="s">{a.excerpt}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="docs-side" ref={sideRef}>
        <div className="docs-side-head">
          <Link href="/" className="docs-back" aria-label="Back to main page"><BackIcon /></Link>
          <span>Articles</span>
        </div>
        {list()}
      </aside>

      <div className="docs-bar">
        <Link href="/" className="docs-back" aria-label="Back to main page"><BackIcon /></Link>
        {articles.length > 0 && (
          <button type="button" className="docs-menu" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Articles
          </button>
        )}
      </div>
      {open && <div className="docs-drawer">{list(() => setOpen(false))}</div>}
    </>
  );
}
