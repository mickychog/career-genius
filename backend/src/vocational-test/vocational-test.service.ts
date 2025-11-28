import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Question, QuestionType, VocationalArea } from './schemas/question.schema';
import { TestSession, UserAnswer } from './schemas/test-session.schema';
import { AiService } from '../ai/ai.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

export interface TestQuestionDto {
    _id: string;
    questionText: string;
    options: { text: string; originalIndex: number }[]; 
    type: string;
}

export interface StartTestResponse {
    sessionId: string;
    questions: TestQuestionDto[];
    currentPhase: string;
}

@Injectable()
export class VocationalTestService {
    private readonly logger = new Logger(VocationalTestService.name);

    // Configuración del TEST (Lo que ve el usuario)
    private readonly QUESTIONS_PHASE_1_GENERAL = 5;
    private readonly QUESTIONS_PHASE_2_SPECIFIC = 6;
    private readonly QUESTIONS_PHASE_3_CONFIRMATION = 5;

    constructor(
        @InjectModel(Question.name) private questionModel: Model<Question>,
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
        private aiService: AiService,
    ) { }

    // --- 1. GENERACIÓN HÍBRIDA (ESTÁTICA + IA) ---
    async generateAndStoreQuestions(targetTotal: number = 100): Promise<any> {
        let totalCreated = 0;
        const areas = Object.values(VocationalArea).filter(a => a !== 'NINGUNA');

        // A. INYECTAR PREGUNTAS GENERALES ESTÁTICAS (BALANCEADAS)
        // Estas preguntas están diseñadas para no requerir conocimiento previo, solo preferencia.
        const staticGeneralQuestions = [
            {
                questionText: "¿Qué tipo de actividad disfrutarías más en un proyecto escolar?",
                options: [
                    { text: "Diseñar y construir el prototipo o maqueta física.", pointsTo: VocationalArea.TEC_INGENIERIA },
                    { text: "Investigar sobre el funcionamiento del cuerpo o la naturaleza.", pointsTo: VocationalArea.SALUD_BIOLOGIA },
                    { text: "Crear la parte visual, los dibujos o la música de fondo.", pointsTo: VocationalArea.ARTE_CREATIVIDAD },
                    { text: "Organizar al equipo, presentar el proyecto y vender la idea.", pointsTo: VocationalArea.NEGOCIOS_ECONOMIA },
                    { text: "Ninguna de las anteriores / No me interesa.", pointsTo: VocationalArea.NINGUNA }
                ]
            },
            {
                questionText: "Si tuvieras una tarde libre para aprender algo nuevo en YouTube, ¿qué buscarías?",
                options: [
                    { text: "Documentales sobre historia, leyes o comportamiento humano.", pointsTo: VocationalArea.SOCIAL_HUMANIDADES },
                    { text: "Tutoriales sobre tecnología, programación o cómo funcionan las máquinas.", pointsTo: VocationalArea.TEC_INGENIERIA },
                    { text: "Videos sobre primeros auxilios, biología o cuidado animal.", pointsTo: VocationalArea.SALUD_BIOLOGIA },
                    { text: "Consejos sobre inversiones, emprendimiento o marketing.", pointsTo: VocationalArea.NEGOCIOS_ECONOMIA },
                    { text: "Ninguna de las anteriores.", pointsTo: VocationalArea.NINGUNA }
                ]
            },
            {
                questionText: "¿Qué problema te motiva más resolver en Bolivia?",
                options: [
                    { text: "La falta de infraestructura tecnológica e industrial.", pointsTo: VocationalArea.TEC_INGENIERIA },
                    { text: "La desigualdad social y la falta de justicia.", pointsTo: VocationalArea.SOCIAL_HUMANIDADES },
                    { text: "La falta de expresión cultural y espacios artísticos.", pointsTo: VocationalArea.ARTE_CREATIVIDAD },
                    { text: "El estancamiento económico y la falta de empresas.", pointsTo: VocationalArea.NEGOCIOS_ECONOMIA },
                    { text: "Ninguna de las anteriores.", pointsTo: VocationalArea.NINGUNA }
                ]
            },
            {
                questionText: "Imagina tu lugar de trabajo ideal. ¿Cómo es?",
                options: [
                    { text: "Un laboratorio, hospital o campo abierto cuidando seres vivos.", pointsTo: VocationalArea.SALUD_BIOLOGIA },
                    { text: "Un estudio creativo, taller de arte o escenario.", pointsTo: VocationalArea.ARTE_CREATIVIDAD },
                    { text: "Una oficina corporativa, banco o sala de reuniones.", pointsTo: VocationalArea.NEGOCIOS_ECONOMIA },
                    { text: "Juzgados, escuelas o centros comunitarios ayudando gente.", pointsTo: VocationalArea.SOCIAL_HUMANIDADES },
                    { text: "Ninguna de las anteriores.", pointsTo: VocationalArea.NINGUNA }
                ]
            },
            {
                questionText: "¿Qué materias te resultan más naturales o fáciles?",
                options: [
                    { text: "Matemáticas, Física o Computación.", pointsTo: VocationalArea.TEC_INGENIERIA },
                    { text: "Biología, Química o Ciencias Naturales.", pointsTo: VocationalArea.SALUD_BIOLOGIA },
                    { text: "Artes Plásticas, Música o Literatura.", pointsTo: VocationalArea.ARTE_CREATIVIDAD },
                    { text: "Historia, Cívica, Psicología o Filosofía.", pointsTo: VocationalArea.SOCIAL_HUMANIDADES },
                    { text: "Ninguna de las anteriores.", pointsTo: VocationalArea.NINGUNA }
                ]
            }
        ];

        this.logger.log(`Inyectando ${staticGeneralQuestions.length} preguntas GENERALES estáticas...`);
        for (const q of staticGeneralQuestions) {
            await this.createQuestionIfNew(q.questionText, q.options, QuestionType.GENERAL);
            totalCreated++;
        }

        // B. GENERAR PREGUNTAS ESPECÍFICAS CON IA (Usando el Mapa de Bolivia)
        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

        // Calculamos cuántas necesitamos por área para llenar el stock
        const targetPerArea = 10; // 5 Específicas + 5 Confirmación por área en el banco

        for (const area of areas) {
            // Fase 2: Específicas
            this.logger.log(`Generando SPECIFIC para ${area} (Nivel Secundaria)...`);
            try {
                const specificQs = await this.aiService.generateVocationalQuestions(5, 'SPECIFIC', area);
                if (specificQs && specificQs.length > 0) {
                    for (const q of specificQs) {
                        const text = q.question;
                        // Asegurar 5ta opción
                        const opts = [...q.options];
                        if (opts.length === 4) opts.push("Ninguna de las anteriores");

                        await this.createQuestionIfNew(text, opts, QuestionType.SPECIFIC, area as VocationalArea);
                        totalCreated++;
                    }
                }
            } catch (e) { this.logger.error(e); }

            await sleep(2000);

            // Fase 3: Confirmación
            this.logger.log(`Generando CONFIRMATION para ${area} (Sub-áreas)...`);
            try {
                const confirmQs = await this.aiService.generateVocationalQuestions(5, 'CONFIRMATION', area);
                if (confirmQs && confirmQs.length > 0) {
                    for (const q of confirmQs) {
                        const text = q.question;
                        const opts = [...q.options];
                        if (opts.length === 4) opts.push("Ninguna de las anteriores");

                        await this.createQuestionIfNew(text, opts, QuestionType.CONFIRMATION, area as VocationalArea);
                        totalCreated++;
                    }
                }
            } catch (e) { this.logger.error(e); }

            await sleep(2000);
        }

        return { message: `Base de datos actualizada. Total procesado: ${totalCreated}` };
    }

    private async createQuestionIfNew(text: string, options: any[], type: QuestionType, area: VocationalArea = VocationalArea.NINGUNA) {
        const exists = await this.questionModel.exists({ questionText: text });
        if (!exists) {
            await this.questionModel.create({ questionText: text, options, type, area });
        }
    }

    // --- 2. INICIAR TEST ---
    async startTest(userId: string): Promise<StartTestResponse> {
        const existingSession = await this.testSessionModel.findOne({ user: userId, isCompleted: false }).exec();
        if (existingSession) return this.getSessionWithQuestions(existingSession as TestSession & Document);

        // Obtener las 5 preguntas generales estáticas
        const generalQuestions = await this.questionModel.aggregate([
            { $match: { type: 'GENERAL' } },
            { $sample: { size: this.QUESTIONS_PHASE_1_GENERAL } }
        ]).exec();

        if (generalQuestions.length === 0) {
            throw new NotFoundException('No hay preguntas generales. Ejecuta generate-questions.');
        }

        const newSession = new this.testSessionModel({
            user: userId,
            questions: generalQuestions.map(q => q._id),
            answers: [],
            scores: {},
            currentPhase: 'GENERAL',
            isCompleted: false,
        });

        try {
            await newSession.save();
        } catch (error: any) {
            if (error.code === 11000) {
                const created = await this.testSessionModel.findOne({ user: userId, isCompleted: false }).exec();
                if (created) return this.getSessionWithQuestions(created as TestSession & Document);
            }
            throw error;
        }
        return this.formatResponse(newSession as TestSession & Document, generalQuestions);
    }

    // --- 3. RESPONDER ---
    async submitAnswer(sessionId: string, userId: string, dto: SubmitAnswerDto): Promise<any> {
        const session = await this.testSessionModel.findById(sessionId).populate('questions').exec() as TestSession & Document;
        if (!session || session.user.toString() !== userId) throw new ForbiddenException('Sesión inválida.');

        const questionIdStr = dto.questionId;
        const questionsArray = session.questions as unknown as (Question & Document)[];
        const questionDoc = questionsArray.find(q => String(q._id) === questionIdStr);

        if (!questionDoc) throw new BadRequestException('Pregunta no encontrada.');

        const newAnswer: UserAnswer = {
            question: new Types.ObjectId(questionIdStr) as any,
            selectedOptionIndex: dto.selectedOptionIndex
        };

        if (!session.scores) session.scores = new Map<string, number>();
        if (!(session.scores instanceof Map)) session.scores = new Map(Object.entries(session.scores));

        // Puntuación Inteligente
        // Si es GENERAL: Suma puntos según el mapeo
        if (questionDoc.type === QuestionType.GENERAL) {
            const selectedOption = questionDoc.options[dto.selectedOptionIndex];
            // Solo sumar si NO es la opción "Ninguna" (que no tiene pointsTo o es NINGUNA)
            if (selectedOption && selectedOption.pointsTo && selectedOption.pointsTo !== 'NINGUNA') {
                const area = selectedOption.pointsTo;
                const currentScore = session.scores.get(area) || 0;
                session.scores.set(area, currentScore + 1);
            }
        }
        // Si es ESPECIFICA: Suma puntos al área de la pregunta
        else if (questionDoc.type === QuestionType.SPECIFIC) {
            // Si elige la opción 4 ("Ninguna"), NO sumamos puntos
            // Asumimos que índices 0,1,2,3 son positivos, 4 es negativo/neutro
            if (dto.selectedOptionIndex < 4) {
                const area = questionDoc.area;
                const currentScore = session.scores.get(area) || 0;
                session.scores.set(area, currentScore + 1);
            }
        }

        const existingIdx = session.answers.findIndex(a => a.question.toString() === questionIdStr);
        if (existingIdx >= 0) session.answers[existingIdx] = newAnswer;
        else session.answers.push(newAnswer);

        let nextPhaseMsg: string | null = null;
        let nextPhaseCode: string | null = null;

        if (session.answers.length >= session.questions.length) {
            session.depopulate('questions');

            if (session.currentPhase === 'GENERAL') {
                await this.transitionToSpecificPhase(session);
                nextPhaseMsg = 'Analizando tus intereses...';
                nextPhaseCode = 'SPECIFIC';
            } else if (session.currentPhase === 'SPECIFIC') {
                await this.transitionToConfirmationPhase(session);
                nextPhaseMsg = 'Perfilando tu rol ideal...';
                nextPhaseCode = 'CONFIRMATION';
            } else if (session.currentPhase === 'CONFIRMATION') {
                nextPhaseMsg = 'Test completado.';
                nextPhaseCode = 'FINISHED';
            }
        }

        await session.save();
        if (nextPhaseCode) return { message: nextPhaseMsg, nextPhase: nextPhaseCode };
        return { message: 'Respuesta guardada' };
    }

    private async transitionToSpecificPhase(session: TestSession & Document) {
        const scoresArray = Array.from(session.scores.entries()).sort((a, b) => b[1] - a[1]);
        // Tomamos las 2 áreas con más puntaje. Si hubo empate o ceros, tomamos defaults.
        const topAreas = scoresArray.slice(0, 2).map(e => e[0]);

        // Fallbacks si el usuario puso "Ninguna" a todo
        if (topAreas.length === 0) topAreas.push(VocationalArea.TEC_INGENIERIA);
        if (topAreas.length === 1) topAreas.push(VocationalArea.NEGOCIOS_ECONOMIA); // Default popular

        session.activeBranches = topAreas;

        // Buscamos preguntas: 3 de cada área top = 6 preguntas
        const specificQuestions = await this.questionModel.aggregate([
            { $match: { type: 'SPECIFIC', area: { $in: topAreas } } },
            { $sample: { size: this.QUESTIONS_PHASE_2_SPECIFIC } }
        ]).exec();

        const newIds = specificQuestions.map(q => q._id);
        session.questions.push(...newIds);
        session.currentPhase = 'SPECIFIC';
    }

    private async transitionToConfirmationPhase(session: TestSession & Document) {
        const scoresArray = Array.from(session.scores.entries()).sort((a, b) => b[1] - a[1]);
        // El ganador absoluto
        const winnerArea = scoresArray[0][0] || VocationalArea.TEC_INGENIERIA;

        const confirmationQuestions = await this.questionModel.aggregate([
            { $match: { type: 'CONFIRMATION', area: winnerArea } },
            { $sample: { size: this.QUESTIONS_PHASE_3_CONFIRMATION } }
        ]).exec();

        const newIds = confirmationQuestions.map(q => q._id);
        session.questions.push(...newIds);
        session.currentPhase = 'CONFIRMATION';
    }
    
    async finishTest(sessionId: string, userId: string): Promise<TestSession> {
        const session = await this.testSessionModel.findById(sessionId)
            .populate('answers.question')
            .exec() as TestSession & Document;

        if (!session || session.user.toString() !== userId || session.isCompleted) {
            throw new BadRequestException('Sesión inválida o ya completada.');
        }

        const answersData = session.answers.map(answer => {
            const questionDoc = answer.question as any;
            if (!questionDoc || !questionDoc.options) return null;
            return {
                pregunta: questionDoc.questionText,
                respuesta: questionDoc.options[answer.selectedOptionIndex],
                fase: questionDoc.type
            };
        }).filter(item => item !== null);

        const answersText = JSON.stringify(answersData, null, 2);

        try {
            const analysisResult = await this.aiService.analyzeTestResults(answersText);
            session.resultProfile = analysisResult.profile;
            session.analysisReport = analysisResult.report;
            if (analysisResult.careers && analysisResult.careers.length > 0) {
                session.recommendedCareers = analysisResult.careers;
                session.selectedCareer = analysisResult.careers[0].name;
            }
        } catch (error) {
            this.logger.error('Error IA (Fallback):', error);
            session.resultProfile = 'Perfil en Exploración';
            session.analysisReport = `### Análisis Pendiente\nHubo un problema técnico.`;
            session.recommendedCareers = [{ name: "Orientación General", duration: "Flexible", reason: "Fallback" }];
            session.selectedCareer = "Orientación General";
        }
        session.isCompleted = true;
        session.completedAt = new Date();
        return session.save();
    }

    private async getSessionWithQuestions(session: TestSession & Document): Promise<StartTestResponse> {
        const populatedSession = await session.populate<{ questions: Question[] }>('questions');
        return this.formatResponse(populatedSession as any, populatedSession.questions);
    }

    async getTestSessionResults(sessionId: string, userId: string): Promise<TestSession> {
        const session = await this.testSessionModel.findById(sessionId).exec();
        if (!session) throw new NotFoundException('Sesión no encontrada.');
        return session;
    }

    async updateDemographics(sessionId: string, userId: string, age: number, gender: string): Promise<void> {
        const session = await this.testSessionModel.findById(sessionId);
        if (!session || session.user.toString() !== userId) throw new ForbiddenException('Sesión no válida.');
        session.userAge = age;
        session.userGender = gender;
        await session.save();
    }

    async selectCareer(sessionId: string, userId: string, careerName: string): Promise<TestSession> {
        const session = await this.testSessionModel.findById(sessionId).exec() as TestSession & Document;
        if (!session || session.user.toString() !== userId) throw new ForbiddenException('Sesión inválida.');
        session.selectedCareer = careerName;
        return session.save();
    }

    async getUserTestStatus(userId: string) {
        const lastCompleted = await this.testSessionModel
            .findOne({ user: userId, isCompleted: true })
            .sort({ createdAt: -1 })
            .exec();

        return {
            hasCompletedTest: !!lastCompleted,
            selectedCareer: lastCompleted?.selectedCareer || null,
            sessionId: lastCompleted?._id || null
        };
    }

    // --- HELPER DE ALEATORIZACIÓN ---
    private formatResponse(session: TestSession & Document, questionsDocs: any[]): StartTestResponse {
        // 1. Mapeamos y Aleatorizamos Opciones
        const mappedQuestions = questionsDocs.map(q => ({
            _id: String(q._id),
            questionText: q.questionText,
            options: this.shuffleOptions(q.options),
            type: q.type
        }));

        // 2. ORDENAR EXPLÍCITAMENTE POR FASE
        // Esto garantiza que el frontend siempre reciba: GENERAL -> SPECIFIC -> CONFIRMATION
        const phaseOrder = { 'GENERAL': 1, 'SPECIFIC': 2, 'CONFIRMATION': 3 };

        mappedQuestions.sort((a, b) => {
            const orderA = phaseOrder[a.type] || 99;
            const orderB = phaseOrder[b.type] || 99;
            return orderA - orderB;
        });

        return {
            sessionId: String(session._id),
            currentPhase: session.currentPhase,
            questions: mappedQuestions
        };
    }

    private shuffleOptions(options: any[]): { text: string; originalIndex: number }[] {
        // 1. Normalizar a estructura común con índice original
        const normalized = options.map((opt, index) => {
            const text = typeof opt === 'string' ? opt : opt.text;
            return { text, originalIndex: index };
        });

        // 2. Mezclar (Fisher-Yates Shuffle)
        for (let i = normalized.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [normalized[i], normalized[j]] = [normalized[j], normalized[i]];
        }

        return normalized;
    }
}