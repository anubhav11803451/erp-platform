import {
    Body,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { InstitutionAdminJwtAuthGuard } from '../common/guards/institution-admin-jwt-auth.guard';
import type { AuthenticatedAccountRequest } from '../common/guards/institution-admin-jwt-auth.guard';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import {
    InstitutionStaffGroupAssignmentUpdateDto,
    InstitutionStaffInvitationCreateDto,
    InstitutionStaffInvitationIssueResponseDto,
    InstitutionStaffInvitationListResponseDto,
    InstitutionStaffInvitationReplaceDto,
    InstitutionStaffInvitationRevokeDto,
    InstitutionStaffListResponseDto,
    InstitutionStaffRevokeDto,
} from './dto/institution-staff-controller.dto';
import { InstitutionStaffInvitationService } from './institution-staff-invitation.service';

type AdminRequest = Request & AuthenticatedAccountRequest;

@Controller('institution/staff')
@UseGuards(InstitutionAdminJwtAuthGuard, ThrottlerGuard)
@UseInterceptors(InvitationSecurityHeadersInterceptor)
export class InstitutionStaffController {
    constructor(private readonly staffService: InstitutionStaffInvitationService) {}

    @Get('invitations')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffInvitationListResponseDto })
    listInvitations(@Req() request: AdminRequest) {
        return this.staffService.listInvitations(this.institutionId(request));
    }

    @Post('invitations')
    @ZodResponse({ status: HttpStatus.CREATED, type: InstitutionStaffInvitationIssueResponseDto })
    createInvitation(
        @Req() request: AdminRequest,
        @Body() payload: InstitutionStaffInvitationCreateDto,
    ) {
        return this.staffService.createInvitation(this.institutionId(request), payload);
    }

    @Post('invitations/:invitationId/replace')
    @ZodResponse({ status: HttpStatus.CREATED, type: InstitutionStaffInvitationIssueResponseDto })
    replaceInvitation(
        @Req() request: AdminRequest,
        @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
        @Body() payload: InstitutionStaffInvitationReplaceDto,
    ) {
        return this.staffService.replaceInvitation(
            this.institutionId(request),
            invitationId,
            payload,
        );
    }

    @Post('invitations/:invitationId/revoke')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffInvitationListResponseDto })
    async revokeInvitation(
        @Req() request: AdminRequest,
        @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
        @Body() _payload: InstitutionStaffInvitationRevokeDto,
    ) {
        await this.staffService.revokeInvitation(this.institutionId(request), invitationId);
        return this.staffService.listInvitations(this.institutionId(request));
    }

    @Get('members')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffListResponseDto })
    listStaff(@Req() request: AdminRequest) {
        return this.staffService.listStaff(this.institutionId(request));
    }

    @Patch('members/:accountId/groups')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffListResponseDto })
    async updateStaffGroups(
        @Req() request: AdminRequest,
        @Param('accountId', new ParseUUIDPipe()) accountId: string,
        @Body() payload: InstitutionStaffGroupAssignmentUpdateDto,
    ) {
        const institutionId = this.institutionId(request);
        await this.staffService.updateStaffGroups(institutionId, accountId, payload);
        return this.staffService.listStaff(institutionId);
    }

    @Post('members/:accountId/revoke')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffListResponseDto })
    async revokeStaff(
        @Req() request: AdminRequest,
        @Param('accountId', new ParseUUIDPipe()) accountId: string,
        @Body() _payload: InstitutionStaffRevokeDto,
    ) {
        const institutionId = this.institutionId(request);
        await this.staffService.revokeStaff(institutionId, accountId);
        return this.staffService.listStaff(institutionId);
    }

    private institutionId(request: AdminRequest): string {
        const institutionId = request.user?.institution_id;
        if (!institutionId) {
            throw new NotFoundException('Institution context unavailable');
        }
        return institutionId;
    }
}
