import z from 'zod';
import { idSchema } from './common';

// ========================================
// StudentBatch (Join Table) Schemas
// ========================================

// Schema for adding a student to a batch
export const enrollStudentSchema = z.object({
    studentId: idSchema,
    batchId: idSchema,
    total_fee_agreed: z.coerce.number<number>().min(0, 'Fee must be a positive number.'),
});

//Schema for removing a student from a batch
export const removeEnrollmentSchema = z.object({
    studentIds: z.array(idSchema),
    batchId: idSchema,
});

// Inferred Types for Enrollment
export type EnrollmentCreatePayload = z.infer<typeof enrollStudentSchema>;
export type EnrollmentRemovePayload = z.infer<typeof removeEnrollmentSchema>;
