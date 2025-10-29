import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define una interfaz para la estructura esperada de la pregunta
interface GeneratedQuestion {
    question: string;
    options: string[];
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
Generate ${count} multiple-choice questions suitable for a vocational aptitude test for university students or young professionals. Focus on identifying preferences in work style, problem-solving approaches, collaborative tendencies, and areas of interest relevant to career choices. Each question must have exactly 4 distinct options.

Provide the output strictly in JSON format as an array of objects, where each object has a "question" (string) and an "options" (array of 4 strings) field. Do not include any introductory text, explanations, or markdown formatting outside the JSON array.

Example format:
[
  {
    "question": "When faced with a complex problem, you prefer to:",
    "options": [
      "Break it down into smaller, logical steps.",
      "Brainstorm creative and unconventional solutions.",
      "Collaborate with others to find a consensus.",
      "Research existing solutions and adapt them."
    ]
  },
  {
    "question": "Which work environment sounds most appealing?",
    "options": [
      "A fast-paced startup with constant change.",
      "A large, established company with clear structure.",
      "A research lab focused on innovation.",
      "Working independently from anywhere."
    ]
  }
]
`;

            // Configuración de seguridad (ajusta según necesidad)
            const generationConfig = {
                temperature: 0.7, // Un poco de creatividad
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
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
}