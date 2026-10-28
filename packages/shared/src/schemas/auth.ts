import { z } from 'zod/v4';

export const platformOwnerSignInSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type PlatformOwnerSignInPayload = z.infer<typeof platformOwnerSignInSchema>;
