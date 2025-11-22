import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import "./UniversitySearchPage.css";

interface UniversityDetail {
  years: string;
  admissionType: string;
  approxCost: string;
  ranking: string;
  employmentIndex: string;
  curriculumHighlights: string[];
  description: string;
}

interface University {
  name: string;
  type: "Pública" | "Privada" | "Instituto Técnico";
  city: string;
  summary: string;
  details: UniversityDetail;
}

const UniversitySearchPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [careerName, setCareerName] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [noTestFound, setNoTestFound] = useState(false);

  // Estado del Modal
  const [selectedUni, setSelectedUni] = useState<University | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(
          "/university-search/recommendations"
        );
        setCareerName(response.data.career);
        setUniversities(response.data.recommendations);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setNoTestFound(true);
        } else {
          toast.error("Error al buscar universidades. Intenta más tarde.");
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="results-loading">
        🔍 Buscando las mejores opciones en Bolivia...
      </div>
    );

  // ESTADO: NO HAY TEST
  if (noTestFound) {
    return (
      <div className="uni-search-container">
        <div className="no-test-state">
          <div className="no-test-icon">🎓</div>
          <h2>¡Aún no conocemos tu perfil!</h2>
          <p style={{ marginBottom: "30px", color: "#718096" }}>
            Para recomendarte universidades, primero necesitamos saber qué
            carrera es ideal para ti.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("/dashboard/vocational-test")}
          >
            Realizar Test Vocacional
          </button>
        </div>
      </div>
    );
  }

  // ESTADO: RESULTADOS
  return (
    <div className="uni-search-container animate-fade-in">
      <div className="uni-header">
        <h2>
          Universidades para{" "}
          <span className="career-highlight">{careerName}</span>
        </h2>
        <p>Las mejores opciones educativas en Bolivia seleccionadas para ti.</p>
      </div>

      <div className="uni-grid">
        {universities.map((uni, index) => (
          <div
            key={index}
            className="uni-card"
            onClick={() => setSelectedUni(uni)}
          >
            <div
              className={`uni-type-badge badge-${uni.type
                .split(" ")[0]
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")}`}
            >
              {uni.type}
            </div>
            <h3 className="uni-name">{uni.name}</h3>
            <div className="uni-city">📍 {uni.city}</div>
            <p className="uni-summary">{uni.summary}</p>
            <button className="btn-details">Ver Detalles Completos</button>
          </div>
        ))}
      </div>

      {/* MODAL DE DETALLES */}
      {selectedUni && (
        <div className="modal-overlay" onClick={() => setSelectedUni(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedUni(null)}>
              ×
            </button>

            <h2 style={{ color: "#2d3748", marginBottom: "5px" }}>
              {selectedUni.name}
            </h2>
            <p
              style={{
                color: "#667eea",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              {selectedUni.type} - {selectedUni.city}
            </p>

            <p style={{ lineHeight: "1.6", color: "#4a5568" }}>
              {selectedUni.details.description}
            </p>

            <div className="detail-section">
              <div className="detail-row">
                <span className="detail-label">⏱ Duración:</span>
                <span className="detail-value">
                  {selectedUni.details.years}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📝 Admisión:</span>
                <span className="detail-value">
                  {selectedUni.details.admissionType}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">💰 Costo Aprox:</span>
                <span className="detail-value">
                  {selectedUni.details.approxCost}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">🏆 Ranking/Prestigio:</span>
                <span className="detail-value">
                  {selectedUni.details.ranking}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">💼 Índice de Empleo:</span>
                <span className="detail-value">
                  {selectedUni.details.employmentIndex}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3>📚 Materias Clave de la Carrera</h3>
              <div className="pensum-list">
                {selectedUni.details.curriculumHighlights.map(
                  (subject, idx) => (
                    <span key={idx} className="pensum-tag">
                      {subject}
                    </span>
                  )
                )}
              </div>
            </div>

            <div style={{ marginTop: "30px", textAlign: "center" }}>
              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=${selectedUni.name} ${careerName} Bolivia`,
                    "_blank"
                  )
                }
              >
                Buscar Más Info en Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitySearchPage;
