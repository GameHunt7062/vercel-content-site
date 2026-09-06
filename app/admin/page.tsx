import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin";

export default async function Admin() {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  return <main className="max-w-5xl mx-auto px-6 py-12">
    <h1 className="text-4xl font-black">Admin Dashboard</h1>
    <div className="grid md:grid-cols-3 gap-5 mt-8">
      <Link href="/admin/articles/new" className="border bg-white dark:bg-zinc-900 rounded-xl p-6 font-semibold">+ New Article</Link>
      <Link href="/admin/artwork/new" className="border bg-white dark:bg-zinc-900 rounded-xl p-6 font-semibold">+ Upload Artwork</Link>
      <Link href="/articles" className="border bg-white dark:bg-zinc-900 rounded-xl p-6 font-semibold">View Website</Link>
    </div>
  </main>;
}
