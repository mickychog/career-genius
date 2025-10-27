import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({ example: 'test@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'P@ssw0rd123' })
    @IsString()
    password: string;
}