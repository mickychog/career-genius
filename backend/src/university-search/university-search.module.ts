import { Module } from '@nestjs/common';
import { UniversitySearchService } from './university-search.service';
import { UniversitySearchController } from './university-search.controller';
import { AiModule } from '../ai/ai.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestSession, TestSessionSchema } from '../vocational-test/schemas/test-session.schema';

@Module({
    imports: [
        AiModule,
        // Necesitamos acceder a TestSession para saber qué carrera le salió al usuario
        MongooseModule.forFeature([{ name: TestSession.name, schema: TestSessionSchema }]),
    ],
    providers: [UniversitySearchService],
    controllers: [UniversitySearchController],
})
export class UniversitySearchModule { }