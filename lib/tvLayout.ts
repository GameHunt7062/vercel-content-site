export type Box = { x: number; y: number; w: number; h: number };

/**
 * "Justified rows" (Google Photos style): every row is stretched to EXACTLY the same width W, so
 * the whole block can repeat left/right/up/down forever with no ragged edge (seamless endless map).
 * Each picture keeps its own aspect ratio. Rows are chosen (dynamic programming) so row heights stay
 * as close to `target` as possible. Items keep their order (left to right, top to bottom).
 *
 * Repeat the block every `pw` px horizontally and every `ph` px vertically.
 */
export function justifiedLayout(ratios: number[], W: number, gap: number, target: number) {
  const n = ratios.length;
  if (!n) return { boxes: [] as Box[], pw: W + gap, ph: 0 };

  const MAX_PER_ROW = 14;
  const pre = [0];
  for (const r of ratios) pre.push(pre[pre.length - 1] + r);
  const rowH = (i: number, j: number) => (W - (j - i - 1) * gap) / (pre[j] - pre[i]);

  const best = new Array<number>(n + 1).fill(Infinity);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    for (let i = Math.max(0, j - MAX_PER_ROW); i < j; i++) {
      const h = rowH(i, j);
      const c = best[i] + (h - target) * (h - target);
      if (c < best[j]) { best[j] = c; from[j] = i; }
    }
  }

  const rows: [number, number][] = [];
  for (let j = n; j > 0; j = from[j]) rows.unshift([from[j], j]);

  const boxes: Box[] = new Array(n);
  let y = 0;
  for (const [i, j] of rows) {
    const h = rowH(i, j);
    let x = 0;
    for (let k = i; k < j; k++) {
      const w = k === j - 1 ? W - x : ratios[k] * h; // last one absorbs rounding so the row is exactly W wide
      boxes[k] = { x, y, w, h };
      x += w + gap;
    }
    y += h + gap;
  }
  return { boxes, pw: W + gap, ph: y };
}

/** Plain card grid (left-aligned rows). */
export function gridLayout(n: number, cols: number, w: number, h: number, gap: number) {
  const boxes: Box[] = [];
  for (let i = 0; i < n; i++) boxes.push({ x: (i % cols) * (w + gap), y: Math.floor(i / cols) * (h + gap), w, h });
  const rows = Math.ceil(n / cols) || 1;
  const bounds: Box = { x: 0, y: 0, w: Math.min(n, cols) * (w + gap) - gap, h: rows * (h + gap) - gap };
  return { boxes, bounds };
}

/** small seeded random generator so the "random" arrangement is the same on every visit */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Scatter rectangles (clusters) at random spots of an endless, repeating block (a torus), without
 * overlapping each other (also not across the repeat edges). Starts with a loose block and grows it a
 * little if everything does not fit. Returns top-left position per cluster and the block size.
 */
export function scatterClusters(
  sizes: { w: number; h: number }[],
  opts: { seed: number; margin: number; density?: number; aspect?: number },
) {
  const n = sizes.length;
  if (!n) return { pos: [] as { x: number; y: number }[], pw: 1, ph: 1 };
  const { margin: m, seed, aspect = 1.5 } = opts;
  let density = opts.density ?? 0.78;

  let area = 0, maxW = 0, maxH = 0;
  for (const s of sizes) {
    area += (s.w + m) * (s.h + m);
    maxW = Math.max(maxW, s.w);
    maxH = Math.max(maxH, s.h);
  }
  const order = sizes.map((_, i) => i).sort((a, b) => sizes[b].w * sizes[b].h - sizes[a].w * sizes[a].h);

  // distance between two rects (0 when touching/overlapping), on the repeating block
  const dist = (ax: number, ay: number, a: { w: number; h: number }, bx: number, by: number, b: { w: number; h: number }) => {
    const dx = Math.max(bx - (ax + a.w), ax - (bx + b.w), 0);
    const dy = Math.max(by - (ay + a.h), ay - (by + b.h), 0);
    return Math.hypot(dx, dy);
  };

  for (let attempt = 0; attempt < 60; attempt++, density *= 0.96) {
    const total = area / density;
    const pw = Math.max(Math.sqrt(total * aspect), maxW + 2 * m + 40);
    const ph = Math.max(total / Math.sqrt(total * aspect), maxH + 2 * m + 40);
    const rnd = seededRandom(seed + attempt * 977);
    const pos: { x: number; y: number }[] = new Array(n);
    const placed: number[] = [];
    let ok = true;

    for (const i of order) {
      const a = sizes[i];
      // try many random spots; among the free ones pick (one of) the tightest, so gaps stay small
      const cands: { x: number; y: number; d: number }[] = [];
      for (let t = 0; t < 900 && cands.length < 28; t++) {
        const x = rnd() * pw;
        const y = rnd() * ph;
        let hit = false;
        let near = Infinity;
        for (const j of placed) {
          const b = sizes[j];
          const p = pos[j];
          for (let ox = -1; ox <= 1 && !hit; ox++)
            for (let oy = -1; oy <= 1 && !hit; oy++) {
              const bx = p.x + ox * pw;
              const by = p.y + oy * ph;
              if (x < bx + b.w + m && x + a.w + m > bx && y < by + b.h + m && y + a.h + m > by) hit = true;
              else near = Math.min(near, dist(x, y, a, bx, by, b));
            }
          if (hit) break;
        }
        if (!hit) cands.push({ x, y, d: near });
      }
      if (!cands.length) { ok = false; break; }
      cands.sort((u, v) => u.d - v.d);
      const pick = cands[Math.floor(rnd() * Math.min(3, cands.length))];
      pos[i] = { x: pick.x, y: pick.y };
      placed.push(i);
    }
    if (ok) return { pos, pw, ph };
  }
  // last resort (should never happen): lay them out in a simple grid
  const cols = Math.ceil(Math.sqrt(n));
  const cw = maxW + m, ch = maxH + m;
  return {
    pos: sizes.map((_, i) => ({ x: (i % cols) * cw, y: Math.floor(i / cols) * ch })),
    pw: cols * cw,
    ph: Math.ceil(n / cols) * ch,
  };
}
