import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/**
 * Admin route guard.
 *
 * Access is granted ONLY when the database confirms the user has the
 * `admin` role in `public.user_roles`. The check runs server-side via
 * Supabase (RLS-protected), so users cannot bypass it by tampering with
 * client state, localStorage, or the email allow-list.
 *
 * Non-admins are redirected to the home page; unauthenticated users are
 * sent to the admin login.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  if (authLoading || roleLoading) {
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
