import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

export const signInSchema = createSmartFormSchema(
    z.object({
        email: z.email(),
        password: z.string().min(8),
    })
);

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signupSchema = createSmartFormSchema(
    z
        .object({
            first_name: z.string().min(1, 'First name is required.'),
            last_name: z.string().min(1, 'Last name is required.'),
            email: z.email('Invalid email address.'),
            password: z.string().min(8, 'Password must be at least 8 characters long.'),
            confirm_password: z.string(),
            role: z.string().min(1, 'You must select a role to continue.'),
        })
        .refine((data) => data.password === data.confirm_password, {
            message: "Passwords don't match",
            path: ['confirm_password'], // Error will show on this field
        })
);

export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = createSmartFormSchema(
    z.object({
        email: z.email('Invalid email address.'),
    })
);

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
