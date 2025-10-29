import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VocationalTestService } from './vocational-test.service';
import { VocationalTestController } from './vocational-test.controller';
import { Question, QuestionSchema } from './schemas/question.schema';
import { TestSession, TestSessionSchema } from './schemas/test-session.schema';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: TestSession.name, schema: TestSessionSchema },
    ]),
    AiModule,
    AuthModule, // Para usar JwtAuthGuard
  ],
  controllers: [VocationalTestController],
  providers: [VocationalTestService],
})
export class VocationalTestModule { }