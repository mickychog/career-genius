import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

// Definimos las props para controlar el menú en modo móvil
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  // Función para cerrar el menú automáticamente cuando se hace clic en un enlace
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    // La clase 'open' se añade dinámicamente para mostrar el menú en móvil
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Encabezado solo visible en móvil para cerrar el menú */}
      <div className="sidebar-header-mobile">
        <div className="sidebar-logo">🎯 CareerGenius</div>
        <button className="close-menu-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <ul className="sidebar-menu">
        {/* Dashboard Principal */}
        <li>
          <NavLink to="/dashboard" end onClick={handleLinkClick}>
            🏠 Dashboard
          </NavLink>
        </li>

        {/* El núcleo de la orientación */}
        <li>
          <NavLink to="/dashboard/vocational-test" onClick={handleLinkClick}>
            🎓 Test Vocacional
          </NavLink>
        </li>

        {/* Catálogo de Universidades */}
        <li>
          <NavLink to="/dashboard/university-search" onClick={handleLinkClick}>
            🏫 Búsqueda de Universidad
          </NavLink>
        </li>

        {/* Reemplazo del simulador por Aptitudes (Comentado según tu código) */}
        {/* <li>
          <NavLink to="/dashboard/aptitude-test" onClick={handleLinkClick}>
            🧠 Examen de Aptitudes
          </NavLink>
        </li> */}

        {/* Cursos Gratis y Capacitación */}
        <li>
          <NavLink to="/dashboard/skills-development" onClick={handleLinkClick}>
            🛠️ Desarrollo de Habilidades
          </NavLink>
        </li>

        {/* Configuración */}
        <li>
          <NavLink to="/dashboard/settings" onClick={handleLinkClick}>
            ⚙️ Configuración
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
