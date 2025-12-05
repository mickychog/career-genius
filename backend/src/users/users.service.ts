import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TestSession } from '../vocational-test/schemas/test-session.schema'; 

export interface DashboardSuggestion {
    id: number;
    title: string;
    type: string;
    image: string;
    action: string;
}


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

    // --- NUEVO MÉTODO PARA GOOGLE ---
    async findOrCreateGoogleUser(googleUser: any): Promise<UserDocument> {
        const { email, firstName, lastName } = googleUser;

        // 1. Buscar si ya existe
        let user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            // 2. Si no existe, crearlo
            console.log(`Creando usuario nuevo desde Google: ${email}`);
            user = new this.userModel({
                email,
                name: `${firstName} ${lastName}`,
                // Generamos una contraseña aleatoria porque Google maneja la auth
                password: Math.random().toString(36).slice(-8),
                role: UserRole.STUDENT, // Rol por defecto
                // Podrías agregar un campo 'isGoogleAccount: true' en tu esquema si quisieras
            });
            await user.save();
        }
        return user;
    }

    // --- ESTADÍSTICAS DEL DASHBOARD ACTUALIZADAS ---
    async getUserDashboardStats(userId: string) {
        const user = await this.userModel.findById(userId).select('-password').exec();
        if (!user) throw new NotFoundException('Usuario no encontrado.');

        // 1. Progreso Perfil
        const requiredProfileFields = ['name', 'headline', 'location', 'birthDate', 'phone', 'gender'];
        let filledFields = 0;
        requiredProfileFields.forEach(field => {
            if (user.get(field) && user.get(field) !== '') filledFields++;
        });
        const profileCompletion = Math.round((filledFields / requiredProfileFields.length) * 100);

        // 2. Búsqueda Inteligente de Sesiones

        // A. Buscar la última sesión COMPLETADA (Para mostrar datos históricos)
        const lastCompletedSession = await this.testSessionModel
            .findOne({ user: userId, isCompleted: true })
            .sort({ createdAt: -1 })
            .exec();

        // B. Buscar si hay una sesión ACTIVA (En progreso)
        const activeSession = await this.testSessionModel
            .findOne({ user: userId, isCompleted: false })
            .sort({ createdAt: -1 })
            .exec();

        // Lógica Híbrida:
        // - "testCompleted" es true si ALGUNA VEZ completó un test (para no bloquear el dashboard).
        const hasEverCompletedTest = !!lastCompletedSession;

        // - Datos a mostrar (Universidades, Carrera, Skills): Usamos los de la última completada.
        const careerSelected = lastCompletedSession?.selectedCareer || null;
        const universityRecs = lastCompletedSession?.savedUniversities?.length || 0;
        const skillsCount = lastCompletedSession?.savedCourses?.length || 0;
        const sessionIdResult = lastCompletedSession?._id || null;


        // 3. Progreso General (Lógica)
        let milestones = 0;
        const totalMilestones = 4;
        if (profileCompletion >= 80) milestones++;
        if (hasEverCompletedTest) milestones++; // Cuenta si ya completó al menos uno
        if (universityRecs > 0) milestones++;
        if (skillsCount > 0) milestones++; 
        
        const overallProgress = Math.round((milestones / totalMilestones) * 100);

        const aptitudeScore = '-';

        const importantDates = [
            { date: "15 ENE", event: "Inscripciones UMSA (PSA)" },
            { date: "02 FEB", event: "Examen UCB (La Paz)" },
            { date: "20 FEB", event: "Inicio Clases UPB" }
        ];

        // 4. Sugerencias
        const suggestions: DashboardSuggestion[] = [];
        if (profileCompletion < 100) {
            suggestions.push({ id: 1, title: "Completa tu Perfil", type: "Acción", image: "👤", action: "/dashboard/profile" });
        }

        // Lógica de sugerencia de test:
        if (activeSession) {
            // CASO 1: Hay un test en progreso (nuevo o retomado)
            suggestions.push({ id: 2, title: "Continuar Test en Curso", type: "En Progreso", image: "⏳", action: "/dashboard/vocational-test" });
        } else if (!hasEverCompletedTest) {
            // CASO 2: Nunca hizo un test
            suggestions.push({ id: 2, title: "Descubre tu Vocación", type: "Test", image: "🎓", action: "/dashboard/vocational-test" });
        } else {
            // CASO 3: Ya terminó uno, pero no tiene uno activo. Le damos opción de hacer otro.
            suggestions.push({ id: 2, title: "Refinar Perfil (Nuevo Test)", type: "Reiniciar", image: "🔄", action: "/dashboard/vocational-test" });
        }

        if (hasEverCompletedTest && !careerSelected) {
            suggestions.push({ id: 3, title: "Elige tu Carrera", type: "Resultados", image: "⭐", action: `/dashboard/results/${sessionIdResult}` });
        } else if (hasEverCompletedTest) {
            if (universityRecs === 0) suggestions.push({ id: 4, title: `Universidades para ${careerSelected}`, type: "Búsqueda", image: "🏫", action: "/dashboard/university-search" });
            if (skillsCount === 0) suggestions.push({ id: 5, title: "Cursos Preparatorios", type: "Educación", image: "📚", action: "/dashboard/skills-development" });
        }

        return {
            userName: user.name,
            profileCompletion,
            testCompleted: hasEverCompletedTest,
            careerFocus: careerSelected,
            universityRecs,
            skillsCount,
            aptitudeScore,
            overallProgress,
            suggestions,
            importantDates
        };

    }
}