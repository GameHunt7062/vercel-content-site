import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminOnly } from "@/components/admin/AdminProvider";
import { getAdminUser } from "@/lib/admin";
import {
  normalizeHomeProfile,
  safeHref,
  socialLabel,
  socialUrl,
  SOCIALS,
  type GlyphKey,
  type LinkItem,
} from "@/lib/homeProfile";
import {
  GlyphArt,
  GlyphArticles,
  GlyphChevron,
  GlyphExplore,
  GlyphExternal,
  GlyphLink,
  GlyphProject,
  GlyphWave,
  BRAND_ICONS,
} from "./icons";
import { SHAPES, type ShapeKey } from "./shapes";
import "./home-profile.css";

const GLYPHS: Record<GlyphKey, (p: { className?: string }) => ReactNode> = {
  articles: GlyphArticles,
  art: GlyphArt,
  project: GlyphProject,
  link: GlyphLink,
};

const CARD = "hp-card border bg-rawme-tint p-6 md:p-8 flex flex-col";

/** Icon badge: coloured soft shape (clover / cookie / hexagon) with the glyph on top. */
function Badge({ shape, tone = "", children }: { shape: ShapeKey; tone?: "" | "pink" | "white"; children: ReactNode }) {
  return (
    <span className={`hp-badge ${tone ? `hp-badge--${tone}` : ""}`}>
      <svg className="hp-badge-shape" viewBox="-1 -1 2 2" aria-hidden="true">
        <path d={SHAPES[shape]} fill="currentColor" />
      </svg>
      <span className="hp-badge-glyph">{children}</span>
    </span>
  );
}

function Card({ icon, shape, tone = "", title, children }: { icon: ReactNode; shape: ShapeKey; tone?: "" | "pink"; title: string; children: ReactNode }) {
  return (
    <div className={CARD}>
      <Badge shape={shape} tone={tone}>{icon}</Badge>
      <h2 className="hp-title mt-5 mb-6 text-3xl md:text-[2.1rem] text-rawme-blue">{title}</h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

/** Row that links to a page of this site (/articles) or an outside URL. */
function LinkRow({ item }: { item: LinkItem }) {
  const href = safeHref(item.href);
  const external = /^https?:\/\//i.test(href);
  const Glyph = GLYPHS[item.icon] ?? GlyphLink;

  const body = (
    <>
      <span className="hp-row-icon">{item.image ? <img src={item.image} alt="" /> : <Glyph />}</span>
      <span className="min-w-0">
        <span className="block font-semibold leading-tight truncate">{item.title}</span>
        {item.subtitle && <span className="block text-sm text-zinc-600 leading-snug">{item.subtitle}</span>}
      </span>
      {href && (external ? <GlyphExternal className="hp-row-go" /> : <GlyphChevron className="hp-row-go" />)}
    </>
  );

  if (!href) return <div className="hp-row">{body}</div>;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hp-row">{body}</a>
  ) : (
    <Link href={href} className="hp-row">{body}</Link>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-rawme-blue/40 px-4 py-3 text-sm text-zinc-500">{text}</p>;
}

export default async function HomeProfile() {
  const supabase = await createClient();
  // If the table isn't created yet this just errors -> we fall back to DEFAULTS (site never breaks)
  const { data: row } = await supabase.from("home_profile").select("data").eq("id", 1).maybeSingle();
  const p = normalizeHomeProfile(row?.data);
  const isAdmin = !!(await getAdminUser());

  const gallery = p.gallery.items.filter((i) => i.title.trim());
  const made = p.made.items.filter((i) => i.title.trim());
  const find = p.find.items.filter((i) => i.value.trim());
  const bullets = p.intro.bullets.map((b) => b.trim()).filter(Boolean);

  return (
    <section className={`relative z-10 max-w-6xl mx-auto px-6 ${p.intro.visible && p.intro.image ? "pt-32 md:pt-44" : "pt-12 md:pt-16"}`}>
      <AdminOnly>
        <Link
          href="/admin/home"
          className="absolute right-6 top-3 z-10 rounded-md bg-rawme-pink px-2.5 py-1 text-xs font-medium text-white hover:bg-rawme-blue"
        >
          Edit sections
        </Link>
      </AdminOnly>

      <div className="stagger grid items-stretch gap-5 md:grid-cols-2">
        {/* 1 · I'm Rawme Arzu */}
        {p.intro.visible && (
          <div className={`${CARD} hp-intro min-h-[17rem] md:min-h-[18rem] justify-between`}>
            {p.intro.image && (
              <span className="hp-intro-pop">
                <img src={p.intro.image} alt="" className="hp-intro-img" />
              </span>
            )}
            <div className={`hp-intro-text ${p.intro.image ? "max-w-[54%] md:max-w-[52%]" : ""}`}>
              <Badge shape="clover" tone="pink"><GlyphWave /></Badge>
              <h2 className="hp-title mt-5 text-4xl md:text-[2.75rem]">{p.intro.title}</h2>
            </div>
            {bullets.length > 0 && (
              <ul className={`hp-intro-text mt-5 space-y-0.5 text-base md:text-lg ${p.intro.image ? "max-w-[54%] md:max-w-[52%]" : ""}`}>
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* 2 · Thoughts and Gallery */}
        {p.gallery.visible && (gallery.length > 0 || isAdmin) && (
          <Card icon={<GlyphArt />} shape="cookie" tone="pink" title={p.gallery.title}>
            {gallery.map((it) => <LinkRow key={it.id} item={it} />)}
            {gallery.length === 0 && <EmptyHint text="No links yet — use “Edit sections”." />}
          </Card>
        )}

        {/* 3 · Where to find me */}
        {p.find.visible && (find.length > 0 || isAdmin) && (
          <Card icon={<GlyphExplore />} shape="hexagon" title={p.find.title}>
            {find.map((it) => {
              const Brand = BRAND_ICONS[it.platform];
              const url = socialUrl(it);
              const body = (
                <>
                  <span className="hp-row-icon"><Brand /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-tight truncate">{socialLabel(it)}</span>
                    <span className="block text-sm text-zinc-600 leading-snug">{SOCIALS[it.platform].name}</span>
                  </span>
                  {url && <GlyphExternal className="hp-row-go" />}
                </>
              );
              return url ? (
                <a key={it.id} href={url} target="_blank" rel="noopener noreferrer" className="hp-row">{body}</a>
              ) : (
                <div key={it.id} className="hp-row">{body}</div>
              );
            })}
            {find.length === 0 && <EmptyHint text="No links yet — add your YouTube, Instagram, etc. from “Edit sections”." />}
          </Card>
        )}

        {/* 4 · What I've made */}
        {p.made.visible && (made.length > 0 || isAdmin) && (
          <Card icon={<GlyphProject />} shape="burst" tone="pink" title={p.made.title}>
            {made.map((it) => <LinkRow key={it.id} item={it} />)}
            {made.length === 0 && <EmptyHint text="Nothing here yet — add what you’ve made from “Edit sections”." />}
          </Card>
        )}
      </div>
    </section>
  );
}
