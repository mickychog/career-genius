import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define una interfaz para la estructura esperada de la pregunta
interface GeneratedQuestion {
    question: string;
    options: string[];
}

// Interfaz para el resultado de análisis
interface AnalysisResult {
    profile: string; // Ej. "Perfil: Analítico-Estratégico"
    report: string;  // El reporte detallado
}

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private readonly logger = new Logger(AiService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY no está definida en las variables de entorno');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateVocationalQuestions(count: number = 5): Promise<GeneratedQuestion[]> {
        try {
            //const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Or 'gemini-1.5-pro-latest'

            const prompt = `
Genera ${count} preguntas de opción múltiple en español para un test de aptitud vocacional dirigido a estudiantes universitarios o jóvenes profesionales. Enfócate en identificar preferencias de estilo de trabajo, enfoques de resolución de problemas, tendencias colaborativas y áreas de interés relevantes para la elección de carrera. Cada pregunta debe tener exactamente 4 opciones distintas.

Proporciona la salida estrictamente en formato JSON como un array de objetos, donde cada objeto tiene un campo "question" (string) y un campo "options" (array de 4 strings). No incluyas ningún texto introductorio, explicaciones o formato markdown fuera del array JSON.

Ejemplo de formato:
[
  {
    "question": "Cuando te enfrentas a un problema complejo, prefieres:",
    "options": [
      "Desglosarlo en pasos lógicos y pequeños.",
      "Lanzar ideas creativas y poco convencionales.",
      "Colaborar con otros para encontrar un consenso.",
      "Investigar soluciones existentes y adaptarlas."
    ]
  },
  {
    "question": "¿Qué ambiente de trabajo te parece más atractivo?",
    "options": [
      "Una startup dinámica con cambios constantes.",
      "Una gran empresa establecida con una estructura clara.",
      "Un laboratorio de investigación enfocado en la innovación.",
      "Trabajar de forma independiente desde cualquier lugar."
    ]
  }
]
`;

            // Configuración de seguridad (ajusta según necesidad)
            const generationConfig = {
                temperature: 0.7, // Un poco de creatividad
                topK: 1,
                topP: 1,
                maxOutputTokens: 8192,
            };
            const safetySettings = [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig,
                safetySettings,
            });

            this.logger.warn('AI Prompt Feedback:', JSON.stringify(result.response.promptFeedback, null, 2));

            const response = result.response;
            const jsonText = response.text().trim();

            this.logger.log(`Respuesta cruda de IA: ${jsonText}`);

            // Intenta parsear la respuesta JSON
            try {
                // Limpia posibles ```json ... ``` si la IA los añade
                const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '').trim();
                const questions: GeneratedQuestion[] = JSON.parse(cleanedJson);

                // Validación básica de la estructura
                if (!Array.isArray(questions) || questions.some(q => !q.question || !Array.isArray(q.options) || q.options.length !== 4)) {
                    throw new Error('La respuesta de la IA no tiene el formato JSON esperado.');
                }
                this.logger.log(`Generadas ${questions.length} preguntas vocacionales.`);
                return questions;
            } catch (parseError) {
                this.logger.error(`Error parseando JSON de IA: ${parseError}. Respuesta cruda: ${jsonText}`);
                throw new Error('Error al procesar la respuesta de la IA. Formato inválido.');
            }

        } catch (error) {
            this.logger.error('Error generando preguntas con IA:', error);
            throw new Error('No se pudieron generar las preguntas desde la IA.');
        }
    }

    async analyzeTestResults(answersJson: string): Promise < AnalysisResult > {
    this.logger.log('Iniciando análisis vocacional con IA...');

    const prompt = `
Eres un analista de carrera experto. Analiza el siguiente conjunto de respuestas a un test vocacional y proporciona un reporte detallado.

1. **Perfil Dominante (Resumen):** Genera un titular (string, máx. 5 palabras) que resuma el perfil profesional del usuario (ej. 'Pensador Lógico y Creativo').
2. **Análisis de Aptitudes:** Basado en las respuestas, describe los puntos fuertes del usuario (ej. Liderazgo, Análisis de Datos, Creatividad).
3. **Recomendaciones de Carrera:** Sugiere 3 carreras específicas (Científico de Datos, Diseñador UX, etc.) que coincidan con este perfil.
4. **Áreas de Desarrollo (Gaps):** Identifica 2-3 áreas donde el usuario podría tener desafíos o necesite desarrollar habilidades.

El formato de las respuestas proporcionadas es el siguiente JSON:
${answersJson}

Proporciona la salida estrictamente en formato JSON como un ÚNICO objeto con los campos: "profile" (string) y "report" (string). El campo "report" debe contener todo el análisis detallado (Punto 2, 3, 4) en formato Markdown bien estructurado (usando encabezados y listas).

Ejemplo de formato de salida JSON:
{
  "profile": "Pensador Lógico y Colaborador",
  "report": "## Análisis Detallado\\n### 🧠 Puntos Fuertes...\\n### 🚀 Recomendaciones..."
}
`;

    try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 8192 }, // Usa el límite alto
        });

        const jsonText = result.response.text().trim().replace(/^```json\s*|```$/g, '').trim();
        const analysis: { profile: string, report: string } = JSON.parse(jsonText);

if (!analysis.profile || !analysis.report) {
    throw new Error('Respuesta de la IA incompleta o inválida.');
}
return analysis;

        } catch (error) {
        this.logger.error('Falla API Gemini en Análisis:', error.message || error);
        this.logger.error('Verifica GEMINI_API_KEY y cuota.');
    throw new Error('Fallo en la comunicación con el modelo de IA para análisis.');
}
    }
}