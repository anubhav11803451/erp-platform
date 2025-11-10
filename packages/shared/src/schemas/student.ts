import z from 'zod';
import { emailSchema, firstNameSchema, lastNameSchema } from './common';
import { guardianCreateSchema } from './guardian';

// ========================================
// Student Schemas
// ========================================

export const studentCreateSchema = z.object({
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    email: emailSchema.optional().nullable(),
    phone: z.string().optional().nullable(),
    school_name: z.string().optional().nullable(),

    // Either provide an existing guardianId OR a new guardian object
    guardian: guardianCreateSchema.optional(),
});

export const studentUpdateSchema = studentCreateSchema
    .partial() // Guardian logic is not part of a simple student update
    .refine(() => true); // Remove the refine check for partial updates

// Inferred Types for Student
export type StudentCreatePayload = z.infer<typeof studentCreateSchema>;
export type StudentUpdatePayload = z.infer<typeof studentUpdateSchema>;

export type StudentPayload = StudentCreatePayload | StudentUpdatePayload;
