import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If provided, only users whose role is in this list may view the route.
   * If omitted, any logged-in user (any role) may view it.
   */
  allowedRoles?: Array<"student" | "landlord">;
}

/**
 * Guards a route so it can only be viewed by someone who is:
 *  1) actually logged in (has a saved token + user), and
 *  2) has the correct role for that page (student pages vs landlord pages).
 *
 * - Not logged in at all -> sent back to the landing page ("/").
 * - Logged in but wrong role (e.g. a landlord opening a /student/* URL)
 *   -> sent to THEIR OWN dashboard instead of the one they tried to open.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // Not logged in — no token or no saved user record.
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Logged in, but this page isn't meant for their role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "student" ? "/student/dashboard" : "/landlord/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
