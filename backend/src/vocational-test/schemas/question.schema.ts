// backend/src/vocational-test/schemas/question.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Question extends Document {
    @Prop({ required: true, trim: true })
    questionText: string;

    @Prop({ type: [String], required: true, validate: [arrayLimit, '{PATH} debe tener exactamente 4 opciones'] })
    options: string[];

    @Prop({ type: String, enum: ['workstyle', 'problem-solving', 'interest', 'collaboration'], default: 'interest' })
    category: string; // Categoría opcional para análisis futuro
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Validador simple para asegurar 4 opciones
function arrayLimit(val: string[]) {
    return val.length === 4;
}

// Índice para buscar por categoría (opcional, pero útil)
QuestionSchema.index({ category: 1 });