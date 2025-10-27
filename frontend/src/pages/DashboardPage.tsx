// frontend/src/pages/DashboardPage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext"; // Para obtener datos del usuario

const DashboardPage = () => {
  const { user, logout } = useAuth(); // Obtén el usuario y la función logout

  return (
    <div
      className="dashboard-container"
      style={{ padding: "40px", background: "#f7fafc", minHeight: "100vh" }}
    >
      {/* Puedes usar estilos de tu CSS o estilos en línea */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2>¡Bienvenido al Dashboard, {user?.name}! 👋</h2>{" "}
        {/* Muestra el nombre */}
        <button
          onClick={logout}
          className="btn-danger"
          style={{ width: "auto" }}
        >
          Cerrar Sesión
        </button>{" "}
        {/* Botón Logout */}
      </div>
      <p>Aquí irá el contenido principal de tu dashboard...</p>
      {/* Pega aquí el HTML relevante de tu maqueta para el dashboard (screen-5) */}
      {/* Por ejemplo: */}
      {/* <div className="stats-grid"> ... </div> */}
      {/* <div className="section"> ... </div> */}
    </div>
  );
};

export default DashboardPage;
