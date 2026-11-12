"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Pages that are full-screen "TV" scenes and must not show the site navigation bar. */
const HIDE_ON = ["/art", "/articles"];

export default function NavGate({ children }: { children: ReactNode }) {
  const path = (usePathname() || "/").replace(/\/+$/, "") || "/";
  if (HIDE_ON.includes(path)) return null;
  return <>{children}</>;
}
