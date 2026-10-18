import { createClient } from "@/lib/supabase/client";

const BUCKET = "artwork";

export function slugify(v: string) {
  const s = v
    .toLowerCase()
    .trim()
    .replace(/[_.]+/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "artwork";
}

/** "IMG_2031.final.jpg" -> "IMG_2031.final" */
export function fileToTitle(name: string) {
  return name.replace(/\.[^./\\]+$/, "").trim() || "Untitled";
}

/** Uploads one image and returns its public URL. Storage key is uuid + extension (safe for any file name). */
export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = (file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: "31536000",
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function pathFromUrl(url: string) {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

/** Best-effort delete of files from Storage (never throws). */
export async function removeFromStorage(urls: string[]) {
  const paths = urls.map(pathFromUrl).filter((p): p is string => !!p);
  if (!paths.length) return;
  try {
    await createClient().storage.from(BUCKET).remove(paths);
  } catch {}
}

async function uniqueSlug(base: string, taken: Set<string>) {
  const { data } = await createClient().from("artworks").select("slug").like("slug", `${base}%`);
  (data ?? []).forEach((r: { slug: string }) => taken.add(r.slug));
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  const slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

/** Inserts an artwork with a guaranteed-unique slug. Returns the slug. */
export async function insertArtwork(
  row: { title: string; description: string | null; category: string | null; images: string[] },
  taken: Set<string> = new Set()
) {
  const supabase = createClient();
  const base = slugify(row.title);
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? await uniqueSlug(base, taken) : `${base}-${crypto.randomUUID().slice(0, 6)}`;
    const { error } = await supabase
      .from("artworks")
      .insert({ ...row, slug, image_url: row.images[0] });
    if (!error) return slug;
    if (error.code !== "23505") throw new Error(error.message); // 23505 = slug already taken, retry
  }
  throw new Error("Could not generate a unique slug");
}
