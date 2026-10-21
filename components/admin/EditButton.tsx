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
        className="rounded-lg bg-rawme-pink text-white px-4 py-2 text-sm font-medium hover:bg-rawme-blue"
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
        className="absolute top-2 right-2 z-10 rounded-md bg-rawme-pink text-white text-xs font-medium px-2.5 py-1 hover:bg-rawme-blue"
      >
        Edit
      </Link>
    </AdminOnly>
  );
}
