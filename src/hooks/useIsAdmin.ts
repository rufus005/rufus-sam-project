import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Server-verified admin check.
 *
 * Queries the `user_roles` table (protected by RLS) for an `admin` row
 * belonging to the current user. This is the SOURCE OF TRUTH for admin
 * access — the client-side email allow-list is only a UX hint and must
 * never be used to gate sensitive UI or data on its own.
 *
 * Returns:
 *  - isAdmin: boolean | null  (null while loading)
 *  - loading: boolean
 */
export function useIsAdmin(): { isAdmin: boolean | null; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (authLoading) return;
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[useIsAdmin] role check failed:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
      setLoading(false);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || loading };
}
