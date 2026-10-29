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
import type { PlatformOwnerAccountResponse } from '@erp/shared';
import { ZodResponse } from 'nestjs-zod';
import { AuthService } from './auth.service';
import {
    PlatformOwnerAccountResponseDto,
    PlatformOwnerLogoutResponseDto,
    PlatformOwnerSignInDto,
    PlatformOwnerSignInResponseDto,
} from './dto/auth-controller.dto';
import { PlatformOwnerJwtAuthGuard } from '../common/guards/platform-owner-jwt-auth.guard';

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
    @ZodResponse({
        status: HttpStatus.OK,
        type: PlatformOwnerSignInResponseDto,
    })
    signIn(
        @Body() payload: PlatformOwnerSignInDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.signIn(payload, response);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ZodResponse({
        status: HttpStatus.OK,
        type: PlatformOwnerSignInResponseDto,
    })
    refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        this.assertCsrf(request);
        const refreshToken = request.cookies?.[this.refreshTokenCookieName] as string | undefined;
        return this.authService.refresh(refreshToken ?? '', response);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ZodResponse({
        status: HttpStatus.OK,
        type: PlatformOwnerLogoutResponseDto,
    })
    logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        this.assertCsrf(request);
        const refreshToken = request.cookies?.[this.refreshTokenCookieName] as string | undefined;
        return this.authService.logout(refreshToken, response);
    }

    @Get('me')
    @UseGuards(PlatformOwnerJwtAuthGuard)
    @ZodResponse({
        status: HttpStatus.OK,
        type: PlatformOwnerAccountResponseDto,
    })
    me(@Req() request: AuthenticatedRequest) {
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
