import z from 'zod';
import { idSchema } from './common';

// ========================================
// Payment Schemas
// ========================================

export const paymentCreateSchema = z.object({
    studentId: idSchema,
    batchId: idSchema,
    amount: z.coerce.number<number>().positive('Amount must be a positive number'),
    method: z.string(),
    notes: z.string().optional().nullable(),
});

export const paymentUpdateSchema = paymentCreateSchema.partial();

// Inferred Type for Payment
export type PaymentCreatePayload = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdatePayload = z.infer<typeof paymentUpdateSchema>;
