import z from 'zod';
import { idSchema, paymentMethodSchema } from './common';

// ========================================
// Payment Schemas
// ========================================

export const paymentCreateSchema = z.object({
    studentId: idSchema,
    batchId: idSchema,
    amount: z.number().positive('Amount must be positive'),
    method: paymentMethodSchema,
    notes: z.string().optional().nullable(),
});

// Inferred Type for Payment
export type PaymentCreatePayload = z.infer<typeof paymentCreateSchema>;
