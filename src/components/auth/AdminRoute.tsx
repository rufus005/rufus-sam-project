import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminEmail } from "@/config/admins";

/**
 * Admin route guard. Access allowed only when the logged-in user's email
 * matches the predefined admin list (case-insensitive). Everyone else is
 * redirected to the home page.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdminEmail(user.email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
