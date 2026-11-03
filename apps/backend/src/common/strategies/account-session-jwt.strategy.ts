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
            include: {
                account: {
                    include: {
                        owner_grant: true,
                        institution_admin_membership: true,
                        institution_staff_membership: true,
                    },
                },
            },
        });
        if (
            !session ||
            session.account_id !== payload.sub ||
            session.revoked_at ||
            session.expires_at <= new Date()
        ) {
            throw new UnauthorizedException();
        }
        if (
            session.account.identity_kind === 'INSTITUTION_STAFF' &&
            (!session.account.institution_staff_membership ||
                session.account.institution_staff_membership.revoked_at ||
                session.account.institution_staff_membership.account_identity_kind !==
                    'INSTITUTION_STAFF' ||
                session.account.institution_admin_membership ||
                session.account.owner_grant)
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
