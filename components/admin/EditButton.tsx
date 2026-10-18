"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminOnly } from "@/components/admin/AdminProvider";

/** Big button for detail pages. Renders only for admins. */
export default function EditButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <AdminOnly>
      <button
        onClick={() => router.push(href)}
        className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-80"
      >
        {label}
      </button>
    </AdminOnly>
  );
}

/** Small corner pill for cards in lists. Parent must be `relative`. */
export function EditLink({ href }: { href: string }) {
  return (
    <AdminOnly>
      <Link
        href={href}
        className="absolute top-2 right-2 z-10 rounded-md bg-black/80 text-white text-xs font-medium px-2.5 py-1 hover:bg-black"
      >
        Edit
      </Link>
    </AdminOnly>
  );
}
