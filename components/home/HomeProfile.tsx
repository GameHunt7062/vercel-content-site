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
  GlyphTouch,
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

const CARD = "hp-card border p-6 md:p-8 flex flex-col";

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

function Card({ icon, shape, tone = "", title, order, children }: { icon: ReactNode; shape: ShapeKey; tone?: "" | "pink"; title: string; order: number; children: ReactNode }) {
  return (
    <div className={CARD} style={{ order }}>
      <Badge shape={shape} tone={tone}>{icon}</Badge>
      <h2 className="hp-title mt-5 mb-6 text-3xl md:text-[2.1rem]">{title}</h2>
      <div className="hp-list">{children}</div>
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
        <span className="block font-medium text-[1.05rem] leading-tight truncate">{item.title}</span>
        {item.subtitle && <span className="block text-sm text-zinc-500 leading-snug">{item.subtitle}</span>}
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
    <section className="relative z-10 max-w-[88rem] mx-auto px-4 md:px-8 pt-28 md:pt-36">
      <AdminOnly>
        <Link
          href="/admin/home"
          className="absolute right-4 md:right-8 top-3 z-10 rounded-md bg-rawme-pink px-2.5 py-1 text-xs font-medium text-white hover:bg-rawme-blue"
        >
          Edit sections
        </Link>
      </AdminOnly>

      {/* Two independent columns (like bignut.zip): every card is only as tall as its own content.
          On phones the columns dissolve (`contents`) and `order` puts the cards back in 1-2-3-4 order. */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start">
        <div className="stagger contents md:flex md:flex-col md:gap-5">
          {/* 1 · I'm Rawme Arzu */}
          {p.intro.visible && (
            <div className={`${CARD} hp-intro min-h-[16rem] justify-between`} style={{ order: 1 }}>
              {p.intro.image && (
                <span className="hp-intro-pop">
                  <img src={p.intro.image} alt="" className="hp-intro-img" />
                </span>
              )}
              <div className="hp-intro-text">
                <Badge shape="clover" tone="pink"><GlyphWave /></Badge>
                <h2 className="hp-title mt-5 text-4xl md:text-[2.75rem]">{p.intro.title}</h2>
              </div>
              {bullets.length > 0 && (
                <ul className="hp-intro-text mt-5 space-y-0.5 text-base md:text-lg">
                  {bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          )}


          {/* 3 · What I've made */}
          {p.made.visible && (made.length > 0 || isAdmin) && (
            <Card order={3} icon={<GlyphProject />} shape="pebble" tone="pink" title={p.made.title}>
              {made.map((it) => <LinkRow key={it.id} item={it} />)}
              {made.length === 0 && <EmptyHint text="Nothing here yet — add what you’ve made from “Edit sections”." />}
            </Card>
          )}
        </div>

        <div className="stagger contents md:flex md:flex-col md:gap-5">
          {/* 2 · Thoughts and Gallery */}
          {p.gallery.visible && (gallery.length > 0 || isAdmin) && (
            <Card order={2} icon={<GlyphArt />} shape="hexagon" title={p.gallery.title}>
              {gallery.map((it) => <LinkRow key={it.id} item={it} />)}
              {gallery.length === 0 && <EmptyHint text="No links yet — use “Edit sections”." />}
            </Card>
          )}

          {/* 4 · Where to find me */}
          {p.find.visible && (find.length > 0 || isAdmin) && (
            <Card order={4} icon={<GlyphTouch />} shape="hexagon" title={p.find.title}>
              {find.map((it) => {
                const Brand = BRAND_ICONS[it.platform];
                const url = socialUrl(it);
                const body = (
                  <>
                    <span className="hp-row-icon"><Brand /></span>
                    <span className="min-w-0">
                      <span className="block font-medium text-[1.05rem] leading-tight truncate">{socialLabel(it)}</span>
                      <span className="block text-sm text-zinc-500 leading-snug">{SOCIALS[it.platform].name}</span>
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
        </div>
      </div>
    </section>
  );
}
