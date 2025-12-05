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

export interface UniversityRecommendation {
    name: string;
    type: 'Pública' | 'Privada' | 'Instituto Técnico';
    city: string;
    summary: string;
    details: {
        years: string;
        admissionType: string; // Examen, Ingreso libre, etc.
        approxCost: string;    // Mensualidad o Matrícula
        ranking: string;       // Percepción local o ranking internacional
        employmentIndex: string; // Alto, Medio, Creciente
        curriculumHighlights: string[]; // Materias clave (Pensum resumen)
        description: string;   // Descripción larga de la IA
    };
}

export interface CourseRecommendation {
    title: string;
    platform: string; // Youtube, Coursera, Web, etc.
    type: 'Preuniversitario' | 'Fundamentos' | 'Habilidad Blanda';
    description: string;
    searchQuery: string; // Para generar el link de búsqueda si no hay URL directa
    difficulty: 'Básico' | 'Intermedio';
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
    /**
         * Genera preguntas vocacionales dinámicas según la fase y categoría.
         * AHORA SOPORTA 3 ARGUMENTOS CORRECTAMENTE.
         */
    async generateVocationalQuestions(count: number, type: string, category?: string): Promise<GeneratedQuestion[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            let prompt = '';

            // INFO DE CONTEXTO PARA LA IA (Tu mapa de carreras)
            const boliviaContext = `
USA ESTE CONTEXTO DE BOLIVIA PARA LA CATEGORÍA:
- TEC_INGENIERIA: Ing. de Sistemas/Informática/Software, Ing. Civil, Ing. Ambiental, Ing. Petrolera (Petróleo y Gas), Ing. Industrial, Ing. Mecatrónica, Ing. Minera, Ing. Eléctrica, Ing. Electrónica, Ing. Telecomunicaciones, Ing. Agronómica, Ing. Agroindustrial, Ing. de Alimentos, Ing. Química, Ing. de Energías Renovables, técnicos afines en sistemas, electrónica, electricidad, mecánica, construcción y agro.
- SALUD_BIOLOGIA: Medicina, Enfermería, Odontología, Farmacia/Bioquímica y Farmacia, Bioquímica, Biología, Fisioterapia y Kinesiología, Nutrición, Medicina Veterinaria y Zootecnia, Salud Pública y gestión en salud.
- ARTE_CREATIVIDAD: Diseño Gráfico, Diseño Digital/Multimedia, Arquitectura, Artes Plásticas y Visuales, Comunicación Audiovisual, Publicidad y Marketing, Música/Artes Musicales.
- SOCIAL_HUMANIDADES: Derecho, Psicología, Trabajo Social, Sociología, Comunicación Social, Ciencias de la Educación, Educación Inicial, Primaria y Secundaria (todas las especialidades de Normales/ESFM), Filosofía, Historia, Lengua y Literatura, Idiomas.
- NEGOCIOS_ECONOMIA: Administración de Empresas, Administración de Negocios, Ingeniería Comercial, Economía, Ingeniería Financiera, Contaduría Pública, Auditoría, Comercio Exterior/Comercio Internacional, Negocios Internacionales, Marketing y Gestión Comercial.
`; 
if (type === 'GENERAL') {
                // Ya no se usa, el servicio usa las estáticas, pero lo dejamos por si acaso
                return [];
            } else if (type === 'SPECIFIC' && category) {
                prompt = `
Genera ${count} preguntas de opción múltiple para un estudiante de secundaria en Bolivia.
Categoría: **${category}**.
${boliviaContext}

Objetivo: Medir interés real en las actividades diarias de estas carreras, NO conocimientos técnicos.
Estilo: "¿Te gustaría hacer X?", "¿Te ves trabajando en Y?". Evita jerga compleja.

Requisitos JSON:
[ { "question": "...", "options": ["Opción A (Muy interesante)", "Opción B", "Opción C", "Opción D (Poco interesante)"] } ]
Asegúrate de que las 4 opciones sean distintas actividades o niveles de agrado, NO "Sí/No".
`;
            } else if (type === 'CONFIRMATION' && category) {
                prompt = `
Genera ${count} preguntas para diferenciar SUB-ÁREAS dentro de: **${category}**.
${boliviaContext}

Objetivo: Saber si el estudiante prefiere, por ejemplo, Ingeniería Civil vs Sistemas (si es TEC), o Medicina vs Veterinaria (si es SALUD).

Requisitos JSON:
[ { "question": "Dilema de preferencia...", "options": ["Prefiero la opción de [Subárea 1]", "Prefiero [Subárea 2]", "Prefiero [Subárea 3]", "Prefiero [Subárea 4]"] } ]
`;
}

            const generationConfig = {
                temperature: 0.9, // Aumentamos creatividad para evitar duplicados
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig,
            });

            return JSON.parse(result.response.text());

        } catch (error) {
            this.logger.error(`Error generando preguntas (${type} - ${category}):`, error);
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

    async getUniversityRecommendations(careerName: string, region: string = 'Nacional'): Promise<UniversityRecommendation[]> {
        this.logger.log(`Buscando universidades para: ${careerName} en ${region}`);

        const regionContext = region === 'Nacional'
            ? "en toda Bolivia (prioriza las mejores del país)."
            : `específicamente en el departamento de **${region}** o ciudades muy cercanas. Si no hay buenas opciones ahí, sugiere las mejores del país indicando que son de otro lugar.`;


        const prompt = `
Actúa como un experto en educación superior en **Bolivia**.
El usuario quiere estudiar: **"${careerName}"**.

Recomienda las 6 mejores opciones (Universidades Públicas, Privadas o Institutos Técnicos) en ${regionContext} para esta carrera específica.

Provee información detallada y realista. Si la carrera es técnica, prioriza institutos. Si es académica, universidades.

**Formato de Salida JSON (Array):**
[
  {
    "name": "Nombre de la Universidad/Instituto",
    "type": "Pública" | "Privada" | "Instituto Técnico",
    "city": "Ciudad Principal",
    "summary": "Breve resumen de prestigio (1 frase).",
    "details": {
      "years": "Duración (Ej. 5 años / 6 semestres)",
      "admissionType": "Ej. Examen de Disp., Ingreso Libre, PSA",
      "approxCost": "Ej. Gratuita (Solo matrícula), o Bs. 1500/mes",
      "ranking": "Ej. Top 3 nacional, Muy reconocida en el sector",
      "employmentIndex": "Ej. Alto, Medio, Competitivo",
      "curriculumHighlights": ["Materia clave 1", "Materia clave 2", "Materia clave 3","Materia clave 4","Materia clave 5"],
      "description": "Párrafo detallado sobre el enfoque de la carrera en esta institución."
    }
  }
]
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
            return JSON.parse(result.response.text());
        } catch (error) {
            this.logger.error('Error buscando universidades:', error);
            return [];
        }
    }

    async getSkillRecommendations(careerName: string): Promise<CourseRecommendation[]> {
        this.logger.log(`Buscando cursos para: ${careerName} en contexto Bolivia`);

        const prompt = `
Actúa como un tutor educativo experto en Bolivia.
El estudiante quiere prepararse para la carrera: **"${careerName}"**.

Recomienda 30 recursos educativos GRATUITOS (Cursos, Canales de YouTube, Listas de reproducción) para empezar a prepararse.

**Contexto Bolivia:**
1. Prioriza contenido **PREUNIVERSITARIO** (Matemáticas, Física, Química, Lenguaje) necesario para exámenes de ingreso (PSA, Pre-facultativos) de universidades públicas (UMSA, UAGRM, UMSS).
2. Incluye cursos de **Fundamentos** de la carrera.
3. Incluye alguna **Habilidad Blanda** o herramienta digital necesaria.

**Formato de Salida JSON (Array):**
[
  {
    "title": "Nombre del Curso/Video (Ej. 'Física desde Cero para el PSA')",
    "platform": "YouTube" | "Khan Academy" | "Web",
    "type": "Preuniversitario" | "Fundamentos" | "Habilidad Blanda",
    "description": "Breve descripción de por qué sirve para esta carrera.",
    "searchQuery": "Término exacto para buscar este video en YouTube/Google (Ej. 'Curso preuniversitario fisica umsa')",
    "difficulty": "Básico"
  }
]
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
            return JSON.parse(result.response.text());
        } catch (error) {
            this.logger.error('Error buscando cursos:', error);
            return [];
        }
    }
}