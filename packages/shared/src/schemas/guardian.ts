import { z } from 'zod';
import { emailSchema, firstNameSchema, lastNameSchema } from './common';

// ========================================
// Guardian Schemas
// ========================================

export const guardianCreateSchema = z.object({
    email: emailSchema,
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    phone: z.string().optional().nullable(),
});

export const guardianUpdateSchema = guardianCreateSchema.partial();

// Inferred Types for Guardian
export type GuardianCreatePayload = z.infer<typeof guardianCreateSchema>;
export type GuardianUpdatePayload = z.infer<typeof guardianUpdateSchema>;
