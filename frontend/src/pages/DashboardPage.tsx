import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import "./DashboardPage.css";

// Interfaz para fechas
interface ImportantDate {
  date: string;
  event: string;
}

// Definición de una sugerencia (para el carrusel)
interface Suggestion {
  id: number;
  title: string;
  type: string;
  image: string;
  action: string;
}

// Interfaz actualizada con todos los datos nuevos
interface DashboardStats {
  userName: string;
  profileCompletion: number;
  testCompleted: boolean;
  careerFocus: string | null;
  universityRecs: number;
  skillsCount: number;
  aptitudeScore: string;
  overallProgress: number;
  suggestions: Suggestion[];
  importantDates: ImportantDate[];
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get("/users/dashboard-stats");
        // Debug: Ver qué llega realmente
        console.log("Stats recibidos:", data);
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        toast.error("Error al cargar el progreso.");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const handleStartTest = () => navigate("/dashboard/vocational-test");

  const handleViewCourses = () => {
    if (stats?.careerFocus) {
      navigate("/dashboard/skills-development");
    } else {
      toast.warning("Completa el test primero.");
    }
  };

  // ✅ Manejador de navegación para las tarjetas
  const handleSuggestionClick = (action: string) => {
    if (!action || action === "#") return;

    if (action.startsWith("http")) {
      window.open(action, "_blank"); // Enlace externo
    } else {
      navigate(action); // Ruta interna
    }
  };

  if (loading)
    return (
      <div className="dashboard-page">
        <h2>Cargando tu panel...</h2>
      </div>
    );

  if (!stats) {
    return (
      <div className="dashboard-page" style={{ textAlign: "center" }}>
        <h2>No se pudo cargar la información.</h2>
        <button
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const careerFocus = stats.careerFocus || "N/A (Inicia el Test)";
  const displayName = stats.userName || user?.name || "Usuario";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>¡Hola, {displayName}! 👋</h2>
          <p className="header-subtitle">
            Aquí tienes el resumen de tu futuro profesional.
          </p>
        </div>
        <Link to="/dashboard/profile" className="btn-primary" style={{ width: "auto" }}>
          Mi Perfil
        </Link>
      </div>

      <div className="dashboard-layout-grid">
        {/* COLUMNA IZQUIERDA */}
        <div className="main-column">
          <div className="stat-card focus-card">
            <div className="focus-header">
              <div className="stat-label">Tu Objetivo Profesional</div>
              <div
                className={`status-badge ${
                  stats.testCompleted ? "done" : "pending"
                }`}
              >
                {stats.testCompleted ? "Definido" : "Pendiente"}
              </div>
            </div>
            <div className="stat-value focus-value">{careerFocus}</div>
            <p style={{ color: "#718096", marginBottom: "20px" }}>
              {stats.testCompleted
                ? "Estás en camino. Revisa las universidades y mejora tus skills."
                : "El primer paso es descubrir qué te apasiona realmente."}
            </p>
            <button
              onClick={
                stats.testCompleted ? handleViewCourses : handleStartTest
              }
              className="btn-secondary"
            >
              {stats.testCompleted
                ? "Ver Plan de Habilidades →"
                : "Iniciar Test Vocacional →"}
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card mini-stat">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <div className="stat-value">{stats.profileCompletion}%</div>
                <div className="stat-label">Perfil</div>
              </div>
            </div>

            <div className="stat-card mini-stat">
              <div className="stat-icon">🏫</div>
              <div className="stat-info">
                <div className="stat-value">{stats.universityRecs}</div>
                <div className="stat-label">Universidades</div>
              </div>
            </div>

            <div className="stat-card mini-stat">
              <div className="stat-icon">🧠</div>
              <div className="stat-info">
                <div className="stat-value">{stats.skillsCount}</div>
                <div className="stat-label">Recursos</div>
              </div>
            </div>

            <div className="stat-card mini-stat">
              <div className="stat-icon">🧩</div>
              <div className="stat-info">
                <div className="stat-value">{stats.aptitudeScore}</div>
                <div className="stat-label">Aptitud</div>
              </div>
            </div>
          </div>

          <div className="section suggestions-section">
            <h3>💡 Recomendado para ti</h3>
            <div className="suggestions-carousel">
              {stats.suggestions && stats.suggestions.length > 0 ? (
                stats.suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="suggestion-card"
                    onClick={() => handleSuggestionClick(item.action)}
                  >
                    <div className="suggestion-icon">{item.image}</div>
                    <div className="suggestion-content">
                      <span className="suggestion-type">{item.type}</span>
                      <h4>{item.title}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <div className="suggestion-card">
                  <p>¡Todo al día!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="side-column">
          <div className="stat-card progress-card">
            <h3>Progreso Global</h3>
            <div
              className="circular-progress"
              style={{
                background: `conic-gradient(#667eea ${stats.overallProgress}%, #e2e8f0 0deg)`,
              }}
            >
              <div className="circle-inner">
                <span>{stats.overallProgress}%</span>
              </div>
            </div>
            <p
              className="stat-label"
              style={{ textAlign: "center", marginTop: "10px" }}
            >
              Nivel de preparación
            </p>
          </div>

          <div className="stat-card dates-card">
            <h3>📅 Fechas Clave (Bolivia)</h3>
            <ul className="dates-list">
              {stats.importantDates && stats.importantDates.length > 0 ? (
                stats.importantDates.map((item, idx) => (
                  <li key={idx}>
                    <span className="date">{item.date}</span>
                    <span className="event">{item.event}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span className="event">No hay fechas próximas</span>
                </li>
              )}
            </ul>
            <button className="btn-text">Ver calendario completo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;