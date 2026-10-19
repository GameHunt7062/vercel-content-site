"use client";

import { useEffect, useRef, useState } from "react";
import RichEditor from "./RichEditor";

type Props = {
  initialContent?: any;
  onSave: (content: any) => Promise<void>;
  saveLabel?: string;
};

const EMPTY = { type: "doc", content: [{ type: "paragraph" }] };

export default function ArticleEditor({ initialContent, onSave, saveLabel = "Save" }: Props) {
  const latest = useRef<any>(initialContent ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // warn before closing the tab with unsaved writing
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(latest.current);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
      }}
    >
      <RichEditor
        initialContent={initialContent}
        minHeight={500}
        placeholder="Start writing your article…"
        onChange={({ json }) => { latest.current = json; setDirty(true); }}
      />
      <div className="mt-4 flex items-center justify-end gap-3">
        {dirty && <span className="text-xs text-zinc-500 dark:text-zinc-400">Unsaved changes · Ctrl+S to save</span>}
        <button onClick={save} disabled={saving} className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-60 dark:bg-white dark:text-black">
          {saving ? "Saving..." : saveLabel}
        </button>
      </div>
    </div>
  );
}
