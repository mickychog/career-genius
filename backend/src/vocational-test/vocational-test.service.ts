// backend/src/vocational-test/vocational-test.service.ts
import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose'; // Importa Types
import { Question } from './schemas/question.schema';
import { TestSession } from './schemas/test-session.schema';
import { AiService } from '../ai/ai.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto'; // Crearemos este DTO

// Define una interfaz para la estructura de la pregunta que devolveremos al frontend
export interface TestQuestionDto {
    _id: string;
    questionText: string;
    options: string[];
    category?: string; // Incluimos categoría si la quieres mostrar
}

// Define una interfaz para la respuesta al iniciar el test
export interface StartTestResponse {
    sessionId: string;
    questions: TestQuestionDto[];
}

@Injectable()
export class VocationalTestService {
    private readonly logger = new Logger(VocationalTestService.name);
    private readonly QUESTIONS_PER_CATEGORY = 7;
    //private readonly TEST_QUESTION_COUNT = 10; 

    constructor(
        @InjectModel(Question.name) private questionModel: Model<Question>,
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
        private aiService: AiService,
    ) { }


    async generateAndStoreQuestions(totalGoal: number = 200): Promise<{ message: string, total: number }> {
        const categories = [
            'ESTILO_INTERES',
            'AMBIENTE_LABORAL',
            'VALORES_MOTIVACION',
            'HABILIDADES_APRENDIZAJE'
        ];

        const goalPerCategory = Math.ceil(totalGoal / categories.length); // Ej: 200 / 4 = 50 por categoría
        let totalCreated = 0;

        this.logger.log(`=== INICIANDO GENERACIÓN MASIVA: Meta ${totalGoal} preguntas (${goalPerCategory} por cat.) ===`);

        for (const category of categories) {
            // 1. Contar cuántas tenemos ya de esta categoría
            let currentCount = await this.questionModel.countDocuments({ category }).exec();

            this.logger.log(`Categoría ${category}: Tiene ${currentCount}, Meta ${goalPerCategory}`);

            while (currentCount < goalPerCategory) {
                const missing = goalPerCategory - currentCount;
                // Pedimos lotes pequeños (máx 10) para evitar timeouts de la IA
                const batchSize = Math.min(missing, 10);

                this.logger.log(`   >>> Generando lote de ${batchSize} preguntas para ${category}...`);

                // Llamamos a la IA con la categoría específica
                const newQuestionsData = await this.aiService.generateVocationalQuestions(batchSize, category);

                if (newQuestionsData.length === 0) {
                    this.logger.warn(`   !!! La IA no devolvió preguntas para ${category}. Reintentando...`);
                    continue; // Reintenta el bucle
                }

                for (const qData of newQuestionsData) {
                    // Verificación de duplicados (Texto exacto)
                    const exists = await this.questionModel.exists({ questionText: qData.question });

                    if (!exists) {
                        await this.questionModel.create({
                            questionText: qData.question,
                            options: qData.options,
                            category: category
                        });
                        totalCreated++;
                        currentCount++; // Incrementamos contador local
                    } else {
                        this.logger.debug(`   Duplicado omitido: "${qData.question.substring(0, 20)}..."`);
                    }
                }

                // Pequeña pausa para no saturar la API (opcional)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const finalCount = await this.questionModel.countDocuments().exec();
        return {
            message: `Proceso finalizado. Se crearon ${totalCreated} nuevas preguntas.`,
            total: finalCount
        };
    }

    /**
     * Inicia una nueva sesión de test para un usuario.
     */
    async startTest(userId: string): Promise<StartTestResponse> {
        // 1. Verifica si ya hay una sesión activa sin completar
        const existingSession = await this.testSessionModel.findOne({ user: userId, isCompleted: false }).exec();
        if (existingSession) {
            this.logger.log(`Usuario ${userId} ya tiene una sesión activa (${existingSession._id}). Reanudando...`);
            // Si quieres permitir reanudar, devuelve la sesión existente
            return this.getSessionWithQuestions(existingSession); // Necesitarías implementar esta función auxiliar
            // Opcionalmente, lanza un error si no permites reanudar
            //throw new ConflictException('Ya tienes un test vocacional en progreso.');
        }

        // 2. Obtiene preguntas ESTRATIFICADAS (7 de cada categoría)
        // Usamos $facet para hacer 4 sub-consultas paralelas
        const aggregation = await this.questionModel.aggregate([
            {
                $facet: {
                    'interes': [
                        { $match: { category: 'ESTILO_INTERES' } },
                        { $sample: { size: this.QUESTIONS_PER_CATEGORY } }
                    ],
                    'ambiente': [
                        { $match: { category: 'AMBIENTE_LABORAL' } },
                        { $sample: { size: this.QUESTIONS_PER_CATEGORY } }
                    ],
                    'valores': [
                        { $match: { category: 'VALORES_MOTIVACION' } },
                        { $sample: { size: this.QUESTIONS_PER_CATEGORY } }
                    ],
                    'habilidades': [
                        { $match: { category: 'HABILIDADES_APRENDIZAJE' } },
                        { $sample: { size: this.QUESTIONS_PER_CATEGORY } }
                    ]
                }
            },
            {
                // Combinamos los 4 arrays en uno solo
                $project: {
                    allQuestions: {
                        $concatArrays: ['$interes', '$ambiente', '$valores', '$habilidades']
                    }
                }
            }
        ]).exec();

        // El resultado de facet viene en un array con un solo objeto
        const randomQuestions = aggregation[0].allQuestions;

        // Validación de seguridad: ¿Tenemos suficientes preguntas?
        // Necesitamos 28 preguntas (7x4)
        const totalNeeded = this.QUESTIONS_PER_CATEGORY * 4;
        if (!randomQuestions || randomQuestions.length < totalNeeded) {
            this.logger.warn(`Stock insuficiente. Se encontraron ${randomQuestions?.length || 0} preguntas de ${totalNeeded} necesarias.`);
            throw new NotFoundException('No hay suficientes preguntas en la base de datos para generar un test equilibrado. Por favor contacta al administrador.');
        }

        // 3. Barajar (Shuffle) las preguntas para que no salgan en bloques por categoría
        // Algoritmo de Fisher-Yates simple
        for (let i = randomQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [randomQuestions[i], randomQuestions[j]] = [randomQuestions[j], randomQuestions[i]];
        }

        // 4. Crea la nueva sesión de test (código igual que antes)
        const newSession = new this.testSessionModel({
            user: userId,
            questions: randomQuestions.map(q => q._id),
            answers: [],
            isCompleted: false,
        });

        // ... (Manejo de duplicados try/catch igual que antes) ...
        try {
            await newSession.save();
            this.logger.log(`Nueva sesión iniciada (${String(newSession._id)}) con ${randomQuestions.length} preguntas estratificadas.`);
        } catch (error) {
            if (error.code === 11000) {
                const createdSession = await this.testSessionModel.findOne({ user: userId, isCompleted: false }).exec();
                if (createdSession) return this.getSessionWithQuestions(createdSession);
            }
            throw error;
        }

        // 5. Formatea la respuesta
        const responseQuestions: TestQuestionDto[] = randomQuestions.map(q => ({
            _id: String(q._id),
            questionText: q.questionText,
            options: q.options,
            category: q.category
        }));

        return {
            sessionId: String(newSession._id),
            questions: responseQuestions,
        };
    }

    /**
     * Guarda la respuesta de un usuario a una pregunta específica en una sesión.
     */
    async submitAnswer(sessionId: string, userId: string, submitAnswerDto: SubmitAnswerDto): Promise<TestSession> {
        const { questionId, selectedOptionIndex } = submitAnswerDto;

        const session = await this.testSessionModel.findById(sessionId).exec();

        if (!session) {
            throw new NotFoundException(`Sesión de test con ID "${sessionId}" no encontrada.`);
        }

        console.log('SUBMIT ANSWER: Session User ID:', session.user.toString());
        console.log('SUBMIT ANSWER: Token User ID (userId):', userId);

        if (session.user.toString() !== userId) {
            throw new ForbiddenException('No tienes permiso para responder en esta sesión.');
        }
        if (session.isCompleted) {
            throw new BadRequestException('Este test ya ha sido completado.');
        }

        // Verifica que la pregunta pertenezca a esta sesión
        const questionObjectId = new Types.ObjectId(questionId); // Convierte string a ObjectId
        const questionInSession = session.questions.some(qId => qId.equals(questionObjectId));
        if (!questionInSession) {
            throw new BadRequestException(`La pregunta con ID "${questionId}" no pertenece a esta sesión.`);
        }

        // Valida el índice de la opción
        if (selectedOptionIndex < 0 || selectedOptionIndex > 3) {
            throw new BadRequestException('El índice de la opción seleccionada debe estar entre 0 y 3.');
        }

        // Busca si ya existe una respuesta para esta pregunta
        const existingAnswerIndex = session.answers.findIndex(a => a.question.equals(questionObjectId));

        if (existingAnswerIndex > -1) {
            // Actualiza la respuesta existente
            session.answers[existingAnswerIndex].selectedOptionIndex = selectedOptionIndex;
            this.logger.log(`Respuesta actualizada para pregunta ${questionId} en sesión ${sessionId}.`);
        } else {
            // Añade la nueva respuesta
            session.answers.push({ question: questionObjectId, selectedOptionIndex });
            this.logger.log(`Respuesta guardada para pregunta ${questionId} en sesión ${sessionId}.`);
        }

        // Guarda la sesión actualizada
        return session.save();
    }

    /**
     * Marca una sesión de test como completada y calcula el resultado (simple).
     */
    
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
            };
        }).filter(item => item !== null);

        const answersText = JSON.stringify(answersData, null, 2);

        try {
            const analysisResult = await this.aiService.analyzeTestResults(answersText);

            session.resultProfile = analysisResult.profile;
            session.analysisReport = analysisResult.report;
            session.recommendedCareers = analysisResult.careers; // <--- GUARDAMOS LAS CARRERAS ESTRUCTURADAS

        } catch (error) {
            this.logger.error('Error IA:', error);
            session.resultProfile = 'Análisis Pendiente';
            session.analysisReport = 'Hubo un problema técnico. Por favor contacta soporte.';
        }

        session.isCompleted = true;
        session.completedAt = new Date();

        return session.save();
    }

    private async getSessionWithQuestions(session: TestSession): Promise<StartTestResponse> {
        const populatedSession = await session.populate<{ questions: Question[] }>('questions');

        const responseQuestions: TestQuestionDto[] = populatedSession.questions.map(q => ({
            _id: String(q._id), 
            questionText: q.questionText,
            options: q.options,
            category: q.category,
        }));

        // CORRECCIÓN 3: Usamos String() para asegurar el tipo de _id
        this.logger.log(`Sesión ${String(session._id)} reanudada con ${responseQuestions.length} preguntas.`);

        return {
            // CORRECCIÓN 3 (2ª parte): Usamos String()
            sessionId: String(session._id),
            questions: responseQuestions,
        };   
    }

    async getTestSessionResults(sessionId: string, userId: string): Promise<TestSession> {
        const session = await this.testSessionModel.findById(sessionId).exec();

        if (!session) {
            throw new NotFoundException(`Sesión con ID ${sessionId} no encontrada.`);
        }
        if (session.user.toString() !== userId) {
            throw new ForbiddenException('No tienes permiso para ver esta sesión.');
        }
        if (!session.isCompleted) {
            throw new BadRequestException('El test aún no ha sido completado.');
        }

        // El resultado está en la sesión, solo la devolvemos
        return session;
    }

    /**
     * Actualiza datos demográficos de la sesión
     */
    async updateDemographics(sessionId: string, userId: string, age: number, gender: string): Promise<void> {
        const session = await this.testSessionModel.findById(sessionId);
        if (!session || session.user.toString() !== userId) {
            throw new ForbiddenException('Sesión no válida.');
        }
        session.userAge = age;
        session.userGender = gender;
        await session.save();
    }
}