import "./dots.css";

/**
 * The two pink balls (top-left and top-right corner), drawn ABOVE the navbar.
 * Used on /articles and on every /article/... page (see app/articles/page.tsx and app/article/layout.tsx).
 * Pure CSS, no client JS. Put it OUTSIDE any positioned/transformed wrapper so it anchors to the top of the page.
 */
export default function ArticleDots() {
  return (
    <div className="art-dots" aria-hidden>
      <span className="art-dot art-dot--l" />
      <span className="art-dot art-dot--r" />
    </div>
  );
}
