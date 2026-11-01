/** How many grid columns an artwork may cross on the /art page (1 = normal, 4 = full width on large screens). */
export const MAX_SPAN = 4;

/**
 * Full class names on purpose (Tailwind only generates classes it can find as plain strings).
 * The grid is 2 columns on phones, 3 on tablets, 4 on desktop, so big spans are capped per screen size.
 */
const SPAN_CLASS: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2 md:col-span-3",
  4: "col-span-2 md:col-span-3 lg:col-span-4",
};

export function normalizeSpan(v: unknown): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(MAX_SPAN, Math.max(1, n)) : 1;
}

export function spanClass(v: unknown): string {
  return SPAN_CLASS[normalizeSpan(v)];
}
