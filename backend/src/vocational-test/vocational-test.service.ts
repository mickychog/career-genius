// backend/src/vocational-test/vocational-test.service.ts
import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Importa Types
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
    private readonly TEST_QUESTION_COUNT = 10; // Número de preguntas por test (ajustable)

    constructor(
        @InjectModel(Question.name) private questionModel: Model<Question>,
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
        private aiService: AiService,
    ) { }

    /**
     * Genera preguntas usando IA y las guarda en la BD, evitando duplicados simples.
     */
    async generateAndStoreQuestions(count: number = 20): Promise<{ created: number }> {
        this.logger.log(`Solicitando ${count} preguntas a la IA...`);
        const generatedQuestions = await this.aiService.generateVocationalQuestions(count);
        let createdCount = 0;

        for (const qData of generatedQuestions) {
            // Verifica si una pregunta con texto similar ya existe (evita duplicados exactos)
            const existingQuestion = await this.questionModel.findOne({ questionText: qData.question }).exec();
            if (!existingQuestion) {
                const newQuestion = new this.questionModel({
                    questionText: qData.question,
                    options: qData.options,
                    // Puedes intentar inferir categoría o dejarla por defecto
                    category: 'interest',
                });
                await newQuestion.save();
                createdCount++;
                this.logger.log(`Pregunta guardada: ${qData.question.substring(0, 50)}...`);
            } else {
                this.logger.warn(`Pregunta duplicada omitida: ${qData.question.substring(0, 50)}...`);
            }
        }
        this.logger.log(`Proceso completado. ${createdCount} nuevas preguntas creadas.`);
        return { created: createdCount };
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
            // return this.getSessionWithQuestions(existingSession); // Necesitarías implementar esta función auxiliar
            // Opcionalmente, lanza un error si no permites reanudar
            throw new ConflictException('Ya tienes un test vocacional en progreso.');
        }

        // 2. Obtiene N preguntas aleatorias de la base de datos
        const randomQuestions = await this.questionModel.aggregate([
            { $sample: { size: this.TEST_QUESTION_COUNT } },
            { $project: { __v: 0, createdAt: 0, updatedAt: 0 } } // Excluye campos innecesarios
        ]).exec();

        if (randomQuestions.length < this.TEST_QUESTION_COUNT) {
            this.logger.warn(`No hay suficientes preguntas en la BD (${randomQuestions.length}). Se necesitan ${this.TEST_QUESTION_COUNT}.`);
            // Podrías generar más preguntas aquí si es necesario
            if (randomQuestions.length === 0) throw new NotFoundException('No hay preguntas disponibles para iniciar el test.');
        }

        // 3. Crea la nueva sesión de test
        const newSession = new this.testSessionModel({
            user: userId,
            questions: randomQuestions.map(q => q._id), // Guarda solo los IDs
            answers: [],
            isCompleted: false,
        });
        await newSession.save();
        this.logger.log(`Nueva sesión iniciada (${newSession._id}) para usuario ${userId} con ${randomQuestions.length} preguntas.`);

        // 4. Formatea la respuesta para el frontend
        const responseQuestions: TestQuestionDto[] = randomQuestions.map(q => ({
            _id: q._id.toString(),
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
        const session = await this.testSessionModel.findById(sessionId).exec();

        if (!session) {
            throw new NotFoundException(`Sesión de test con ID "${sessionId}" no encontrada.`);
        }
        if (session.user.toString() !== userId) {
            throw new ForbiddenException('No tienes permiso para finalizar esta sesión.');
        }
        if (session.isCompleted) {
            throw new BadRequestException('Este test ya ha sido completado.');
        }

        // Verifica si todas las preguntas han sido respondidas (opcional pero recomendado)
        if (session.answers.length !== session.questions.length) {
            throw new BadRequestException(`Aún no has respondido todas las preguntas (${session.answers.length}/${session.questions.length}).`);
        }

        // Marca como completada
        session.isCompleted = true;
        session.completedAt = new Date();

        // Lógica MUY BÁSICA para calcular un perfil (ejemplo simple)
        // En una aplicación real, esto sería mucho más complejo, analizando
        // las respuestas por categoría y usando quizás la IA o reglas predefinidas.
        const answerCount = session.answers.length;
        session.resultProfile = `Perfil Ejemplo (Basado en ${answerCount} respuestas)`;

        this.logger.log(`Sesión ${sessionId} completada por usuario ${userId}. Resultado: ${session.resultProfile}`);

        return session.save();
    }

    /**
     * (Función auxiliar potencial para reanudar test)
     * Obtiene los detalles completos de las preguntas para una sesión existente.
     */
    /*
    private async getSessionWithQuestions(session: TestSession): Promise<StartTestResponse> {
        const populatedSession = await session.populate<{ questions: Question[] }>('questions');
        const responseQuestions: TestQuestionDto[] = populatedSession.questions.map(q => ({
            _id: q._id.toString(),
            questionText: q.questionText,
            options: q.options,
            category: q.category,
        }));
        return {
            sessionId: session._id.toString(),
            questions: responseQuestions,
        };
    }
    */
}