import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('auth') // Agrupa endpoints en Swagger
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.', type: LoginResponseDto })
    @ApiResponse({ status: 409, description: 'El correo electrónico ya está en uso.' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    // Usamos el LocalAuthGuard para validar credenciales
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.', type: LoginResponseDto })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
    async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
        // @Body() es necesario para que Swagger documente el DTO
        return this.authService.login(req.user);
    }

    // --- Ejemplo de Ruta Protegida ---
    @ApiBearerAuth() // Le dice a Swagger que esta ruta requiere un Token
    @UseGuards(JwtAuthGuard) // ¡Aplica el Guardián de JWT!
    @Get('profile')
    @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
    @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    getProfile(@Request() req) {
        // req.user es inyectado por JwtStrategy
        return req.user;
    }

    // --- Ejemplo de Ruta Protegida por Rol ---
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard) // Se aplican en orden
    @Roles(UserRole.ADMIN) // Solo 'admin' puede acceder
    @Get('admin')
    @ApiOperation({ summary: 'Ruta de prueba solo para administradores' })
    getAdminData(@Request() req) {
        return { message: 'Bienvenido, Administrador', user: req.user };
    }
}