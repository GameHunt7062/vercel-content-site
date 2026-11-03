export type LayoutItem = {
  id: string;
  /** columns crossed (already capped to the column count) */
  span: number;
  /** rendered height in px */
  h: number;
  /** fixed start column; leave empty to let the item pick the best spot automatically */
  pin?: number | null;
};

export type Placed = { col: number; y: number };

/**
 * Masonry with column spans. Items are placed in the given order:
 *  - pinned item -> its own column (clamped so it still fits), stacked under whatever is already there
 *  - free item   -> the column window where it ends up highest (ties: least wasted space, then leftmost)
 * Nothing ever overlaps, and free items never leave a gap bigger than a spanned item forces.
 */
export function computeLayout(items: LayoutItem[], cols: number, gap: number) {
  const colH: number[] = new Array(cols).fill(0);
  const pos: Record<string, Placed> = {};

  for (const it of items) {
    const span = Math.min(Math.max(1, it.span), cols);
    const top = (c: number) => {
      let m = 0;
      for (let k = 0; k < span; k++) m = Math.max(m, colH[c + k]);
      return m;
    };

    let col = 0;
    if (it.pin != null && it.pin >= 0) {
      col = Math.min(Math.floor(it.pin), cols - span);
    } else {
      let bestY = Infinity;
      let bestWaste = Infinity;
      for (let c = 0; c <= cols - span; c++) {
        const y = top(c);
        let waste = 0;
        for (let k = 0; k < span; k++) waste += y - colH[c + k];
        if (y < bestY - 0.5 || (Math.abs(y - bestY) <= 0.5 && waste < bestWaste - 0.5)) {
          bestY = y;
          bestWaste = waste;
          col = c;
        }
      }
    }

    const y = top(col);
    pos[it.id] = { col, y };
    for (let k = 0; k < span; k++) colH[col + k] = y + it.h + gap;
  }

  const height = items.length ? Math.max(0, Math.max(...colH) - gap) : 0;
  return { pos, height };
}
