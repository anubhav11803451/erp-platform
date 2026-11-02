import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { accountIdentityResponseSchema } from '@erp/shared';
import { PrismaService } from '../../core/prisma.service';
import { AccountSessionJwtAuthGuard } from './account-session-jwt-auth.guard';

export type AuthenticatedAccountRequest = Request & {
    user?: {
        id: string;
        email: string;
        identity_kind: string;
        institution_id?: string;
        identity?: unknown;
    };
};

@Injectable()
export class InstitutionAdminJwtAuthGuard
    extends AccountSessionJwtAuthGuard
    implements CanActivate
{
    private readonly csrfCookieName: string;
    private readonly clientOrigin: string;

    constructor(
        private readonly prisma: PrismaService,
        configService: ConfigService,
    ) {
        super();
        this.csrfCookieName = configService.get<string>('CSRF_TOKEN_COOKIE_NAME') || 'erp360_ctk';
        this.clientOrigin = new URL(configService.getOrThrow<string>('CLIENT_URL')).origin;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authenticated = await super.canActivate(context);
        if (!authenticated) {
            throw new UnauthorizedException();
        }

        const request = context.switchToHttp().getRequest<AuthenticatedAccountRequest>();
        await this.attachInstitutionScope(request);
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
            this.assertOriginAndCsrf(request);
        }

        return true;
    }

    async attachInstitutionScope(request: AuthenticatedAccountRequest): Promise<void> {
        const user = request.user;
        if (!user || user.identity_kind !== 'INSTITUTION_ADMIN') {
            throw new ForbiddenException();
        }

        const membership = await this.prisma.institutionAdminMembership.findUnique({
            where: { account_id: user.id },
            include: {
                institution: {
                    select: {
                        id: true,
                        name: true,
                        code_suffix: true,
                        legal_entity: { select: { code: true } },
                    },
                },
                account: {
                    select: {
                        identity_kind: true,
                        owner_grant: { select: { account_id: true } },
                    },
                },
            },
        });
        if (
            !membership ||
            membership.account.identity_kind !== 'INSTITUTION_ADMIN' ||
            membership.account.owner_grant
        ) {
            throw new ForbiddenException();
        }

        request.user = {
            ...user,
            institution_id: membership.institution_id,
            identity: accountIdentityResponseSchema.parse({
                identity_kind: 'INSTITUTION_ADMIN',
                institution: {
                    id: membership.institution.id,
                    name: membership.institution.name,
                },
            }),
        };
    }

    private assertOriginAndCsrf(request: Request): void {
        if (request.header('origin') !== this.clientOrigin) {
            throw new ForbiddenException('Request origin rejected');
        }

        const cookieToken = request.cookies?.[this.csrfCookieName] as string | undefined;
        const headerToken = request.header('x-csrf-token');
        if (!cookieToken || !headerToken) {
            throw new ForbiddenException('CSRF validation failed');
        }

        const cookieBuffer = Buffer.from(cookieToken);
        const headerBuffer = Buffer.from(headerToken);
        if (
            cookieBuffer.length !== headerBuffer.length ||
            !timingSafeEqual(cookieBuffer, headerBuffer)
        ) {
            throw new ForbiddenException('CSRF validation failed');
        }
    }
}
