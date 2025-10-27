import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Seguridad (Middleware) ---
  app.use(helmet());

  // --- CORS ---
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001', // Tu URL de Vercel
  });

  // --- Validación Global de DTOs ---
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ignora propiedades que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    transform: true, // Transforma los tipos (ej. string a Date)
  }));

  // --- Prefijo Global de API ---
  app.setGlobalPrefix('api/v1'); // Opcional, pero recomendado (ej. /api/v1/auth/login)

  // --- Configuración de Swagger ---
  setupSwagger(app);

  // --- Iniciar Servidor ---
  await app.listen(process.env.PORT || 3000);
}
bootstrap();


