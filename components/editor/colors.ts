const SHADES: Record<string, [string, string, string, string]> = {
  red: ["#fca5a5", "#ef4444", "#b91c1c", "#7f1d1d"],
  orange: ["#fdba74", "#f97316", "#c2410c", "#7c2d12"],
  amber: ["#fcd34d", "#f59e0b", "#b45309", "#78350f"],
  yellow: ["#fde047", "#eab308", "#a16207", "#713f12"],
  lime: ["#bef264", "#84cc16", "#4d7c0f", "#365314"],
  green: ["#86efac", "#22c55e", "#15803d", "#14532d"],
  teal: ["#5eead4", "#14b8a6", "#0f766e", "#134e4a"],
  cyan: ["#67e8f9", "#06b6d4", "#0e7490", "#164e63"],
  blue: ["#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"],
  indigo: ["#a5b4fc", "#6366f1", "#4338ca", "#312e81"],
  violet: ["#c4b5fd", "#8b5cf6", "#6d28d9", "#4c1d95"],
  pink: ["#f9a8d4", "#ec4899", "#be185d", "#831843"],
};

const hues = Object.values(SHADES);

/** 12 columns x 5 rows: neutrals + brand colors, then light -> dark of 12 hues */
export const TEXT_COLORS: string[] = [
  "#000000", "#27272a", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8",
  "#ffffff", "#000cff", "#00a884", "#dc2626", "#ea580c", "#a855f7",
  ...[0, 1, 2, 3].flatMap((i) => hues.map((h) => h[i])),
];

/** 12 columns x 2 rows of highlighter colors */
export const HIGHLIGHT_COLORS: string[] = [
  ...hues.map((h) => h[0]),
  "#fecaca", "#fed7aa", "#fde68a", "#fef08a", "#d9f99d", "#bbf7d0",
  "#99f6e4", "#a5f3fc", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#fbcfe8",
];

/** "#abc" | "abc" | "rgb(1,2,3)" | "#AABBCC" -> "#aabbcc" (or null if invalid) */
export function normalizeHex(v?: string | null): string | null {
  if (!v) return null;
  let s = v.trim().toLowerCase();
  const rgb = s.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgb) return "#" + [rgb[1], rgb[2], rgb[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, "0")).join("");
  if (s[0] !== "#") s = "#" + s;
  if (/^#[0-9a-f]{3}$/.test(s)) s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

const KEY = "rawme:recent-colors";

export function loadRecentColors(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((c) => typeof c === "string").slice(0, 12) : [];
  } catch {
    return [];
  }
}

export function rememberColor(color: string): string[] {
  const hex = normalizeHex(color);
  if (!hex) return loadRecentColors();
  const next = [hex, ...loadRecentColors().filter((c) => c !== hex)].slice(0, 12);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}
