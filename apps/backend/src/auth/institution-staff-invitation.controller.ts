import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import {
    InstitutionStaffInvitationAcceptRequestDto,
    InstitutionStaffInvitationAcceptResponseDto,
    InstitutionStaffInvitationContextRequestDto,
    InstitutionStaffInvitationContextResponseDto,
} from './dto/institution-staff-invitation-controller.dto';
import { InstitutionStaffInvitationService } from './institution-staff-invitation.service';

@Controller('auth/staff-invitations')
@UseInterceptors(InvitationSecurityHeadersInterceptor)
export class InstitutionStaffInvitationController {
    private readonly clientOrigin: string;

    constructor(
        private readonly staffService: InstitutionStaffInvitationService,
        configService: ConfigService,
    ) {
        this.clientOrigin = new URL(configService.getOrThrow<string>('CLIENT_URL')).origin;
    }

    @Post('context')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffInvitationContextResponseDto })
    context(@Body() payload: InstitutionStaffInvitationContextRequestDto, @Req() request: Request) {
        this.assertExactOrigin(request);
        return this.staffService.getInvitationContext(payload.token);
    }

    @Post('accept')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffInvitationAcceptResponseDto })
    accept(@Body() payload: InstitutionStaffInvitationAcceptRequestDto, @Req() request: Request) {
        this.assertExactOrigin(request);
        return this.staffService.acceptInvitation(payload);
    }

    private assertExactOrigin(request: Request): void {
        if (request.header('origin') !== this.clientOrigin) {
            throw new ForbiddenException('Request origin rejected');
        }
    }
}
