"use client";

import { useEffect } from "react";

/**
 * Parallax for the hero: while the page scrolls, writes the scroll distance into CSS variables on
 * .hero. hero.css then moves each layer (character / RAWME / ARZU / dots) at its own speed.
 *   --sy   scroll distance in screen px   (used by the HTML dots)
 *   --syu  scroll distance in SVG units   (used by the SVG layers; the artwork is scaled to the screen width)
 */
export default function HeroParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.querySelector<HTMLElement>(".hero");
    if (!hero) return;

    let unitsPerPx = 1; // SVG units per screen px
    let ticking = false;

    const measure = () => {
      const svg = Array.from(hero.querySelectorAll<SVGSVGElement>("svg.hero-art")).find((s) => s.clientWidth > 0);
      if (svg) unitsPerPx = svg.viewBox.baseVal.width / svg.clientWidth;
    };
    const update = () => {
      ticking = false;
      const y = Math.min(window.scrollY, hero.offsetHeight);
      hero.style.setProperty("--sy", String(y));
      hero.style.setProperty("--syu", String(y * unitsPerPx));
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    const onResize = () => { measure(); update(); };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
