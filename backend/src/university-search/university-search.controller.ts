import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UniversitySearchService } from './university-search.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('university-search')
@ApiBearerAuth()
@Controller('university-search')
export class UniversitySearchController {
    constructor(private readonly universitySearchService: UniversitySearchService) { }

    @UseGuards(JwtAuthGuard)
    @Get('recommendations')
    @ApiOperation({ summary: 'Obtiene universidades recomendadas basadas en el último test vocacional' })
    @ApiQuery({ name: 'region', required: false, description: 'Departamento o región (ej. La Paz)', example: 'La Paz' })
    @ApiResponse({ status: 200, description: 'Lista de universidades obtenida.' })
    @ApiResponse({ status: 404, description: 'Usuario no tiene test vocacional completado.' })
    getRecommendations(
        @Request() req,
        @Query('region') region?: string // <-- Recibimos el parámetro opcional
    ) {
        const userId = req.user.sub;
        // Si no envían región, usamos 'Nacional' por defecto
        return this.universitySearchService.getRecommendationsForUser(userId, region || 'Nacional');
    }
}