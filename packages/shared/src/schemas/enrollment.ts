import z from 'zod';
import { idSchema } from './common';

// ========================================
// StudentBatch (Join Table) Schemas
// ========================================

// Schema for adding a student to a batch
export const addStudentToBatchSchema = z.object({
    studentId: idSchema,
    batchId: idSchema,
    total_fee_agreed: z.number().positive('Total fee agreed must be a positive number').default(0),
});

//Schema for removing a student from a batch
export const removeStudentFromBatchSchema = z.object({
    studentIds: z.array(idSchema),
    batchId: idSchema,
});
