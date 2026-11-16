/**
 * Soft "cookie / clover / hexagon" outlines used as icon badges (same idea as the Material 3
 * expressive shapes on bignut.zip). Each shape is a closed path in a -1..1 box, built once from a polar curve.
 */
export type ShapeKey = "clover" | "hexagon" | "pebble";

function path(radius: (t: number) => number, steps = 240) {
  let d = "";
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2 - Math.PI / 2; // start at the top
    const r = radius(t);
    d += `${i ? "L" : "M"}${(Math.cos(t) * r).toFixed(3)} ${(Math.sin(t) * r).toFixed(3)}`;
  }
  return d + "Z";
}

/** n lobes, amp = how deep the dips are */
const lobes = (n: number, amp: number) => (t: number) => (1 + amp * Math.cos(n * (t + Math.PI / 2))) / (1 + amp);

/** hexagon with rounded corners (sharp hexagon radius, averaged over a small angle window) */
const hexRaw = (t: number) => {
  const a = ((((t + Math.PI / 2 + Math.PI / 6) % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)) - Math.PI / 6; // -30°..30°
  return Math.cos(Math.PI / 6) / Math.cos(a); // 0.866 (edge) .. 1 (corner)
};
const hexagon = (window: number) => (t: number) => {
  let sum = 0;
  const n = 15;
  for (let k = -n; k <= n; k++) sum += hexRaw(t + (k / n) * window);
  return sum / (2 * n + 1);
};

export const SHAPES: Record<ShapeKey, string> = {
  clover: path(lobes(4, 0.2)), // 4-leaf clover (waving-hand badge)
  hexagon: path(hexagon(0.2)), // rounded hexagon
  pebble: path(lobes(3, 0.06)), // soft, slightly uneven blob
};
