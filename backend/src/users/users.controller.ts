import { Controller, Get, Patch, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Obtener datos del perfil del usuario autenticado' })
    getProfile(@Request() req) {
        // req.user contiene el payload del token (sub, email, role)
        return this.usersService.getProfile(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    @ApiOperation({ summary: 'Actualizar campos del perfil (nombre, ubicación, etc.)' })
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        // req.user.sub es el ID del usuario
        return this.usersService.updateProfile(req.user.sub, updateUserDto);
    }

    // NDPOINT: DASHBOARD STATS ---
    @UseGuards(JwtAuthGuard)
    @Get('dashboard-stats')
    @ApiOperation({ summary: 'Obtiene las estadísticas de progreso y el foco vocacional del usuario' })
    @ApiResponse({ status: 200, description: 'Estadísticas del dashboard.' })
    getDashboardStats(@Request() req) {
        if (!req.user || !req.user.sub) throw new UnauthorizedException('Token inválido o incompleto.');
        return this.usersService.getUserDashboardStats(req.user.sub);
    }
}