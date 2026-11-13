import Link from "next/link";
import { AdminOnly } from "@/components/admin/AdminProvider";
import NavBrand from "@/components/NavBrand";

export default function Navbar() {
  return (
    <nav className="bg-rawme-blue text-white" style={{ animation: "slide-down .7s var(--ease-out) both" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavBrand />
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/articles" className="link-grow">Articles</Link>
          <Link href="/art" className="link-grow">Artwork</Link>
          <AdminOnly><Link href="/admin" className="link-grow font-semibold text-rawme-pink">Admin</Link></AdminOnly>
        </div>
      </div>
    </nav>
  );
}
