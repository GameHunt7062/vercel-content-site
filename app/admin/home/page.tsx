import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeHomeProfile } from "@/lib/homeProfile";
import HomeProfileForm from "@/components/admin/HomeProfileForm";

export default async function AdminHome() {
  if (!(await getAdminUser())) redirect("/login");

  const supabase = await createClient();
  const { data: row } = await supabase.from("home_profile").select("data").eq("id", 1).maybeSingle();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/admin" className="text-sm text-rawme-blue">← Admin</Link>
      <h1 className="text-3xl font-black mt-2 mb-1">Home page cards</h1>
      <p className="text-zinc-600 mb-6">Edit the 4 cards shown under the hero on the home page.</p>
      <HomeProfileForm initial={normalizeHomeProfile(row?.data)} />
    </main>
  );
}
