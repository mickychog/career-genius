// frontend/src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Muestra algo mientras se verifica el token
    return <div>Cargando autenticación...</div>;
  }

  if (!isAuthenticated) {
    // Si no está autenticado, redirige a /login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el componente hijo (ej. DashboardPage)
  return <Outlet />;
};

export default ProtectedRoute;
