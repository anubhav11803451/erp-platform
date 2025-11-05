import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

export const paymentFormSchema = createSmartFormSchema(
    z.object({
        batchId: z.string().min(1, 'You must select a batch for this payment.'),
        amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
        method: z.string().min(1, 'Payment method is required.'),
        notes: z.string().optional(),
    })
);

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
