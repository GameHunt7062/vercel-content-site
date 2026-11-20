/**
 * Scroll driver for the photo under "An Artist" (see home-bottom.css).
 *
 * Every element with [data-hb-pin] is a box that sits in normal flow. Its picture is held still on the screen while the page
 * scrolls and "An Artist" (above the box) uncovers it from the bottom up. When the picture's top meets the box's top
 * (= "An Artist"'s bottom edge) it lets go and scrolls with the page.
 *
 * Where it is held: with its top at the top of the screen (so you see the picture's top first), or, if the picture is shorter than
 * the screen, with its bottom on the bottom of the screen. We just set --pin (px): how far the picture must be moved UP from its
 * normal place so that it stays held.
 *   pinnedTop = max(0, screenHeight - boxHeight)
 *   pin       = min(0, pinnedTop - boxTop)
 * The box itself never moves (only its picture inside does, and it is clipped by the box), so there is no feedback loop.
 * Skipped when the visitor prefers reduced motion (the photo then just scrolls normally).
 */
export function initParallax(): () => void {
  if (typeof window === "undefined") return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-hb-pin]"));
  if (!els.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const pin = Math.min(0, Math.max(0, vh - r.height) - r.top);
      el.style.setProperty("--pin", `${pin.toFixed(2)}px`);
    }
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  // the page above can change height (cards load, fonts swap) without a scroll
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(request) : null;
  ro?.observe(document.documentElement);
  request();

  return () => {
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    ro?.disconnect();
    if (raf) cancelAnimationFrame(raf);
    els.forEach((el) => el.style.removeProperty("--pin"));
  };
}
