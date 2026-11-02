import {
    institutionAdminInvitationCreateRequestSchema,
    institutionAdminInvitationCreateResponseSchema,
    institutionAdminInvitationDecisionRequestSchema,
    institutionAdminInvitationDecisionResponseSchema,
    institutionAdminInvitationIssueResponseSchema,
    institutionAdminInvitationOwnerClaimsResponseSchema,
    institutionAdminInvitationReissueRequestSchema,
    institutionAdminInvitationRevokeRequestSchema,
    institutionAdminInvitationStatusResponseSchema,
    legalEntityCreateRequestSchema,
    legalEntityCreateResponseSchema,
    legalEntityDirectoryResponseSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class CreateLegalEntityDto extends createZodDto(legalEntityCreateRequestSchema) {}
export class LegalEntityCreateResponseDto extends createZodDto(legalEntityCreateResponseSchema) {}
export class LegalEntityDirectoryResponseDto extends createZodDto(
    legalEntityDirectoryResponseSchema,
) {}
export class InstitutionAdminInvitationCreateDto extends createZodDto(
    institutionAdminInvitationCreateRequestSchema,
) {}
export class InstitutionAdminInvitationCreateResponseDto extends createZodDto(
    institutionAdminInvitationCreateResponseSchema,
) {}
export class InstitutionAdminInvitationReissueDto extends createZodDto(
    institutionAdminInvitationReissueRequestSchema,
) {}
export class InstitutionAdminInvitationRevokeRequestDto extends createZodDto(
    institutionAdminInvitationRevokeRequestSchema,
) {}
export class InstitutionAdminInvitationIssueResponseDto extends createZodDto(
    institutionAdminInvitationIssueResponseSchema,
) {}
export class InstitutionAdminInvitationStatusResponseDto extends createZodDto(
    institutionAdminInvitationStatusResponseSchema,
) {}
export class InstitutionAdminInvitationOwnerClaimsResponseDto extends createZodDto(
    institutionAdminInvitationOwnerClaimsResponseSchema,
) {}
export class InstitutionAdminInvitationDecisionRequestDto extends createZodDto(
    institutionAdminInvitationDecisionRequestSchema,
) {}
export class InstitutionAdminInvitationDecisionResponseDto extends createZodDto(
    institutionAdminInvitationDecisionResponseSchema,
) {}
