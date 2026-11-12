"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import TvStage, { type StageItem } from "@/components/tv/TvStage";
import TvPanel from "@/components/tv/TvPanel";
import { useMediaQuery } from "@/components/tv/useMediaQuery";
import ArtDetail from "@/components/artwork/ArtDetail";
import { hashString, justifiedLayout, scatterClusters, seededRandom } from "@/lib/tvLayout";

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

const GAP_IN = 4; //      gap between slides of the SAME artwork (they sit side by side)
const GAP_OUT = 10; //    minimum gap between different artworks
const PANEL_W = 440;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const slidesOf = (a: ArtItem) => (a.images?.length ? a.images : [a.image_url]);
const tileId = (artId: string, idx: number) => `${artId}#${idx}`;

type Tile = { art: ArtItem; idx: number; src: string };

const ArtTile = memo(function ArtTile({
  tile, w, h, selected, onSelect,
}: {
  tile: Tile; w: number; h: number; selected: boolean; onSelect: (artId: string, idx: number) => void;
}) {
  return (
    <button
      type="button"
      className={`tv-tile${selected ? " is-sel" : ""}`}
      onClick={() => onSelect(tile.art.id, tile.idx)}
      aria-label={tile.art.title}
    >
      <span className="tv-card" style={{ width: w, height: h }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tile.src} alt="" draggable={false} decoding="async" />
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
  const [sel, setSel] = useState<{ id: string; idx: number } | null>(null);

  // every slide of every artwork is its own tile, so we need each picture's real shape first
  useEffect(() => {
    const all = artworks.flatMap((a) => slidesOf(a).map((src, idx) => ({ key: tileId(a.id, idx), src })));
    if (!all.length) return;
    let alive = true;
    let late = false;
    let left = all.length;
    const got: Record<string, number> = {};
    const flush = () => alive && setRatios({ ...got });
    const timer = setTimeout(() => { late = true; flush(); if (alive) setReady(true); }, 8000);
    all.forEach(({ key, src }) => {
      const im = new Image();
      im.decoding = "async";
      const fin = (r: number) => {
        got[key] = clamp(r, 0.3, 3.5);
        left -= 1;
        if (late) flush();
        else if (left === 0) { clearTimeout(timer); flush(); if (alive) setReady(true); }
      };
      im.onload = () => fin(im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 1);
      im.onerror = () => fin(1);
      im.src = src;
    });
    return () => { alive = false; clearTimeout(timer); };
  }, [artworks]);

  // Layout: each artwork = a little cluster (all its slides side by side), clusters scattered randomly
  const { items, period, tiles } = useMemo(() => {
    const T = clamp(Math.round((Math.min(vp.w, vp.h) * 0.3) / 10) * 10, 140, 210);
    const rnd = seededRandom(hashString(artworks.map((a) => a.id).join("|")));

    const clusters = artworks.map((a) => {
      const slides = slidesOf(a);
      const s = 0.85 + rnd() * 0.4; // each artwork gets its own size
      const r = slides.map((_, i) => ratios[tileId(a.id, i)] ?? 1);
      const n = r.length;
      const cols = n === 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
      const avgW = (r.reduce((x, v) => x + T * s * Math.sqrt(v), 0) / n) || T;
      const Wc = n === 1 ? T * s * Math.sqrt(r[0]) : cols * avgW + (cols - 1) * GAP_IN;
      const lay = justifiedLayout(r, Wc, GAP_IN, T * s);
      return { a, lay, w: Wc, h: lay.ph - GAP_IN };
    });

    const sc = scatterClusters(clusters.map((c) => ({ w: c.w, h: c.h })), {
      seed: hashString(artworks.map((a) => a.id).join("|")) + 1,
      margin: GAP_OUT,
    });

    const items: StageItem[] = [];
    const tiles = new Map<string, Tile>();
    clusters.forEach((c, i) => {
      const slides = slidesOf(c.a);
      c.lay.boxes.forEach((b, k) => {
        const id = tileId(c.a.id, k);
        items.push({ id, x: sc.pos[i].x + b.x, y: sc.pos[i].y + b.y, w: b.w, h: b.h });
        tiles.set(id, { art: c.a, idx: k, src: slides[k] });
      });
    });
    return { items, period: { w: sc.pw, h: sc.ph }, tiles };
  }, [artworks, ratios, vp]);

  const byId = useMemo(() => new Map(artworks.map((a) => [a.id, a])), [artworks]);
  const art = sel ? byId.get(sel.id) : undefined;
  const close = useCallback(() => setSel(null), []);
  const onSelect = useCallback((id: string, idx: number) => setSel({ id, idx }), []);

  const renderItem = useCallback(
    (item: StageItem) => {
      const tile = tiles.get(item.id);
      return tile ? (
        <ArtTile
          tile={tile}
          w={item.w}
          h={item.h}
          selected={sel?.id === tile.art.id}
          onSelect={onSelect}
        />
      ) : null;
    },
    [tiles, sel?.id, onSelect],
  );

  return (
    <TvStage
      label="Artwork"
      hint="scroll to zoom · drag to explore"
      wheel="zoom"
      minZoom={0.55}
      maxZoom={2.6}
      items={ready ? items : []}
      period={ready ? period : null}
      renderItem={renderItem}
      loading={!ready}
      emptyText="NO ARTWORK YET"
      insetLeft={art && desktop ? PANEL_W : 0}
      focusId={sel ? tileId(sel.id, sel.idx) : null}
      curve={0.35}
    >
      {art && sel && (
        <TvPanel width={desktop ? PANEL_W : null} onClose={close} label={art.title}>
          <ArtDetail key={`${art.id}:${sel.idx}`} art={art} startIndex={sel.idx} />
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
