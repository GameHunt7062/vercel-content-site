"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { removeFromStorage } from "@/lib/artwork";

/** Admin-only delete (also enforced by Supabase RLS). Asks for confirmation first. */
export default function DeleteButton({
  table,
  id,
  name,
  kind,
  redirectTo,
  storageUrls = [],
}: {
  table: "articles" | "artworks";
  id: string;
  name: string;
  kind: "article" | "artwork";
  redirectTo: string;
  storageUrls?: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete this ${kind}?\n\n"${name}"\n\nThis cannot be undone.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
    if (error || !data?.length) {
      alert(error?.message ?? "Could not delete (not allowed or already deleted).");
      setBusy(false);
      return;
    }
    await removeFromStorage(storageUrls); // best effort: artwork image files
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={remove}
      className="rounded-lg border border-red-500 text-red-600 dark:text-red-400 px-5 py-3 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
    >
      {busy ? "Deleting..." : `Delete ${kind}`}
    </button>
  );
}
