import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        // Obtenemos la URL base del backend (Local o Producción)
        const backendUrl = configService.get<string>('BACKEND_URL') || 'http://localhost:3000/api/v1';

        if (!clientID || !clientSecret) {
            throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be defined in environment variables');
        }

        super({
            clientID,
            clientSecret,
            // Construimos la URL de callback dinámicamente
            callbackURL: `${backendUrl}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
}