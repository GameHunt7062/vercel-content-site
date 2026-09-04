"use client";

import { useRouter } from "next/navigation";

export default function EditButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-80"
    >
      {label}
    </button>
  );
}