import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token: string | null = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
