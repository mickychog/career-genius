import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define una interfaz para la estructura esperada de la pregunta
export interface GeneratedQuestion {
    question: string;
    options: string[];
}

// Interfaz para el resultado de análisis
export interface AnalysisResult {
    profile: string;
    report: string; // Markdown general
    careers: {      // Array estructurado para las Cards
        name: string;
        duration: string;
        reason: string;
    }[];
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

    /**
     * Genera preguntas vocacionales basadas en una categoría específica y el contexto de Bolivia.
     */
    async generateVocationalQuestions(count: number, category: string): Promise<GeneratedQuestion[]> {
        try {
            // Usamos 'gemini-1.5-flash' que es rápido y estable
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `
Genera ${count} preguntas de opción múltiple en español para un test vocacional enfocado en **BOLIVIA**.
El público objetivo incluye: estudiantes de colegio, personas sin estudios formales y personas buscando cambiar de oficio.

**Categoría de las preguntas:** ${category}

**Contexto Boliviano:**
- Incluye situaciones realistas del mercado laboral local (comercio, agricultura, minería, tecnología, servicios, emprendimiento informal y formal).
- Usa un lenguaje claro y accesible, evitando tecnicismos académicos complejos.
- Las preguntas deben ayudar a discernir si la persona tiene aptitud o interés real en esa área.

**Requisitos de Salida:**
1. Formato estrictamente JSON (Array de objetos).
2. Cada objeto debe tener: "question" (string) y "options" (array de 4 strings).
3. Las opciones deben ser distintas y representar diferentes inclinaciones dentro de la categoría.
4. NO incluyas bloques de código markdown (\`\`\`json), solo el JSON puro si es posible, o asegúrate de que sea fácil de limpiar.

Ejemplo de formato JSON:
[
  {
    "question": "Si tuvieras un capital semilla para un negocio en tu zona, ¿en qué lo invertirías?",
    "options": [
      "En maquinaria para transformar materia prima (ej. taller de alimentos o madera).",
      "En mercadería para abrir una tienda de abarrotes o ropa.",
      "En equipos para ofrecer servicios digitales o técnicos.",
      "En insumos para un proyecto de cultivo o crianza de animales."
    ]
  }
]
`;

            // Configuración de seguridad relajada para evitar bloqueos falsos positivos en generación masiva
            const generationConfig = {
                temperature: 0.8, // Creatividad alta para variedad
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                responseMimeType: "application/json", 
            };

            const safetySettings = [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig,
                safetySettings,
            });

            // Log para depuración en caso de fallos de seguridad
            // this.logger.warn('AI Prompt Feedback:', JSON.stringify(result.response.promptFeedback, null, 2));

            const response = result.response;
            const jsonText = response.text().trim();

            // this.logger.log(`Respuesta cruda de IA: ${jsonText.substring(0, 100)}...`);

            // Intenta parsear la respuesta JSON limpiando bloques markdown
            try {
                const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '').trim();
                const questions: GeneratedQuestion[] = JSON.parse(cleanedJson);

                // Validación básica de la estructura
                if (!Array.isArray(questions) || questions.some(q => !q.question || !Array.isArray(q.options) || q.options.length !== 4)) {
                    throw new Error('La respuesta de la IA no tiene el formato JSON esperado.');
                }
                this.logger.log(`Generadas ${questions.length} preguntas para la categoría ${category}.`);
                return questions;
            } catch (parseError) {
                this.logger.error(`Error parseando JSON de IA: ${parseError}. Respuesta cruda: ${jsonText}`);
                throw new Error('Error al procesar la respuesta de la IA. Formato inválido.');
            }

        } catch (error) {
            this.logger.error(`Error generando preguntas con IA para ${category}:`, error);
            // Retornamos array vacío para no romper el proceso masivo en el servicio
            return [];
        }
    }

    /**
     * Analiza y devuelve estructura para Cards.
     */
    async analyzeTestResults(answersJson: string): Promise<AnalysisResult> {
        this.logger.log('Iniciando análisis vocacional con IA...');

        const prompt = `
Actúa como un orientador vocacional experto en Bolivia.
Analiza mis respuestas y genera un perfil profesional.

**Contexto:** Carreras reales en Bolivia (Universitarias o Técnicas).

**Entrada (Respuestas):**
${answersJson}

**Salida JSON (Estricta):**
{
  "profile": "Título corto del perfil (Ej. Innovador Tecnológico)",
  "careers": [
    {
      "name": "Nombre de la Carrera (Ej. Ingeniería de Sistemas)",
      "duration": "Duración (Ej. 5 años - UMSA)",
      "reason": "Breve razón de por qué encaja conmigo."
    },
    { "name": "...", "duration": "...", "reason": "..." },
    { "name": "...", "duration": "...", "reason": "..." }
  ],
  "report": "Texto en Markdown con: 1. Tus Superpoderes (puntos fuertes), 2. Tu Reto (áreas de mejora). Sé breve y motivador."
}
`;

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json"
                },
            });

            const jsonText = result.response.text();
            const analysis: AnalysisResult = JSON.parse(jsonText);

            if (!analysis.profile || !analysis.careers) {
                throw new Error('Respuesta de la IA incompleta.');
            }
            return analysis;

        } catch (error) {
            this.logger.error('Falla API Gemini en Análisis:', error.message || error);
            throw new Error('Fallo en la comunicación con el modelo de IA.');
        }
    }
}