"use client";

import { useSyncExternalStore } from "react";
import { fromLocalInput, toLocalInput } from "@/lib/date";
import PublishedDate from "@/components/PublishedDate";

const noop = () => () => {};

/**
 * Edit the published date + time. `value` is an ISO string ("" = not set -> "now" on save).
 * The input itself shows the admin's local time.
 */
export default function DateTimeField({
  value, onChange, label = "Published date & time", emptyHint = "Leave empty to use the current time when saving.",
}: { value: string; onChange: (iso: string) => void; label?: string; emptyHint?: string }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="datetime-local"
          value={mounted ? toLocalInput(value) : ""}
          onChange={(e) => onChange(fromLocalInput(e.target.value))}
          className="rounded-lg border border-zinc-300 bg-transparent p-2 dark:border-zinc-700"
        />
        <button type="button" onClick={() => onChange(new Date().toISOString())} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Set to now
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Clear
          </button>
        )}
      </div>
      <div className="mt-2 min-h-5 text-xs">
        {value ? <PublishedDate date={value} prefix="Visitors will see:" className="!text-xs" /> : <span className="text-zinc-500 dark:text-zinc-400">{emptyHint}</span>}
      </div>
    </div>
  );
}
