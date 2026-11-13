import "./dots.css";

/**
 * The same two pink balls as the home-page hero: one on the top-left corner (half on the navbar, half on the page),
 * one on the bottom-right corner. Used on /articles and on every /article/... page.
 * The parent MUST be `position: relative` (see .arts-page and .art-dots-root). Pure CSS, no client JS.
 */
export default function ArticleDots() {
  return (
    <>
      <span className="art-dot art-dot--tl" aria-hidden />
      <span className="art-dot art-dot--br" aria-hidden />
    </>
  );
}
