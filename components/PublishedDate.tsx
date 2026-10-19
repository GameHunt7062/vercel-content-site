"use client";

import { useSyncExternalStore } from "react";
import { formatDate, formatDateTime, timeAgo } from "@/lib/date";

function subscribe(cb: () => void) {
  const t = setInterval(cb, 30_000); // keeps "5 minutes ago" fresh while the page is open
  return () => clearInterval(t);
}
const clientMinute = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => 0; // 0 = not hydrated yet (avoids server/browser timezone mismatch)

/** "19 Oct 2026 · 3 days ago" */
export default function PublishedDate({
  date, prefix = "Published", className = "",
}: { date?: string | null; prefix?: string; className?: string }) {
  const minute = useSyncExternalStore(subscribe, clientMinute, serverMinute);
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const live = minute !== 0;
  return (
    <p className={`text-sm text-zinc-500 dark:text-zinc-400 ${className}`}>
      {prefix && <>{prefix} </>}
      <time dateTime={d.toISOString()} title={live ? formatDateTime(d) : undefined}>
        {formatDate(d, live ? undefined : "UTC")}
      </time>
      {live && (
        <>
          <span aria-hidden> · </span>
          <span>{timeAgo(d, minute * 60_000)}</span>
        </>
      )}
    </p>
  );
}
