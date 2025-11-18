import { z } from 'zod';
import {
    emailSchema,
    firstNameSchema,
    lastNameSchema,
    passwordSchema,
    userRoleSchema,
} from './common';

// ========================================
// User Schemas
// ========================================

export const userCreateSchema = z.object({
    email: emailSchema,
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    password: passwordSchema,
    role: userRoleSchema,
});

// For updating a user
export const userUpdateSchema = userCreateSchema.partial(); // Makes all fields optional

// Inferred Types for User
export type UserCreatePayload = z.infer<typeof userCreateSchema>;
export type UserUpdatePayload = z.infer<typeof userUpdateSchema>;
