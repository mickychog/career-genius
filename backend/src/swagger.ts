import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Definimos las URLs de nuestros entornos
const LOCALHOST_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://career-genius-backend.onrender.com'; // Tu URL de Render

export function setupSwagger(app: INestApplication): void {

    const config = new DocumentBuilder()
        .setTitle('CareerGenius API')
        .setDescription('Documentación de la API para la plataforma CareerGenius')
        .setVersion('1.0')
        .addBearerAuth() // Habilita la autenticación JWT en la UI

        // --- ¡AQUÍ ESTÁ EL SELECTOR! ---
        // Añadimos los servidores. El primero es el default.
        .addServer(LOCALHOST_URL, 'Desarrollo Local')
        .addServer(PRODUCTION_URL, 'Producción (Render)')

        .build();

    const document = SwaggerModule.createDocument(app, config);

    // La ruta donde se servirá la UI de Swagger
    SwaggerModule.setup('api-docs', app, document);
}