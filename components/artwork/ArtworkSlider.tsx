"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const DURATION = 350;

/**
 * Infinite-loop slider. Renders [last, ...images, first]; after sliding onto a clone
 * it silently jumps (no animation) to the matching real slide, so it never "ends".
 */
export default function ArtworkSlider({ images, title }: { images: string[]; title: string }) {
  const count = images.length;
  const [pos, setPos] = useState(1); // 1..count = real slides, 0 and count+1 = clones
  const [animate, setAnimate] = useState(true);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (count <= 1) {
    return <img src={images[0]} alt={title} className="w-full max-h-[75vh] object-contain rounded-2xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  const slides = [images[count - 1], ...images, images[0]];
  const current = pos === 0 ? count : pos === count + 1 ? 1 : pos; // 1-based real slide

  function settle(p: number) {
    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    if (p === 0) { setAnimate(false); setPos(count); }
    else if (p === count + 1) { setAnimate(false); setPos(1); }
  }

  function moveTo(p: number) {
    if (locked.current) return;
    locked.current = true;
    setAnimate(true);
    setPos(p);
    // fallback in case transitionend never fires (hidden tab, reduced motion…)
    timer.current = setTimeout(() => settle(p), DURATION + 80);
  }

  const next = () => moveTo(pos + 1);
  const prev = () => moveTo(pos - 1);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  function onPointerDown(e: PointerEvent) { startX.current = e.clientX; }
  function onPointerUp(e: PointerEvent) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  }

  const arrow = "absolute top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/60 text-white text-xl hover:bg-black/80";

  return (
    <div className="space-y-3" onKeyDown={onKeyDown}>
      <div
        className="relative rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden touch-pan-y focus:outline-none"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={`${title} — slide ${current} of ${count}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { startX.current = null; }}
      >
        <div
          className="flex"
          style={{ transform: `translateX(-${pos * 100}%)`, transition: animate ? `transform ${DURATION}ms ease` : "none" }}
          onTransitionEnd={() => settle(pos)}
        >
          {slides.map((src, i) => (
            <div key={`${i}-${src}`} className="w-full shrink-0 flex items-center justify-center" aria-hidden={i !== pos}>
              <img src={src} alt={`${title} — ${i === 0 ? count : i === count + 1 ? 1 : i}`} draggable={false} className="w-full max-h-[75vh] object-contain select-none" />
            </div>
          ))}
        </div>
        <button type="button" aria-label="Previous slide" onClick={prev} className={`${arrow} left-3`}>‹</button>
        <button type="button" aria-label="Next slide" onClick={next} className={`${arrow} right-3`}>›</button>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 text-white text-xs px-2.5 py-1">{current} / {count}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => moveTo(i + 1)}
            aria-label={`Go to slide ${i + 1}`}
            className={`shrink-0 rounded-lg overflow-hidden ring-2 ${i + 1 === current ? "ring-black dark:ring-white" : "ring-transparent opacity-70 hover:opacity-100"}`}
          >
            <img src={src} alt="" className="h-16 w-16 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
