import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import omit from 'lodash/omit';
import * as crypto from 'crypto';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/domains/users/users.service';
import { PrismaService } from '@/core/prisma.service';
import { User } from '@erp/db';
import { AuthResponse, TokenPayload, UserWithoutPassword } from './types';

@Injectable()
export class AuthService {
    private refreshTokenCookieName: string; // Refresh Token
    private csrfTokenCookieName: string; // Csrf ToKen
    private isProduction: boolean;
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.csrfTokenCookieName =
            configService.get<string>('CSRF_TOKEN_COOKIE_NAME') || 'erp360_ctk';
        this.refreshTokenCookieName =
            configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') || 'erp360_rtk';
        this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    }

    private omitHashPassword(user: User): UserWithoutPassword {
        return omit(user, 'password_hash');
    }

    /**
     * Validates a user based on email and password.
     * Called by LocalStrategy.
     */
    async validateUser(email: string, pass: string): Promise<UserWithoutPassword | null> {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const encryptedPass: string = user.password_hash;
            await bcrypt.compare(pass, encryptedPass);
            // Passwords match. Return user *without* the password hash.

            //use loadash omit
            return this.omitHashPassword(user);
        }
        return null; // Invalid credentials
    }

    /**
     * Creates a CSRF token
     */
    private createCsrfToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Hashes a token with SHA256 for database storage
     */
    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Creates a secure refresh token, stores it in the DB, and returns it.
     */
    private async createAndStoreRefreshToken(
        user_id: string,
        ip: string,
        user_agent: string,
    ): Promise<string> {
        const raw_token = crypto.randomBytes(64).toString('hex');
        const hashed_token = this.hashToken(raw_token);
        const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId: user_id,
                hashed_token,
                ip,
                user_agent,
                expires_at,
            },
        });
        return raw_token;
    }

    /**
     * Creates an access token from a user payload
     */
    private async createAccessToken(user: UserWithoutPassword): Promise<string> {
        const payload: TokenPayload = { email: user.email, sub: user.id, role: user.role };
        return this.jwtService.signAsync(payload, { expiresIn: '15m' }); // Access token expires in 15 minutes (Short-lived)
    }

    /**
     * Sets the secure HttpOnly refresh token cookie on the response
     */
    private setRefreshTokenCookie(res: Response, token: string) {
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 30 days
        res.cookie(this.refreshTokenCookieName, token, {
            httpOnly: true, // Not accessible by JavaScript
            secure: this.isProduction, // HTTPS only
            sameSite: 'lax', // Strict SameSite
            path: '/v1/api/auth', // Only sent to auth endpoints
            expires,
        });
    }

    /**
     * Sets the client-visible CSRF token cookie on the response
     */
    private setCsrfTokenCookie(res: Response, token: string) {
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 30 days
        res.cookie(this.csrfTokenCookieName, token, {
            httpOnly: false, // IS accessible by JavaScript (for double-submit)
            secure: this.isProduction,
            sameSite: 'lax',
            path: '/', // Accessible on all paths
            expires,
        });
    }

    /**
     * Logs in a user and returns a JWT.
     * Called by the AuthController.
     */
    async login(
        user: UserWithoutPassword,
        res: Response,
        ip: string,
        userAgent: string,
    ): Promise<AuthResponse> {
        const access_token = await this.createAccessToken(user);
        const refresh_token = await this.createAndStoreRefreshToken(user.id, ip, userAgent);
        const csrf_token = this.createCsrfToken();

        this.setRefreshTokenCookie(res, refresh_token);
        this.setCsrfTokenCookie(res, csrf_token);

        return {
            access_token,
            csrf_token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
        };
    }

    /**
     * Refresh Access Token (with Refresh Token Rotation)
     */
    async refresh(
        old_raw_token: string,
        res: Response,
        ip: string,
        user_agent: string,
    ): Promise<AuthResponse> {
        const old_hashed_token = this.hashToken(old_raw_token);

        // 1. Find the token in the DB
        const dbToken = await this.prisma.refreshToken.findUnique({
            where: { hashed_token: old_hashed_token },
            include: { user: true },
        });

        // 2. Check if token is valid, not revoked, and not expired
        if (!dbToken || dbToken.revoked_at || dbToken.expires_at < new Date()) {
            // Security: This could be a stolen token. Clear the cookie.
            this.clearCookies(res);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // --- REFRESH TOKEN ROTATION ---

        // 3. Check for Token Reuse: If token is valid but revoked, it's been reused!
        // This is a sign of token theft. Revoke all user's tokens and log them out.
        if (dbToken.revoked_at) {
            await this.prisma.refreshToken.updateMany({
                where: { userId: dbToken.userId },
                data: { revoked_at: new Date() },
            });
            this.clearCookies(res);
            throw new ForbiddenException('Refresh token reuse detected. All sessions revoked.');
        }

        // 4. Revoke the old token (mark as used)
        await this.prisma.refreshToken.update({
            where: { id: dbToken.id },
            data: { revoked_at: new Date() },
        });

        // 5. Issue new tokens
        const user = this.omitHashPassword(dbToken.user as User);
        const access_token = await this.createAccessToken(user);
        const refresh_token = await this.createAndStoreRefreshToken(user.id, ip, user_agent);
        const csrf_token = this.createCsrfToken();

        // 6. Set new cookies
        this.setRefreshTokenCookie(res, refresh_token);
        this.setCsrfTokenCookie(res, csrf_token);

        // 7. Return new tokens and user info
        return {
            access_token,
            csrf_token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
        };
    }

    /**
     * Clears all auth cookies on the response
     */
    private clearCookies(res: Response) {
        res.cookie(this.refreshTokenCookieName, '', {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'lax',
            path: '/v1/api/auth',
            expires: new Date(0), // Expire immediately
        });
        res.cookie(this.csrfTokenCookieName, '', {
            httpOnly: false,
            secure: this.isProduction,
            sameSite: 'lax',
            path: '/',
            expires: new Date(0),
        });
    }

    /**
     * Logout
     */
    async logout(refreshToken: string, res: Response): Promise<{ message: string }> {
        if (refreshToken) {
            const hashedToken = this.hashToken(refreshToken);
            // Revoke the token in the DB
            await this.prisma.refreshToken.updateMany({
                where: { hashed_token: hashedToken },
                data: { revoked_at: new Date() },
            });
        }
        // Clear cookies regardless
        this.clearCookies(res);
        return { message: 'Logged out successfully' };
    }
}
