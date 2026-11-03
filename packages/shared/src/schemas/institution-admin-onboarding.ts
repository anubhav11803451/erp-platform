import { z } from 'zod/v4';
import {
    institutionCreateResponseSchema,
    institutionFullCodeSchema,
    institutionAdminInvitationRecipientSchema,
    normalizedEmailResponseSchema,
    normalizedEmailSchema,
} from './institution-onboarding';

const uuidSchema = z.uuid();
const dateTimeSchema = z.iso.datetime();
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const claimantNameSchema = z.string().trim().min(1);
const ownerContactNameSchema = z.string().trim().min(1).max(160);
const ownerContactPhoneSchema = z.string().trim().min(1).max(64);
const oneTimeInvitationUrlSchema = z.url().refine((value) => new URL(value).hash.length > 1, {
    message: 'Invitation bearer must be carried in the URL fragment',
});

export const accountIdentityKindSchema = z.enum([
    'UNASSIGNED',
    'PLATFORM_OWNER',
    'INSTITUTION_ADMIN',
    'INSTITUTION_STAFF',
]);

export const institutionAdminInvitationStatusSchema = z.enum([
    'PENDING',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'REVOKED',
    'EXPIRED',
    'LEGACY_ACCEPTED',
]);

export const institutionAdminClaimantStatusSchema = z.enum([
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'REVOKED',
    'EXPIRED',
]);

export const institutionAdminInvitationDecisionSchema = z.enum(['APPROVE', 'REJECT', 'REVOKE']);

const institutionSummarySchema = z
    .object({
        id: uuidSchema,
        name: z.string().trim().min(1).max(160),
    })
    .strict();

export const accountIdentityResponseSchema = z.discriminatedUnion('identity_kind', [
    z.object({ identity_kind: z.literal('UNASSIGNED') }).strict(),
    z.object({ identity_kind: z.literal('PLATFORM_OWNER') }).strict(),
    z
        .object({
            identity_kind: z.literal('INSTITUTION_ADMIN'),
            institution: institutionSummarySchema,
        })
        .strict(),
    z
        .object({
            identity_kind: z.literal('INSTITUTION_STAFF'),
            institution: institutionSummarySchema,
        })
        .strict(),
]);

// Institution selection is carried by an Owner-authorized route, never by a writable body.
export const institutionAdminInvitationIssueRequestSchema =
    institutionAdminInvitationRecipientSchema;
export const institutionAdminInvitationReissueRequestSchema =
    institutionAdminInvitationRecipientSchema;
export const institutionAdminInvitationRevokeRequestSchema = z.object({}).strict();
export const institutionAdminClaimStatusResumeRequestSchema = z.object({}).strict();

// The bearer is accepted only for the initial exchange. Status credentials are cookie-only:
// neither their raw value nor their server-side hash is part of a public contract.
export const institutionAdminInvitationExchangeRequestSchema = z
    .object({
        bearer_token: z.string().min(1),
    })
    .strict();

export const institutionAdminInvitationAccountCredentialsSchema = z
    .object({
        email: normalizedEmailSchema,
        password: passwordSchema,
    })
    .strict();

export const institutionAdminInvitationContextResponseSchema = z
    .object({
        institution: institutionSummarySchema.extend({
            code: institutionFullCodeSchema.nullable(),
        }),
        invited_email: normalizedEmailResponseSchema,
        invitation_expires_at: dateTimeSchema,
    })
    .strict();

export const institutionAdminInvitationExchangeResponseSchema =
    institutionAdminInvitationContextResponseSchema
        .extend({
            csrf_token: z.string().min(1),
        })
        .strict();

export const institutionAdminInvitationClaimRequestSchema = z
    .object({
        claimant_provided_name: claimantNameSchema,
    })
    .strict();

export const institutionAdminInvitationNewAccountClaimSchema = z
    .object({
        password: passwordSchema,
        claimant_provided_name: claimantNameSchema,
    })
    .strict();

export const institutionAdminInvitationIssueResponseSchema = z
    .object({
        id: uuidSchema,
        status: z.literal('PENDING'),
        created_at: dateTimeSchema,
        expires_at: dateTimeSchema,
        invited_email: normalizedEmailResponseSchema,
        one_time_invitation_url: oneTimeInvitationUrlSchema,
    })
    .strict();

export const institutionAdminInvitationCreateResponseSchema = z
    .object({
        institution: institutionCreateResponseSchema.shape.institution,
        invitation: institutionAdminInvitationIssueResponseSchema,
    })
    .strict();

// Owner-only detail includes the legacy acceptance timestamp for compatibility, but does not
// reinterpret it as a claim or Owner decision.
export const institutionAdminInvitationStatusResponseSchema = z
    .object({
        id: uuidSchema,
        status: institutionAdminInvitationStatusSchema,
        created_at: dateTimeSchema,
        expires_at: dateTimeSchema,
        invited_email: normalizedEmailResponseSchema.nullable(),
        owner_contact_name: ownerContactNameSchema.nullable(),
        owner_contact_phone: ownerContactPhoneSchema.nullable(),
        accepted_at: dateTimeSchema.nullable(),
        revoked_at: dateTimeSchema.nullable(),
        claimed_at: dateTimeSchema.nullable(),
        claimed_by_account_id: uuidSchema.nullable(),
        claimant_login_identifier: z.email().nullable(),
        claimant_provided_name: claimantNameSchema.nullable(),
        review_expires_at: dateTimeSchema.nullable(),
        decided_at: dateTimeSchema.nullable(),
        decided_by_account_id: uuidSchema.nullable(),
    })
    .strict();

export const institutionAdminInvitationClaimResponseSchema = z
    .object({
        id: uuidSchema,
        status: z.literal('PENDING_APPROVAL'),
        invited_email: normalizedEmailResponseSchema,
        claimed_at: dateTimeSchema,
        review_expires_at: dateTimeSchema,
    })
    .strict();

export const institutionAdminInvitationClaimantStatusResponseSchema = z
    .object({
        status: institutionAdminClaimantStatusSchema,
        invited_email: normalizedEmailResponseSchema,
        claimed_at: dateTimeSchema,
        review_expires_at: dateTimeSchema,
        decided_at: dateTimeSchema.nullable(),
    })
    .strict();

export const institutionAdminInvitationOwnerClaimSchema = z
    .object({
        id: uuidSchema,
        status: z.literal('PENDING_APPROVAL'),
        invited_email: normalizedEmailResponseSchema.nullable(),
        owner_contact_name: ownerContactNameSchema.nullable(),
        owner_contact_phone: ownerContactPhoneSchema.nullable(),
        claimant_account_id: uuidSchema,
        claimant_login_identifier: z.email(),
        claimant_provided_name: claimantNameSchema,
        claimed_at: dateTimeSchema,
        review_expires_at: dateTimeSchema,
    })
    .strict();

export const institutionAdminInvitationOwnerClaimsResponseSchema = z
    .object({
        claims: z.array(institutionAdminInvitationOwnerClaimSchema),
    })
    .strict();

export const institutionAdminInvitationDecisionRequestSchema = z
    .object({
        decision: institutionAdminInvitationDecisionSchema,
    })
    .strict();

export const institutionAdminInvitationDecisionResponseSchema = z
    .object({
        id: uuidSchema,
        status: z.enum(['APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED']),
        claimed_at: dateTimeSchema.nullable(),
        review_expires_at: dateTimeSchema.nullable(),
        decided_at: dateTimeSchema.nullable(),
        decided_by_account_id: uuidSchema.nullable(),
        revoked_at: dateTimeSchema.nullable(),
    })
    .strict();

export type AccountIdentityKind = z.infer<typeof accountIdentityKindSchema>;
export type AccountIdentityResponse = z.infer<typeof accountIdentityResponseSchema>;
export type InstitutionAdminInvitationStatus = z.infer<
    typeof institutionAdminInvitationStatusSchema
>;
export type InstitutionAdminClaimantStatus = z.infer<typeof institutionAdminClaimantStatusSchema>;
export type InstitutionAdminInvitationDecision = z.infer<
    typeof institutionAdminInvitationDecisionSchema
>;
export type InstitutionAdminInvitationIssueRequest = z.infer<
    typeof institutionAdminInvitationIssueRequestSchema
>;
export type InstitutionAdminInvitationReissueRequest = z.infer<
    typeof institutionAdminInvitationReissueRequestSchema
>;
export type InstitutionAdminInvitationRevokeRequest = z.infer<
    typeof institutionAdminInvitationRevokeRequestSchema
>;
export type InstitutionAdminInvitationExchangeRequest = z.infer<
    typeof institutionAdminInvitationExchangeRequestSchema
>;
export type InstitutionAdminClaimStatusResumeRequest = z.infer<
    typeof institutionAdminClaimStatusResumeRequestSchema
>;
export type InstitutionAdminInvitationAccountCredentials = z.infer<
    typeof institutionAdminInvitationAccountCredentialsSchema
>;
export type InstitutionAdminInvitationContextResponse = z.infer<
    typeof institutionAdminInvitationContextResponseSchema
>;
export type InstitutionAdminInvitationExchangeResponse = z.infer<
    typeof institutionAdminInvitationExchangeResponseSchema
>;
export type InstitutionAdminInvitationClaimRequest = z.infer<
    typeof institutionAdminInvitationClaimRequestSchema
>;
export type InstitutionAdminInvitationNewAccountClaim = z.infer<
    typeof institutionAdminInvitationNewAccountClaimSchema
>;
export type InstitutionAdminInvitationIssueResponse = z.infer<
    typeof institutionAdminInvitationIssueResponseSchema
>;
export type InstitutionAdminInvitationCreateResponse = z.infer<
    typeof institutionAdminInvitationCreateResponseSchema
>;
export type InstitutionAdminInvitationStatusResponse = z.infer<
    typeof institutionAdminInvitationStatusResponseSchema
>;
export type InstitutionAdminInvitationClaimResponse = z.infer<
    typeof institutionAdminInvitationClaimResponseSchema
>;
export type InstitutionAdminInvitationClaimantStatusResponse = z.infer<
    typeof institutionAdminInvitationClaimantStatusResponseSchema
>;
export type InstitutionAdminInvitationOwnerClaim = z.infer<
    typeof institutionAdminInvitationOwnerClaimSchema
>;
export type InstitutionAdminInvitationOwnerClaimsResponse = z.infer<
    typeof institutionAdminInvitationOwnerClaimsResponseSchema
>;
export type InstitutionAdminInvitationDecisionRequest = z.infer<
    typeof institutionAdminInvitationDecisionRequestSchema
>;
export type InstitutionAdminInvitationDecisionResponse = z.infer<
    typeof institutionAdminInvitationDecisionResponseSchema
>;
