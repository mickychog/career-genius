import React from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-container animate-fade-in">
      <div className="about-header">
        <h1>🎯 CareerGenius</h1>
        <p>Orientación Vocacional Inteligente para el Futuro de Bolivia</p>
      </div>

      <div className="features-grid">
        {/* Feature 1: El núcleo */}
        <div className="feature-box">
          <div className="feature-icon">🧠</div>
          <h3>Test Vocacional Adaptativo</h3>
          <p>
            Olvídate de los tests aburridos. Nuestro sistema usa un algoritmo de
            "embudo" que adapta las preguntas en tiempo real según tus
            respuestas, profundizando en tus verdaderos intereses.
          </p>
        </div>

        {/* Feature 2: IA Gemini */}
        <div className="feature-box">
          <div className="feature-icon">✨</div>
          <h3>Potenciado por Google Gemini</h3>
          <p>
            Utilizamos el modelo de IA más avanzado de Google (Gemini 1.5 Flash)
            para analizar tu perfil y generar reportes detallados, no solo
            resultados genéricos.
          </p>
        </div>

        {/* Feature 3: Contexto Local */}
        <div className="feature-box">
          <div className="feature-icon">🇧🇴</div>
          <h3>Enfoque 100% Boliviano</h3>
          <p>
            Recomendaciones ajustadas a la realidad nacional. Sugerimos carreras
            disponibles en universidades (UMSA, UCB, UPB) e institutos técnicos
            reales de tu departamento.
          </p>
        </div>

        {/* Feature 4: Universidades */}
        <div className="feature-box">
          <div className="feature-icon">🏫</div>
          <h3>Buscador Universitario</h3>
          <p>
            Una vez definida tu carrera, nuestra IA busca las mejores opciones
            de estudio en Bolivia, detallando costos, duración y requisitos de
            admisión.
          </p>
        </div>

        {/* Feature 5: Habilidades */}
        <div className="feature-box">
          <div className="feature-icon">📚</div>
          <h3>Plan de Habilidades</h3>
          <p>
            Cerramos la brecha educativa recomendándote cursos gratuitos y
            preuniversitarios específicos para que empieces a prepararte hoy
            mismo.
          </p>
        </div>

        {/* Feature 6: Seguridad */}
        <div className="feature-box">
          <div className="feature-icon">🔒</div>
          <h3>Privacidad y Seguridad</h3>
          <p>
            Tu perfil es tuyo. Gestionamos tus datos con estándares modernos de
            encriptación y te damos control total sobre tu información.
          </p>
        </div>
      </div>

      <div className="tech-section">
        <h2>Tecnología de Vanguardia</h2>
        <p>
          Construido con un stack moderno para garantizar velocidad y precisión:
        </p>
        <div className="tech-logos">
          <div className="tech-logo">Google Gemini AI</div>
          <div className="tech-logo">React + TypeScript</div>
          <div className="tech-logo">NestJS Backend</div>
          <div className="tech-logo">MongoDB Atlas</div>
        </div>
      </div>

      <div className="testimonials">
        <h2>Historias de Éxito</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <div className="testimonial-avatar">L</div>
            <h4>Lucía M. (La Paz)</h4>
            <p>
              "No sabía si estudiar Medicina o Biología. El test adaptativo
              entendió que me gusta la investigación más que la clínica y me
              sugirió Biotecnología."
            </p>
          </div>
          <div className="testimonial">
            <div className="testimonial-avatar">J</div>
            <h4>Jorge T. (Santa Cruz)</h4>
            <p>
              "Encontré cursos preuniversitarios exactos para la carrera que me
              salió en el test. Me siento mucho más preparado para el examen de
              ingreso."
            </p>
          </div>
          <div className="testimonial">
            <div className="testimonial-avatar">A</div>
            <h4>Ana K. (Cochabamba)</h4>
            <p>
              "Me encantó que las sugerencias de universidades fueran reales y
              de mi ciudad. Ahorré mucho tiempo investigando."
            </p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>¿Listo para descubrir tu camino?</h2>
        <div className="cta-buttons">
          <Link to="/register" className="btn-primary">
            Crear Cuenta Gratis
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
