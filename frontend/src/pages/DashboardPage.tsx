// frontend/src/pages/DashboardPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css"; // Mantenemos sus estilos específicos

const DashboardPage = () => {
  const { user } = useAuth(); // Ya no necesitamos logout aquí, está en el Header

  const stats = {
    matchVocacional: 92,
    cursosProgreso: 5,
    empleosRecomendados: 12,
    puntajeEntrevista: "B+",
    progresoGeneral: 65,
  };

  return (
    // Ahora solo renderizamos el contenido principal
    <div className="dashboard-page">
      {" "}
      {/* Aplicamos padding y estilos aquí */}
      <div className="dashboard-header">
        <h2>¡Hola, {user?.name}! 👋</h2>
        <Link to="/profile" className="btn-primary" style={{ width: "auto" }}>
          Ver Perfil
        </Link>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.matchVocacional}%</div>
          <div className="stat-label">Match Vocacional</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.cursosProgreso}</div>
          <div className="stat-label">Cursos en Progreso</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.empleosRecomendados}</div>
          <div className="stat-label">Empleos Recomendados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.puntajeEntrevista}</div>
          <div className="stat-label">Puntaje Entrevista IA</div>
        </div>
      </div>
      <div className="section progress-section">
        <h3 style={{ marginBottom: "10px", borderBottom: "none" }}>
          📈 Progreso General
        </h3>
        <p className="stat-label" style={{ marginBottom: "20px" }}>
          Completa tu plan de carrera para maximizar tus oportunidades.
        </p>
        <div className="test-progress">
          <div
            className="test-progress-bar"
            style={{ width: `${stats.progresoGeneral}%` }}
          ></div>
        </div>
        <div
          style={{
            fontSize: "0.9em",
            textAlign: "right",
            color: "#667eea",
            marginTop: "5px",
          }}
        >
          {stats.progresoGeneral}% Completado
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
