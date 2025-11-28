import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkillsDevelopmentService } from './skills-development.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('skills-development')
@ApiBearerAuth()
@Controller('skills-development')
export class SkillsDevelopmentController {
    constructor(private readonly skillsService: SkillsDevelopmentService) { }

    @UseGuards(JwtAuthGuard)
    @Get('recommendations')
    @ApiOperation({ summary: 'Obtiene cursos recomendados basados en la carrera del test vocacional' })
    @ApiResponse({ status: 200, description: 'Lista de cursos obtenida.' })
    @ApiResponse({ status: 404, description: 'Usuario no tiene test vocacional completado.' })
    getRecommendations(@Request() req) {
        const userId = req.user.sub;
        return this.skillsService.getSkillsForUser(userId);
    }
}