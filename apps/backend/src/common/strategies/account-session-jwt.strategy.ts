import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../core/prisma.service';

interface AccountAccessToken {
    sub: string;
    sid: string;
}

@Injectable()
export class AccountSessionJwtStrategy extends PassportStrategy(Strategy, 'account-session-jwt') {
    private readonly prisma: PrismaService;

    constructor(configService: ConfigService, prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
        this.prisma = prisma;
    }

    async validate(payload: AccountAccessToken) {
        if (!payload || typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
            throw new UnauthorizedException();
        }

        const session = await this.prisma.session.findUnique({
            where: { id: payload.sid },
            include: { account: true },
        });
        if (
            !session ||
            session.account_id !== payload.sub ||
            session.revoked_at ||
            session.expires_at <= new Date()
        ) {
            throw new UnauthorizedException();
        }

        return {
            id: session.account.id,
            email: session.account.email,
            identity_kind: session.account.identity_kind,
        };
    }
}
