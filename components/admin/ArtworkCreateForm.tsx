"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fileToTitle, insertArtwork, removeFromStorage, uploadImage } from "@/lib/artwork";

type Item = { id: string; file: File; title: string; preview: string };
type Mode = "bulk" | "slides";

export default function ArtworkCreateForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("bulk");
  const [items, setItems] = useState<Item[]>([]);
  const [slideTitle, setSlideTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const itemsRef = useRef<Item[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ id: crypto.randomUUID(), file, title: "", preview: URL.createObjectURL(file) }));
    if (added.length) setItems((prev) => [...prev, ...added]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      prev.filter((i) => i.id === id).forEach((i) => URL.revokeObjectURL(i.preview));
      return prev.filter((i) => i.id !== id);
    });
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function setItemTitle(id: string, title: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title } : i)));
  }

  async function submit() {
    if (!items.length) { alert("Select at least one image."); return; }
    setBusy(true);
    setErrors([]);
    const common = { description: description.trim() || null, category: category.trim() || null };
    const taken = new Set<string>();

    try {
      if (mode === "slides") {
        // ONE artwork, many slides
        const urls: string[] = [];
        try {
          for (let i = 0; i < items.length; i++) {
            setProgress(`Uploading image ${i + 1}/${items.length}…`);
            urls.push(await uploadImage(items[i].file));
          }
          const title = slideTitle.trim() || fileToTitle(items[0].file.name);
          const slug = await insertArtwork({ title, ...common, images: urls }, taken);
          router.push(`/art/${slug}`);
          router.refresh();
        } catch (e: any) {
          await removeFromStorage(urls);
          setErrors([e.message ?? String(e)]);
        }
        return;
      }

      // BULK: every image becomes its own artwork.
      // Inserted in reverse so the list on /art (newest first) shows them in the order selected here.
      const failed: string[] = [];
      const doneIds = new Set<string>();
      let lastSlug = "";
      const queue = [...items].reverse();
      for (let n = 0; n < queue.length; n++) {
        const it = queue[n];
        setProgress(`Uploading ${n + 1}/${queue.length}: ${it.file.name}`);
        let url = "";
        try {
          url = await uploadImage(it.file);
          const title = it.title.trim() || fileToTitle(it.file.name);
          lastSlug = await insertArtwork({ title, ...common, images: [url] }, taken);
          doneIds.add(it.id);
        } catch (e: any) {
          if (url) await removeFromStorage([url]);
          failed.push(`${it.file.name}: ${e.message ?? e}`);
        }
      }

      if (!failed.length) {
        router.push(items.length === 1 ? `/art/${lastSlug}` : "/art");
        router.refresh();
      } else {
        // keep only the failed ones so you can retry
        items.filter((i) => doneIds.has(i.id)).forEach((i) => URL.revokeObjectURL(i.preview));
        setItems((prev) => prev.filter((i) => !doneIds.has(i.id)));
        setErrors([`${doneIds.size} uploaded, ${failed.length} failed:`, ...failed]);
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  const n = items.length;
  const label = busy
    ? progress || "Uploading…"
    : mode === "bulk"
      ? `Upload ${n || ""} artwork${n === 1 ? "" : "s"}`.replace("  ", " ")
      : `Upload as 1 artwork (${n} slide${n === 1 ? "" : "s"})`;

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border overflow-hidden text-sm font-medium">
        {([["bulk", "Separate artworks"], ["slides", "One artwork with slides"]] as [Mode, string][]).map(([m, text]) => (
          <button
            key={m}
            type="button"
            disabled={busy}
            onClick={() => setMode(m)}
            className={`px-4 py-2 ${mode === m ? "bg-black text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
          >
            {text}
          </button>
        ))}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {mode === "bulk"
          ? "Every image becomes its own artwork. Title is optional — if empty, the file name is used."
          : "All images go into a single artwork as slides (variants). The first image is the cover."}
      </p>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        className="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span className="font-semibold">Click to choose images, or drag & drop</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">You can select many files at once</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
      </label>

      {mode === "slides" && (
        <input value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)} placeholder="Title (optional — first file name if empty)" className="w-full border rounded-lg p-3" />
      )}
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={mode === "bulk" ? "Category (optional, applied to all)" : "Category (optional)"} className="w-full border rounded-lg p-3" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={mode === "bulk" ? "Description (optional, applied to all)" : "Description (optional)"} className="w-full border rounded-lg p-3" />

      {n > 0 && (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={it.id} className="flex items-center gap-3 border rounded-xl p-2">
              <img src={it.preview} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {mode === "slides" && i === 0 ? "Cover · " : mode === "slides" ? `Slide ${i + 1} · ` : ""}
                  {it.file.name}
                </p>
                {mode === "bulk" && (
                  <input
                    value={it.title}
                    onChange={(e) => setItemTitle(it.id, e.target.value)}
                    placeholder={fileToTitle(it.file.name)}
                    disabled={busy}
                    className="w-full border rounded-md px-2 py-1 mt-1 text-sm"
                  />
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} className="px-2 py-1 border rounded-md disabled:opacity-30" aria-label="Move up">↑</button>
                <button type="button" disabled={busy || i === n - 1} onClick={() => move(i, 1)} className="px-2 py-1 border rounded-md disabled:opacity-30" aria-label="Move down">↓</button>
                <button type="button" disabled={busy} onClick={() => removeItem(it.id)} className="px-2 py-1 border rounded-md text-red-600" aria-label="Remove">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-300 text-red-600 dark:text-red-400 p-3 text-sm space-y-1">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      <button disabled={busy || !n} onClick={submit} className="bg-black text-white rounded-lg px-5 py-3 disabled:opacity-50">
        {label}
      </button>
    </div>
  );
}
