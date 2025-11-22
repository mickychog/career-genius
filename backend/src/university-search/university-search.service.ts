import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestSession } from '../vocational-test/schemas/test-session.schema';
import { AiService, UniversityRecommendation } from '../ai/ai.service';

@Injectable()
export class UniversitySearchService {
    constructor(
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
        private aiService: AiService
    ) { }

    async getRecommendationsForUser(userId: string): Promise<{ career: string, recommendations: UniversityRecommendation[] }> {
        // 1. Buscar el último test completado del usuario
        const lastSession = await this.testSessionModel
            .findOne({ user: userId, isCompleted: true })
            .sort({ createdAt: -1 }) // El más reciente
            .exec();

        if (!lastSession || !lastSession.recommendedCareers || lastSession.recommendedCareers.length === 0) {
            throw new NotFoundException('No se encontró un test vocacional completado. Por favor realiza el test primero.');
        }

        // 2. Tomar la carrera principal (la primera de la lista)
        const topCareer = lastSession.recommendedCareers[0].name;

        // 3. Pedir a la IA recomendaciones de universidades para esa carrera
        const recommendations = await this.aiService.getUniversityRecommendations(topCareer);

        return {
            career: topCareer,
            recommendations
        };
    }
}