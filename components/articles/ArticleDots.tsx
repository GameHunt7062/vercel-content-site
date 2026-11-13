import "./dots.css";

/**
 * The same two pink balls as the home-page hero: one on the top-left corner of the screen, one on the bottom-right corner.
 * They are position:fixed, so they stay on the screen corners while scrolling. Used on /articles and on every /article/... page.
 * Pure CSS, no client JS.
 */
export default function ArticleDots() {
  return (
    <>
      <span className="art-dot art-dot--tl" aria-hidden />
      <span className="art-dot art-dot--br" aria-hidden />
    </>
  );
}
