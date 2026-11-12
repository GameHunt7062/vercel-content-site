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
