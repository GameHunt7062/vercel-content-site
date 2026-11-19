"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { removeFromStorage, uploadImage } from "@/lib/artwork";
import {
  GLYPH_OPTIONS,
  PLATFORM_ORDER,
  SOCIALS,
  newId,
  type GlyphKey,
  type HomeProfile,
  type LinkItem,
  type SocialItem,
  type SocialPlatform,
} from "@/lib/homeProfile";

const inp = "w-full rounded-lg border border-zinc-300 bg-[#1c1c31] px-3 py-2 text-sm dark:border-zinc-600";
const btn = "rounded-lg border border-zinc-300 bg-[#1c1c31] px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-40 dark:border-zinc-600";

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function Panel({
  title,
  visible,
  onVisible,
  children,
}: {
  title: string;
  visible: boolean;
  onVisible: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-[#1c1c31] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--link)]">{title}</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={(e) => onVisible(e.target.checked)} />
          Show on home page
        </label>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function RowTools({ i, len, onMove, onRemove }: { i: number; len: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1">
      <button type="button" className={btn} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
      <button type="button" className={btn} disabled={i === len - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
      <button type="button" className={`${btn} border-red-400 text-red-600`} onClick={onRemove} aria-label="Remove">✕</button>
    </div>
  );
}

function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const uploaded = useRef<Set<string>>(new Set()); // uploaded in this editing session (safe to delete again)

  async function dropIfTemporary(url: string) {
    if (url && uploaded.current.has(url)) {
      uploaded.current.delete(url);
      await removeFromStorage([url]);
    }
  }

  async function pick(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      await dropIfTemporary(value);
      uploaded.current.add(url);
      onChange(url);
    } catch (e: any) {
      alert(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium">
        {label} {hint && <span className="font-normal text-zinc-500">({hint})</span>}
      </p>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="h-16 w-16 rounded-lg border bg-rawme-tint object-contain" />}
        <label className={`${btn} cursor-pointer`}>
          {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {value && (
          <button type="button" disabled={busy} className={`${btn} border-red-400 text-red-600`} onClick={async () => { await dropIfTemporary(value); onChange(""); }}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/** Editor for the two list cards that use the same row UI: "Thoughts and Gallery" and "What I've made". */
function LinkList({
  items,
  onChange,
  defaultIcon,
}: {
  items: LinkItem[];
  onChange: (items: LinkItem[]) => void;
  defaultIcon: GlyphKey;
}) {
  const set = (i: number, patch: Partial<LinkItem>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.id} className="space-y-3 rounded-xl border bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title"><input className={inp} value={it.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="Gramophone" /></Field>
            <Field label="Small text under title"><input className={inp} value={it.subtitle} onChange={(e) => set(i, { subtitle: e.target.value })} placeholder="What it is, in one line" /></Field>
            <Field label="Link (/articles or https://…)"><input className={inp} value={it.href} onChange={(e) => set(i, { href: e.target.value })} placeholder="https://example.com" /></Field>
            <Field label="Icon (used when no image is uploaded)">
              <select className={inp} value={it.icon} onChange={(e) => set(i, { icon: e.target.value as GlyphKey })}>
                {GLYPH_OPTIONS.map((g) => <option key={g.key} value={g.key}>{g.name}</option>)}
              </select>
            </Field>
          </div>
          <ImageField label="Custom icon image" hint="optional · small square works best" value={it.image} onChange={(image) => set(i, { image })} />
          <RowTools i={i} len={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, k) => k !== i))} />
        </div>
      ))}
      <button
        type="button"
        className={btn}
        onClick={() => onChange([...items, { id: newId(), title: "", subtitle: "", href: "", icon: defaultIcon, image: "" }])}
      >
        + Add row
      </button>
    </div>
  );
}

function collectImages(p: HomeProfile): string[] {
  return [p.intro.image, p.footer.peekImage, ...p.gallery.items.map((i) => i.image), ...p.made.items.map((i) => i.image)].filter(Boolean);
}

export default function HomeProfileForm({ initial }: { initial: HomeProfile }) {
  const router = useRouter();
  const [p, setP] = useState<HomeProfile>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const savedImages = useRef<string[]>(collectImages(initial)); // images that are currently live

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("home_profile")
      .upsert({ id: 1, data: p, updated_at: new Date().toISOString() });
    if (error) {
      setMsg({
        ok: false,
        text: /relation .*home_profile|schema cache/i.test(error.message)
          ? "Table `home_profile` doesn't exist yet. Run supabase/add-home-profile.sql in the Supabase SQL Editor first."
          : error.message,
      });
      setSaving(false);
      return;
    }
    // delete image files that were replaced/removed (best effort)
    const now = new Set(collectImages(p));
    await removeFromStorage(savedImages.current.filter((u) => !now.has(u)));
    savedImages.current = [...now];
    setMsg({ ok: true, text: "Saved ✓  The home page is updated." });
    setSaving(false);
    router.refresh();
  }

  const setIntro = (patch: Partial<HomeProfile["intro"]>) => setP((s) => ({ ...s, intro: { ...s.intro, ...patch } }));
  const setGallery = (patch: Partial<HomeProfile["gallery"]>) => setP((s) => ({ ...s, gallery: { ...s.gallery, ...patch } }));
  const setFind = (patch: Partial<HomeProfile["find"]>) => setP((s) => ({ ...s, find: { ...s.find, ...patch } }));
  const setFooter = (patch: Partial<HomeProfile["footer"]>) => setP((s) => ({ ...s, footer: { ...s.footer, ...patch } }));
  const setMade = (patch: Partial<HomeProfile["made"]>) => setP((s) => ({ ...s, made: { ...s.made, ...patch } }));

  const setSocial = (i: number, patch: Partial<SocialItem>) =>
    setFind({ items: p.find.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) });

  return (
    <div className="space-y-6">
      {/* 1 */}
      <Panel title="1 · Intro card" visible={p.intro.visible} onVisible={(visible) => setIntro({ visible })}>
        <Field label="Title"><input className={inp} value={p.intro.title} onChange={(e) => setIntro({ title: e.target.value })} /></Field>
        <div>
          <p className="mb-1 text-sm font-medium">Bullet points</p>
          <div className="space-y-2">
            {p.intro.bullets.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className={inp} value={b} onChange={(e) => setIntro({ bullets: p.intro.bullets.map((x, k) => (k === i ? e.target.value : x)) })} />
                <RowTools i={i} len={p.intro.bullets.length} onMove={(d) => setIntro({ bullets: move(p.intro.bullets, i, d) })} onRemove={() => setIntro({ bullets: p.intro.bullets.filter((_, k) => k !== i) })} />
              </div>
            ))}
            <button type="button" className={btn} onClick={() => setIntro({ bullets: [...p.intro.bullets, ""] })}>+ Add bullet</button>
          </div>
        </div>
        <ImageField label="Character image" hint="transparent PNG cutout · sits flush on the right and pops out above the card" value={p.intro.image} onChange={(image) => setIntro({ image })} />
      </Panel>

      {/* 2 */}
      <Panel title="2 · Thoughts and Gallery" visible={p.gallery.visible} onVisible={(visible) => setGallery({ visible })}>
        <Field label="Card title"><input className={inp} value={p.gallery.title} onChange={(e) => setGallery({ title: e.target.value })} /></Field>
        <LinkList items={p.gallery.items} defaultIcon="link" onChange={(items) => setGallery({ items })} />
      </Panel>

      {/* 3 */}
      <Panel title="3 · Where to find me" visible={p.find.visible} onVisible={(visible) => setFind({ visible })}>
        <Field label="Card title"><input className={inp} value={p.find.title} onChange={(e) => setFind({ title: e.target.value })} /></Field>
        <p className="text-sm text-zinc-500">
          Type a username (e.g. <code>rawmearzu</code>) or paste the full URL. Rows with an empty value are hidden on the website.
          Discord has no profile URL, so a plain username is shown as text (paste an invite link if you want it clickable).
        </p>
        <div className="space-y-3">
          {p.find.items.map((it, i) => (
            <div key={it.id} className="space-y-3 rounded-xl border bg-white/5 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Platform">
                  <select className={inp} value={it.platform} onChange={(e) => setSocial(i, { platform: e.target.value as SocialPlatform })}>
                    {PLATFORM_ORDER.map((k) => <option key={k} value={k}>{SOCIALS[k].name}</option>)}
                  </select>
                </Field>
                <Field label="Username or URL"><input className={inp} value={it.value} onChange={(e) => setSocial(i, { value: e.target.value })} placeholder="rawmearzu" /></Field>
                <Field label="Display text (optional)"><input className={inp} value={it.label} onChange={(e) => setSocial(i, { label: e.target.value })} placeholder="auto from username" /></Field>
              </div>
              <RowTools i={i} len={p.find.items.length} onMove={(d) => setFind({ items: move(p.find.items, i, d) })} onRemove={() => setFind({ items: p.find.items.filter((_, k) => k !== i) })} />
            </div>
          ))}
          <button type="button" className={btn} onClick={() => setFind({ items: [...p.find.items, { id: newId(), platform: "youtube", value: "", label: "" }] })}>+ Add link</button>
        </div>
      </Panel>

      {/* 4 */}
      <Panel title="4 · What I've made" visible={p.made.visible} onVisible={(visible) => setMade({ visible })}>
        <Field label="Card title"><input className={inp} value={p.made.title} onChange={(e) => setMade({ title: e.target.value })} /></Field>
        <LinkList items={p.made.items} defaultIcon="project" onChange={(items) => setMade({ items })} />
      </Panel>

      {/* footer */}
      <Panel title="5 · Footer (very bottom of home page)" visible={p.footer.visible} onVisible={(visible) => setFooter({ visible })}>
        <p className="text-sm text-zinc-500">The round social icons are taken automatically from “Where to find me” (rows with a link).</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name / wordmark (left side)"><input className={inp} value={p.footer.brand} onChange={(e) => setFooter({ brand: e.target.value })} /></Field>
          <span />
          <Field label="Contact button text"><input className={inp} value={p.footer.contactLabel} onChange={(e) => setFooter({ contactLabel: e.target.value })} /></Field>
          <Field label="Your email (or any contact link) — button opens this"><input className={inp} value={p.footer.contactHref} onChange={(e) => setFooter({ contactHref: e.target.value })} placeholder="you@gmail.com" /></Field>
        </div>
        <ImageField label="Peeking character" hint="optional · small transparent PNG that sits on the top edge of the footer" value={p.footer.peekImage} onChange={(peekImage) => setFooter({ peekImage })} />
      </Panel>

      <div className="sticky bottom-0 -mx-2 flex flex-wrap items-center gap-3 rounded-xl border bg-[#1c1c31]/95 p-3 backdrop-blur">
        <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-rawme-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-rawme-pink disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <Link href="/" className={btn}>View home page</Link>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
