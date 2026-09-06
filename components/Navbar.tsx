import Link from "next/link";
import { getAdminUser } from "@/lib/admin";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Navbar() {
  const admin = await getAdminUser();

  return (
    <nav className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">My Site</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/articles">Articles</Link>
          <Link href="/art">Artwork</Link>
          {admin && <Link href="/admin" className="font-semibold">Admin</Link>}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
