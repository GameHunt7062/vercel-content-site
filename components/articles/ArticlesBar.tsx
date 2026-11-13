import Link from "next/link";

/** Top bar for /articles:  Rawme / Articles  on the left, site links on the right. */
export default function ArticlesBar() {
  return (
    <header className="arts-bar">
      <div className="arts-crumb">
        <Link href="/">Rawme</Link>
        <span className="sep">/</span>
        <span>Articles</span>
      </div>
      <nav className="arts-links" aria-label="Site">
        <Link href="/">Home</Link>
        <Link href="/art">Art</Link>
      </nav>
    </header>
  );
}
