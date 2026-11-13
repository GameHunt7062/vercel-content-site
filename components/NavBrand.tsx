"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Left side of the navbar.
 * - normal pages: "Rawme Arzu" (goes to the home page)
 * - /article and /article/<slug>: "Rawme / Articles"  (Rawme -> home page, Articles -> /articles)
 */
export default function NavBrand() {
  const path = (usePathname() || "/").replace(/\/+$/, "") || "/";
  const onArticle = path === "/article" || path.startsWith("/article/");

  if (!onArticle) {
    return <Link href="/" className="font-bold text-xl tracking-tight hover:text-rawme-pink">Rawme Arzu</Link>;
  }
  return (
    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
      <Link href="/" className="hover:text-rawme-pink">Rawme</Link>
      <span aria-hidden className="opacity-60">/</span>
      <Link href="/articles" className="hover:text-rawme-pink">Articles</Link>
    </div>
  );
}
