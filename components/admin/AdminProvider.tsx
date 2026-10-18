"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const AdminContext = createContext(false);

/**
 * Keeps "is this visitor an admin?" in sync with the browser's saved Supabase
 * session, so edit buttons appear on every page right after login — no need
 * to revisit /admin. `initialIsAdmin` comes from the server to avoid flicker.
 * NOTE: this only controls what the UI shows. Real security is Supabase RLS.
 */
export function AdminProvider({
  initialIsAdmin,
  children,
}: {
  initialIsAdmin: boolean;
  children: ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function check(userId?: string) {
      if (!userId) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      // On a network error keep the current state instead of hiding the buttons.
      if (error || cancelled) return;
      setIsAdmin(!!data);
    }

    supabase.auth.getSession().then(({ data }) => check(data.session?.user.id));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: don't call Supabase inside the auth callback itself.
      setTimeout(() => check(session?.user.id), 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>;
}

export function useIsAdmin() {
  return useContext(AdminContext);
}

export function AdminOnly({ children }: { children: ReactNode }) {
  return useIsAdmin() ? <>{children}</> : null;
}
