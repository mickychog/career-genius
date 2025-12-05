import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // ... validateUser ...
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) return null;
        const isPasswordValid = await user.comparePassword(pass);
        if (!isPasswordValid) return null;
        return user;
    }

    // ... login ...
    async login(user: User) {
        // Aseguramos tipado para evitar errores de _id
        const userDoc = user as any;
        const payload = { email: user.email, sub: userDoc._id.toString(), role: user.role };

        // Eliminar password del objeto retornado
        // const { password, ...userWithoutPassword } = user.toObject(); // Si falla, usa userDoc

        return {
            access_token: this.jwtService.sign(payload),
            user: { email: user.email, name: user.name, role: user.role }, // Retorno simple
        };
    }

    // Usado por AuthController
    async register(createUserDto: CreateUserDto) {
        const existingUser = await this.usersService.findOneByEmail(createUserDto.email);

        if (existingUser) {
            throw new ConflictException('El correo electrónico ya está en uso');
        }

        const user = await this.usersService.create(createUserDto);

        // Convertir a objeto plano
        const userObject = user.toObject();
        return this.login(userObject);
    }

    async loginWithGoogle(googleUser: any) {
        const user = await this.usersService.findOrCreateGoogleUser(googleUser);
        return this.login(user);
    }
}
