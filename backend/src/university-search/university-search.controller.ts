import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UniversitySearchService } from './university-search.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('university-search')
@ApiBearerAuth()
@Controller('university-search')
export class UniversitySearchController {
    constructor(private readonly universitySearchService: UniversitySearchService) { }

    @UseGuards(JwtAuthGuard)
    @Get('recommendations')
    @ApiOperation({ summary: 'Obtiene universidades recomendadas basadas en el último test vocacional' })
    @ApiResponse({ status: 200, description: 'Lista de universidades obtenida.' })
    @ApiResponse({ status: 404, description: 'Usuario no tiene test vocacional completado.' })
    getRecommendations(@Request() req) {
        const userId = req.user.sub;
        return this.universitySearchService.getRecommendationsForUser(userId);
    }
}