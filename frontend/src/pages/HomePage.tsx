import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate("/register"); // Mejor llevar al registro para capturar al usuario
  };

  return (
    <div className="home-container animate-fade-in">
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🇧🇴 Orientación Vocacional en Bolivia</div>
          <h1 className="hero-title">
            Descubre tu verdadero{" "}
            <span className="highlight">potencial profesional</span> con
            Inteligencia Artificial
          </h1>
          <p className="hero-subtitle">
            Olvídate de los tests tradicionales. Nuestra IA analiza tus
            intereses reales y te conecta con carreras, universidades y cursos
            en Bolivia que se adaptan a ti.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-lg" onClick={handleStartNow}>
              Comenzar Test Gratis
            </button>
            <Link to="/about" className="btn-secondary btn-lg">
              Conocer Más
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-desc">Precisión vocacional</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">+500</span>
              <span className="stat-desc">Carreras analizadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">IA</span>
              <span className="stat-desc">Tecnología Gemini</span>
            </div>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-blob"></div>
          <div className="hero-card-mockup">
            <div className="mockup-header">
              <div className="mockup-avatar">🧠</div>
              <div>
                <div className="mockup-title">Análisis Completado</div>
                <div className="mockup-subtitle">
                  Perfil: Innovador Tecnológico
                </div>
              </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-line width-80"></div>
              <div className="mockup-line width-60"></div>
              <div className="mockup-button">Ver Recomendaciones</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="features-section">
        <h2 className="section-title">Tu camino al éxito en 3 pasos</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-purple">
              <span className="feature-icon">🎓</span>
            </div>
            <h3>1. Descubre</h3>
            <p>
              Realiza nuestro <strong>Test Vocacional Adaptativo</strong>. No
              son preguntas aburridas; nuestra IA conversa contigo para entender
              quién eres realmente.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-blue">
              <span className="feature-icon">🏫</span>
            </div>
            <h3>2. Encuentra</h3>
            <p>
              Explora un catálogo inteligente de{" "}
              <strong>Universidades e Institutos en Bolivia</strong>. Filtra por
              departamento, costo y tipo de admisión.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-green">
              <span className="feature-icon">🚀</span>
            </div>
            <h3>3. Prepárate</h3>
            <p>
              No esperes a inscribirte. Accede a nuestro módulo de{" "}
              <strong>Desarrollo de Habilidades</strong> con cursos gratuitos
              recomendados para tu carrera.
            </p>
          </div>
        </div>
      </section>

      {/* --- VALUE PROP SECTION --- */}
      <section className="value-section">
        <div className="value-content">
          <h2>¿Por qué CareerGenius?</h2>
          <p>
            Entendemos que elegir carrera en Bolivia es un desafío único.
            Combinamos tecnología global con contexto local.
          </p>
          <ul className="value-list">
            <li>
              ✅ <strong>Adaptativo:</strong> El test cambia según tus
              respuestas.
            </li>
            <li>
              ✅ <strong>Realista:</strong> Recomendamos opciones viables en el
              mercado laboral boliviano.
            </li>
            <li>
              ✅ <strong>Integral:</strong> Desde el descubrimiento hasta la
              preparación pre-universitaria.
            </li>
          </ul>
          <Link to="/register" className="btn-primary">
            Crear mi Perfil Ahora
          </Link>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="footer-cta">
        <h2>Tu futuro empieza hoy</h2>
        <p>Únete a cientos de estudiantes que ya encontraron su vocación.</p>
        <button className="btn-white" onClick={handleStartNow}>
          Empezar Aventura
        </button>
      </section>
    </div>
  );
};

export default HomePage;
