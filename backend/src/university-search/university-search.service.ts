import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestSession } from '../vocational-test/schemas/test-session.schema';
import { AiService, UniversityRecommendation } from '../ai/ai.service';

@Injectable()
export class UniversitySearchService {
    private readonly logger = new Logger(UniversitySearchService.name);

    constructor(
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
        private aiService: AiService
    ) { }

    async getRecommendationsForUser(userId: string, region: string = 'Nacional'): Promise<{ career: string, recommendations: UniversityRecommendation[] }> {
        this.logger.log(`Buscando universidades para usuario: ${userId} en ${region}`);

        // 1. Buscar el último test completado del usuario
        const lastSession = await this.testSessionModel
            .findOne({ user: userId, isCompleted: true })
            .sort({ createdAt: -1 }) // El más reciente
            .exec();

        if (!lastSession || !lastSession.recommendedCareers || lastSession.recommendedCareers.length === 0) {
            throw new NotFoundException('No se encontró un test vocacional completado. Por favor realiza el test primero.');
        }

        // Si ya tenemos universidades guardadas para esta sesión, las devolvemos 
        // Si quieres refrescar siempre, comenta este bloque if.
        // if (lastSession.savedUniversities && lastSession.savedUniversities.length > 0) {
        //     this.logger.log('Devolviendo universidades guardadas en DB.');
        //     return {
        //         career: lastSession.selectedCareer || lastSession.recommendedCareers[0].name,
        //         recommendations: lastSession.savedUniversities as UniversityRecommendation[]
        //     };
        // }

        // 2. DETERMINAR LA CARRERA OBJETIVO (CORRECCIÓN)
        // Si el usuario guardó una carrera explícitamente, usamos esa.
        // Si no, usamos la primera de la lista recomendada por defecto.
        const targetCareer = lastSession.selectedCareer || lastSession.recommendedCareers[0].name;

        this.logger.log(`Carrera objetivo para búsqueda: ${targetCareer}`);

        // Llamada a la IA con la región
        const recommendations = await this.aiService.getUniversityRecommendations(targetCareer, region);

        // 3. Pedir a la IA recomendaciones de universidades para esa carrera específica
        // const recommendations = await this.aiService.getUniversityRecommendations(targetCareer);

        // --- GUARDAR EN BASE DE DATOS ---
        await this.testSessionModel.findByIdAndUpdate(
            lastSession._id,
            { $set: { savedUniversities: recommendations } }
        ).exec();

        return {
            career: targetCareer,
            recommendations
        };
    }
}