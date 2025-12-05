import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Opcional: Puedes poner un spinner aquí si quieres evitar el parpadeo
    return null;
  }

  // Si el usuario YA está autenticado, lo mandamos al Dashboard
  // y no le dejamos ver las páginas públicas de entrada.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, renderiza la página hija (Outlet)
  return <Outlet />;
};

export default PublicRoute;
