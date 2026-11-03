/** How many grid columns an artwork may cross on the /art page (1 = normal, 4 = full width on large screens). */
export const MAX_SPAN = 4;

export function normalizeSpan(v: unknown): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(MAX_SPAN, Math.max(1, n)) : 1;
}

/** The grid has 2 columns on phones, 3 on tablets, 4 on desktop, so a big span is capped per screen size. */
export function capSpan(v: unknown, cols: number): number {
  return Math.min(normalizeSpan(v), Math.max(1, cols));
}
