import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    // This is called AFTER the token is verified
    async validate(payload: { sub: string; email: string; role: string }) {
        // The payload is the object we put in the token (in auth.service.ts)
        // This return value is what gets attached to req.user on protected routes
        return { id: payload.sub, email: payload.email, role: payload.role };
    }
}
