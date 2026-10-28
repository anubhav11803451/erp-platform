import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import type {
    PlatformOwnerAccountResponse,
    PlatformOwnerLogoutResponse,
    PlatformOwnerSignInResponse,
} from '@erp/shared';
import { AuthService } from './auth.service';
import { PlatformOwnerSignInDto } from './dto/platform-owner-sign-in.dto';
import { PlatformOwnerJwtAuthGuard } from './guards/platform-owner-jwt-auth.guard';

type AuthenticatedRequest = Request & {
    user: PlatformOwnerAccountResponse;
};

@Controller('auth')
export class AuthController {
    private readonly csrfTokenCookieName: string;
    private readonly refreshTokenCookieName: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.csrfTokenCookieName =
            this.configService.get<string>('CSRF_TOKEN_COOKIE_NAME') || 'erp360_ctk';
        this.refreshTokenCookieName =
            this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') || 'erp360_rtk';
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    signIn(
        @Body() payload: PlatformOwnerSignInDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<PlatformOwnerSignInResponse> {
        return this.authService.signIn(payload, response);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<PlatformOwnerSignInResponse> {
        this.assertCsrf(request);
        const refreshToken = request.cookies?.[this.refreshTokenCookieName] as string | undefined;
        return this.authService.refresh(refreshToken ?? '', response);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<PlatformOwnerLogoutResponse> {
        this.assertCsrf(request);
        const refreshToken = request.cookies?.[this.refreshTokenCookieName] as string | undefined;
        return this.authService.logout(refreshToken, response);
    }

    @Get('me')
    @UseGuards(PlatformOwnerJwtAuthGuard)
    me(@Req() request: AuthenticatedRequest): PlatformOwnerAccountResponse {
        return request.user;
    }

    private assertCsrf(request: Request): void {
        const cookieToken = request.cookies?.[this.csrfTokenCookieName] as string | undefined;
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
