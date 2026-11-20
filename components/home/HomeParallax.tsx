"use client";

import { useEffect } from "react";
import { initParallax } from "./parallax";

/** Renders nothing; just switches on the pinned-photo scroll effect for the [data-hb-pin] box of the bottom block. */
export default function HomeParallax() {
  useEffect(() => initParallax(), []);
  return null;
}
