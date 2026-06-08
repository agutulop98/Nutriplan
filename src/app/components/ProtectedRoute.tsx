import { Navigate, Outlet } from "react-router";
import { useApp } from "../context/AppContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
