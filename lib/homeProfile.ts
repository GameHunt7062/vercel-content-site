/**
 * Data model for the "profile cards" section under the home-page hero.
 * Everything is stored as ONE json document in `public.home_profile` (row id = 1),
 * edited from /admin/home. If the table/row doesn't exist yet, DEFAULTS are shown.
 */

export type SocialPlatform = "youtube" | "instagram" | "github" | "discord" | "x" | "facebook";
export type GlyphKey = "articles" | "art" | "project" | "link";

export type SocialItem = {
  id: string;
  platform: SocialPlatform;
  /** username (e.g. "rawmearzu" / "@rawmearzu") OR a full https:// URL */
  value: string;
  /** optional text shown instead of the auto-detected username */
  label: string;
};

export type LinkItem = {
  id: string;
  title: string;
  subtitle: string;
  /** "/articles" (internal) or "https://..." (external) */
  href: string;
  icon: GlyphKey;
  /** optional uploaded image shown instead of the icon */
  image: string;
};

export type HomeProfile = {
  intro: { visible: boolean; title: string; bullets: string[]; image: string };
  gallery: { visible: boolean; title: string; items: LinkItem[] };
  find: { visible: boolean; title: string; items: SocialItem[] };
  made: { visible: boolean; title: string; items: LinkItem[] };
  footer: {
    visible: boolean;
    /** wordmark on the left */
    brand: string;
    /** contact button is shown only when the link below is filled (mailto:you@mail.com, you@mail.com or https://…) */
    contactLabel: string;
    contactHref: string;
    /** small transparent character that sits on the top edge of the footer */
    peekImage: string;
  };
};

export const SOCIALS: Record<SocialPlatform, { name: string; build: ((handle: string) => string) | null }> = {
  youtube: { name: "YouTube", build: (h) => `https://www.youtube.com/${h.startsWith("@") ? h : "@" + h}` },
  instagram: { name: "Instagram", build: (h) => `https://www.instagram.com/${h.replace(/^@/, "")}` },
  github: { name: "GitHub", build: (h) => `https://github.com/${h.replace(/^@/, "")}` },
  // Discord usernames have no public profile URL -> shown as plain text unless you paste an invite/profile link
  discord: { name: "Discord", build: null },
  x: { name: "X", build: (h) => `https://x.com/${h.replace(/^@/, "")}` },
  facebook: { name: "Facebook", build: (h) => `https://www.facebook.com/${h.replace(/^@/, "")}` },
};

export const PLATFORM_ORDER = Object.keys(SOCIALS) as SocialPlatform[];
export const GLYPH_OPTIONS: { key: GlyphKey; name: string }[] = [
  { key: "articles", name: "Articles" },
  { key: "art", name: "Art" },
  { key: "project", name: "Project" },
  { key: "link", name: "Link" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export const DEFAULTS: HomeProfile = {
  intro: {
    visible: true,
    title: "I'm Rawme Arzu",
    bullets: ["i write articles", "i make artwork", "i share my thoughts and things"],
    image: "",
  },
  gallery: {
    visible: true,
    title: "Thoughts and Gallery",
    items: [
      { id: "d-articles", title: "Articles", subtitle: "Thoughts, stories and write-ups", href: "/articles", icon: "articles", image: "" },
      { id: "d-art", title: "Arts", subtitle: "Artwork and illustrations", href: "/art", icon: "art", image: "" },
    ],
  },
  find: {
    visible: true,
    title: "Where to find me",
    // empty values are hidden on the public page - fill the ones you use from /admin/home
    items: PLATFORM_ORDER.map((p) => ({ id: "d-" + p, platform: p, value: "", label: "" })),
  },
  made: { visible: true, title: "What I've made", items: [] },
  footer: { visible: true, brand: "RAWME ARZU", contactLabel: "Contact", contactHref: "", peekImage: "" },
};

/* ---------- helpers ---------- */

export function isUrl(v: string) {
  return /^https?:\/\//i.test(v.trim());
}

/** Only allow http(s) links and site-internal paths (blocks javascript: etc.). Returns "" when unsafe. */
export function safeHref(v: string) {
  const s = (v ?? "").trim();
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  if (isUrl(s)) return s;
  if (/^mailto:[^\s]+$/i.test(s)) return s;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(s)) return "mailto:" + s; // plain e-mail address
  // "example.com/me" typed without protocol
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(s)) return "https://" + s;
  return "";
}

export function socialUrl(item: Pick<SocialItem, "platform" | "value">) {
  const v = item.value.trim();
  if (!v) return "";
  if (isUrl(v)) return v;
  const build = SOCIALS[item.platform]?.build;
  return build ? build(v) : "";
}

/** Text shown on the row: custom label > username typed > last part of the pasted URL. */
export function socialLabel(item: Pick<SocialItem, "value" | "label">) {
  if (item.label.trim()) return item.label.trim();
  const v = item.value.trim();
  if (!isUrl(v)) return v;
  try {
    const parts = new URL(v).pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? decodeURIComponent(last) : new URL(v).hostname.replace(/^www\./, "");
  } catch {
    return v;
  }
}

/* ---------- normalize whatever is stored in the DB into a complete HomeProfile ---------- */

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const bool = (v: unknown, fallback = true) => (typeof v === "boolean" ? v : fallback);
const list = <T,>(v: unknown, map: (x: any) => T, fallback: T[]): T[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === "object").map(map) : fallback;
const glyph = (v: unknown, fallback: GlyphKey): GlyphKey =>
  GLYPH_OPTIONS.some((g) => g.key === v) ? (v as GlyphKey) : fallback;

function linkItem(x: any, defIcon: GlyphKey): LinkItem {
  return {
    id: str(x.id) || uid(),
    title: str(x.title),
    subtitle: str(x.subtitle),
    href: str(x.href),
    icon: glyph(x.icon, defIcon),
    image: str(x.image),
  };
}

export function normalizeHomeProfile(raw: unknown): HomeProfile {
  const r = (raw && typeof raw === "object" ? raw : {}) as any;
  const d = DEFAULTS;

  return {
    intro: {
      visible: bool(r.intro?.visible),
      title: str(r.intro?.title, d.intro.title),
      bullets: Array.isArray(r.intro?.bullets) ? r.intro.bullets.filter((b: unknown) => typeof b === "string") : d.intro.bullets,
      image: str(r.intro?.image, d.intro.image),
    },
    gallery: {
      visible: bool(r.gallery?.visible),
      title: str(r.gallery?.title, d.gallery.title),
      items: list(r.gallery?.items, (x) => linkItem(x, "link"), d.gallery.items),
    },
    find: {
      visible: bool(r.find?.visible),
      title: str(r.find?.title, d.find.title),
      items: list(
        r.find?.items,
        (x): SocialItem => ({
          id: str(x.id) || uid(),
          platform: PLATFORM_ORDER.includes(x.platform) ? x.platform : "youtube",
          value: str(x.value),
          label: str(x.label),
        }),
        d.find.items
      ),
    },
    made: {
      visible: bool(r.made?.visible),
      title: str(r.made?.title, d.made.title),
      items: list(r.made?.items, (x) => linkItem(x, "project"), d.made.items),
    },
    footer: {
      visible: bool(r.footer?.visible),
      brand: str(r.footer?.brand, d.footer.brand),
      contactLabel: str(r.footer?.contactLabel, d.footer.contactLabel),
      contactHref: str(r.footer?.contactHref, d.footer.contactHref),
      peekImage: str(r.footer?.peekImage, d.footer.peekImage),
    },
  };
}

export function newId() {
  return uid();
}
