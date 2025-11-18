import {
    Controller,
    Post,
    UseGuards,
    Body,
    Res,
    Req,
    Ip,
    Headers,
    Get,
    HttpCode,
    HttpStatus,
    UnauthorizedException, // To get the refresh token
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';

import { ConfigService } from '@nestjs/config';
import { UserLoginDto } from './dto/login.dto';
import { AuthResponse, UserResponse } from '@erp/shared';

@Controller('auth')
export class AuthController {
    private refreshTokenCookieName: string; // Refresh Token

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.refreshTokenCookieName =
            configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') || 'erp360_rtk';
    }

    /**
     * REFACTORED: Login endpoint
     */
    @UseGuards(LocalAuthGuard)
    @Throttle({ auth: { limit: 5, ttl: 60 * 1000 } }) // Override default: 5 attempts/min
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Req() req: { user: UserResponse },
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Body() _loginDto: UserLoginDto, // Kept for validation pipe
    ): Promise<AuthResponse> {
        // LocalAuthGuard has run, validated, and attached the user to req.
        return this.authService.login(req.user, res, ip, userAgent);
    }

    /**
     * NEW: Refresh token endpoint
     */
    @Get('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        const token_key = this.refreshTokenCookieName;
        const refresh_token = req?.cookies[token_key] as string;
        if (!refresh_token) {
            throw new UnauthorizedException('No refresh token provided');
        }
        return this.authService.refresh(refresh_token, res, ip, userAgent);
    }

    /**
     * NEW: Logout endpoint
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token_key = this.refreshTokenCookieName;
        const refresh_token = req.cookies[token_key] as string;
        return this.authService.logout(refresh_token, res);
    }
}
