import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const token: string | null = localStorage.getItem("authToken");

  // Agar already logged in hai to dashboard bhejo
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
