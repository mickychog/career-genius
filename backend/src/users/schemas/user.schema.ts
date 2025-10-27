import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Enum para roles
export enum UserRole {
    STUDENT = 'student',
    PROFESSIONAL = 'professional',
    ADMIN = 'admin', // Puedes quitar ADMIN si no lo necesitas en el registro
    // EMPRESA = 'company' // Puedes añadir 'company' si lo necesitas
}

// Enum para sexo
export enum UserGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

// Interfaz para los métodos de instancia
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Tipo combinado: Document + User + Métodos
export type UserDocument = User & Document & IUserMethods & {
    _id: Types.ObjectId;
};

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string; // Nombre completo

    @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Prop({ type: Date })
    birthDate: Date; // Fecha de nacimiento

    @Prop({ type: String, enum: UserGender })
    gender: UserGender;

    @Prop({ type: String, trim: true })
    headline: string; // Titular profesional (ej. "Desarrollador Full-Stack")

    @Prop({ type: String, trim: true })
    summary: string; // Un resumen o "bio"

    @Prop({ type: String, default: '' })
    profilePictureUrl: string;

    @Prop({ type: [String], default: [] })
    skills: string[];

    // ... (Aquí puedes añadir más adelante 'evaluations', 'developmentPlans', etc.)
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware (hook) de Mongoose para hashear la contraseña ANTES de guardarla
UserSchema.pre<User>('save', async function (next) {
    // Solo hashear si la contraseña ha sido modificada
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err as Error);
    }
});

// Método para comparar contraseñas (opcional pero útil)
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};