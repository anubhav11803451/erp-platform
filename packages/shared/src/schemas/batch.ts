import z from 'zod';
import { dateTimeSchema, idSchema } from './common';

// ========================================
// Batch Schemas
// ========================================

export const batchCreateSchema = z.object({
    name: z.string().min(3, 'Batch name is required'),
    subject: z.string().optional().nullable(),
    teacher: z.string().optional().nullable(),
    start_date: dateTimeSchema.optional().nullable(), // z.coerce.date() converts string to Date
    end_date: dateTimeSchema.optional().nullable(),
    tutorId: idSchema.optional().nullable(), // The User ID of the tutor
});

export const batchUpdateSchema = batchCreateSchema.partial();

// Inferred Types for Batch
export type BatchCreatePayload = z.infer<typeof batchCreateSchema>;
export type BatchUpdatePayload = z.infer<typeof batchUpdateSchema>;
