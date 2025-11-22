import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate para reiniciar
import apiClient from "../services/api";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./TestResultsPage.css"; // Nuevo CSS

interface Career {
  name: string;
  duration: string;
  reason: string;
}

interface FinalResult {
  resultProfile: string;
  analysisReport: string;
  recommendedCareers: Career[]; // Recibimos el array
}

const TestResultsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate(); // Hook para navegación

  const [result, setResult] = useState<FinalResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiClient.get(
          `/vocational-test/session/${sessionId}`
        );
        setResult(response.data);
      } catch (error) {
        toast.error("Error cargando resultados.");
      } finally {
        setIsLoading(false);
      }
    };
    if (sessionId) fetchResults();
  }, [sessionId]);

  const handleRestart = () => {
    // Navegar a la ruta del test iniciará uno nuevo automáticamente
    navigate("/dashboard/vocational-test");
  };

  const handleSaveCareer = (careerName: string) => {
    // Aquí podrías llamar a un endpoint para guardar en favoritos
    toast.success(`Carrera "${careerName}" guardada en tu perfil.`);
  };

  if (isLoading)
    return <div className="results-loading">🔮 Analizando tu futuro...</div>;
  if (!result) return <div>No se encontraron resultados.</div>;

  return (
    <div className="results-container animate-fade-in">
      {/* Encabezado de Perfil */}
      <div className="results-header-card">
        <div className="profile-badge">TU PERFIL PROFESIONAL</div>
        <h1 className="profile-title">{result.resultProfile}</h1>
        <p className="profile-subtitle">
          Basado en tus respuestas y el contexto de Bolivia 🇧🇴
        </p>
      </div>

      {/* Sección de Carreras Recomendadas (CARDS) */}
      <h2 className="section-title">🎓 Carreras Recomendadas para Ti</h2>
      <div className="careers-grid">
        {result.recommendedCareers &&
          result.recommendedCareers.map((career, index) => (
            <div key={index} className="career-card">
              <div className="career-icon">🚀</div>
              <h3 className="career-name">{career.name}</h3>
              <div className="career-duration">⏱ {career.duration}</div>
              <p className="career-reason">{career.reason}</p>
              <button
                className="btn-save-career"
                onClick={() => handleSaveCareer(career.name)}
              >
                ❤️ Guardar Opción
              </button>
            </div>
          ))}
      </div>

      {/* Sección de Análisis Detallado */}
      <div className="analysis-section">
        <h2 className="section-title">📊 Análisis de Fortalezas</h2>
        <div className="markdown-box">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result.analysisReport}
          </ReactMarkdown>
        </div>
      </div>

      {/* Botones de Acción Final */}
      <div className="actions-footer">
        <button className="btn-secondary" onClick={handleRestart}>
          🔄 Reiniciar Test
        </button>
        <button className="btn-primary" onClick={() => navigate("/dashboard")}>
          🏠 Ir al Dashboard
        </button>
      </div>
    </div>
  );
};

export default TestResultsPage;
