/** ISO string (UTC) -> value for <input type="datetime-local"> in the viewer's local timezone */
export function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** value of <input type="datetime-local"> (local time) -> ISO string, or "" if empty/invalid */
export function fromLocalInput(v: string) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

export function formatDate(d: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone }).format(d);
}

export function formatDateTime(d: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true, timeZone,
  }).format(d);
}

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago"... (also handles future dates: "in 2 days") */
export function timeAgo(date: Date, now: number = Date.now()) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = Math.round((now - date.getTime()) / 1000);
  const sign = diff >= 0 ? -1 : 1;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  const min = Math.floor(abs / 60);
  if (min < 60) return rtf.format(sign * min, "minute");
  const hr = Math.floor(min / 60);
  if (hr < 24) return rtf.format(sign * hr, "hour");
  const day = Math.floor(hr / 24);
  if (day < 7) return rtf.format(sign * day, "day");
  if (day < 30) return rtf.format(sign * Math.floor(day / 7), "week");
  if (day < 365) return rtf.format(sign * Math.floor(day / 30), "month");
  return rtf.format(sign * Math.floor(day / 365), "year");
}
