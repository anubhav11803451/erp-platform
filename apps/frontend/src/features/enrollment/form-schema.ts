import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

export const enrollStudentSchema = createSmartFormSchema(
    z.object({
        studentId: z.string().min(1, 'You must select a student.'),
        total_fee_agreed: z.coerce.number().min(0, 'Fee must be a positive number.'),
    })
);

export type EnrollStudentFormValues = z.infer<typeof enrollStudentSchema>;
