// backend/src/vocational-test/vocational-test.controller.ts
import { Controller, Post, UseGuards, Request, Req, Body, Param, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VocationalTestService } from './vocational-test.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { Roles } from '../auth/decorators/roles.decorator'; // Si quieres proteger la generación
import { UserRole } from '../users/schemas/user.schema';   // Si quieres proteger la generación
import { RolesGuard } from '../auth/guards/roles.guard';   // Si quieres proteger la generación
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('vocational-test') // Agrupa en Swagger
@ApiBearerAuth() // Indica que las rutas requieren autenticación JWT
@Controller('vocational-test')

export class VocationalTestController {
    constructor(private readonly vocationalTestService: VocationalTestService) { }
    /**
     * Endpoint (potencialmente solo para admin) para generar y guardar preguntas desde IA.
     */
    @Post('generate-questions')
    // @UseGuards(JwtAuthGuard, RolesGuard) // Descomenta para proteger
    // @Roles(UserRole.ADMIN)              // Descomenta para proteger (requiere rol admin)
    @ApiOperation({ summary: '(Admin) Genera y guarda nuevas preguntas vocacionales usando IA' })
    @ApiQuery({ name: 'count', required: false, description: 'Número de preguntas a generar (default: 20)', type: Number })
    @ApiResponse({ status: 201, description: 'Preguntas generadas y guardadas.' })
    generateQuestions(@Query('count', new DefaultValuePipe(20), ParseIntPipe) count: number) {
        // No necesitas el userId aquí, es una tarea administrativa
        return this.vocationalTestService.generateAndStoreQuestions(count);
    }

    /**
     * Inicia una nueva sesión de test para el usuario autenticado.
     */
    @UseGuards(JwtAuthGuard)
    @Post('start')
    @ApiOperation({ summary: 'Inicia una nueva sesión de test vocacional' })
    @ApiResponse({ status: 201, description: 'Sesión iniciada, devuelve ID y preguntas.' })
    @ApiResponse({ status: 409, description: 'Ya hay un test en progreso.' })
    @ApiResponse({ status: 404, description: 'No hay preguntas disponibles.' })
    startTest(@Req() req: { user: JwtUserPayload }) {
        const userId = req.user.sub; // Obtenemos el ID del usuario del token JWT
        console.log('START TEST: User ID obtenido del token (req.user.sub):', userId);
        return this.vocationalTestService.startTest(userId);
    }

    /**
     * Guarda la respuesta a una pregunta de la sesión activa.
     */
    @UseGuards(JwtAuthGuard)
    @Post(':sessionId/answer')
    @ApiOperation({ summary: 'Guarda la respuesta a una pregunta del test' })
    @ApiParam({ name: 'sessionId', description: 'ID de la sesión de test activa' })
    @ApiResponse({ status: 200, description: 'Respuesta guardada exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos inválidos (índice, pregunta no pertenece).' })
    @ApiResponse({ status: 403, description: 'Usuario no autorizado para esta sesión.' })
    @ApiResponse({ status: 404, description: 'Sesión no encontrada.' })
    
    submitAnswer(
        @Param('sessionId') sessionId: string,
        @Req() req: { user: JwtUserPayload },
        @Body() submitAnswerDto: SubmitAnswerDto,
    ) {
        const userId = req.user.sub;

        // El log debe confirmar que userId ya no es 'undefined'
        console.log('SUBMIT ANSWER CONTROLLER: userId extraído del token:', userId);

        return this.vocationalTestService.submitAnswer(sessionId, userId, submitAnswerDto);
    }

    /**
     * Finaliza la sesión de test activa para el usuario.
     */
    @UseGuards(JwtAuthGuard)
    @Post(':sessionId/finish')
    @ApiOperation({ summary: 'Finaliza la sesión de test y calcula el resultado' })
    @ApiParam({ name: 'sessionId', description: 'ID de la sesión de test activa' })
    @ApiResponse({ status: 200, description: 'Test finalizado, devuelve la sesión completada con el resultado.' })
    @ApiResponse({ status: 400, description: 'El test ya está completado o faltan respuestas.' })
    @ApiResponse({ status: 403, description: 'Usuario no autorizado para esta sesión.' })
    @ApiResponse({ status: 404, description: 'Sesión no encontrada.' })
    finishTest(@Param('sessionId') sessionId: string, @Request() req) {
        const userId = req.user.sub;
        return this.vocationalTestService.finishTest(sessionId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('session/:sessionId') // <-- Nuevo endpoint GET
    @ApiOperation({ summary: 'Obtiene los resultados y análisis de una sesión completa' })
    @ApiResponse({ status: 200, description: 'Sesión completada y analizada.' })
    @ApiResponse({ status: 404, description: 'Sesión no encontrada.' })
    getTestSessionResults(
        @Param('sessionId') sessionId: string,
        @Request() req
    ) {
        const userId = req.user.sub;
        return this.vocationalTestService.getTestSessionResults(sessionId, userId);
    }
}

interface JwtUserPayload {
    sub: string; // El ID del usuario, que viene del payload del token
    email: string;
    role: string;
}