import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

export const studentFormSchema = createSmartFormSchema(
    z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.email('Invalid email').optional().or(z.literal('')),
        phone: z.string().optional(),
        school_name: z.string().optional(),
        guardian: z.object({
            first_name: z.string().min(1, 'Guardian first name is required'),
            last_name: z.string().min(1, 'Guardian last name is required'),
            email: z.email('Invalid guardian email'),
            phone: z.string().optional(),
        }),
    })
);

export type StudentFormValues = z.infer<typeof studentFormSchema>;
