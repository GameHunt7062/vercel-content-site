export type Pt = [number, number];

export type Warp = {
  /** flat layout point -> point on the curved "TV glass" */
  fwd: (x: number, y: number) => Pt;
  /** point on the glass -> flat layout point (exact inverse, used so dragging feels 1:1 under the cursor) */
  inv: (x: number, y: number) => Pt;
};

/**
 * Barrel / "old CRT" lens (optics-compensation style).
 *
 *  - (lx, ly) is the lens centre: that point never moves.
 *  - R   is the distance from the lens centre to the farthest screen corner.
 *  - k   is the curve strength (0 = flat, ~0.2 gentle, ~0.35 TV, 0.6 fisheye).
 *  - over: the content that sits `over` * R away from the centre ends up exactly on the screen corner,
 *          so we always see a bit MORE than the flat screen would (that is what a bulging tube does).
 *
 * radial map:  d = m * r / sqrt(1 + k r^2)      (always increasing, so nothing ever folds over itself)
 */
export function makeWarp(lx: number, ly: number, R: number, k: number, over = 1.3): Warp {
  const m = Math.sqrt(1 + k * over * over) / over;
  const m2 = m * m;
  return {
    fwd(x, y) {
      const ux = (x - lx) / R;
      const uy = (y - ly) / R;
      const f = m / Math.sqrt(1 + k * (ux * ux + uy * uy));
      return [lx + R * ux * f, ly + R * uy * f];
    },
    inv(x, y) {
      const dx = (x - lx) / R;
      const dy = (y - ly) / R;
      const f = 1 / Math.sqrt(Math.max(m2 - k * (dx * dx + dy * dy), 0.02));
      return [lx + R * dx * f, ly + R * dy * f];
    },
  };
}

/**
 * CSS matrix3d that maps a w x h element (transform-origin: 0 0) onto an arbitrary convex quad.
 * Quad corners in order: top-left, top-right, bottom-right, bottom-left, as [x0,y0,x1,y1,x2,y2,x3,y3].
 * (Paul Heckbert's square-to-quad projective mapping.) Returns null when the quad is degenerate.
 */
export function quadToMatrix3d(p: number[], w: number, h: number): string | null {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = p;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a: number, b: number, d: number, e: number, g: number, hh: number;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = x1 - x0; b = x2 - x1; d = y1 - y0; e = y2 - y1; g = 0; hh = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-9) return null;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    hh = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + hh * x3;
    d = y1 - y0 + g * y1; e = y3 - y0 + hh * y3;
  }
  if (![a, b, d, e, g, hh].every(Number.isFinite)) return null;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${x0},${y0},0,1)`;
}
