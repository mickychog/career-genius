// frontend/src/pages/VocationalTestPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../services/api";
import "./VocationalTestPage.css"; // Crearemos este CSS

// Interfaz para la estructura de una pregunta
interface TestQuestion {
  _id: string;
  questionText: string;
  options: string[];
  category?: string;
}

const VocationalTestPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 1. Iniciar el test al cargar la página
  useEffect(() => {
    const startTest = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Llama al endpoint del backend para iniciar
        const response = await apiClient.post("/vocational-test/start");

        setSessionId(response.data.sessionId);
        setQuestions(response.data.questions);
        setCurrentQuestionIndex(0); // Empezar en la primera pregunta
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error al iniciar el test:", err);
        setError(
          err.response?.data?.message ||
            "No se pudo cargar el test. Intenta de nuevo."
        );
        toast.error("Error al cargar el test.");
        setIsLoading(false);
      }
    };

    startTest();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // 2. Lógica para manejar el "Siguiente" (próximo paso)
  const handleNextQuestion = async () => {
    if (selectedOption === null || !sessionId) return; // No hacer nada si no se ha seleccionado opción

    const currentQuestion = questions[currentQuestionIndex];

    try {
      // 2a. Enviar la respuesta actual al backend
      await apiClient.post(`/vocational-test/${sessionId}/answer`, {
        questionId: currentQuestion._id,
        selectedOptionIndex: selectedOption,
      });

      setSelectedOption(null); // Resetea la opción seleccionada

      // 2b. Comprobar si es la última pregunta
      if (currentQuestionIndex < questions.length - 1) {
        // Ir a la siguiente pregunta
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Es la última pregunta, finalizar el test
        await handleFinishTest();
      }
    } catch (err: any) {
      console.error("Error al enviar respuesta:", err);
      toast.error(
        err.response?.data?.message || "Error al guardar tu respuesta."
      );
    }
  };

  // 3. Lógica para finalizar el test
  const handleFinishTest = async () => {
    if (!sessionId) return;
    try {
      const response = await apiClient.post(
        `/vocational-test/${sessionId}/finish`
      );
      toast.success("¡Test completado con éxito! Generando resultados...");
      // Redirige a una futura página de resultados (pasando el ID de sesión)
      navigate(`/dashboard/results/${sessionId}`, {
        state: { results: response.data },
      });
    } catch (err: any) {
      console.error("Error al finalizar el test:", err);
      toast.error(err.response?.data?.message || "Error al finalizar el test.");
    }
  };

  // --- Renderizado ---

  if (isLoading) {
    return (
      <div className="test-container">
        <h2>Cargando tu test vocacional...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-container">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="test-container">
        <h2>No hay preguntas disponibles.</h2>
      </div>
    );
  }

  // Obtiene la pregunta actual
  const question = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="test-container">
      <h2
        style={{ textAlign: "center", color: "#2d3748", marginBottom: "20px" }}
      >
        Test Vocacional
      </h2>
      <div className="test-progress">
        <div
          className="test-progress-bar"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="question-card">
        <div className="question-number">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </div>
        <div className="question-text">{question.questionText}</div>
        <div className="options">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option ${selectedOption === index ? "selected" : ""}`}
              onClick={() => setSelectedOption(index)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn-primary"
          style={{ width: "auto" }}
          onClick={handleNextQuestion}
          disabled={selectedOption === null} // Deshabilita si no hay opción
        >
          {isLastQuestion ? "Finalizar Test" : "Siguiente Pregunta →"}
        </button>
      </div>
    </div>
  );
};

export default VocationalTestPage;
