import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps admin-only routes. Checks for authentication AND admin role
 * via the has_role RPC. Redirects non-admin users to home and
 * unauthenticated users to the admin login page.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  /** Verify admin role via server-side RPC (not client storage) */
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data, error }) => {
        if (error) {
          console.error("Admin role check failed:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      });
  }, [user]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
