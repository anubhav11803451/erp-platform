import { z } from 'zod/v4';

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

export type PlatformOwnerSignInPayload = z.infer<typeof platformOwnerSignInSchema>;
export type PlatformOwnerAccountResponse = z.infer<typeof platformOwnerAccountResponseSchema>;
export type PlatformOwnerSignInResponse = z.infer<typeof platformOwnerSignInResponseSchema>;
export type PlatformOwnerLogoutResponse = z.infer<typeof platformOwnerLogoutResponseSchema>;
