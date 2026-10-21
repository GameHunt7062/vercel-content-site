"use client";

import { useEffect } from "react";

/** How long the intro animation runs (ms). Keep in sync with the timings in hero.css. */
const INTRO_MS = 3200;

/**
 * Blocks scrolling (wheel, touch, keyboard) until the hero intro animation has finished.
 * The CSS in hero.css also locks the page from the very first paint, so nothing can scroll
 * before this component has hydrated.
 */
export default function HeroIntro() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    window.scrollTo(0, 0);
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if ([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);

    const release = () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };
    const timer = setTimeout(release, INTRO_MS);
    return () => { clearTimeout(timer); release(); };
  }, []);

  return null;
}
