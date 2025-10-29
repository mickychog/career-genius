import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VocationalTestModule } from './vocational-test/vocational-test.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Carga variables de entorno (.env) globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MongoDB (usando la variable de .env) - configurado de forma asíncrona para obtener la URL desde ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI no está definida en las variables de entorno');
        }
        return { uri };
      },
    }),

    // Nuestros módulos de lógica
    UsersModule,
    AuthModule,
    VocationalTestModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }