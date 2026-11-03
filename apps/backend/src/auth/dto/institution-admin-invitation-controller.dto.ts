import {
    institutionAdminClaimStatusResumeRequestSchema,
    institutionAdminInvitationClaimRequestSchema,
    institutionAdminInvitationClaimResponseSchema,
    institutionAdminInvitationClaimantStatusResponseSchema,
    institutionAdminInvitationExchangeResponseSchema,
    institutionAdminInvitationExchangeRequestSchema,
    institutionAdminInvitationNewAccountClaimSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class InvitationExchangeRequestDto extends createZodDto(
    institutionAdminInvitationExchangeRequestSchema,
) {}
export class InvitationClaimRequestDto extends createZodDto(
    institutionAdminInvitationClaimRequestSchema,
) {}
export class InvitationNewAccountClaimDto extends createZodDto(
    institutionAdminInvitationNewAccountClaimSchema,
) {}
export class InvitationClaimStatusResumeRequestDto extends createZodDto(
    institutionAdminClaimStatusResumeRequestSchema,
) {}
export class InvitationContextResponseDto extends createZodDto(
    institutionAdminInvitationExchangeResponseSchema,
) {}
export class InvitationClaimResponseDto extends createZodDto(
    institutionAdminInvitationClaimResponseSchema,
) {}
export class InvitationClaimantStatusResponseDto extends createZodDto(
    institutionAdminInvitationClaimantStatusResponseSchema,
) {}
