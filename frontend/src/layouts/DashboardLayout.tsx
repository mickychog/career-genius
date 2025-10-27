// frontend/src/layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom"; // Outlet renderiza la ruta hija
import Sidebar from "../components/Sidebar";
import "./DashboardLayout.css"; // Crearemos este CSS

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main-content">
        <Outlet /> {/* Aquí se renderizará DashboardPage, SettingsPage, etc. */}
      </div>
    </div>
  );
};

export default DashboardLayout;
