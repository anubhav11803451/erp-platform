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
// Auth Schemas
// ========================================

export const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const signUpSchema = signInSchema
    .extend({
        first_name: firstNameSchema,
        last_name: lastNameSchema,
        confirm_password: z.string(),
        role: userRoleSchema.default(UserRole.STAFF),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords don't match",
        path: ['confirm_password'],
    });

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirm_password: z.string().optional(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords don't match",
        path: ['confirm_password'], // Error will show on this field
    });

export const changePasswordSchema = z
    .object({
        old_password: passwordSchema,
        new_password: passwordSchema,
        confirm_password: z.string().optional(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords don't match",
        path: ['confirm_password'], // Error will show on this field
    });

export const changeEmailSchema = z
    .object({
        email: emailSchema,
        confirm_email: z.string().optional(),
    })
    .refine((data) => data.email === data.confirm_email, {
        message: "Emails don't match",
        path: ['confirm_email'], // Error will show on this field
    });

export type SignInPayload = z.infer<typeof signInSchema>;
export type SignUpPayload = z.infer<typeof signUpSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
export type ChangeEmailPayload = z.infer<typeof changeEmailSchema>;

export type AuthPayload =
    | SignInPayload
    | SignUpPayload
    | ForgotPasswordPayload
    | ResetPasswordPayload
    | ChangePasswordPayload
    | ChangeEmailPayload;
