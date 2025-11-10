// backend/src/vocational-test/schemas/test-session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema'; // Importa tu schema de User
import { Question } from './question.schema'; // Importa el schema de Question

// Subdocumento para almacenar las respuestas
@Schema({ _id: false }) // No necesita ID propio
class UserAnswer {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', required: true })
    question: Types.ObjectId; // Referencia a la pregunta

    @Prop({ required: true })
    selectedOptionIndex: number; // El índice (0-3) de la opción elegida
}
export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);


@Schema({ timestamps: true })
export class TestSession extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    user: Types.ObjectId; // Referencia al usuario

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Question' }], required: true })
    questions: Types.ObjectId[]; // Array de IDs de las preguntas presentadas

    @Prop({ type: [UserAnswerSchema], default: [] })
    answers: UserAnswer[]; // Array de respuestas del usuario

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop()
    completedAt?: Date; // Fecha de finalización

    @Prop({ type: String }) // Podrías almacenar aquí el resultado (ej. "Analítico-Creativo")
    resultProfile?: string;

    @Prop({ type: String })
    analysisReport?: string;
}
export const TestSessionSchema = SchemaFactory.createForClass(TestSession);
TestSessionSchema.index({ user: 1, isCompleted: 1 }, { unique: true, partialFilterExpression: { isCompleted: false } });
