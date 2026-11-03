import { z } from 'zod/v4';
import {
    institutionFullCodeSchema,
    normalizedEmailResponseSchema,
    normalizedEmailSchema,
} from './primitives';

export const platformOwnerSignInSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const platformOwnerAccountResponseSchema = z.object({
    id: z.string().min(1),
    email: z.email(),
});

export const platformOwnerSignInResponseSchema = z.object({
    access_token: z.string().min(1),
    csrf_token: z.string().min(1),
    account: platformOwnerAccountResponseSchema,
});

export const platformOwnerLogoutResponseSchema = z.object({
    message: z.string().min(1),
});

export const csrfBootstrapResponseSchema = z
    .object({
        csrf_token: z.string().min(1),
    })
    .strict();

export type PlatformOwnerSignInPayload = z.infer<typeof platformOwnerSignInSchema>;
export type PlatformOwnerAccountResponse = z.infer<typeof platformOwnerAccountResponseSchema>;
export type PlatformOwnerSignInResponse = z.infer<typeof platformOwnerSignInResponseSchema>;
export type PlatformOwnerLogoutResponse = z.infer<typeof platformOwnerLogoutResponseSchema>;
export type CsrfBootstrapResponse = z.infer<typeof csrfBootstrapResponseSchema>;

const authenticatedAccountSchema = z
    .object({
        id: z.string().min(1),
        email: normalizedEmailResponseSchema,
    })
    .strict();

const workspaceInstitutionSchema = z
    .object({
        id: z.uuid(),
        name: z.string().trim().min(1).max(160),
        code: institutionFullCodeSchema.nullable(),
    })
    .strict();

const platformOwnerIdentitySchema = z
    .object({
        identity_kind: z.literal('PLATFORM_OWNER'),
        account: authenticatedAccountSchema,
    })
    .strict();

const institutionAdminIdentitySchema = z
    .object({
        identity_kind: z.literal('INSTITUTION_ADMIN'),
        account: authenticatedAccountSchema,
        institution: workspaceInstitutionSchema,
    })
    .strict();

const institutionStaffIdentitySchema = z
    .object({
        identity_kind: z.literal('INSTITUTION_STAFF'),
        account: authenticatedAccountSchema,
        institution: workspaceInstitutionSchema,
    })
    .strict();

const unassignedAccountIdentitySchema = z
    .object({
        identity_kind: z.literal('UNASSIGNED'),
        account: authenticatedAccountSchema,
    })
    .strict();

export const signInIntentSchema = z.enum(['WORKSPACE', 'INVITATION']);

export const signInRequestSchema = z
    .object({
        email: normalizedEmailSchema,
        password: z.string().min(8, 'Password must be at least 8 characters'),
        intent: signInIntentSchema,
    })
    .strict();

export const authenticatedAccountIdentityResponseSchema = z.discriminatedUnion('identity_kind', [
    unassignedAccountIdentitySchema,
    platformOwnerIdentitySchema,
    institutionAdminIdentitySchema,
    institutionStaffIdentitySchema,
]);

export const workspaceIdentityResponseSchema = z.discriminatedUnion('identity_kind', [
    platformOwnerIdentitySchema,
    institutionAdminIdentitySchema,
    institutionStaffIdentitySchema,
]);

export const workspaceSessionResponseSchema = z
    .object({
        kind: z.literal('SESSION'),
        access_token: z.string().min(1),
        csrf_token: z.string().min(1),
        identity: workspaceIdentityResponseSchema,
    })
    .strict();

export const invitationContinuationResponseSchema = z
    .object({
        kind: z.literal('INVITATION_CONTINUATION'),
        institution: workspaceInstitutionSchema,
        invited_email: normalizedEmailResponseSchema,
        invitation_expires_at: z.iso.datetime(),
        csrf_token: z.string().min(1),
    })
    .strict();

// UNASSIGNED identities are account state, not workspace sessions.
export const authSessionResponseSchema = z.discriminatedUnion('kind', [
    workspaceSessionResponseSchema,
    invitationContinuationResponseSchema,
]);

export type SignInIntent = z.infer<typeof signInIntentSchema>;
export type SignInPayload = z.infer<typeof signInRequestSchema>;
export type AuthenticatedAccountIdentityResponse = z.infer<
    typeof authenticatedAccountIdentityResponseSchema
>;
export type WorkspaceIdentityResponse = z.infer<typeof workspaceIdentityResponseSchema>;
export type WorkspaceSessionResponse = z.infer<typeof workspaceSessionResponseSchema>;
export type InvitationContinuationResponse = z.infer<typeof invitationContinuationResponseSchema>;
export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;
