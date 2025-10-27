import React from "react";
import "./HomePage.css"; // 1. Importaremos el CSS aquí
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate("/login"); // Redirige a la página de login
  };

  return (
    <>
      {" "}
      {/* Usamos Fragment porque hay varios elementos */}
      {/* 2. Este es tu HTML convertido a JSX */}
      <div className="hero">
        <h2>Tu Futuro Profesional Comienza Aquí</h2>
        <p>
          Descubre tu vocación y conecta con las mejores oportunidades laborales
          usando IA
        </p>
        <div className="cta-buttons">
          {/* 3. Los botones necesitarán lógica 'onClick' más adelante */}
          <button className="btn-primary" onClick={handleStartNow}>
            Comenzar Ahora
          </button>
          <button className="btn-secondary">
            Conocer Más
            </button>
        </div>
      </div>
      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🎓</div>
          <h3>Test Vocacional IA</h3>
          <p>
            Evaluación avanzada de aptitudes e intereses con análisis predictivo
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Matching Inteligente</h3>
          <p>
            Conecta con oportunidades laborales perfectas para tu perfil
          </p>{" "}
          {/* Corregido el cierre del div */}
        </div>
        {/* Puedes añadir más feature-cards si los tenías */}
      </div>
    </>
  );
};

export default HomePage;
