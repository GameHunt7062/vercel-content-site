"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { removeFromStorage, uploadImage } from "@/lib/artwork";
import DeleteButton from "@/components/admin/DeleteButton";
import RichEditor, { type EditorChange } from "@/components/editor/RichEditor";
import DateTimeField from "@/components/admin/DateTimeField";
import { docHasContent, textToDoc } from "@/lib/richtext";

type Slide = { key: string; url?: string; file?: File; preview: string };

export default function ArtworkEditForm({ artwork }: { artwork: any }) {
  const router = useRouter();
  const original: string[] = artwork.images?.length ? artwork.images : [artwork.image_url];

  const [title, setTitle] = useState<string>(artwork.title);
  // new rich description if present, otherwise the old plain-text description converted to paragraphs
  const initialDoc = artwork.description_json ?? (artwork.description ? textToDoc(artwork.description) : null);
  const [desc, setDesc] = useState<EditorChange>({ json: initialDoc, text: artwork.description ?? "" });
  const [publishedAt, setPublishedAt] = useState<string>(artwork.published_at ?? artwork.created_at ?? "");
  const [category, setCategory] = useState<string>(artwork.category ?? "");
  const [slides, setSlides] = useState<Slide[]>(original.map((url) => ({ key: url, url, preview: url })));
  const [busy, setBusy] = useState(false);

  const slidesRef = useRef<Slide[]>([]);
  useEffect(() => { slidesRef.current = slides; }, [slides]);
  useEffect(() => () => slidesRef.current.forEach((s) => s.file && URL.revokeObjectURL(s.preview)), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }));
    if (added.length) setSlides((prev) => [...prev, ...added]);
  }

  function removeSlide(key: string) {
    setSlides((prev) => {
      if (prev.length <= 1) { alert("An artwork needs at least one image."); return prev; }
      prev.filter((s) => s.key === key && s.file).forEach((s) => URL.revokeObjectURL(s.preview));
      return prev.filter((s) => s.key !== key);
    });
  }

  function move(index: number, dir: -1 | 1) {
    setSlides((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function save() {
    setBusy(true);
    const supabase = createClient();
    const newlyUploaded: string[] = [];
    const hasDesc = docHasContent(desc.json);
    try {
      const images: string[] = [];
      for (const s of slides) {
        if (s.url) images.push(s.url);
        else {
          const url = await uploadImage(s.file!);
          newlyUploaded.push(url);
          images.push(url);
        }
      }
      const { error } = await supabase
        .from("artworks")
        .update({
          title: title.trim() || artwork.title,
          description: hasDesc ? desc.text.trim() || null : null,
          description_json: hasDesc ? desc.json : null,
          published_at: publishedAt || artwork.published_at || artwork.created_at || new Date().toISOString(),
          category: category.trim() || null,
          image_url: images[0],
          images,
          updated_at: new Date().toISOString(),
        })
        .eq("id", artwork.id);
      if (error) throw new Error(error.message);

      // slides you removed -> delete their files from Storage (best effort)
      await removeFromStorage(original.filter((u) => !images.includes(u)));
      router.push(`/art/${artwork.slug}`);
      router.refresh();
    } catch (e: any) {
      await removeFromStorage(newlyUploaded);
      alert(e.message ?? String(e));
      setBusy(false);
    }
  }

  const n = slides.length;

  return (
    <div className="space-y-5">
      <div>
        <p className="font-semibold mb-2">Slides ({n})</p>
        <ul className="space-y-2">
          {slides.map((s, i) => (
            <li key={s.key} className="flex items-center gap-3 border rounded-xl p-2">
              <img src={s.preview} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
              <p className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">
                {i === 0 ? "Cover" : `Slide ${i + 1}`}{s.file ? ` · new (${s.file.name})` : ""}
              </p>
              <div className="flex gap-1 shrink-0">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} className="px-2 py-1 border rounded-md disabled:opacity-30" aria-label="Move up">↑</button>
                <button type="button" disabled={busy || i === n - 1} onClick={() => move(i, 1)} className="px-2 py-1 border rounded-md disabled:opacity-30" aria-label="Move down">↓</button>
                <button type="button" disabled={busy || n <= 1} onClick={() => removeSlide(s.key)} className="px-2 py-1 border rounded-md text-red-600 disabled:opacity-30" aria-label="Remove">✕</button>
              </div>
            </li>
          ))}
        </ul>
        <label className="inline-block mt-3 border rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
          + Add more images
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border rounded-lg p-3" />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="w-full border rounded-lg p-3" />
      <div>
        <p className="mb-2 text-sm font-semibold">Description <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span></p>
        <RichEditor initialContent={initialDoc ?? undefined} minHeight={200} placeholder="Write about this artwork…" onChange={setDesc} />
      </div>
      <DateTimeField value={publishedAt} onChange={setPublishedAt} />
      <button disabled={busy} onClick={save} className="bg-black text-white rounded-lg px-5 py-3 disabled:opacity-50">
        {busy ? "Saving..." : "Save Changes"}
      </button>

      <div className="pt-6 mt-2 border-t">
        <DeleteButton table="artworks" id={artwork.id} name={artwork.title} kind="artwork" redirectTo="/art" storageUrls={original} />
      </div>
    </div>
  );
}
