import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TestSession } from '../vocational-test/schemas/test-session.schema'; 

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(TestSession.name) private testSessionModel: Model<TestSession>,
    ) { }
    

    // Busca un usuario por su email
    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    // Crea un nuevo usuario (usado por el registro)
    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    // Busca un usuario por su ID (usado por el guardián de JWT)
    async findOneById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    // --- NUEVO: Obtener perfil completo ---
    async getProfile(userId: string): Promise<User | null> {
        const userDoc = await this.userModel.findById(userId).select('-password').exec();

        // ✅ CORRECCIÓN: Convertir explícitamente a un objeto JSON plano.
        if (userDoc) {
            // Esto asegura que todas las propiedades se incluyan en la respuesta HTTP.
            return userDoc.toObject({ getters: true, virtuals: false }) as User;
        }
        return null;
    }


    // --- NUEVO: Guardar cambios en el perfil ---
    async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User & Document> {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: updateUserDto },
            { new: true, runValidators: true } // new: true devuelve el documento actualizado
        ).exec();

        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }
        return user as unknown as User & Document;
    }

    // --- ESTADÍSTICAS DEL DASHBOARD ACTUALIZADAS ---
    async getUserDashboardStats(userId: string) {
        const user = await this.userModel.findById(userId).select('-password').exec();

        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        // 1. Calcular Progreso del Perfil
        const requiredProfileFields = ['name', 'headline', 'location', 'birthDate', 'phone'];
        let completedProfileFields = 0;

        requiredProfileFields.forEach(field => {
            if (user.get(field)) completedProfileFields++;
        });

        const profileCompletion = Math.round((completedProfileFields / requiredProfileFields.length) * 100);

        // 2. Obtener Estado del Test Vocacional
        const lastSession = await this.testSessionModel
            .findOne({ user: userId })
            .sort({ createdAt: -1 })
            .exec();

        const testCompleted = lastSession?.isCompleted || false;
        const careerSelected = lastSession?.selectedCareer || null;

        // 3. Progreso General
        const totalMilestones = 4;
        let milestonesCompleted = 0;
        if (profileCompletion >= 75) milestonesCompleted++;
        if (testCompleted) milestonesCompleted++;
        if (careerSelected) milestonesCompleted++;
        if (lastSession?.analysisReport) milestonesCompleted++;

        const overallProgress = Math.round((milestonesCompleted / totalMilestones) * 100);

        // 4. Generar Sugerencias Dinámicas (Simulado para el ejemplo)
        // En un futuro, esto podría venir de la IA o de una base de datos de recursos
        const suggestions = [
            {
                id: 1,
                title: careerSelected ? `Intro a ${careerSelected}` : "Descubre tu vocación",
                type: "Curso Gratuito",
                image: "📚"
            },
            {
                id: 2,
                title: "Webinar: Futuro Laboral en Bolivia",
                type: "Evento Online",
                image: "🇧🇴"
            },
            {
                id: 3,
                title: "Guía de Becas Universitarias 2025",
                type: "Artículo",
                image: "🎓"
            }
        ];

        return {
            userName: user.name,                // <--- ENVIAMOS EL NOMBRE CORRECTO
            profileCompletion: profileCompletion,
            testCompleted: testCompleted,
            careerFocus: careerSelected,
            universityRecs: careerSelected ? 4 : 0, // Número realista                         
            skillsCount: 5,
            aptitudeScore: testCompleted ? 'B+' : '-',
            overallProgress: overallProgress,
            suggestions: suggestions            // <--- NUEVO CAMPO
        };
    }
}