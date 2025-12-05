import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient, { saveDemographics, getTestStatus } from '../services/api';
import './VocationalTestPage.css';

interface TestQuestion {
  _id: string;
  questionText: string;
  options: string[];
  type: string; // 'GENERAL', 'SPECIFIC', 'CONFIRMATION'
}

interface TestStatus {
    hasCompletedTest: boolean;
    selectedCareer: string | null;
    sessionId: string | null;
}

const VocationalTestPage = () => {
  const navigate = useNavigate();

  // Estados de Vista
  const [viewMode, setViewMode] = useState<"loading" | "summary" | "test">(
    "loading"
  );
  const [statusData, setStatusData] = useState<TestStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estados del Test
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  // Control de Pasos: 0=Edad, 1=Sexo, 2=Pregunta 1...
  const [currentStep, setCurrentStep] = useState(0);

  // Respuestas
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await getTestStatus();
      if (data.hasCompletedTest && data.selectedCareer) {
        setStatusData(data);
        setViewMode("summary");
      } else {
        startOrResumeTest();
      }
    } catch (error) {
      console.error("Error verificando estado:", error);
      startOrResumeTest();
    }
  };

  const startNewTestSession = async () => {
    setViewMode("loading");
    try {
      const response = await apiClient.post("/vocational-test/start");
      setSessionId(response.data.sessionId);
      setQuestions(response.data.questions);
      setViewMode("test");

      setCurrentStep(0);
      setAge("");
      setGender(null);
      setSelectedOptionIndex(null);
    } catch (err) {
      toast.error("Error iniciando el test.");
      setViewMode("test");
    }
  };

  // Inicia o Recarga el test (trae todas las preguntas acumuladas hasta el momento)
  const startOrResumeTest = async () => {
    setViewMode("loading");
    try {
      const response = await apiClient.post("/vocational-test/start");
      const { sessionId, questions, answersCount, userAge, userGender } =
        response.data;

      setSessionId(sessionId);
      setQuestions(questions);

      // 1. Restaurar datos demográficos si existen
      if (userAge) setAge(String(userAge));
      if (userGender) setGender(userGender);

      // 2. Calcular el paso (Step) correcto
      // Pasos 0 y 1 son demográficos. Las preguntas empiezan en Step 2.
      // Si ya tiene demográficos y N respuestas, salta:
      // - Si no tiene demográficos: Step 0
      // - Si tiene demográficos pero 0 respuestas: Step 2
      // - Si tiene demográficos y 3 respuestas: Step 2 + 3 = 5 (Va a la pregunta 4)

      let initialStep = 0;
      if (userAge) initialStep = 1;
      if (userAge && userGender) initialStep = 2;

      if (answersCount > 0) {
        initialStep = 2 + answersCount;
      }

      console.log(
        `[RESUME] Respuestas previas: ${answersCount}. Saltando al paso: ${initialStep}`
      );
      setCurrentStep(initialStep);

      setViewMode("test");
    } catch (err) {
      toast.error("Error conectando con el test.");
      setViewMode("test");
    }
  };

  // --- FUNCIÓN CRÍTICA DE SINCRONIZACIÓN ---
  const refreshAndCheck = async () => {
    try {
      console.log("Sincronizando preguntas con backend...");
      const response = await apiClient.post("/vocational-test/start");
      const newQuestions = response.data.questions;

      // Si hay más preguntas de las que teníamos, actualizamos
      if (newQuestions.length > questions.length) {
        console.log(
          `¡Nuevas preguntas detectadas! (${questions.length} -> ${newQuestions.length})`
        );
        setQuestions(newQuestions);
        return true; // Indica que sí hubo actualización
      }
      return false;
    } catch (error) {
      console.error("Error sync:", error);
      return false;
    }
  };

  // Función para refrescar preguntas en mitad del test (Transición de Fase)
  const refreshQuestions = async () => {
    await refreshAndCheck();
  };

  const handleOptionClick = (index: number) => setSelectedOptionIndex(index);

  const handleNext = async () => {
    // --- PASO 0: EDAD ---
    if (currentStep === 0) {
      if (!age || Number(age) < 10 || Number(age) > 99) {
        toast.warning("Ingresa una edad válida");
        return;
      }
      setCurrentStep(1);
      return;
    }
    // --- PASO 1: SEXO ---
    if (currentStep === 1) {
      if (!gender) {
        toast.warning("Selecciona género");
        return;
      }
      try {
        if (sessionId) await saveDemographics(sessionId, Number(age), gender);
        setCurrentStep(2); // Pasar a primera pregunta
      } catch (e) {
        toast.error("Error conexión");
      }
      return;
    }

    // --- PASO 2+: PREGUNTAS DEL TEST ---
    const qIndex = currentStep - 2;

    if (selectedOptionIndex === null) {
      toast.warning("Selecciona una opción");
      return;
    }

    try {
      // 1. Enviar respuesta al backend
      const response = await apiClient.post(
        `/vocational-test/${sessionId}/answer`,
        {
          questionId: questions[qIndex]._id,
          selectedOptionIndex: selectedOptionIndex,
        }
      );

      setSelectedOptionIndex(null); // Limpiar selección

      // 1. CAMBIO DE FASE EXPLÍCITO
      if (
        response.data.nextPhase === "SPECIFIC" ||
        response.data.nextPhase === "CONFIRMATION"
      ) {
        toast.info(response.data.message || "Avanzando a la siguiente fase...");
        await refreshQuestions();
        setCurrentStep((prev) => prev + 1);
      }
      // 2. FINALIZACIÓN EXPLÍCITA
      else if (response.data.nextPhase === "FINISHED") {
        await handleFinish();
      }

      // 3. CONTINUACIÓN NORMAL
      else {
        // ¿Quedan preguntas en la lista local?
        if (qIndex < questions.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          // --- CORRECCIÓN DE SEGURIDAD ---
          // Se acabaron las preguntas locales, pero el backend NO dijo "FINISHED".
          // Esto significa que faltan preguntas por cargar (retraso en la red o lógica de branching).
          // NUNCA llamar a handleFinish() aquí. Intentamos sincronizar.

          console.warn(
            "Fin de lista local alcanzado sin señal de FINISHED. Sincronizando..."
          );
          const hasNewQuestions = await refreshAndCheck();

          if (hasNewQuestions) {
            // Si llegaron nuevas preguntas, avanzamos
            setCurrentStep((prev) => prev + 1);
          } else {
            // Si no hay nuevas preguntas y no es FINISHED, es un estado ambiguo.
            // Verificamos si la pregunta actual era de tipo CONFIRMATION (la última fase).
            // Solo en ese caso extremo permitimos intentar finalizar.
            const currentQ = questions[qIndex];
            if (currentQ && currentQ.type === "CONFIRMATION") {
              await handleFinish();
            } else {
              toast.info(
                "Procesando fase... por favor espera un momento y presiona Siguiente de nuevo."
              );
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar respuesta. Intenta de nuevo.");
    }
  };

  const handleFinish = async () => {
    setIsAnalyzing(true);
    try {
      await apiClient.post(`/vocational-test/${sessionId}/finish`);
      toast.success("¡Test finalizado!");
      navigate(`/dashboard/results/${sessionId}`);
    } catch (err: any) {
      setIsAnalyzing(false);
      // Mostrar el error real del backend (ej. "Faltan preguntas")
      toast.error(err.response?.data?.message || "Error al finalizar.");
    }
  };

  // --- RENDERIZADO ---

  if (isAnalyzing) {
    return (
      <div className="analysis-overlay">
        <div className="analysis-content">
          <div className="brain-loader">🧠</div>
          <h2>Analizando tu perfil...</h2>
          <p>
            Nuestra IA está conectando tus respuestas con oportunidades reales
            en Bolivia.
          </p>
          <div className="loading-bar-container">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "loading")
    return (
      <div className="test-container">
        <h2>Cargando...</h2>
      </div>
    );

  if (viewMode === "summary" && statusData) {
    return (
      <div className="test-container">
        <div
          className="question-card animate-fade-in"
          style={{ textAlign: "center" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎓</div>
          <h2 style={{ color: "#2d3748", marginBottom: "10px" }}>
            Ya tienes una carrera elegida
          </h2>
          <div
            style={{
              background: "#eef2ff",
              color: "#667eea",
              padding: "20px",
              borderRadius: "15px",
              fontWeight: "bold",
              fontSize: "1.5rem",
              marginBottom: "40px",
            }}
          >
            {statusData.selectedCareer}
          </div>
          <div
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <button
              className="btn-secondary"
              onClick={() =>
                navigate(`/dashboard/results/${statusData.sessionId}`)
              }
            >
              Ver Detalles
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                // Para reiniciar, forzamos un nuevo sessionId o limpiamos el estado
                // Por ahora, simplemente llamamos a startNew (que reanudará el incompleto o creará nuevo si el anterior está completo)
                // if(window.confirm("¿Quieres empezar un test nuevo desde cero?")) {
                //      // Aquí idealmente llamarías a un endpoint para 'archivar' el test anterior si quisieras forzar cero
                //      // Pero como la lógica es 'resume if incomplete', y este está completo (viewMode summary),
                //      // startOrResumeTest creará uno nuevo automáticamente.
                //     startOrResumeTest();
                // }
                startOrResumeTest();
              }}
            >
              Realizar Nuevo Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Total estimado para barra de progreso (5 General + 6 Specific + 5 Confirmation + 2 Demo = 18)
  const totalEstimatedSteps = 18;
  const progress = Math.min(
    ((currentStep + 1) / totalEstimatedSteps) * 100,
    100
  );

  // Obtener pregunta actual de forma segura
  const questionIndex = currentStep - 2;
  const currentQuestion =
    questionIndex >= 0 && questionIndex < questions.length
      ? questions[questionIndex]
      : null;

  return (
    <div className="test-container">
      <h2 className="test-title">Test Vocacional </h2>
      <div className="test-progress">
        <div
          className="test-progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* PASO 0: EDAD */}
      {currentStep === 0 && (
        <div className="question-card animate-fade-in">
          <div className="question-number">Paso 1</div>
          <div className="question-text" style={{ textAlign: "center" }}>
            ¿Cuál es tu edad?
          </div>
          <div className="demographic-input-container">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="age-input"
              placeholder="18"
              autoFocus
            />
            <p className="hint-text">
              Para recomendarte formación universitaria o técnica.
            </p>
          </div>
        </div>
      )}

      {/* PASO 1: GÉNERO */}
      {currentStep === 1 && (
        <div className="question-card animate-fade-in">
          <div className="question-number">Paso 2</div>
          <div className="question-text">¿Género?</div>
          <div className="options">
            {["Masculino", "Femenino", "Prefiero no decir"].map((g) => (
              <div
                key={g}
                onClick={() => setGender(g)}
                className={`option ${gender === g ? "selected" : ""}`}
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2+: PREGUNTAS DINÁMICAS */}
      {currentStep >= 2 && currentQuestion && (
        <div className="question-card animate-fade-in">
          <div className="question-header-row">
            <span className="question-number">Pregunta {currentStep - 1}</span>
            {/* Badge para saber en qué fase estamos */}
            {currentQuestion.type === "SPECIFIC" && (
              <span className="phase-badge phase-specific">Profundización</span>
            )}
            {currentQuestion.type === "CONFIRMATION" && (
              <span className="phase-badge phase-confirm">Confirmación</span>
            )}
          </div>

          <div className="question-text">{currentQuestion.questionText}</div>

          <div className="options">
            {currentQuestion.options.map((opt: any, idx: number) => {
              // Manejar si options es array de strings o de objetos (general)
              const text = typeof opt === "string" ? opt : opt.text || "Opción";
              return (
                <div
                  key={idx}
                  className={`option ${
                    selectedOptionIndex === opt.originalIndex ? "selected" : ""
                  }`}
                  onClick={() => handleOptionClick(opt.originalIndex)}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + idx)}
                  </span>{" "}
                  {text}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="test-actions">
        <button className="btn-primary" onClick={handleNext}>
          {/* Solo mostrar "Finalizar" si estamos en la última pregunta de la última fase Y no hay más preguntas cargadas */}
          {currentStep >= 2 &&
          currentQuestion?.type === "CONFIRMATION" &&
          questionIndex === questions.length - 1
            ? "Finalizar"
            : "Siguiente"}
        </button>
      </div>
    </div>
  );
};

export default VocationalTestPage;

