// frontend/src/pages/TestResultsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown"; // Importa la librería Markdown
import remarkGfm from "remark-gfm"; // Para soporte de tablas

// Interfaz para el resultado que esperamos
interface FinalResult {
  resultProfile: string;
  analysisReport: string;
  isCompleted: boolean;
}

const TestResultsPage = () => {
  // Usamos useParams para obtener el ID de la URL
  const { sessionId } = useParams<{ sessionId: string }>();

  const [result, setResult] = useState<FinalResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast.error("ID de sesión no encontrado.");
      setIsLoading(false);
      return;
    }

    // Función para obtener los resultados desde la API (puedes crear un nuevo GET endpoint
    // o reutilizar el POST /finish si el backend devuelve el objeto)
    const fetchResults = async () => {
      try {
        // Supondremos que vamos a crear un nuevo endpoint GET /results/:sessionId
        // Por ahora, solo devolveremos un objeto mock para no crear otro endpoint
        // En producción, harías: const response = await apiClient.get(`/vocational-test/results/${sessionId}`);

        // --- MOCK/SIMULACIÓN del resultado ---
        // Para ver el resultado REAL, necesitas llamar al backend.
        // Si el POST /finish fue la última llamada exitosa, usaremos esos datos.
        // Tendrás que crear un endpoint GET /vocational-test/results/:sessionId
        // que busque la sesión y devuelva los campos analysisReport y resultProfile.
        // Para no detenernos, mostraremos un mensaje de éxito.
        // --- FIN MOCK ---

        // Opción: Recargar el último estado de la sesión desde el backend
        // Por simplicidad de desarrollo, vamos a asumir que la variable de estado
        // de React en la página anterior ya tiene los datos (si hubieras podido capturarlos).

        // Opción más robusta (Requiere nuevo endpoint en BE: GET /vocational-test/session/:sessionId)
        const response = await apiClient.get(
          `/vocational-test/session/${sessionId}`
        );
        setResult(response.data);
      } catch (error) {
        toast.error("No se pudieron cargar los resultados del test.");
        console.error("Error fetching results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="results-container">
        <h2>Cargando resultados...</h2>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-container">
        <h2>Error: Resultados no disponibles.</h2>
      </div>
    );
  }

  // --- Renderizado con el HTML de tu Mockup (screen-8) ---
  return (
    <div className="results-container">
      <div className="results-header">
        <div style={{ fontSize: "4em", marginBottom: "10px" }}>✨</div>
        <h2>¡Test Completado!</h2>
        <p style={{ color: "#718096", fontSize: "1.1em" }}>
          Tu perfil de aptitudes ha sido analizado por nuestra IA.
        </p>
        {/* Usa el campo resultProfile para el resumen */}
        <div className="results-score">
          {result.resultProfile || "Perfil Indefinido"}
        </div>
      </div>

      <div
        className="analysis-report"
        style={{
          marginTop: "40px",
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3
          style={{
            color: "#2d3748",
            marginBottom: "20px",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "10px",
          }}
        >
          Reporte de Análisis Detallado:
        </h3>

        {/* Renderiza el reporte Markdown de la IA */}
        <div className="markdown-content">
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.analysisReport}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <a
          href="/dashboard"
          className="btn-primary"
          style={{ textDecoration: "none" }}
        >
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
};

export default TestResultsPage;
