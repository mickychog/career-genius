import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
//import { CareerRecommendation, CareerRecommendationSchema } from './test-session.schema'; // Auto-referencia si está en el mismo archivo o ajusta imports

// Asegúrate de exportar esto si lo usas fuera
@Schema({ _id: false })
export class UserAnswer {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', required: true })
    question: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    selectedOptionIndex: number;

    // Guardamos el valor semántico para facilitar cálculos
    @Prop()
    pointsTo?: string;
}
const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);

// Re-declaramos CareerRecommendation si no lo tienes en otro archivo compartido
@Schema({ _id: false })
export class CareerRecommendation {
    @Prop() name: string;
    @Prop() duration: string;
    @Prop() reason: string;
}
const CareerRecommendationSchema = SchemaFactory.createForClass(CareerRecommendation);


@Schema({ timestamps: true })
export class TestSession extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    user: MongooseSchema.Types.ObjectId;

    @Prop({ type: Number }) userAge?: number;
    @Prop({ type: String }) userGender?: string;

    // ---Lógica Adaptativa ---
    @Prop({ type: Map, of: Number, default: {} })
    scores: Map<string, number>; // Puntuación acumulada por área

    @Prop({ type: [String], default: [] })
    activeBranches: string[]; // Las áreas ganadoras

    @Prop({ enum: ['GENERAL', 'SPECIFIC', 'CONFIRMATION', 'FINISHED'], default: 'GENERAL' })
    currentPhase: string;
    // -------------------------------

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Question' }], default: [] })
    questions: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [UserAnswerSchema], default: [] })
    answers: UserAnswer[];

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop()
    completedAt?: Date;

    @Prop({ type: String })
    resultProfile?: string;

    @Prop({ type: String })
    analysisReport?: string;

    @Prop({ type: [CareerRecommendationSchema], default: [] })
    recommendedCareers: CareerRecommendation[];

    @Prop({ type: String })
    selectedCareer?: string;

    @Prop({ type: [Object], default: [] })
    savedUniversities: any[];

    @Prop({ type: [Object], default: [] })
    savedCourses: any[];

}

export const TestSessionSchema = SchemaFactory.createForClass(TestSession);
TestSessionSchema.index({ user: 1, isCompleted: 1 }, { unique: true, partialFilterExpression: { isCompleted: false } });