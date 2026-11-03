import { z } from 'zod/v4';
import { normalizedEmailResponseSchema, normalizedEmailSchema } from './primitives';

const uuidSchema = z.uuid();
const dateTimeSchema = z.iso.datetime();
const dateSchema = z.iso.date();
const displayNameSchema = z.string().trim().min(1).max(160);
const localIdSchema = z.string().trim().min(1).max(64);
const institutionTimeZoneSchema = z.string().trim().min(1).max(64);

export const institutionGroupTypeSchema = z.enum(['SCHOOL_SECTION', 'COACHING_BATCH']);

export const institutionStaffInvitationStatusSchema = z.enum([
    'PENDING',
    'ACCEPTED',
    'REVOKED',
    'EXPIRED',
]);

export const institutionAttendanceMarkStatusSchema = z.enum(['PRESENT', 'ABSENT']);

export const institutionProfileResponseSchema = z
    .object({
        id: uuidSchema,
        name: displayNameSchema,
        timezone: institutionTimeZoneSchema.nullable(),
    })
    .strict();

export const institutionStaffContextResponseSchema = z
    .object({
        institution_name: displayNameSchema,
        timezone: institutionTimeZoneSchema.nullable(),
    })
    .strict();

export const institutionProfileUpdateRequestSchema = z
    .object({
        name: displayNameSchema,
        timezone: institutionTimeZoneSchema,
    })
    .strict();

export const institutionGroupResponseSchema = z
    .object({
        id: uuidSchema,
        name: displayNameSchema,
        type: institutionGroupTypeSchema,
        created_at: dateTimeSchema,
        updated_at: dateTimeSchema,
        archived_at: dateTimeSchema.nullable(),
    })
    .strict();

export const institutionGroupCreateRequestSchema = z
    .object({
        name: displayNameSchema,
        type: institutionGroupTypeSchema,
    })
    .strict();

export const institutionGroupUpdateRequestSchema = institutionGroupCreateRequestSchema;
export const institutionGroupArchiveRequestSchema = z.object({}).strict();

export const institutionGroupListResponseSchema = z
    .object({
        groups: z.array(institutionGroupResponseSchema),
    })
    .strict();

export const institutionStudentResponseSchema = z
    .object({
        id: uuidSchema,
        display_name: displayNameSchema,
        local_id: localIdSchema.nullable(),
        group_ids: z.array(uuidSchema),
        created_at: dateTimeSchema,
        updated_at: dateTimeSchema,
        archived_at: dateTimeSchema.nullable(),
    })
    .strict();

export const institutionStudentCreateRequestSchema = z
    .object({
        display_name: displayNameSchema,
        local_id: localIdSchema.optional(),
        group_ids: z.array(uuidSchema),
    })
    .strict()
    .superRefine((request, context) => {
        if (new Set(request.group_ids).size !== request.group_ids.length) {
            context.addIssue({
                code: 'custom',
                path: ['group_ids'],
                message: 'Group IDs must be unique',
            });
        }
    });

export const institutionStudentUpdateRequestSchema = z
    .object({
        display_name: displayNameSchema.optional(),
        local_id: localIdSchema.nullable().optional(),
    })
    .strict()
    .refine((request) => request.display_name !== undefined || request.local_id !== undefined, {
        message: 'At least one student field must be provided',
    });

export const institutionStudentArchiveRequestSchema = z.object({}).strict();

export const institutionStudentGroupMembershipUpdateRequestSchema = z
    .object({
        group_ids: z.array(uuidSchema),
    })
    .strict()
    .superRefine((request, context) => {
        if (new Set(request.group_ids).size !== request.group_ids.length) {
            context.addIssue({
                code: 'custom',
                path: ['group_ids'],
                message: 'Group IDs must be unique',
            });
        }
    });

export const institutionStudentListResponseSchema = z
    .object({
        students: z.array(institutionStudentResponseSchema),
    })
    .strict();

export const institutionStaffInvitationCreateRequestSchema = z
    .object({
        invited_email: normalizedEmailSchema,
        group_ids: z.array(uuidSchema).min(1),
    })
    .strict()
    .superRefine((request, context) => {
        if (new Set(request.group_ids).size !== request.group_ids.length) {
            context.addIssue({
                code: 'custom',
                path: ['group_ids'],
                message: 'Group IDs must be unique',
            });
        }
    });

export const institutionStaffInvitationReplaceRequestSchema =
    institutionStaffInvitationCreateRequestSchema;
export const institutionStaffInvitationRevokeRequestSchema = z.object({}).strict();

// The one-time bearer URL and its token are deliberately excluded from shared response contracts.
export const institutionStaffInvitationIssueResponseSchema = z
    .object({
        id: uuidSchema,
        status: z.literal('PENDING'),
        created_at: dateTimeSchema,
        expires_at: dateTimeSchema,
        invited_email: normalizedEmailResponseSchema,
        group_ids: z.array(uuidSchema),
        // The creation response is the only response allowed to contain the manual-share bearer URL.
        invitation_url: z.url(),
    })
    .strict();

export const institutionStaffInvitationContextRequestSchema = z
    .object({
        token: z.string().min(1).max(256),
    })
    .strict();

export const institutionStaffInvitationContextResponseSchema = z
    .object({
        institution_id: uuidSchema,
        institution_name: displayNameSchema,
        invited_email: normalizedEmailResponseSchema,
        expires_at: dateTimeSchema,
        groups: z.array(
            z
                .object({
                    id: uuidSchema,
                    name: displayNameSchema,
                    type: institutionGroupTypeSchema,
                })
                .strict()
        ),
    })
    .strict();

export const institutionStaffInvitationAcceptRequestSchema = z
    .object({
        token: z.string().min(1).max(256),
        password: z.string().min(8),
    })
    .strict();

export const institutionStaffInvitationAcceptResponseSchema = z
    .object({
        accepted: z.literal(true),
    })
    .strict();

export const institutionStaffInvitationResponseSchema = z
    .object({
        id: uuidSchema,
        status: institutionStaffInvitationStatusSchema,
        created_at: dateTimeSchema,
        expires_at: dateTimeSchema,
        invited_email: normalizedEmailResponseSchema,
        accepted_at: dateTimeSchema.nullable(),
        revoked_at: dateTimeSchema.nullable(),
        group_ids: z.array(uuidSchema),
    })
    .strict();

export const institutionStaffInvitationListResponseSchema = z
    .object({
        invitations: z.array(institutionStaffInvitationResponseSchema),
    })
    .strict();

export const institutionStaffGroupAssignmentUpdateRequestSchema = z
    .object({
        group_ids: z.array(uuidSchema),
    })
    .strict()
    .superRefine((request, context) => {
        if (new Set(request.group_ids).size !== request.group_ids.length) {
            context.addIssue({
                code: 'custom',
                path: ['group_ids'],
                message: 'Group IDs must be unique',
            });
        }
    });

export const institutionStaffMembershipResponseSchema = z
    .object({
        account_id: uuidSchema,
        email: normalizedEmailResponseSchema,
        created_at: dateTimeSchema,
        revoked_at: dateTimeSchema.nullable(),
        group_ids: z.array(uuidSchema),
    })
    .strict();

export const institutionStaffListResponseSchema = z
    .object({
        staff: z.array(institutionStaffMembershipResponseSchema),
    })
    .strict();

export const institutionStaffRevokeRequestSchema = z.object({}).strict();

const attendanceMarkInputSchema = z
    .object({
        student_id: uuidSchema,
        // Null removes the saved mark so the roster state returns to Unmarked.
        status: institutionAttendanceMarkStatusSchema.nullable(),
    })
    .strict();

export const institutionAttendanceSaveRequestSchema = z
    .object({
        group_id: uuidSchema,
        attendance_date: dateSchema,
        marks: z.array(attendanceMarkInputSchema),
    })
    .strict()
    .superRefine((request, context) => {
        const studentIds = request.marks.map(({ student_id }) => student_id);
        if (new Set(studentIds).size !== studentIds.length) {
            context.addIssue({
                code: 'custom',
                path: ['marks'],
                message: 'A student may have only one mark per attendance date',
            });
        }
    });

export const institutionAttendanceDayEntrySchema = z
    .object({
        student_id: uuidSchema,
        display_name: displayNameSchema,
        local_id: localIdSchema.nullable(),
        status: institutionAttendanceMarkStatusSchema.nullable(),
        updated_by_account_id: uuidSchema.nullable(),
        updated_at: dateTimeSchema.nullable(),
    })
    .strict();

export const institutionAttendanceDayResponseSchema = z
    .object({
        group_id: uuidSchema,
        attendance_date: dateSchema,
        entries: z.array(institutionAttendanceDayEntrySchema),
    })
    .strict();

export type InstitutionProfileResponse = z.infer<typeof institutionProfileResponseSchema>;
export type InstitutionStaffContextResponse = z.infer<typeof institutionStaffContextResponseSchema>;
export type InstitutionProfileUpdateRequest = z.infer<typeof institutionProfileUpdateRequestSchema>;
export type InstitutionGroupType = z.infer<typeof institutionGroupTypeSchema>;
export type InstitutionGroupResponse = z.infer<typeof institutionGroupResponseSchema>;
export type InstitutionGroupCreateRequest = z.infer<typeof institutionGroupCreateRequestSchema>;
export type InstitutionGroupUpdateRequest = z.infer<typeof institutionGroupUpdateRequestSchema>;
export type InstitutionGroupArchiveRequest = z.infer<typeof institutionGroupArchiveRequestSchema>;
export type InstitutionGroupListResponse = z.infer<typeof institutionGroupListResponseSchema>;
export type InstitutionStudentResponse = z.infer<typeof institutionStudentResponseSchema>;
export type InstitutionStudentCreateRequest = z.infer<typeof institutionStudentCreateRequestSchema>;
export type InstitutionStudentUpdateRequest = z.infer<typeof institutionStudentUpdateRequestSchema>;
export type InstitutionStudentArchiveRequest = z.infer<
    typeof institutionStudentArchiveRequestSchema
>;
export type InstitutionStudentGroupMembershipUpdateRequest = z.infer<
    typeof institutionStudentGroupMembershipUpdateRequestSchema
>;
export type InstitutionStudentListResponse = z.infer<typeof institutionStudentListResponseSchema>;
export type InstitutionStaffInvitationStatus = z.infer<
    typeof institutionStaffInvitationStatusSchema
>;
export type InstitutionStaffInvitationCreateRequest = z.infer<
    typeof institutionStaffInvitationCreateRequestSchema
>;
export type InstitutionStaffInvitationReplaceRequest = z.infer<
    typeof institutionStaffInvitationReplaceRequestSchema
>;
export type InstitutionStaffInvitationRevokeRequest = z.infer<
    typeof institutionStaffInvitationRevokeRequestSchema
>;
export type InstitutionStaffInvitationIssueResponse = z.infer<
    typeof institutionStaffInvitationIssueResponseSchema
>;
export type InstitutionStaffInvitationContextRequest = z.infer<
    typeof institutionStaffInvitationContextRequestSchema
>;
export type InstitutionStaffInvitationContextResponse = z.infer<
    typeof institutionStaffInvitationContextResponseSchema
>;
export type InstitutionStaffInvitationAcceptRequest = z.infer<
    typeof institutionStaffInvitationAcceptRequestSchema
>;
export type InstitutionStaffInvitationAcceptResponse = z.infer<
    typeof institutionStaffInvitationAcceptResponseSchema
>;
export type InstitutionStaffInvitationResponse = z.infer<
    typeof institutionStaffInvitationResponseSchema
>;
export type InstitutionStaffInvitationListResponse = z.infer<
    typeof institutionStaffInvitationListResponseSchema
>;
export type InstitutionStaffGroupAssignmentUpdateRequest = z.infer<
    typeof institutionStaffGroupAssignmentUpdateRequestSchema
>;
export type InstitutionStaffMembershipResponse = z.infer<
    typeof institutionStaffMembershipResponseSchema
>;
export type InstitutionStaffListResponse = z.infer<typeof institutionStaffListResponseSchema>;
export type InstitutionStaffRevokeRequest = z.infer<typeof institutionStaffRevokeRequestSchema>;
export type InstitutionAttendanceMarkStatus = z.infer<typeof institutionAttendanceMarkStatusSchema>;
export type InstitutionAttendanceSaveRequest = z.infer<
    typeof institutionAttendanceSaveRequestSchema
>;
export type InstitutionAttendanceDayResponse = z.infer<
    typeof institutionAttendanceDayResponseSchema
>;
