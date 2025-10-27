// frontend/src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css"; // Crearemos este CSS

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="header-logo">
        🎯 CareerGenius
      </Link>
      <nav className="header-nav">
        {isAuthenticated && user ? (
          <>
            <span className="user-greeting">Hola, {user.name}</span>
            <button onClick={logout} className="logout-button">
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="nav-link register-link">
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
