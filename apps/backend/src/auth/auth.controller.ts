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
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { ZodResponse } from 'nestjs-zod';
import { AccountSessionJwtAuthGuard } from '../common/guards/account-session-jwt-auth.guard';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import { AuthService } from './auth.service';
import {
    AuthSessionResponseDto,
    AuthenticatedAccountIdentityResponseDto,
    CsrfBootstrapResponseDto,
    PlatformOwnerLogoutResponseDto,
    SignInDto,
} from './dto/auth-controller.dto';
import { InstitutionAdminInvitationService } from './institution-admin-invitation.service';

type AuthenticatedRequest = Request & {
    user: { id: string };
};

@Controller('auth')
export class AuthController {
    private readonly csrfTokenCookieName: string;
    private readonly refreshTokenCookieName: string;
    private readonly continuationCookieName: string;
    private readonly continuationCsrfCookieName: string;
    private readonly clientOrigin: string;

    constructor(
        private readonly authService: AuthService,
        private readonly invitationService: InstitutionAdminInvitationService,
        private readonly configService: ConfigService,
    ) {
        this.csrfTokenCookieName =
            this.configService.get<string>('CSRF_TOKEN_COOKIE_NAME') || 'erp360_ctk';
        this.refreshTokenCookieName =
            this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') || 'erp360_rtk';
        this.continuationCookieName =
            this.configService.get<string>('INSTITUTION_ADMIN_CONTINUATION_COOKIE_NAME') ||
            'erp360_iac';
        this.continuationCsrfCookieName =
            this.configService.get<string>('INSTITUTION_ADMIN_CONTINUATION_CSRF_COOKIE_NAME') ||
            'erp360_iac_ctk';
        this.clientOrigin = new URL(this.configService.getOrThrow<string>('CLIENT_URL')).origin;
    }

    @Get('csrf')
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: CsrfBootstrapResponseDto,
    })
    csrfBootstrap(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        this.assertCsrfBootstrapOrigin(request);
        return this.authService.issueCsrfToken(response);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: AuthSessionResponseDto,
    })
    signIn(
        @Body() payload: SignInDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        this.assertExactOrigin(request);

        if (payload.intent === 'INVITATION') {
            this.assertDoubleSubmitCsrf(request, this.continuationCsrfCookieName);
            return this.invitationService
                .signInExistingAccount(
                    request.cookies?.[this.continuationCookieName] as string | undefined,
                    { email: payload.email, password: payload.password },
                    request.header('x-csrf-token') ?? '',
                    response,
                )
                .then((continuation) => ({
                    kind: 'INVITATION_CONTINUATION' as const,
                    ...continuation,
                }));
        }

        return this.authService.signInWorkspace(payload, response);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: AuthSessionResponseDto,
    })
    refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        this.assertExactOrigin(request);
        this.assertDoubleSubmitCsrf(request, this.csrfTokenCookieName);
        const refreshToken = request.cookies?.[this.refreshTokenCookieName] as string | undefined;
        return this.authService.refresh(refreshToken ?? '', response);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: PlatformOwnerLogoutResponseDto,
    })
    logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies?.[this.refreshTokenCookieName] as string | undefined;
        const continuationToken = request.cookies?.[this.continuationCookieName] as
            string | undefined;

        if (refreshToken && continuationToken) {
            throw new ForbiddenException('Logout must use one active authentication context');
        }
        if (continuationToken) {
            this.assertExactOrigin(request);
            this.assertDoubleSubmitCsrf(request, this.continuationCsrfCookieName);
        } else if (refreshToken) {
            this.assertExactOrigin(request);
            this.assertDoubleSubmitCsrf(request, this.csrfTokenCookieName);
        }

        return this.authService.logout(refreshToken, response).then(async (result) => {
            await this.invitationService.logoutContinuation(
                continuationToken,
                request.header('x-csrf-token') ?? '',
                response,
            );
            return result;
        });
    }

    @Get('me')
    @UseGuards(AccountSessionJwtAuthGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: AuthenticatedAccountIdentityResponseDto,
    })
    me(@Req() request: AuthenticatedRequest) {
        return this.authService.getAuthenticatedIdentity(request.user.id);
    }

    private assertExactOrigin(request: Request): void {
        if (request.header('origin') !== this.clientOrigin) {
            throw new ForbiddenException('Request origin rejected');
        }
    }

    private assertCsrfBootstrapOrigin(request: Request): void {
        const origin = request.header('origin');
        if (origin === this.clientOrigin) {
            return;
        }

        // Safe same-origin GET requests may omit Origin but include Fetch Metadata.
        if (!origin && request.header('sec-fetch-site') === 'same-origin') {
            return;
        }

        throw new ForbiddenException('Request origin rejected');
    }

    private assertDoubleSubmitCsrf(request: Request, cookieName: string): void {
        const cookieToken = request.cookies?.[cookieName] as string | undefined;
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
