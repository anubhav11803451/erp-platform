import {
    institutionAttendanceDayResponseSchema,
    institutionAttendanceSaveRequestSchema,
    institutionGroupArchiveRequestSchema,
    institutionGroupCreateRequestSchema,
    institutionGroupListResponseSchema,
    institutionGroupResponseSchema,
    institutionGroupUpdateRequestSchema,
    institutionProfileResponseSchema,
    institutionProfileUpdateRequestSchema,
    institutionStaffContextResponseSchema,
    institutionStudentArchiveRequestSchema,
    institutionStudentCreateRequestSchema,
    institutionStudentGroupMembershipUpdateRequestSchema,
    institutionStudentListResponseSchema,
    institutionStudentResponseSchema,
    institutionStudentUpdateRequestSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class InstitutionProfileUpdateDto extends createZodDto(
    institutionProfileUpdateRequestSchema,
) {}
export class InstitutionProfileResponseDto extends createZodDto(institutionProfileResponseSchema) {}
export class InstitutionStaffContextResponseDto extends createZodDto(
    institutionStaffContextResponseSchema,
) {}
export class InstitutionGroupCreateDto extends createZodDto(institutionGroupCreateRequestSchema) {}
export class InstitutionGroupUpdateDto extends createZodDto(institutionGroupUpdateRequestSchema) {}
export class InstitutionGroupArchiveDto extends createZodDto(
    institutionGroupArchiveRequestSchema,
) {}
export class InstitutionGroupResponseDto extends createZodDto(institutionGroupResponseSchema) {}
export class InstitutionGroupListResponseDto extends createZodDto(
    institutionGroupListResponseSchema,
) {}
export class InstitutionStudentCreateDto extends createZodDto(
    institutionStudentCreateRequestSchema,
) {}
export class InstitutionStudentUpdateDto extends createZodDto(
    institutionStudentUpdateRequestSchema,
) {}
export class InstitutionStudentArchiveDto extends createZodDto(
    institutionStudentArchiveRequestSchema,
) {}
export class InstitutionStudentGroupMembershipUpdateDto extends createZodDto(
    institutionStudentGroupMembershipUpdateRequestSchema,
) {}
export class InstitutionStudentResponseDto extends createZodDto(institutionStudentResponseSchema) {}
export class InstitutionStudentListResponseDto extends createZodDto(
    institutionStudentListResponseSchema,
) {}
export class InstitutionAttendanceSaveDto extends createZodDto(
    institutionAttendanceSaveRequestSchema,
) {}
export class InstitutionAttendanceDayResponseDto extends createZodDto(
    institutionAttendanceDayResponseSchema,
) {}
