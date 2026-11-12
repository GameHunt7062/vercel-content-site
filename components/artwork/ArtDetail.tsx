"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import EditButton from "@/components/admin/EditButton";
import PublishedDate from "@/components/PublishedDate";
import ArticleViewer from "@/components/articles/ArticleViewer";
import type { ArtItem } from "@/components/artwork/ArtCanvas";

export default function ArtDetail({ art }: { art: ArtItem }) {
  const images = art.images?.length ? art.images : [art.image_url];
  const n = images.length;
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [msg, setMsg] = useState("");
  const startX = useRef<number | null>(null);

  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoom) { e.stopPropagation(); setZoom(false); }
      else if (n > 1 && e.key === "ArrowLeft") go(-1);
      else if (n > 1 && e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, n, zoom]);

  const share = async () => {
    const url = `${window.location.origin}/art/${art.slug}${i > 0 ? `#${i + 1}` : ""}`;
    try {
      if (navigator.share) { await navigator.share({ title: art.title, url }); return; }
    } catch { /* cancelled */ }
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copied");
      setTimeout(() => setMsg(""), 1800);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div
        className="tv-media"
        onPointerDown={(e) => { startX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (startX.current === null || n < 2) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={art.title} draggable={false} onClick={() => setZoom(true)} />
        {n > 1 && (
          <>
            <button type="button" className="nav prev" onClick={() => go(-1)} aria-label="Previous slide">‹</button>
            <button type="button" className="nav next" onClick={() => go(1)} aria-label="Next slide">›</button>
            <div className="dots" aria-hidden>
              {images.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}
            </div>
          </>
        )}
      </div>

      {art.category && (
        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-500">{art.category}</p>
      )}
      <h2 className="mt-1 text-2xl font-extrabold leading-tight">{art.title}</h2>
      <PublishedDate date={art.published_at ?? art.created_at} className="mt-2" />

      <div className="tv-actions">
        <button type="button" className="tv-btn" onClick={share}>{msg || "Share"}</button>
        <Link href={`/art/${art.slug}`} className="tv-btn">Open page ↗</Link>
        <EditButton href={`/admin/artwork/${art.id}`} label="Edit Artwork" />
      </div>

      {art.description_json ? (
        <ArticleViewer content={art.description_json} className="mt-6" />
      ) : art.description ? (
        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-zinc-700">{art.description}</p>
      ) : null}

      {zoom && (
        <div className="tv-zoom" onClick={() => setZoom(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[i]} alt={art.title} />
        </div>
      )}
    </div>
  );
}
