import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../core/prisma.service';

interface PlatformOwnerAccessToken {
    sub: string;
    sid: string;
}

@Injectable()
export class PlatformOwnerJwtStrategy extends PassportStrategy(Strategy, 'platform-owner-jwt') {
    constructor(
        configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: PlatformOwnerAccessToken) {
        if (!payload || typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
            throw new UnauthorizedException();
        }

        const session = await this.prisma.session.findUnique({
            where: { id: payload.sid },
            include: { account: { include: { owner_grant: true } } },
        });

        if (
            !session ||
            session.account_id !== payload.sub ||
            session.revoked_at ||
            session.expires_at <= new Date() ||
            !session.account.owner_grant ||
            session.account.identity_kind !== 'PLATFORM_OWNER'
        ) {
            throw new UnauthorizedException();
        }

        return {
            id: session.account.id,
            email: session.account.email,
            identity_kind: 'PLATFORM_OWNER' as const,
        };
    }
}
