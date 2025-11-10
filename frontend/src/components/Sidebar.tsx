// frontend/src/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom"; // Usaremos NavLink para el estado activo
import "./Sidebar.css"; // Crearemos este CSS

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">🎯 CareerGenius</div>
      <ul className="sidebar-menu">
        {/* NavLink añade la clase 'active' automáticamente */}
        <li>
          <NavLink to="/dashboard" end>
            🏠 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/vocational-test">🎓 Test Vocacional</NavLink>
        </li>
        <li>
          <NavLink to="/job-search">💼 Búsqueda de Empleo</NavLink>
        </li>
        <li>
          <NavLink to="/interview-simulator">🗣️ Simulador Entrevista</NavLink>
        </li>
        <li>
          <NavLink to="/skills-development">
            🛠️ Desarrollo de Habilidades
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings">⚙️ Configuración</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
