"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import ArtworkCard from "@/components/artwork/ArtworkCard";
import { useIsAdmin } from "@/components/admin/AdminProvider";
import { createClient } from "@/lib/supabase/client";
import { capSpan } from "@/lib/gridSpan";
import { computeLayout, type LayoutItem } from "@/lib/masonry";

const GAP = 24; // = Tailwind gap-6
const PLACEHOLDER = "__drop__";
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Draft = { order: string[]; pins: Record<string, number> };
type LastMove = { id: string; title: string; before: Record<string, number> };
type Drag = {
  id: string;
  left: number; top: number; // current position inside the grid
  w: number; h: number;
  grabX: number; grabY: number; // where inside the artwork it was grabbed
  startX: number; startY: number;
  startCol: number;
  moved: boolean;
  index: number; // insert position in the list without this artwork
  col: number; // target start column
  freeze: Record<string, number>; // column of every artwork at the moment of grabbing
  before: Record<string, number>;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const samePins = (a: Record<string, number>, b: Record<string, number>) => {
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
};

export default function ArtworkGrid({ artworks }: { artworks: any[] }) {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [cols, setCols] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [settled, setSettled] = useState(false);
  const [arrange, setArrange] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [saving, setSaving] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef(new Map<string, HTMLDivElement>());
  const dragRef = useRef<Drag | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const updateRef = useRef<(x: number, y: number) => void>(() => {});

  // ---- screen size -> 2 / 3 / 4 columns (same breakpoints as Tailwind md / lg)
  useIsoLayoutEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)");
    const update = () => setCols(lg.matches ? 4 : md.matches ? 3 : 2);
    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => { lg.removeEventListener("change", update); md.removeEventListener("change", update); };
  }, []);

  // ---- available width
  useIsoLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const active = cols !== null && width > 0;
  const C = cols ?? 4;
  const colW = active ? (width - GAP * (C - 1)) / C : 0;
  const idsKey = artworks.map((a) => a.id).join(",");

  // ---- real rendered height of every artwork (image + title), re-measured whenever it changes
  useIsoLayoutEffect(() => {
    if (!active) return;
    const ro = new ResizeObserver((entries) => {
      setHeights((prev) => {
        let next = prev;
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const id = el.dataset.id!;
          const h = Math.round(el.offsetHeight);
          if (prev[id] !== h) {
            if (next === prev) next = { ...prev };
            next[id] = h;
          }
        }
        return next;
      });
    });
    itemEls.current.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [active, idsKey]);

  const ready = active && artworks.every((a) => heights[a.id] !== undefined);
  useEffect(() => {
    if (!ready) return;
    const r = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(r);
  }, [ready]);

  // ---- saved layout (from the database) and the unsaved draft
  const byId = useMemo(() => new Map<string, any>(artworks.map((a) => [a.id, a])), [artworks]);
  const base: Draft = useMemo(() => ({
    order: artworks.map((a) => a.id),
    pins: Object.fromEntries(
      artworks.filter((a) => typeof a.grid_col === "number" && a.grid_col >= 0).map((a) => [a.id, a.grid_col as number]),
    ),
  }), [artworks]);
  const cur = draft ?? base;
  const dirty = !!draft && (draft.order.join(",") !== base.order.join(",") || !samePins(draft.pins, base.pins));

  useEffect(() => { setDraft(null); setLastMove(null); }, [artworks]); // fresh data from the server -> drop the draft

  const arranging = arrange && isAdmin && cols === 4;
  const effPins = useMemo(() => ({ ...cur.pins, ...(drag?.freeze ?? {}) }), [cur.pins, drag?.freeze]);

  function toItems(order: string[], pins: Record<string, number>, exclude?: string): LayoutItem[] {
    const out: LayoutItem[] = [];
    for (const id of order) {
      if (id === exclude) continue;
      const a = byId.get(id);
      if (!a) continue;
      out.push({ id, span: capSpan(a.grid_span, C), h: heights[id] ?? 0, pin: C === 4 ? pins[id] : undefined });
    }
    return out;
  }

  const dragSpan = drag ? capSpan(byId.get(drag.id)?.grid_span, C) : 1;
  const layout = useMemo(() => {
    if (!ready) return { pos: {} as Record<string, { col: number; y: number }>, height: 0 };
    if (!drag) return computeLayout(toItems(cur.order, effPins), C, GAP);
    const items = toItems(cur.order, effPins, drag.id);
    items.splice(drag.index, 0, { id: PLACEHOLDER, span: dragSpan, h: drag.h, pin: drag.col });
    return computeLayout(items, C, GAP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, cur.order, effPins, heights, C, drag?.id, drag?.index, drag?.col]);

  // ---- admin: remember the real shape of every cover image (so the page can reserve the right space)
  useEffect(() => {
    if (!isAdmin) return;
    const root = wrapRef.current;
    if (!root) return;
    const supabase = createClient();
    const handled = new Set<string>();
    const check = (img: HTMLImageElement) => {
      const id = img.dataset.ratioId;
      if (!id || handled.has(id) || !img.naturalWidth || !img.naturalHeight) return;
      const ratio = img.naturalWidth / img.naturalHeight;
      const stored = Number(byId.get(id)?.image_ratio) || 0;
      if (stored && Math.abs(stored - ratio) / ratio < 0.01) return;
      handled.add(id);
      supabase.from("artworks").update({ image_ratio: Math.round(ratio * 10000) / 10000 }).eq("id", id).then(() => {}, () => {});
    };
    const cleanups = Array.from(root.querySelectorAll<HTMLImageElement>("img[data-ratio-id]")).map((img) => {
      if (img.complete) { check(img); return () => {}; }
      const fn = () => check(img);
      img.addEventListener("load", fn);
      return () => img.removeEventListener("load", fn);
    });
    return () => cleanups.forEach((f) => f());
  }, [isAdmin, byId]);

  // ---- dragging
  function updateDrag(clientX: number, clientY: number) {
    const d = dragRef.current;
    const wrap = wrapRef.current;
    if (!d || !wrap) return;
    const wr = wrap.getBoundingClientRect();
    const span = capSpan(byId.get(d.id)?.grid_span, C);
    const left = clientX - wr.left - d.grabX;
    const top = clientY - wr.top - d.grabY;
    const col = clamp(Math.round(left / (colW + GAP)), 0, C - span);

    // where in the stack of that column does it land? -> before the first artwork (crossing those columns) that is lower than its centre
    const others = toItems(cur.order, { ...cur.pins, ...d.freeze }, d.id);
    const L = computeLayout(others, C, GAP);
    const cy = top + d.h / 2;
    let found = -1, last = -1;
    others.forEach((it, i) => {
      const p = L.pos[it.id];
      if (!p || p.col >= col + span || p.col + it.span <= col) return;
      last = i;
      if (found < 0 && p.y + it.h / 2 > cy) found = i;
    });
    const index = found >= 0 ? found : last + 1;
    const moved = d.moved || Math.hypot(clientX - d.startX, clientY - d.startY) > 5;
    const next = { ...d, left, top, col, index, moved };
    dragRef.current = next;
    setDrag(next);
  }
  updateRef.current = updateDrag;

  function onDown(e: ReactPointerEvent<HTMLDivElement>, id: string) {
    if (saving || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = itemEls.current.get(id);
    const wrap = wrapRef.current;
    if (!el || !wrap || !layout.pos[id]) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const wr = wrap.getBoundingClientRect();
    const ir = el.getBoundingClientRect();
    const freeze: Record<string, number> = {};
    for (const [pid, p] of Object.entries(layout.pos)) freeze[pid] = p.col;
    const d: Drag = {
      id, left: ir.left - wr.left, top: ir.top - wr.top, w: ir.width, h: ir.height,
      grabX: e.clientX - ir.left, grabY: e.clientY - ir.top,
      startX: e.clientX, startY: e.clientY, startCol: layout.pos[id].col, moved: false,
      index: cur.order.indexOf(id), col: layout.pos[id].col, freeze, before: cur.pins,
    };
    pointer.current = { x: e.clientX, y: e.clientY };
    dragRef.current = d;
    setDrag(d);
  }

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    updateRef.current(e.clientX, e.clientY);
  }

  function finish(commit: boolean) {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d || !commit || !d.moved) return;
    const others = cur.order.filter((i) => i !== d.id);
    const order = [...others.slice(0, d.index), d.id, ...others.slice(d.index)];
    if (order.join(",") === cur.order.join(",") && d.col === d.startCol) return; // dropped back where it was
    // Everything else stays exactly in its column; only this artwork moves. The admin then chooses what happens to the rest.
    setDraft({ order, pins: { ...cur.pins, ...d.freeze, [d.id]: d.col } });
    setLastMove({ id: d.id, title: byId.get(d.id)?.title ?? "artwork", before: d.before });
  }

  // edge auto-scroll while dragging + Escape to cancel
  useEffect(() => {
    if (!drag) return;
    let raf = 0;
    const tick = () => {
      const y = pointer.current.y;
      const margin = 90;
      let dy = 0;
      if (y < margin) dy = -Math.ceil((margin - y) / 5);
      else if (y > window.innerHeight - margin) dy = Math.ceil((y - (window.innerHeight - margin)) / 5);
      if (dy) {
        window.scrollBy({ top: dy, behavior: "instant" as ScrollBehavior });
        updateRef.current(pointer.current.x, pointer.current.y);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") finish(false); };
    window.addEventListener("keydown", key);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", key); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id]);

  // ---- toolbar actions
  function autoAdjustRest() {
    if (!lastMove || !draft) return;
    // the rest behave as if nothing had been frozen: only earlier pins + the artwork you just placed stay fixed
    setDraft({ order: draft.order, pins: { ...lastMove.before, [lastMove.id]: draft.pins[lastMove.id] } });
    setLastMove(null);
  }
  function autoFillAll() {
    setDraft({ order: cur.order, pins: {} });
    setLastMove(null);
  }
  function newestFirst() {
    const t = (a: any) => new Date(a.published_at ?? a.created_at ?? 0).getTime();
    const order = [...artworks].sort((a, b) => t(b) - t(a)).map((a) => a.id);
    setDraft({ order, pins: {} });
    setLastMove(null);
  }
  function discard() { setDraft(null); setLastMove(null); }
  function exit() {
    if (dirty && !window.confirm("Discard your unsaved layout changes?")) return;
    discard();
    setArrange(false);
  }
  async function save() {
    if (!draft) return;
    setSaving(true);
    const supabase = createClient();
    const jobs: PromiseLike<{ error: { message: string } | null }>[] = [];
    draft.order.forEach((id, i) => {
      const a = byId.get(id);
      if (!a) return;
      const col = draft.pins[id] ?? null;
      if (a.sort_order !== i || (a.grid_col ?? null) !== col) {
        jobs.push(supabase.from("artworks").update({ sort_order: i, grid_col: col }).eq("id", id));
      }
    });
    const results = await Promise.all(jobs);
    const err = results.find((r) => r.error)?.error;
    if (err) {
      window.alert(/sort_order|grid_col/i.test(err.message)
        ? "The layout needs new database columns first. Run supabase/add-artwork-layout.sql in the Supabase SQL Editor, then save again."
        : err.message);
      setSaving(false);
      return;
    }
    router.refresh(); // the draft is dropped as soon as the fresh data arrives
    setSaving(false);
  }

  // ---- render
  const btn = "px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div>
      {isAdmin && cols === 4 && !arranging && (
        <div className="mb-5 flex justify-end">
          <button type="button" className={btn} onClick={() => setArrange(true)}>Arrange layout</button>
        </div>
      )}
      {isAdmin && cols !== null && cols < 4 && (
        <p className="mb-4 text-xs text-zinc-500">Arranging the layout works on desktop screens (1024px and wider).</p>
      )}

      {arranging && (
        <div className="sticky top-2 z-40 mb-5 space-y-2 rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-rawme-blue">Arrange mode</span>
            <span className="text-xs text-zinc-500">Drag an artwork anywhere; the dashed box shows where it will land.</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button type="button" className={btn} onClick={autoFillAll} disabled={saving}>Auto-fill all gaps</button>
              <button type="button" className={btn} onClick={newestFirst} disabled={saving}>Newest first</button>
              <button type="button" className={btn} onClick={discard} disabled={!dirty || saving}>Discard</button>
              <button type="button" className="px-3 py-1.5 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40" onClick={save} disabled={!dirty || saving}>
                {saving ? "Saving…" : "Save layout"}
              </button>
              <button type="button" className={btn} onClick={exit} disabled={saving}>Done</button>
            </div>
          </div>
          {lastMove && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-rawme-tint px-3 py-2 text-sm">
              <span>
                You moved <b>{lastMove.title}</b>. The other artworks stayed in their columns, so some gaps may be left.
              </span>
              <button type="button" className="px-3 py-1 rounded-lg bg-rawme-blue text-white text-sm font-medium" onClick={autoAdjustRest}>Auto-adjust the rest</button>
              <button type="button" className={btn} onClick={() => setLastMove(null)}>I'll adjust them myself</button>
            </div>
          )}
        </div>
      )}

      <div
        ref={wrapRef}
        className={active ? "relative" : "columns-2 md:columns-3 lg:columns-4 gap-6"}
        style={active ? { height: layout.height, visibility: ready ? "visible" : "hidden" } : undefined}
      >
        {arranging && ready && Array.from({ length: C }, (_, i) => (
          <div key={i} className="pointer-events-none absolute inset-y-0 rounded-xl bg-rawme-tint/60" style={{ left: i * (colW + GAP), width: colW }} />
        ))}

        {drag && layout.pos[PLACEHOLDER] && (
          <div
            className="pointer-events-none absolute rounded-xl border-2 border-dashed border-rawme-blue bg-rawme-blue/10"
            style={{ left: layout.pos[PLACEHOLDER].col * (colW + GAP), top: layout.pos[PLACEHOLDER].y, width: drag.w, height: drag.h, transition: "left .2s, top .2s" }}
          />
        )}

        {artworks.map((a) => {
          const isDragged = drag?.id === a.id;
          const p = layout.pos[a.id];
          const span = capSpan(a.grid_span, C);
          let style: CSSProperties | undefined;
          if (active) {
            style = {
              position: "absolute",
              width: span * colW + (span - 1) * GAP,
              left: isDragged ? drag!.left : p ? p.col * (colW + GAP) : 0,
              top: isDragged ? drag!.top : p ? p.y : 0,
              zIndex: isDragged ? 50 : 1,
              transition: settled && !isDragged ? "left .35s var(--ease-out), top .35s var(--ease-out)" : "none",
            };
            if (isDragged) {
              style.scale = "1.03";
              style.filter = "drop-shadow(0 18px 24px rgba(0,18,255,.35))";
            }
          }
          return (
            <div
              key={a.id}
              data-id={a.id}
              ref={(el) => { if (el) itemEls.current.set(a.id, el); else itemEls.current.delete(a.id); }}
              className={active ? undefined : "mb-6 break-inside-avoid"}
              style={style}
            >
              <ArtworkCard artwork={a} />
              {arranging && (
                <div
                  className={`absolute inset-0 z-20 touch-none rounded-xl ring-2 ${lastMove?.id === a.id ? "ring-rawme-pink" : "ring-rawme-blue/30 hover:ring-rawme-blue"} ${isDragged ? "cursor-grabbing" : "cursor-grab"}`}
                  onPointerDown={(e) => onDown(e, a.id)}
                  onPointerMove={onMove}
                  onPointerUp={(e) => { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ } finish(true); }}
                  onPointerCancel={() => finish(false)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
