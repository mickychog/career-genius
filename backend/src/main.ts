import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //CORS habilitado para el frontend
  app.enableCors({
    origin: 'https://career-genius.vercel.app',
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
