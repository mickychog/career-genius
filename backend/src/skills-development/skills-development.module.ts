import { Module } from '@nestjs/common';
import { SkillsDevelopmentService } from './skills-development.service';
import { SkillsDevelopmentController } from './skills-development.controller';
import { AiModule } from '../ai/ai.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestSession, TestSessionSchema } from '../vocational-test/schemas/test-session.schema';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([{ name: TestSession.name, schema: TestSessionSchema }]),
  ],
  providers: [SkillsDevelopmentService],
  controllers: [SkillsDevelopmentController],
})
export class SkillsDevelopmentModule {}

