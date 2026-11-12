"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";

/** Google-Maps-style details panel that slides in from the left. */
export default function TvPanel({
  width, onClose, label, children,
}: {
  width: number | null; // null = full screen (phones)
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      className="tv-panel"
      role="dialog"
      aria-label={label}
      style={{ "--tv-panel-w": width ? `${width}px` : "100vw" } as CSSProperties}
    >
      <button type="button" className="tv-panel-close" onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="tv-panel-scroll">{children}</div>
    </aside>
  );
}
