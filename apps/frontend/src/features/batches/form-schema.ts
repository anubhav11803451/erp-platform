import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

export const batchFormSchema = createSmartFormSchema(
    z.object({
        name: z.string().min(1, 'Batch name is required'),
        subject: z.string().optional(),
        tutorId: z.string().optional(),
    })
);

export type BatchFormValues = z.infer<typeof batchFormSchema>;
