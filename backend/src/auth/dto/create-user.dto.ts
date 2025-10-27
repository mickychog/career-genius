import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { UserGender, UserRole } from '../../users/schemas/user.schema';

export class CreateUserDto {
    @ApiProperty({ example: 'test@gmail.com', description: 'Correo electrónico del usuario' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'P@ssw0rd123', description: 'Contraseña del usuario (mínimo 8 caracteres)' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ enum: UserRole, example: UserRole.STUDENT, description: 'Tipo de cuenta' })
    @IsEnum(UserRole) // Valida que el valor sea uno de los roles definidos
    role: UserRole;

    @ApiProperty({ example: '1995-10-20', description: 'Fecha de nacimiento', required: false })
    @IsOptional()
    @IsDateString()
    birthDate?: Date;

    @ApiProperty({ enum: UserGender, example: 'male', description: 'Sexo', required: false })
    @IsOptional()
    @IsEnum(UserGender)
    gender?: UserGender;

}