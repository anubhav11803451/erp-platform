import {
    institutionStaffGroupAssignmentUpdateRequestSchema,
    institutionStaffInvitationCreateRequestSchema,
    institutionStaffInvitationIssueResponseSchema,
    institutionStaffInvitationListResponseSchema,
    institutionStaffInvitationReplaceRequestSchema,
    institutionStaffInvitationRevokeRequestSchema,
    institutionStaffListResponseSchema,
    institutionStaffRevokeRequestSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class InstitutionStaffInvitationCreateDto extends createZodDto(
    institutionStaffInvitationCreateRequestSchema,
) {}
export class InstitutionStaffInvitationReplaceDto extends createZodDto(
    institutionStaffInvitationReplaceRequestSchema,
) {}
export class InstitutionStaffInvitationRevokeDto extends createZodDto(
    institutionStaffInvitationRevokeRequestSchema,
) {}
export class InstitutionStaffInvitationIssueResponseDto extends createZodDto(
    institutionStaffInvitationIssueResponseSchema,
) {}
export class InstitutionStaffInvitationListResponseDto extends createZodDto(
    institutionStaffInvitationListResponseSchema,
) {}
export class InstitutionStaffGroupAssignmentUpdateDto extends createZodDto(
    institutionStaffGroupAssignmentUpdateRequestSchema,
) {}
export class InstitutionStaffRevokeDto extends createZodDto(institutionStaffRevokeRequestSchema) {}
export class InstitutionStaffListResponseDto extends createZodDto(
    institutionStaffListResponseSchema,
) {}
