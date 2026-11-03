import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@erp/db/client';
import {
    authenticatedAccountIdentityResponseSchema,
    platformOwnerLogoutResponseSchema,
    workspaceIdentityResponseSchema,
    workspaceSessionResponseSchema,
} from '@erp/shared';
import type {
    AuthenticatedAccountIdentityResponse,
    AuthSessionResponse,
    PlatformOwnerLogoutResponse,
    SignInPayload,
} from '@erp/shared';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../core/prisma.service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_COOKIE_PATH = '/v1/api/auth';
const LEGACY_ADMIN_ACCESS_COOKIE_PATHS = ['/v1/api', '/v1/api/auth'];
const LEGACY_ADMIN_REFRESH_COOKIE_PATHS = ['/v1/api/auth', '/v1/api/auth/invitations'];
const WORKSPACE_ACCOUNT_RELATIONS = {
    owner_grant: true,
    institution_admin_membership: {
        include: {
            institution: {
                include: {
                    legal_entity: { select: { code: true } },
                },
            },
        },
    },
    institution_staff_membership: {
        include: {
            institution: {
                include: {
                    legal_entity: { select: { code: true } },
                },
            },
        },
    },
} satisfies Prisma.AccountInclude;

type WorkspaceAccount = Prisma.AccountGetPayload<{
    include: typeof WORKSPACE_ACCOUNT_RELATIONS;
}>;

@Injectable()
export class AuthService {
    private readonly refreshTokenCookieName: string;
    private readonly csrfTokenCookieName: string;
    private readonly adminRefreshTokenCookieName: string;
    private readonly adminCsrfTokenCookieName: string;
    private readonly adminAccessTokenCookieName: string;
    private readonly isProduction: boolean;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.refreshTokenCookieName =
            this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') || 'erp360_rtk';
        this.csrfTokenCookieName =
            this.configService.get<string>('CSRF_TOKEN_COOKIE_NAME') || 'erp360_ctk';
        this.adminRefreshTokenCookieName =
            this.configService.get<string>('INSTITUTION_ADMIN_REFRESH_COOKIE_NAME') ||
            'erp360_ia_rtk';
        this.adminCsrfTokenCookieName =
            this.configService.get<string>('INSTITUTION_ADMIN_CSRF_COOKIE_NAME') || 'erp360_ia_ctk';
        this.adminAccessTokenCookieName =
            this.configService.get<string>('INSTITUTION_ADMIN_ACCESS_COOKIE_NAME') ||
            'erp360_ia_at';
        this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    }

    async signInWorkspace(
        payload: SignInPayload,
        response: Response,
    ): Promise<AuthSessionResponse> {
        if (payload.intent !== 'WORKSPACE') {
            throw new UnauthorizedException('Invalid credentials');
        }

        const normalizedEmail = payload.email.trim().toLowerCase();
        const account = await this.prisma.account.findUnique({
            where: { email: normalizedEmail },
            include: WORKSPACE_ACCOUNT_RELATIONS,
        });
        const comparisonHash =
            account?.password_hash ?? (await bcrypt.hash(randomBytes(24).toString('hex'), 12));
        if (!(await bcrypt.compare(payload.password, comparisonHash)) || !account) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const sessionId = randomUUID();
        const refreshToken = this.createOpaqueToken();
        const csrfToken = this.createOpaqueToken();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
        const result = await this.prisma.$transaction(async (transaction) => {
            await this.lockAccount(transaction, account.id);
            const activeAccount = await transaction.account.findUnique({
                where: { id: account.id },
                include: WORKSPACE_ACCOUNT_RELATIONS,
            });
            if (
                !activeAccount ||
                activeAccount.password_hash !== account.password_hash ||
                activeAccount.email.trim().toLowerCase() !== normalizedEmail
            ) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const identity = this.toAuthenticatedIdentity(activeAccount);
            if (identity.identity_kind === 'UNASSIGNED') {
                throw new UnauthorizedException('Invalid credentials');
            }
            const workspaceIdentity = workspaceIdentityResponseSchema.parse(identity);

            await transaction.session.create({
                data: {
                    id: sessionId,
                    account_id: activeAccount.id,
                    rotation_family_id: sessionId,
                    refresh_token_hash: this.hashToken(refreshToken),
                    expires_at: expiresAt,
                },
            });
            return { identity: workspaceIdentity };
        });

        const accessToken = await this.jwtService.signAsync(
            { sub: account.id, sid: sessionId, email: normalizedEmail },
            { expiresIn: ACCESS_TOKEN_TTL },
        );
        this.setAuthCookies(response, refreshToken, csrfToken, expiresAt);
        this.clearLegacyAdminCookies(response);
        return workspaceSessionResponseSchema.parse({
            kind: 'SESSION',
            access_token: accessToken,
            csrf_token: csrfToken,
            identity: result.identity,
        });
    }

    async getAuthenticatedIdentity(
        accountId: string,
    ): Promise<AuthenticatedAccountIdentityResponse> {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: WORKSPACE_ACCOUNT_RELATIONS,
        });
        if (!account) {
            throw new UnauthorizedException();
        }
        return authenticatedAccountIdentityResponseSchema.parse(
            this.toAuthenticatedIdentity(account),
        );
    }

    async refresh(oldRefreshToken: string, response: Response): Promise<AuthSessionResponse> {
        const oldTokenHash = this.hashToken(oldRefreshToken);
        const now = new Date();
        const nextSessionId = randomUUID();
        const nextRefreshToken = this.createOpaqueToken();
        const csrfToken = this.createOpaqueToken();
        const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

        try {
            const result = await this.prisma.$transaction(async (transaction) => {
                const lockedFamily = await this.lockSessionFamily(transaction, oldTokenHash);
                if (!lockedFamily) {
                    throw new UnauthorizedException('Invalid or expired session');
                }

                const session = await transaction.session.findUnique({
                    where: { refresh_token_hash: oldTokenHash },
                    include: { account: { include: WORKSPACE_ACCOUNT_RELATIONS } },
                });
                if (
                    !session ||
                    session.revoked_at ||
                    session.expires_at <= now ||
                    session.rotation_family_id !== lockedFamily.rotation_family_id
                ) {
                    throw new UnauthorizedException('Invalid or expired session');
                }

                const identity = this.toAuthenticatedIdentity(session.account);
                if (identity.identity_kind === 'UNASSIGNED') {
                    throw new UnauthorizedException('Invalid or expired session');
                }
                const workspaceIdentity = workspaceIdentityResponseSchema.parse(identity);

                const revoked = await transaction.session.updateMany({
                    where: {
                        id: session.id,
                        revoked_at: null,
                        expires_at: { gt: now },
                    },
                    data: { revoked_at: now },
                });
                if (revoked.count !== 1) {
                    throw new UnauthorizedException('Invalid or expired session');
                }

                await transaction.session.create({
                    data: {
                        id: nextSessionId,
                        account_id: session.account.id,
                        rotation_family_id: session.rotation_family_id,
                        refresh_token_hash: this.hashToken(nextRefreshToken),
                        expires_at: expiresAt,
                    },
                });
                return {
                    accountId: session.account.id,
                    email: session.account.email,
                    identity: workspaceIdentity,
                };
            });

            const accessToken = await this.jwtService.signAsync(
                { sub: result.accountId, sid: nextSessionId, email: result.email },
                { expiresIn: ACCESS_TOKEN_TTL },
            );
            this.setAuthCookies(response, nextRefreshToken, csrfToken, expiresAt);
            this.clearLegacyAdminCookies(response);
            return workspaceSessionResponseSchema.parse({
                kind: 'SESSION',
                access_token: accessToken,
                csrf_token: csrfToken,
                identity: result.identity,
            });
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                this.clearAuthCookies(response);
                this.clearLegacyAdminCookies(response);
            }
            throw error;
        }
    }

    async logout(
        refreshToken: string | undefined,
        response: Response,
    ): Promise<PlatformOwnerLogoutResponse> {
        if (refreshToken) {
            const refreshTokenHash = this.hashToken(refreshToken);
            await this.prisma.$transaction(async (transaction) => {
                const lockedFamily = await this.lockSessionFamily(transaction, refreshTokenHash);
                if (!lockedFamily) {
                    return;
                }

                await transaction.session.updateMany({
                    where: {
                        rotation_family_id: lockedFamily.rotation_family_id,
                        revoked_at: null,
                    },
                    data: { revoked_at: new Date() },
                });
            });
        }

        this.clearAuthCookies(response);
        this.clearLegacyAdminCookies(response);
        return platformOwnerLogoutResponseSchema.parse({ message: 'Logged out successfully' });
    }

    private toAuthenticatedIdentity(
        account: WorkspaceAccount,
    ): AuthenticatedAccountIdentityResponse {
        const accountSummary = { id: account.id, email: account.email.trim().toLowerCase() };
        const membership = account.institution_admin_membership;
        const staffMembership = account.institution_staff_membership;
        const institutionAdmin = account.identity_kind === 'INSTITUTION_ADMIN';
        const institutionStaff = account.identity_kind === 'INSTITUTION_STAFF';
        const platformOwner = account.identity_kind === 'PLATFORM_OWNER';

        if (
            account.identity_kind === 'UNASSIGNED' &&
            !account.owner_grant &&
            !membership &&
            !staffMembership
        ) {
            return { identity_kind: 'UNASSIGNED', account: accountSummary };
        }
        if (platformOwner && account.owner_grant && !membership && !staffMembership) {
            return { identity_kind: 'PLATFORM_OWNER', account: accountSummary };
        }
        if (institutionAdmin && !account.owner_grant && !staffMembership && membership) {
            const { institution } = membership;
            const code =
                institution.legal_entity.code && institution.code_suffix
                    ? `${institution.legal_entity.code}-${institution.code_suffix}`
                    : null;
            return {
                identity_kind: 'INSTITUTION_ADMIN',
                account: accountSummary,
                institution: { id: institution.id, name: institution.name, code },
            };
        }
        if (
            institutionStaff &&
            !account.owner_grant &&
            !membership &&
            staffMembership &&
            staffMembership.account_id === account.id &&
            staffMembership.account_identity_kind === 'INSTITUTION_STAFF' &&
            staffMembership.revoked_at === null &&
            staffMembership.institution_id === staffMembership.institution.id
        ) {
            const { institution } = staffMembership;
            const code =
                institution.legal_entity.code && institution.code_suffix
                    ? `${institution.legal_entity.code}-${institution.code_suffix}`
                    : null;
            return {
                identity_kind: 'INSTITUTION_STAFF',
                account: accountSummary,
                institution: { id: institution.id, name: institution.name, code },
            };
        }
        throw new UnauthorizedException('Account identity is invalid');
    }

    private async lockAccount(
        transaction: Prisma.TransactionClient,
        accountId: string,
    ): Promise<void> {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
            SELECT "id" FROM "Account" WHERE "id" = ${accountId} FOR UPDATE
        `;
        if (rows.length === 0) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    private async lockSessionFamily(
        transaction: Prisma.TransactionClient,
        refreshTokenHash: string,
    ): Promise<{ id: string; rotation_family_id: string } | undefined> {
        const rows = await transaction.$queryRaw<Array<{ id: string; rotation_family_id: string }>>`
            SELECT anchor."id" AS "id",
                   source."rotation_family_id" AS "rotation_family_id"
            FROM "Session" AS anchor
            INNER JOIN "Session" AS source
                ON source."rotation_family_id" = anchor."id"
            WHERE source."refresh_token_hash" = ${refreshTokenHash}
              AND anchor."rotation_family_id" = anchor."id"
            FOR UPDATE OF anchor
        `;
        return rows[0];
    }

    private createOpaqueToken(): string {
        return randomBytes(64).toString('hex');
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private cookieIsSecure(response: Response): boolean {
        return this.isProduction || response.req?.secure === true;
    }

    private setAuthCookies(
        response: Response,
        refreshToken: string,
        csrfToken: string,
        expiresAt: Date,
    ): void {
        const secure = this.cookieIsSecure(response);
        response.cookie(this.refreshTokenCookieName, refreshToken, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            expires: expiresAt,
        });
        response.cookie(this.csrfTokenCookieName, csrfToken, {
            httpOnly: false,
            secure,
            sameSite: 'lax',
            path: '/',
            expires: expiresAt,
        });
    }

    private clearAuthCookies(response: Response): void {
        const secure = this.cookieIsSecure(response);
        response.clearCookie(this.refreshTokenCookieName, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
        });
        response.clearCookie(this.csrfTokenCookieName, {
            httpOnly: false,
            secure,
            sameSite: 'lax',
            path: '/',
        });
    }

    private clearLegacyAdminCookies(response: Response): void {
        const secure = this.cookieIsSecure(response);
        for (const path of LEGACY_ADMIN_ACCESS_COOKIE_PATHS) {
            response.clearCookie(this.adminAccessTokenCookieName, {
                httpOnly: true,
                secure,
                sameSite: 'lax',
                path,
            });
        }
        for (const path of LEGACY_ADMIN_REFRESH_COOKIE_PATHS) {
            response.clearCookie(this.adminRefreshTokenCookieName, {
                httpOnly: true,
                secure,
                sameSite: 'lax',
                path,
            });
        }
        response.clearCookie(this.adminCsrfTokenCookieName, {
            httpOnly: false,
            secure,
            sameSite: 'lax',
            path: '/',
        });
    }
}
