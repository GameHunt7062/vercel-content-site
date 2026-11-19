"use client";

import { useEffect } from "react";
import { initParallax } from "./parallax";

/** Renders nothing; just switches on the parallax for the [data-hb-px] elements of the bottom block. */
export default function HomeParallax() {
  useEffect(() => initParallax(), []);
  return null;
}
