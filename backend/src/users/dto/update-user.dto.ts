import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsNumberString, MaxLength } from 'class-validator';
import { UserGender } from '../schemas/user.schema'; // Asegúrate de que UserGender esté bien definido

export class UpdateUserDto {
    @ApiProperty({ description: 'Nombre completo' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Titular profesional (Ej: Estudiante / Técnico)' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    headline?: string;

    @ApiProperty({ description: 'Resumen de perfil/Bio' })
    @IsOptional()
    @IsString()
    summary?: string;

    @ApiProperty({ description: 'Teléfono (solo números)' })
    @IsOptional()
    @IsNumberString()
    phone?: string;

    @ApiProperty({ description: 'Departamento de residencia (Ej: La Paz, Santa Cruz)' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ description: 'Fecha de nacimiento' })
    @IsOptional()
    @IsDateString()
    birthDate?: Date;

    @ApiProperty({ enum: UserGender, description: 'Sexo del usuario' })
    @IsOptional()
    @IsEnum(UserGender)
    gender?: UserGender;
}