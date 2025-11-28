import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardLayout.css";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SidebarComponent = Sidebar as React.ComponentType<SidebarProps>;

const DashboardLayout = () => {
  // Estado para controlar el menú en móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Botón de Menú Móvil (Solo visible en celular) */}
      <div className="mobile-nav-bar">
        <button className="hamburger-btn" onClick={toggleMenu}>
          ☰
        </button>
        <span className="mobile-logo">🎯 CareerGenius</span>
      </div>

      {/* Sidebar con props para controlar su estado */}
      <SidebarComponent isOpen={isMobileMenuOpen} onClose={closeMenu} />

      {/* Overlay oscuro para cerrar el menú al hacer click afuera */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMenu}></div>
      )}

      <div className="dashboard-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
