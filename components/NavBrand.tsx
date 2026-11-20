"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Left side of the navbar.
 * - normal pages: "Rawme Arzu" (goes to the home page)
 * - /articles, /article and /article/<slug>: "Rawme / Articles"  (Rawme -> home page, Articles -> /articles)
 */
export default function NavBrand() {
  const path = (usePathname() || "/").replace(/\/+$/, "") || "/";
  const onArticle = path === "/articles" || path === "/article" || path.startsWith("/article/");

  if (!onArticle) {
    return <Link href="/" className="site-nav-brand hover:text-rawme-pink">Rawme Arzu</Link>;
  }
  return (
    <div className="site-nav-brand flex items-center gap-2">
      <Link href="/" className="hover:text-rawme-pink">Rawme</Link>
      <span aria-hidden className="opacity-60">/</span>
      <Link href="/articles" className="hover:text-rawme-pink">Articles</Link>
    </div>
  );
}
