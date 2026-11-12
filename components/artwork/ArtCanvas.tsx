"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import TvStage, { type StageItem } from "@/components/tv/TvStage";
import TvPanel from "@/components/tv/TvPanel";
import { useMediaQuery } from "@/components/tv/useMediaQuery";
import ArtDetail from "@/components/artwork/ArtDetail";
import { justifiedLayout } from "@/lib/tvLayout";

export type ArtItem = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  image_url: string;
  images: string[] | null;
  description: string | null;
  description_json: unknown;
  published_at: string | null;
  created_at: string;
};

const GAP = 6; // gap between pictures (px)
const PANEL_W = 440;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const coverOf = (a: ArtItem) => a.images?.[0] || a.image_url;

const ArtTile = memo(function ArtTile({
  art, w, h, selected, onSelect,
}: {
  art: ArtItem; w: number; h: number; selected: boolean; onSelect: (id: string) => void;
}) {
  const n = art.images?.length ?? 1;
  const depth = Math.min(Math.max(n - 1, 0), 2); // pictures with slides look like a little stack
  const step = clamp(h * 0.03, 4, 8);
  const cw = w - depth * step;
  const ch = h - depth * step;
  return (
    <button
      type="button"
      className={`tv-tile${selected ? " is-sel" : ""}`}
      onClick={() => onSelect(art.id)}
      aria-label={art.title}
    >
      {Array.from({ length: depth }, (_, i) => depth - i).map((k) => (
        <span
          key={k}
          className="tv-layer"
          style={{ left: k * step, bottom: k * step, width: cw, height: ch, opacity: 1 - k * 0.2 }}
        />
      ))}
      <span className="tv-card" style={{ width: cw, height: ch }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverOf(art)} alt="" draggable={false} decoding="async" />
        {n > 1 && <span className="tv-count">{n}</span>}
      </span>
    </button>
  );
});

function useViewport() {
  const [v, setV] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const read = () => {
      const w = Math.round(window.innerWidth / 50) * 50;
      const h = Math.round(window.innerHeight / 50) * 50;
      setV((p) => (p.w === w && p.h === h ? p : { w, h }));
    };
    const on = () => { clearTimeout(t); t = setTimeout(read, 200); };
    read();
    window.addEventListener("resize", on);
    return () => { clearTimeout(t); window.removeEventListener("resize", on); };
  }, []);
  return v;
}

export default function ArtCanvas({ artworks }: { artworks: ArtItem[] }) {
  const vp = useViewport();
  const desktop = useMediaQuery("(min-width: 900px)");
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(artworks.length === 0);
  const [sel, setSel] = useState<string | null>(null);

  // we need every picture's real shape before we can lay them out (original ratio is kept)
  useEffect(() => {
    if (!artworks.length) return;
    let alive = true;
    let late = false;
    let left = artworks.length;
    const got: Record<string, number> = {};
    const flush = () => alive && setRatios({ ...got });
    const timer = setTimeout(() => { late = true; flush(); if (alive) setReady(true); }, 4500);
    artworks.forEach((a) => {
      const im = new Image();
      im.decoding = "async";
      const fin = (r: number) => {
        got[a.id] = clamp(r, 0.3, 3.5);
        left -= 1;
        if (late) flush();
        else if (left === 0) { clearTimeout(timer); flush(); if (alive) setReady(true); }
      };
      im.onload = () => fin(im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 1);
      im.onerror = () => fin(1);
      im.src = coverOf(a);
    });
    return () => { alive = false; clearTimeout(timer); };
  }, [artworks]);

  const layout = useMemo(() => {
    const W = clamp(Math.round(vp.w * 1.6), 1000, 2200);
    const target = clamp(Math.round((Math.min(vp.w, vp.h) * 0.42) / 10) * 10, 170, 280);
    return justifiedLayout(artworks.map((a) => ratios[a.id] ?? 1), W, GAP, target);
  }, [artworks, ratios, vp]);

  const items = useMemo<StageItem[]>(
    () => layout.boxes.map((b, i) => ({ id: artworks[i].id, ...b })),
    [layout, artworks],
  );
  const period = useMemo(() => ({ w: layout.pw, h: layout.ph }), [layout]);
  const byId = useMemo(() => new Map(artworks.map((a) => [a.id, a])), [artworks]);
  const art = sel ? byId.get(sel) : undefined;
  const close = useCallback(() => setSel(null), []);

  const renderItem = useCallback(
    (item: StageItem) => {
      const a = byId.get(item.id);
      return a ? <ArtTile art={a} w={item.w} h={item.h} selected={sel === item.id} onSelect={setSel} /> : null;
    },
    [byId, sel],
  );

  return (
    <TvStage
      label="Artwork"
      hint="drag to explore"
      items={ready ? items : []}
      period={ready ? period : null}
      renderItem={renderItem}
      loading={!ready}
      emptyText="NO ARTWORK YET"
      insetLeft={art && desktop ? PANEL_W : 0}
      focusId={sel}
      curve={0.35}
    >
      {art && (
        <TvPanel width={desktop ? PANEL_W : null} onClose={close} label={art.title}>
          <ArtDetail key={art.id} art={art} />
        </TvPanel>
      )}
      <nav className="tv-sr" aria-label="All artwork">
        <ul>
          {artworks.map((a) => (
            <li key={a.id}>
              <Link href={`/art/${a.slug}`} tabIndex={-1}>{a.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </TvStage>
  );
}
