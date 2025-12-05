import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestSession } from '../vocational-test/schemas/test-session.schema';
import { AiService, CourseRecommendation } from '../ai/ai.service';

@Injectable()
export class SkillsDevelopmentService {
    private readonly logger = new Logger(SkillsDevelopmentService.name);

    constructor(
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
        private aiService: AiService
    ) { }

    async getSkillsForUser(userId: string): Promise<{ career: string, courses: CourseRecommendation[] }> {
        this.logger.log(`Buscando test completado para usuario: ${userId}`);

        // 1. Obtener la última sesión completada
        const lastSession = await this.testSessionModel
            .findOne({ user: userId, isCompleted: true })
            .sort({ createdAt: -1 })
            .exec();

        if (!lastSession) {
            this.logger.warn(`No se encontró ninguna sesión completada para el usuario ${userId}`);
            throw new NotFoundException('No se encontró un test vocacional completado.');
        }

        // Devolver caché si existe
        if (lastSession.savedCourses && lastSession.savedCourses.length > 0) {
            return {
                career: lastSession.selectedCareer || lastSession.recommendedCareers[0].name,
                courses: lastSession.savedCourses as CourseRecommendation[]
            };
        }

        // 2. DETERMINAR LA CARRERA OBJETIVO (Lógica Robusta)
        // Prioridad 1: Carrera seleccionada manualmente (guardada en BD)
        // Prioridad 2: Primera carrera recomendada (si existe el array)
        let targetCareer = lastSession.selectedCareer;

        if (!targetCareer) {
            if (lastSession.recommendedCareers && lastSession.recommendedCareers.length > 0) {
                targetCareer = lastSession.recommendedCareers[0].name;
            }
        }

        // 3. Validación Final
        if (!targetCareer) {
            this.logger.error(`Sesión ${lastSession._id} encontrada pero sin carrera seleccionada ni recomendaciones.`);
            throw new NotFoundException('No hay una carrera definida para generar habilidades. Por favor realiza el test.');
        }

        this.logger.log(`Generando cursos para: ${targetCareer}`);

        // 4. Pedir recomendaciones de cursos a la IA
        const courses = await this.aiService.getSkillRecommendations(targetCareer);

        await this.testSessionModel.findByIdAndUpdate(
            lastSession._id,
            { $set: { savedCourses: courses } }
        ).exec();
        
        return {
            career: targetCareer,
            courses
        };
    }
}