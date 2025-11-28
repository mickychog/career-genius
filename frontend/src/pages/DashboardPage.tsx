import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import "./DashboardPage.css";

// Definición de una sugerencia (para el carrusel)
interface Suggestion {
  id: number;
  title: string;
  type: string;
  image: string;
}

// Interfaz actualizada con todos los datos nuevos
interface DashboardStats {
  userName: string; // <--- Nombre real desde la DB
  profileCompletion: number;
  testCompleted: boolean;
  careerFocus: string | null;
  universityRecs: number;
  skillsCount: number;
  aptitudeScore: string;
  overallProgress: number;
  suggestions: Suggestion[]; // <--- Lista de sugerencias
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
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        toast.error("Error al cargar el progreso.");
        // Fallback visual
        setStats({
          userName: user?.name || "Usuario",
          profileCompletion: 0,
          testCompleted: false,
          careerFocus: null,
          universityRecs: 0,
          skillsCount: 0,
          aptitudeScore: "-",
          overallProgress: 0,
          suggestions: [],
        });
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

  if (loading)
    return (
      <div className="dashboard-page">
        <h2>Cargando tu panel...</h2>
      </div>
    );
  if (!stats)
    return (
      <div className="dashboard-page">
        <h2>Error de carga.</h2>
      </div>
    );

  const careerFocus = stats.careerFocus || "N/A (Inicia el Test)";

  // Priorizamos el nombre que viene fresco de la DB
  const displayName = stats.userName || user?.name || "Usuario";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          {/* --- AQUÍ ESTÁ EL SALUDO CON EL NOMBRE REAL --- */}
          <h2>¡Hola, {displayName}! 👋</h2>
          <p className="header-subtitle">
            Aquí tienes el resumen de tu futuro profesional.
          </p>
        </div>
        <Link
          to="/dashboard/profile"
          className="btn-primary"
          style={{ width: "auto" }}
        >
          Mi Perfil
        </Link>
      </div>

      {/* Layout de Grid para columnas */}
      <div className="dashboard-layout-grid">
        {/* COLUMNA IZQUIERDA (Principal) */}
        <div className="main-column">
          {/* Tarjeta de Foco (Estado del Test) */}
          <div className="stat-card focus-card">
            <div className="focus-header">
              <div className="stat-label">Tu Objetivo Profesional</div>
              <div
                className={`status-badge ${
                  stats.testCompleted ? "done" : "pending"
                }`}
              >
                {stats.testCompleted ? "En Curso" : "Pendiente"}
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

          {/* Grid de Mini Estadísticas */}
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
          </div>

          {/* --- AQUÍ ESTÁ LA SECCIÓN DE CARRUSEL DE SUGERENCIAS --- */}
          <div className="section suggestions-section">
            <h3>💡 Recomendado para ti</h3>
            <div className="suggestions-carousel">
              {stats.suggestions && stats.suggestions.length > 0 ? (
                stats.suggestions.map((item) => (
                  <div key={item.id} className="suggestion-card">
                    <div className="suggestion-icon">{item.image}</div>
                    <div className="suggestion-content">
                      <span className="suggestion-type">{item.type}</span>
                      <h4>{item.title}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <div className="suggestion-card">
                  <p>Completa tu perfil para ver sugerencias.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Lateral) */}
        <div className="side-column">
          {/* Progreso General */}
          <div className="stat-card progress-card">
            <h3>Progreso Global</h3>
            <div className="circular-progress">
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

          {/* --- AQUÍ ESTÁ EL SIDEBAR CON FECHAS IMPORTANTES --- */}
          <div className="stat-card dates-card">
            <h3>📅 Fechas Clave (Bolivia)</h3>
            <ul className="dates-list">
              <li>
                <span className="date">15 ENE</span>
                <span className="event">Inscripciones UMSA (PSA)</span>
              </li>
              <li>
                <span className="date">02 FEB</span>
                <span className="event">Examen UCB (La Paz)</span>
              </li>
              <li>
                <span className="date">20 FEB</span>
                <span className="event">Inicio Clases UPB</span>
              </li>
            </ul>
            <button className="btn-text">Ver calendario completo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
