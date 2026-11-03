import {
    institutionStaffInvitationAcceptRequestSchema,
    institutionStaffInvitationAcceptResponseSchema,
    institutionStaffInvitationContextRequestSchema,
    institutionStaffInvitationContextResponseSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class InstitutionStaffInvitationContextRequestDto extends createZodDto(
    institutionStaffInvitationContextRequestSchema,
) {}
export class InstitutionStaffInvitationContextResponseDto extends createZodDto(
    institutionStaffInvitationContextResponseSchema,
) {}
export class InstitutionStaffInvitationAcceptRequestDto extends createZodDto(
    institutionStaffInvitationAcceptRequestSchema,
) {}
export class InstitutionStaffInvitationAcceptResponseDto extends createZodDto(
    institutionStaffInvitationAcceptResponseSchema,
) {}
