import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">🎯 CareerGenius</div>
      <ul className="sidebar-menu">
        {/* Dashboard Principal */}
        <li>
          <NavLink to="/dashboard" end>
            🏠 Dashboard
          </NavLink>
        </li>

        {/* El núcleo de la orientación */}
        <li>
          <NavLink to="/dashboard/vocational-test">🎓 Test Vocacional</NavLink>
        </li>

        {/* NCatálogo de Universidades */}
        <li>
          <NavLink to="/dashboard/university-search">
            🏫 Búsqueda de Universidad
          </NavLink>
        </li>

        {/* Reemplazo del simulador por Aptitudes */}
        {/* <li>
          <NavLink to="/dashboard/aptitude-test">
            🧠 Examen de Aptitudes
          </NavLink>
        </li> */}

        {/* Cursos Gratis y Capacitación */}
        <li>
          <NavLink to="/dashboard/skills-development">
            🛠️ Desarrollo de Habilidades
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/settings">⚙️ Configuración</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
