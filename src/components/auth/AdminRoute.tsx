import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isStaticAdminAuthed } from "@/config/staticAdmin";

/**
 * Simple static admin route guard — checks sessionStorage flag set by AdminLogin.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  if (!isStaticAdminAuthed()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
