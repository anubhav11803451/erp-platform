import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';
import { UserRole } from '@erp/common/enums';

// Zod schema for validation
const userFormSchema = createSmartFormSchema(
    z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.email('Invalid email address').min(1, 'Email is required'),
        role: z.string().min(1, 'You must select a role to continue').default(UserRole.STAFF),
        // Password is only required when *creating* a user
        // We'll handle this logic in the component
        password: z.string().optional(),
    })
);

// We add password validation conditionally
export const createUserFormSchema = userFormSchema.extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserFormSchema = userFormSchema;

export type UserFormValues = z.infer<typeof userFormSchema>;
