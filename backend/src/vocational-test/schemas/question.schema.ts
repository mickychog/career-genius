// backend/src/vocational-test/schemas/question.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Question extends Document {
    @Prop({ required: true, trim: true, unique: true })
    questionText: string;

    @Prop({ type: [String], required: true, validate: [arrayLimit, '{PATH} debe tener exactamente 4 opciones'] })
    options: string[];

    @Prop({
        type: String,
        required: true,
        enum: [
            'ESTILO_INTERES',      // Práctico vs Teórico vs Creativo
            'AMBIENTE_LABORAL',    // Campo vs Oficina vs Social
            'VALORES_MOTIVACION',  // Estabilidad vs Emprendimiento vs Impacto Social
            'HABILIDADES_APRENDIZAJE' // Técnico vs Universitario
        ]
    })
    category: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Validador simple para asegurar 4 opciones
function arrayLimit(val: string[]) {
    return val.length === 4;
}

// Índice para buscar por categoría (opcional, pero útil)
QuestionSchema.index({ category: 1 });