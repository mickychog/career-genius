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

    // Usado por LocalStrategy
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await user.comparePassword(pass);

        if (!isPasswordValid) {
            return null;
        }

        const { password, ...result } = user.toObject();
        return result;
    }

    // Usado por AuthController
    async login(user: any) {
        // Verificar si user tiene el método toObject (es un documento de Mongoose)
        const userObj = typeof user.toObject === 'function' ? user.toObject() : user;

        const payload = {
            email: userObj.email,
            sub: userObj._id?.toString ? userObj._id.toString() : String(userObj._id),
            role: userObj.role
        };

        const { password, ...userWithoutPassword } = userObj;

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
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
}
