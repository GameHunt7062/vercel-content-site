"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Pages that keep their own (light) look. Everything else gets the dark #1C1C31 page background.
 *  (The home page hero keeps its own artwork colours; it is not affected by this.) */
const KEEP_LIGHT = ["/art"];

export default function ThemeScope({ children }: { children: ReactNode }) {
  const path = (usePathname() || "/").replace(/\/+$/, "") || "/";
  return <div className={KEEP_LIGHT.includes(path) ? undefined : "dark"}>{children}</div>;
}
