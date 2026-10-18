"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shares the page's current URL. For artworks the slider keeps "#2", "#3"… in the URL,
 * so sharing while on slide 2 shares the link to slide 2.
 */
export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function share() {
    const url = window.location.href;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    // phones/tablets: native share sheet; desktop: copy to clipboard
    if (touch && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {copied ? "Link copied ✓" : "Share"}
    </button>
  );
}
