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
import { PrismaService } from '../../core/prisma.service';
import { AccountSessionJwtAuthGuard } from './account-session-jwt-auth.guard';

export type AuthenticatedOwnerRequest = Request & {
    user?: { id: string; identity_kind: string };
};

@Injectable()
export class PlatformOwnerJwtAuthGuard extends AccountSessionJwtAuthGuard implements CanActivate {
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

        const request = context.switchToHttp().getRequest<AuthenticatedOwnerRequest>();
        await this.assertOwner(request);
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
            this.assertOriginAndCsrf(request);
        }
        return true;
    }

    async assertOwner(request: AuthenticatedOwnerRequest): Promise<void> {
        const user = request.user;
        if (!user || user.identity_kind !== 'PLATFORM_OWNER') {
            throw new ForbiddenException();
        }

        const grant = await this.prisma.platformOwnerGrant.findUnique({
            where: { account_id: user.id },
            select: { account_id: true },
        });
        if (!grant) {
            throw new ForbiddenException();
        }
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
