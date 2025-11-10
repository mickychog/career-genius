import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        
        if (!secret) {
            throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    // Passport inyectará el 'payload' del JWT aquí
    async validate(payload: { sub: string; email: string; role: string }) {
        // 'sub' es el ID del usuario
        const user = await this.usersService.findOneById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Token inválido');
        }
        // El objeto que retornamos aquí se inyectará en `req.user`
        return {
            sub: user._id.toString(), // Asegúrate de que sub sea el ID
            email: user.email,
            role: user.role
        };
    }
}