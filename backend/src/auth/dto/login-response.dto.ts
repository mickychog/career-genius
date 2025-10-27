import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';

export class LoginResponseDto {
    @ApiProperty({ description: 'Token de acceso JWT' })
    access_token: string;

    @ApiProperty({ description: 'Información del usuario (sin contraseña)' })
    user: Partial<User>; // O un DTO de Usuario si prefieres
}