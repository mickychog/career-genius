import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

export enum QuestionType {
    GENERAL = 'GENERAL',
    SPECIFIC = 'SPECIFIC',
    CONFIRMATION = 'CONFIRMATION' 
}

export enum VocationalArea {
    TEC_INGENIERIA = 'TEC_INGENIERIA',
    SALUD_BIOLOGIA = 'SALUD_BIOLOGIA',
    ARTE_CREATIVIDAD = 'ARTE_CREATIVIDAD',
    SOCIAL_HUMANIDADES = 'SOCIAL_HUMANIDADES',
    NEGOCIOS_ECONOMIA = 'NEGOCIOS_ECONOMIA',
    NINGUNA = 'NINGUNA'
}

@Schema({ timestamps: true })
export class Question extends Document {
    @Prop({ required: true, trim: true, unique: true })
    questionText: string;

    @Prop({ required: true, enum: QuestionType })
    type: QuestionType;

    @Prop({ type: String, enum: VocationalArea, default: VocationalArea.NINGUNA })
    area: VocationalArea;

    @Prop({ type: [Object], required: true })
    options: any[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);