"use client";

import { useRef, useState } from "react";
import { removeFromStorage, uploadImage } from "@/lib/artwork";

/** Optional cover image for an article (also used as the link-preview image when shared). */
export default function CoverImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const uploaded = useRef<Set<string>>(new Set()); // files uploaded during this editing session

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
    <div className="rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
      <p className="mb-2 text-sm font-semibold">Cover image <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional · shown on top and in link previews)</span></p>
      {value && <img src={value} alt="" className="mb-3 max-h-56 rounded-lg" />}
      <div className="flex gap-2">
        <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {value && (
          <button type="button" disabled={busy} onClick={async () => { await dropIfTemporary(value); onChange(""); }} className="rounded-lg border border-red-400 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
