import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type {
    PlatformOwnerAccountResponse,
    PlatformOwnerLogoutResponse,
    PlatformOwnerSignInPayload,
    PlatformOwnerSignInResponse,
} from '@erp/shared';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../core/prisma.service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_PATH = '/v1/api/auth';

@Injectable()
export class AuthService {
    private readonly refreshTokenCookieName: string;
    private readonly csrfTokenCookieName: string;
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
        this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    }

    async signIn(
        payload: PlatformOwnerSignInPayload,
        response: Response,
    ): Promise<PlatformOwnerSignInResponse> {
        const account = await this.prisma.account.findUnique({
            where: { email: payload.email.trim().toLowerCase() },
            include: { owner_grant: true },
        });

        if (
            !account?.owner_grant ||
            !(await bcrypt.compare(payload.password, account.password_hash))
        ) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const sessionId = randomUUID();
        const refreshToken = this.createOpaqueToken();
        const csrfToken = this.createOpaqueToken();
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        const accessToken = await this.jwtService.signAsync(
            { sub: account.id, sid: sessionId, email: account.email },
            { expiresIn: '15m' },
        );

        await this.prisma.$transaction(async (transaction) => {
            const activeGrant = await transaction.platformOwnerGrant.findUnique({
                where: { account_id: account.id },
                select: { account_id: true },
            });
            if (!activeGrant) {
                throw new UnauthorizedException('Invalid credentials');
            }

            await transaction.session.create({
                data: {
                    id: sessionId,
                    account_id: account.id,
                    refresh_token_hash: this.hashToken(refreshToken),
                    expires_at: expiresAt,
                },
            });
        });

        this.setAuthCookies(response, refreshToken, csrfToken, expiresAt);
        return {
            access_token: accessToken,
            csrf_token: csrfToken,
            account: this.toAccountResponse(account),
        };
    }

    async refresh(
        oldRefreshToken: string,
        response: Response,
    ): Promise<PlatformOwnerSignInResponse> {
        const oldTokenHash = this.hashToken(oldRefreshToken);
        const now = new Date();
        const nextSessionId = randomUUID();
        const nextRefreshToken = this.createOpaqueToken();
        const csrfToken = this.createOpaqueToken();
        const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

        try {
            const result = await this.prisma.$transaction(async (transaction) => {
                const session = await transaction.session.findUnique({
                    where: { refresh_token_hash: oldTokenHash },
                    include: { account: { include: { owner_grant: true } } },
                });

                if (
                    !session ||
                    session.revoked_at ||
                    session.expires_at <= now ||
                    !session.account.owner_grant
                ) {
                    throw new UnauthorizedException('Invalid or expired session');
                }

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

                const accessToken = await this.jwtService.signAsync(
                    {
                        sub: session.account.id,
                        sid: nextSessionId,
                        email: session.account.email,
                    },
                    { expiresIn: '15m' },
                );

                await transaction.session.create({
                    data: {
                        id: nextSessionId,
                        account_id: session.account.id,
                        refresh_token_hash: this.hashToken(nextRefreshToken),
                        expires_at: expiresAt,
                    },
                });

                return {
                    accessToken,
                    account: this.toAccountResponse(session.account),
                };
            });

            this.setAuthCookies(response, nextRefreshToken, csrfToken, expiresAt);
            return {
                access_token: result.accessToken,
                csrf_token: csrfToken,
                account: result.account,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                this.clearAuthCookies(response);
            }
            throw error;
        }
    }

    async logout(
        refreshToken: string | undefined,
        response: Response,
    ): Promise<PlatformOwnerLogoutResponse> {
        if (refreshToken) {
            await this.prisma.session.updateMany({
                where: {
                    refresh_token_hash: this.hashToken(refreshToken),
                    revoked_at: null,
                },
                data: { revoked_at: new Date() },
            });
        }

        this.clearAuthCookies(response);
        return { message: 'Logged out successfully' };
    }

    private createOpaqueToken(): string {
        return randomBytes(64).toString('hex');
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private toAccountResponse(account: {
        id: string;
        email: string;
    }): PlatformOwnerAccountResponse {
        return { id: account.id, email: account.email };
    }

    private setAuthCookies(
        response: Response,
        refreshToken: string,
        csrfToken: string,
        expiresAt: Date,
    ): void {
        response.cookie(this.refreshTokenCookieName, refreshToken, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            expires: expiresAt,
        });
        response.cookie(this.csrfTokenCookieName, csrfToken, {
            httpOnly: false,
            secure: this.isProduction,
            sameSite: 'lax',
            path: '/',
            expires: expiresAt,
        });
    }

    private clearAuthCookies(response: Response): void {
        response.clearCookie(this.refreshTokenCookieName, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
        });
        response.clearCookie(this.csrfTokenCookieName, {
            httpOnly: false,
            secure: this.isProduction,
            sameSite: 'lax',
            path: '/',
        });
    }
}
