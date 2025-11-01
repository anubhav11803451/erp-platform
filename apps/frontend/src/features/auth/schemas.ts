import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

export const signInSchema = createSmartFormSchema(
    z.object({
        email: z.email(),
        password: z.string().min(8),
    })
);

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = createSmartFormSchema(
    z
        .object({
            email: z.email(),
            password: z.string().min(8),
            confirmPassword: z.string().min(8),
            firstName: z.string(),
            lastName: z.string(),
            phoneNumber: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        })
);

export type SignUpFormValues = z.infer<typeof signUpSchema>;
