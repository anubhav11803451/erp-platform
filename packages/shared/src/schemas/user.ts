import { z } from 'zod';
import {
    emailSchema,
    firstNameSchema,
    lastNameSchema,
    passwordSchema,
    userRoleSchema,
} from './common';
import { UserRole } from '../enums';

// ========================================
// User Schemas
// ========================================

export const userCreateSchema = z
    .object({
        email: emailSchema,
        first_name: firstNameSchema,
        last_name: lastNameSchema,
        password: passwordSchema,
        confirm_password: z.string(),
        role: userRoleSchema,
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords don't match",
        path: ['confirm_password'], // Error will show on this field
    });

// For updating a user
export const userUpdateSchema = userCreateSchema
    .partial() // Makes all fields optional
    .omit({ email: true }); // Often, you don't allow email changes, or it's a separate process

// For Signing In
export const userSignInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

// Inferred Types for User
export type UserCreateType = z.infer<typeof userCreateSchema>;
export type UserUpdateType = z.infer<typeof userUpdateSchema>;
export type UserSignInType = z.infer<typeof userSignInSchema>;
