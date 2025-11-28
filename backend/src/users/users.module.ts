import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { TestSession, TestSessionSchema } from '../vocational-test/schemas/test-session.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: TestSession.name, schema: TestSessionSchema }]), 
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ¡Importante! Lo exportamos para que AuthModule lo use
})
export class UsersModule { }