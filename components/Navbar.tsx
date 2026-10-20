import Image from "next/image";
import Link from "next/link";
import { AdminOnly } from "@/components/admin/AdminProvider";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl" aria-label="Rawme Arzu - home">
          <Image src="/logo.png" alt="" width={36} height={36} priority className="h-9 w-9" />
          <span>Rawme Arzu</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/articles">Articles</Link>
          <Link href="/art">Artwork</Link>
          <AdminOnly><Link href="/admin" className="font-semibold">Admin</Link></AdminOnly>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
