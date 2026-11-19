/**
 * Tiny scroll-parallax driver for the "An Artist" + photo block (see home-bottom.css).
 * For every element with [data-hb-px] it sets a CSS variable --p (0 → 1): 0 when the element's top
 * touches the bottom of the screen, 1 when its bottom leaves the top of the screen. The CSS then turns
 * --p into movement. The measured element itself never moves (only its children do), so there is no feedback loop.
 * Skipped completely when the visitor prefers reduced motion.
 */
export function initParallax(): () => void {
  if (typeof window === "undefined") return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-hb-px]"));
  if (!els.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue; // far away: nothing to animate
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      el.style.setProperty("--p", p.toFixed(4));
    }
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  request();

  return () => {
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    if (raf) cancelAnimationFrame(raf);
    els.forEach((el) => el.style.removeProperty("--p"));
  };
}
