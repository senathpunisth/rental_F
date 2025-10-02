// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Wrap any route that requires login.
 * If not logged in -> /signin with { state: { from: pathname } }
 */
export default function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  return children;
}
