import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient, { saveDemographics } from "../services/api";
import "./VocationalTestPage.css";

interface TestQuestion {
  _id: string;
  questionText: string;
  options: string[];
  category?: string;
}

const VocationalTestPage = () => {
  const navigate = useNavigate();

  // Estados del Test
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Edad, 1: Sexo, 2+: Preguntas
  const [isLoading, setIsLoading] = useState(true);

  // Datos Demográficos
  const [age, setAge] = useState<number | string>("");
  const [gender, setGender] = useState<string | null>(null);

  // Respuestas del Test
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );

  // Cargar sesión e iniciar test al montar
  useEffect(() => {
    const initTest = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.post("/vocational-test/start");
        setSessionId(response.data.sessionId);
        setQuestions(response.data.questions);

        // Opcional: Si la sesión ya tenía avance, podríamos calcular el currentStep aquí
        // Pero por simplicidad, asumimos que si reanuda, empieza o revisa desde el principio
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error iniciando test:", err);
        toast.error("No se pudo iniciar el test. Intenta recargar.");
        setIsLoading(false);
      }
    };
    initTest();
  }, []);

  // --- MANEJADORES DE NAVEGACIÓN ---

  const handleNext = async () => {
    // 1. Lógica para Pregunta 1: EDAD
    if (currentStep === 0) {
      if (!age || Number(age) < 10 || Number(age) > 99) {
        toast.warning("Por favor ingresa una edad válida.");
        return;
      }
      setCurrentStep(1); // Pasar a Sexo
      return;
    }

    // 2. Lógica para Pregunta 2: SEXO (y guardar demográficos)
    if (currentStep === 1) {
      if (!gender) {
        toast.warning("Por favor selecciona una opción.");
        return;
      }

      // Guardar demográficos en el backend antes de seguir
      try {
        if (sessionId) {
          await saveDemographics(sessionId, Number(age), gender);
        }
        setCurrentStep(2); // Pasar a la primera pregunta real
      } catch (error) {
        console.error(error);
        toast.error("Error guardando datos. Intenta de nuevo.");
      }
      return;
    }

    // 3. Lógica para Preguntas del Test (Paso 2 en adelante)
    // El índice real en el array de questions es (currentStep - 2)
    const questionIndex = currentStep - 2;

    if (selectedOptionIndex === null) return;

    try {
      // Enviar respuesta
      await apiClient.post(`/vocational-test/${sessionId}/answer`, {
        questionId: questions[questionIndex]._id,
        selectedOptionIndex: selectedOptionIndex,
      });

      setSelectedOptionIndex(null); // Resetear selección

      // Si hay más preguntas, avanzar
      if (questionIndex < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Si era la última, finalizar
        await handleFinish();
      }
    } catch (err: any) {
      console.error("Error enviando respuesta:", err);
      toast.error("Error al guardar respuesta.");
    }
  };

  const handleFinish = async () => {
    try {
      await apiClient.post(`/vocational-test/${sessionId}/finish`);
      toast.success("¡Test completado! Generando resultados...");
      navigate(`/dashboard/results/${sessionId}`);
    } catch (err) {
      toast.error("Error al finalizar el test.");
    }
  };

  // --- RENDERIZADO ---

  if (isLoading)
    return (
      <div className="test-container">
        <h2>Preparando tu test...</h2>
      </div>
    );

  // Calcular progreso (Total = 2 preguntas demográficas + N preguntas de API)
  const totalSteps = 2 + questions.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Renderizar contenido dinámico según el paso
  const renderContent = () => {
    // PASO 0: EDAD
    if (currentStep === 0) {
      return (
        <div className="question-card animate-fade-in">
          <div className="question-number">Pregunta 1 de {totalSteps}</div>
          <div className="question-text">
            Para empezar, ¿cuántos años tienes?
          </div>
          <div className="demographic-input-container">
            <input
              type="number"
              className="age-input"
              placeholder="Ej. 17"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="15"
              max="99"
              autoFocus
            />
            <p className="hint-text">
              Tu edad nos ayuda a sugerir si buscas formación universitaria o
              técnica rápida.
            </p>
          </div>
        </div>
      );
    }

    // PASO 1: SEXO
    if (currentStep === 1) {
      return (
        <div className="question-card animate-fade-in">
          <div className="question-number">Pregunta 2 de {totalSteps}</div>
          <div className="question-text">¿Con qué género te identificas?</div>
          <div className="options">
            {["Masculino", "Femenino", "Prefiero no decir"].map((option) => (
              <div
                key={option}
                className={`option ${gender === option ? "selected" : ""}`}
                onClick={() => setGender(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // PASO 2+: PREGUNTAS REALES
    const questionIndex = currentStep - 2;
    const question = questions[questionIndex];

    // Si por alguna razón no hay pregunta (error de índice), mostrar carga
    if (!question) return <div>Cargando pregunta...</div>;

    return (
      <div className="question-card animate-fade-in">
        <div className="question-number">
          Pregunta {currentStep + 1} de {totalSteps}
        </div>
        <div className="question-text">{question.questionText}</div>
        <div className="options">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option ${
                selectedOptionIndex === index ? "selected" : ""
              }`}
              onClick={() => setSelectedOptionIndex(index)}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}.
              </span>{" "}
              {option}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Validación del botón "Siguiente"
  const isNextDisabled = () => {
    if (currentStep === 0) return !age;
    if (currentStep === 1) return !gender;
    return selectedOptionIndex === null;
  };

  return (
    <div className="test-container">
      <h2 className="test-title">Test Vocacional Bolivia 🇧🇴</h2>

      <div className="test-progress">
        <div
          className="test-progress-bar"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {renderContent()}

      <div className="test-actions">
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {currentStep === totalSteps - 1
            ? "Finalizar Test"
            : "Siguiente Pregunta →"}
        </button>
      </div>
    </div>
  );
};

export default VocationalTestPage;
