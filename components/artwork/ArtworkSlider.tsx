"use client";

import { useRef, useState, type KeyboardEvent } from "react";

export default function ArtworkSlider({ images, title }: { images: string[]; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  if (count <= 1) {
    return <img src={images[0]} alt={title} className="w-full max-h-[75vh] object-contain rounded-2xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = ref.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  }

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/60 text-white text-xl hover:bg-black/80 disabled:hidden";

  return (
    <div className="space-y-3" onKeyDown={onKeyDown}>
      <div className="relative rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          ref={ref}
          onScroll={onScroll}
          tabIndex={0}
          aria-label={`${title} — slide ${index + 1} of ${count}`}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        >
          {images.map((src, i) => (
            <div key={src} className="w-full shrink-0 snap-center flex items-center justify-center">
              <img src={src} alt={`${title} — ${i + 1}`} className="w-full max-h-[75vh] object-contain" />
            </div>
          ))}
        </div>
        <button type="button" aria-label="Previous slide" disabled={index === 0} onClick={() => goTo(index - 1)} className={`${arrow} left-3`}>‹</button>
        <button type="button" aria-label="Next slide" disabled={index === count - 1} onClick={() => goTo(index + 1)} className={`${arrow} right-3`}>›</button>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 text-white text-xs px-2.5 py-1">{index + 1} / {count}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`shrink-0 rounded-lg overflow-hidden ring-2 ${i === index ? "ring-black dark:ring-white" : "ring-transparent opacity-70 hover:opacity-100"}`}
          >
            <img src={src} alt="" className="h-16 w-16 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
