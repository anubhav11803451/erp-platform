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

export type AuthenticatedStaffRequest = Request & {
    user?: {
        id: string;
        email: string;
        identity_kind: string;
        institution_id?: string;
        group_ids?: string[];
    };
};

@Injectable()
export class InstitutionStaffJwtAuthGuard
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

        const request = context.switchToHttp().getRequest<AuthenticatedStaffRequest>();
        await this.attachInstitutionScope(request);
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
            this.assertOriginAndCsrf(request);
        }
        return true;
    }

    async attachInstitutionScope(request: AuthenticatedStaffRequest): Promise<void> {
        const user = request.user;
        if (!user || user.identity_kind !== 'INSTITUTION_STAFF') {
            throw new ForbiddenException();
        }

        const membership = await this.prisma.institutionStaffMembership.findUnique({
            where: { account_id: user.id },
            select: {
                institution_id: true,
                revoked_at: true,
                account_identity_kind: true,
                account: {
                    select: {
                        identity_kind: true,
                        owner_grant: { select: { account_id: true } },
                        institution_admin_membership: { select: { account_id: true } },
                    },
                },
            },
        });
        if (
            !membership ||
            membership.revoked_at ||
            membership.account_identity_kind !== 'INSTITUTION_STAFF' ||
            membership.account.identity_kind !== 'INSTITUTION_STAFF' ||
            membership.account.owner_grant ||
            membership.account.institution_admin_membership
        ) {
            throw new ForbiddenException();
        }
        const assignments = await this.prisma.institutionStaffGroupAssignment.findMany({
            where: {
                institution_id: membership.institution_id,
                staff_account_id: user.id,
                revoked_at: null,
                staff_membership: {
                    institution_id: membership.institution_id,
                    revoked_at: null,
                    account: { identity_kind: 'INSTITUTION_STAFF' },
                },
                group: {
                    institution_id: membership.institution_id,
                    archived_at: null,
                },
            },
            select: { group_id: true },
        });

        request.user = {
            ...user,
            institution_id: membership.institution_id,
            group_ids: assignments.map(({ group_id }) => group_id),
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
