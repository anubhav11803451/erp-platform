import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { PlatformOwnerJwtAuthGuard } from '../common/guards/platform-owner-jwt-auth.guard';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import {
    CreateLegalEntityDto,
    LegalEntityCreateResponseDto,
    InstitutionAdminInvitationCreateDto,
    InstitutionAdminInvitationCreateResponseDto,
    InstitutionAdminInvitationIssueResponseDto,
    InstitutionAdminInvitationDecisionRequestDto,
    InstitutionAdminInvitationDecisionResponseDto,
    InstitutionAdminInvitationOwnerClaimsResponseDto,
    InstitutionAdminInvitationReissueDto,
    InstitutionAdminInvitationRevokeRequestDto,
    InstitutionAdminInvitationStatusResponseDto,
    LegalEntityDirectoryResponseDto,
} from './dto/owner-controller.dto';
import { OwnerService } from './owner.service';

type PlatformOwnerRequest = Request & {
    user: { id: string };
};

@Controller('owner/legal-entities')
@UseGuards(PlatformOwnerJwtAuthGuard)
export class OwnerController {
    constructor(
        private readonly ownerService: OwnerService,
        private readonly configService: ConfigService,
    ) {}

    @Get()
    @ZodResponse({
        status: 200,
        type: LegalEntityDirectoryResponseDto,
    })
    listLegalEntities() {
        return this.ownerService.listLegalEntities();
    }

    @Post()
    @ZodResponse({
        status: 201,
        type: LegalEntityCreateResponseDto,
    })
    createLegalEntity(@Body() payload: CreateLegalEntityDto) {
        return this.ownerService.createLegalEntity(payload);
    }

    @Post(':legalEntityId/institutions')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.CREATED,
        type: InstitutionAdminInvitationCreateResponseDto,
    })
    createInstitutionAndIssueInvitation(
        @Param('legalEntityId', new ParseUUIDPipe()) legalEntityId: string,
        @Body() payload: InstitutionAdminInvitationCreateDto,
    ) {
        return this.ownerService.createInstitutionAndIssueInvitation(
            legalEntityId,
            payload,
            this.configService.getOrThrow<string>('CLIENT_URL'),
        );
    }

    @Get('institutions/:institutionId/admin-invitation')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: InstitutionAdminInvitationStatusResponseDto,
    })
    getFirstAdminInvitationStatus(
        @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
    ) {
        return this.ownerService.getFirstAdminInvitationStatus(institutionId);
    }

    @Get('institutions/:institutionId/admin-invitation/claims')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: InstitutionAdminInvitationOwnerClaimsResponseDto,
    })
    listPendingFirstAdminClaims(
        @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
    ) {
        return this.ownerService.listPendingFirstAdminClaims(institutionId);
    }

    @Post('institutions/:institutionId/admin-invitations/:invitationId/decision')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: InstitutionAdminInvitationDecisionResponseDto,
    })
    decideFirstAdminInvitation(
        @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
        @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
        @Body() payload: InstitutionAdminInvitationDecisionRequestDto,
        @Req() request: PlatformOwnerRequest,
    ) {
        return this.ownerService.decideFirstAdminInvitation(
            institutionId,
            invitationId,
            request.user.id,
            payload.decision,
        );
    }

    @Post('institutions/:institutionId/admin-invitations/:invitationId/revoke')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.OK,
        type: InstitutionAdminInvitationStatusResponseDto,
    })
    revokeFirstAdminInvitation(
        @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
        @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
        @Body() _payload: InstitutionAdminInvitationRevokeRequestDto,
        @Req() request: PlatformOwnerRequest,
    ) {
        return this.ownerService.revokeFirstAdminInvitation(
            institutionId,
            invitationId,
            request.user.id,
        );
    }

    @Post('institutions/:institutionId/admin-invitations/:invitationId/replace')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(InvitationSecurityHeadersInterceptor)
    @ZodResponse({
        status: HttpStatus.CREATED,
        type: InstitutionAdminInvitationIssueResponseDto,
    })
    replaceFirstAdminInvitation(
        @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
        @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
        @Body() payload: InstitutionAdminInvitationReissueDto,
        @Req() request: PlatformOwnerRequest,
    ) {
        return this.ownerService.replaceFirstAdminInvitation(
            institutionId,
            invitationId,
            payload,
            this.configService.getOrThrow<string>('CLIENT_URL'),
            request.user.id,
        );
    }
}
