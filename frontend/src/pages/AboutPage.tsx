// frontend/src/pages/AboutPage.tsx
import React from "react";
import { Link } from "react-router-dom"; // Para los botones CTA
import "./AboutPage.css"; // Crearemos este CSS

const AboutPage = () => {
  return (
    <div className="about-container mockup-container active">
      {" "}
      {/* Usamos mockup-container para padding, etc. */}
      <div className="about-header">
        <h2>¿Qué es CareerGenius?</h2>
        <p>
          La plataforma que revoluciona la orientación profesional con
          inteligencia artificial
        </p>
      </div>
      <div className="features-grid">
        {/* Repetimos la estructura feature-box para cada característica */}
        <div className="feature-box">
          <div className="feature-icon">🎓</div>
          <h3>Test Vocacional con IA</h3>
          <p>
            Evaluación avanzada que analiza tus aptitudes, intereses y
            personalidad para identificar las carreras que mejor se adaptan a tu
            perfil único.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">🤖</div>
          <h3>Matching Inteligente</h3>
          <p>
            Nuestros algoritmos de IA analizan miles de ofertas laborales en
            tiempo real para encontrar las que mejor se ajustan a tu perfil y
            aspirations.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">📊</div>
          <h3>Análisis de Mercado</h3>
          <p>
            Visualiza tendencias del mercado laboral, demanda de habilidades y
            salarios por sector para tomar decisiones informadas.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">🎤</div>
          <h3>Simulador de Entrevistas</h3>
          <p>
            Practica entrevistas con IA que te da feedback en tiempo real sobre
            tu comunicación, lenguaje corporal y respuestas.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">🚀</div>
          <h3>Desarrollo de Habilidades</h3>
          <p>
            Planes de aprendizaje personalizados para cerrar las brechas entre
            tu perfil actual y el ideal para tus metas profesionales.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">🌐</div>
          <h3>Conexión con Oportunidades</h3>
          <p>
            Accede a una red de empresas que buscan perfiles como el tuyo y
            postúlate directamente desde la plataforma.
          </p>
        </div>
      </div>
      <div className="tech-section">
        <h2>Tecnología de Vanguardia</h2>
        <p>
          CareerGenius utiliza las APIs más avanzadas de inteligencia artificial
          para ofrecerte la mejor experiencia:
        </p>
        <div className="tech-logos">
          {/* Estos podrían ser imágenes o simplemente texto */}
          <div className="tech-logo">OpenAI GPT-4</div>
          <div className="tech-logo">Google NLP</div>
          <div className="tech-logo">LinkedIn Learning</div>
          <div className="tech-logo">Indeed API</div>
        </div>
      </div>
      <div className="testimonials">
        <h2>Lo que Dicen Nuestros Usuarios</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <div className="testimonial-avatar">M</div>
            <h4>María López</h4>
            <p>
              "CareerGenius me ayudó a descubrir mi verdadera vocación. Ahora
              trabajo en lo que realmente me apasiona."
            </p>
          </div>
          <div className="testimonial">
            <div className="testimonial-avatar">C</div>
            <h4>Carlos Ramírez</h4>
            <p>
              "Como reclutador, la plataforma me ha permitido encontrar
              candidatos perfectamente alineados con nuestras necesidades."
            </p>
          </div>
          <div className="testimonial">
            <div className="testimonial-avatar">A</div>
            <h4>Ana Martínez</h4>
            <p>
              "El simulador de entrevistas fue clave para prepararme y conseguir
              mi trabajo actual."
            </p>
          </div>
        </div>
      </div>
      <div className="cta-section">
        <h2>¿Listo para transformar tu futuro profesional?</h2>
        <div className="cta-buttons">
          {/* Usamos Link para navegar a registro o login */}
          <Link to="/register" className="btn-primary">
            Comenzar Ahora
          </Link>
          <Link to="/" className="btn-secondary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
