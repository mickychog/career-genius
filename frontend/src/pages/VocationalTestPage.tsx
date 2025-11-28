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
  const [viewMode, setViewMode] = useState<'loading' | 'summary' | 'test'>('loading');
  const [statusData, setStatusData] = useState<TestStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estados del Test
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  
  // Control de Pasos: 0=Edad, 1=Sexo, 2=Pregunta 1...
  const [currentStep, setCurrentStep] = useState(0); 

  // Respuestas
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
      try {
          const { data } = await getTestStatus();
          if (data.hasCompletedTest && data.selectedCareer) {
              setStatusData(data);
              setViewMode('summary');
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
      setViewMode('loading');
      try {
        const response = await apiClient.post('/vocational-test/start');
        setSessionId(response.data.sessionId);
        setQuestions(response.data.questions);
        setViewMode('test');
        
        // Si es un test nuevo, nos aseguramos de empezar desde el principio
        if (response.data.questions.length <= 6 && currentStep === 0) {
             // Mantenemos en 0 para pedir demográficos
        } 
        // (Opcional: Si quisieras reanudar en la última pregunta sin responder, 
        // necesitarías lógica extra aquí para calcular 'currentStep' basado en 'answers.length')
        
      } catch (err) {
        toast.error('Error conectando con el test.');
        setViewMode('test');
      }
  };

  // Función para refrescar preguntas en mitad del test (Transición de Fase)
  const refreshQuestions = async () => {
      try {
          // Llamamos a /start que nos devuelve la sesión actualizada con las nuevas preguntas
          const response = await apiClient.post('/vocational-test/start');
          setQuestions(response.data.questions);
          console.log("Preguntas actualizadas. Total:", response.data.questions.length);
      } catch (error) {
          console.error("Error refrescando preguntas:", error);
      }
  };

  const handleOptionClick = (index: number) => setSelectedOptionIndex(index);

  const handleNext = async () => {
    // --- PASO 0: EDAD ---
    if (currentStep === 0) {
        if (!age || Number(age) < 10 || Number(age) > 99) {
            toast.warning('Ingresa una edad válida');
            return;
        }
        setCurrentStep(1); 
        return;
    }
    // --- PASO 1: SEXO ---
    if (currentStep === 1) {
        if (!gender) {
            toast.warning('Selecciona género');
            return;
        }
        try {
            if (sessionId) await saveDemographics(sessionId, Number(age), gender);
            setCurrentStep(2); // Pasar a primera pregunta
        } catch (e) { toast.error('Error conexión'); }
        return;
    }

    // --- PASO 2+: PREGUNTAS DEL TEST ---
    const qIndex = currentStep - 2;
    
    if (selectedOptionIndex === null) {
        toast.warning('Selecciona una opción');
        return;
    }

    try {
      // 1. Enviar respuesta al backend
      const response = await apiClient.post(`/vocational-test/${sessionId}/answer`, {
        questionId: questions[qIndex]._id,
        selectedOptionIndex: selectedOptionIndex,
      });

      setSelectedOptionIndex(null); // Limpiar selección

      // 2. Verificar si hubo cambio de fase (Branching)
      if (response.data.nextPhase === 'SPECIFIC') {
          toast.info("🔍 Analizando intereses... Generando preguntas específicas.");
          await refreshQuestions(); // Traer las nuevas preguntas (Fase 2)
          setCurrentStep(prev => prev + 1);
      } 
      else if (response.data.nextPhase === 'CONFIRMATION') {
          toast.success("🎯 ¡Perfil detectado! Últimas preguntas de confirmación.");
          await refreshQuestions(); // Traer las nuevas preguntas (Fase 3)
          setCurrentStep(prev => prev + 1);
      } 
      else if (response.data.nextPhase === 'FINISHED') {
          await handleFinish();
      } 
      else {
          // Flujo normal: avanzar a la siguiente pregunta existente
          if (qIndex < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            // Si no hay más preguntas y el backend no dijo FINISHED, forzamos finalizar
            await handleFinish();
          }
      }

    } catch (err) {
        console.error(err);
        toast.error('Error guardando respuesta');
    }
  };

  const handleFinish = async () => {
    setIsAnalyzing(true);
    try {
      await apiClient.post(`/vocational-test/${sessionId}/finish`);
      toast.success('¡Test completado exitosamente!');
      navigate(`/dashboard/results/${sessionId}`);
    } catch (err) {
      setIsAnalyzing(false);
      toast.error('Error al finalizar.');
    }
  };

  // --- RENDERIZADO ---

  if (isAnalyzing) {
      return (
          <div className="analysis-overlay">
              <div className="analysis-content">
                  <div className="brain-loader">🧠</div>
                  <h2>Analizando tu perfil...</h2>
                  <p>Nuestra IA está conectando tus respuestas con oportunidades reales en Bolivia.</p>
                  <div className="loading-bar-container"><div className="loading-bar-fill"></div></div>
              </div>
          </div>
      );
  }

  if (viewMode === 'loading') return <div className="test-container"><h2>Cargando...</h2></div>;

  if (viewMode === 'summary' && statusData) {
      return (
          <div className="test-container">
              <div className="question-card animate-fade-in" style={{textAlign: 'center'}}>
                  <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎓</div>
                  <h2 style={{color: '#2d3748', marginBottom: '10px'}}>Ya tienes una carrera elegida</h2>
                  <div style={{background: '#eef2ff', color: '#667eea', padding: '20px', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '40px'}}>
                      {statusData.selectedCareer}
                  </div>
                  <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
                      <button className="btn-secondary" onClick={() => navigate(`/dashboard/results/${statusData.sessionId}`)}>Ver Detalles</button>
                      <button className="btn-primary" onClick={startNewTestSession}>Realizar Nuevo Test</button>
                  </div>
              </div>
          </div>
      );
  }

  // Pregunta Actual
  const questionIndex = currentStep - 2;
  const currentQuestion = questions[questionIndex];

  // Cálculo de progreso visual (Aproximado: 20 preguntas + 2 demográficas = 22 pasos)
  const totalEstimatedSteps = 18; 
  const progress = Math.min(((currentStep + 1) / totalEstimatedSteps) * 100, 100);

  return (
      <div className="test-container">
          <h2 className="test-title">Test Vocacional Adaptativo</h2>
          <div className="test-progress"><div className="test-progress-bar" style={{width: `${progress}%`}}></div></div>
          
          {/* PASO 0: EDAD */}
          {currentStep === 0 && (
              <div className="question-card animate-fade-in">
                  <div className="question-number">Paso 1</div>
                  <div className="question-text" style={{textAlign: 'center'}}>¿Cuál es tu edad?</div>
                  <div className="demographic-input-container">
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} className="age-input" placeholder="18" autoFocus />
                    <p className="hint-text">Para recomendarte formación universitaria o técnica.</p>
                  </div>
              </div>
          )}
          
          {/* PASO 1: GÉNERO */}
          {currentStep === 1 && (
              <div className="question-card animate-fade-in">
                  <div className="question-number">Paso 2</div>
                  <div className="question-text">¿Género?</div>
                  <div className="options">
                    {['Masculino', 'Femenino', 'Prefiero no decir'].map(g => (
                        <div key={g} onClick={() => setGender(g)} className={`option ${gender === g ? 'selected':''}`}>{g}</div>
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
                      {currentQuestion.type === 'SPECIFIC' && <span className="phase-badge phase-specific">Profundización</span>}
                      {currentQuestion.type === 'CONFIRMATION' && <span className="phase-badge phase-confirm">Confirmación</span>}
                  </div>

                  <div className="question-text">{currentQuestion.questionText}</div>
                  
                  <div className="options">
                      {currentQuestion.options.map((opt: any, idx: number) => {
                          // Manejar si options es array de strings o de objetos (general)
                          const text = typeof opt === 'string' ? opt : opt.text || "Opción";
                          return (
                              <div 
                                key={idx} 
                                className={`option ${selectedOptionIndex === idx ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(idx)}
                              >
                                  <span className="option-letter">{String.fromCharCode(65+idx)}</span> {text}
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          <div className="test-actions">
              <button className="btn-primary" onClick={handleNext}>
                  {currentStep >= 2 && !questions[currentStep - 1] && questions[currentStep - 2]?.type === 'CONFIRMATION' 
                    ? 'Finalizar Test' 
                    : 'Siguiente'}
              </button>
          </div>
      </div>
  );
};

export default VocationalTestPage;

