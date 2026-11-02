import {
    Body,
    Controller,
    ForbiddenException,
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
import { ZodResponse } from 'nestjs-zod';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import {
    InvitationClaimRequestDto,
    InvitationClaimResponseDto,
    InvitationClaimStatusResumeRequestDto,
    InvitationClaimantStatusResponseDto,
    InvitationContextResponseDto,
    InvitationExchangeRequestDto,
    InvitationNewAccountClaimDto,
} from './dto/institution-admin-invitation-controller.dto';
import { InstitutionAdminInvitationService } from './institution-admin-invitation.service';

@Controller('auth/invitations')
@UseInterceptors(InvitationSecurityHeadersInterceptor)
export class InstitutionAdminInvitationController {
    private readonly continuationCookieName: string;
    private readonly statusCookieName: string;
    private readonly clientOrigin: string;

    constructor(
        private readonly invitationService: InstitutionAdminInvitationService,
        configService: ConfigService,
    ) {
        this.continuationCookieName =
            configService.get<string>('INSTITUTION_ADMIN_CONTINUATION_COOKIE_NAME') || 'erp360_iac';
        this.statusCookieName =
            configService.get<string>('INSTITUTION_ADMIN_STATUS_COOKIE_NAME') || 'erp360_ias';
        this.clientOrigin = new URL(configService.getOrThrow<string>('CLIENT_URL')).origin;
    }

    @Post('exchange')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InvitationContextResponseDto })
    exchange(
        @Body() payload: InvitationExchangeRequestDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        this.assertExactOrigin(request);
        return this.invitationService.exchange(payload.bearer_token, response);
    }

    @Post('resume')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InvitationContextResponseDto })
    resume(
        @Body() _payload: InvitationClaimStatusResumeRequestDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        this.assertExactOrigin(request);
        return this.invitationService.resume(
            request.cookies?.[this.continuationCookieName] as string | undefined,
            response,
        );
    }

    @Post('claim')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InvitationClaimResponseDto })
    claim(
        @Body() payload: InvitationClaimRequestDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        this.assertExactOrigin(request);
        this.requireContinuationCsrfHeader(request);
        return this.invitationService.claimExistingAccount(
            request.cookies?.[this.continuationCookieName] as string | undefined,
            payload,
            request.header('x-csrf-token') ?? '',
            response,
        );
    }

    @Post('claim/new-account')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InvitationClaimResponseDto })
    claimNewAccount(
        @Body() payload: InvitationNewAccountClaimDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        this.assertExactOrigin(request);
        this.requireContinuationCsrfHeader(request);
        return this.invitationService.claimNewAccount(
            request.cookies?.[this.continuationCookieName] as string | undefined,
            payload,
            request.header('x-csrf-token') ?? '',
            response,
        );
    }

    @Post('status')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InvitationClaimantStatusResponseDto })
    claimantStatus(
        @Body() _payload: InvitationClaimStatusResumeRequestDto,
        @Req() request: Request,
    ) {
        this.assertExactOrigin(request);
        return this.invitationService.getClaimantStatus(
            request.cookies?.[this.statusCookieName] as string | undefined,
        );
    }

    private assertExactOrigin(request: Request): void {
        if (request.header('origin') !== this.clientOrigin) {
            throw new ForbiddenException('Request origin rejected');
        }
    }

    private requireContinuationCsrfHeader(request: Request): void {
        if (!request.header('x-csrf-token')) {
            throw new ForbiddenException('CSRF validation failed');
        }
    }
}
