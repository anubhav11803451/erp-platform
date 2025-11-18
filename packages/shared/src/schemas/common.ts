import { z } from 'zod';
import { AttendanceStatus, PaymentMethod, UserRole } from '@erp/db/enums';

// --- Enums ---
// Based on Prisma schema
export const userRoleSchema = z.enum(UserRole).default(UserRole.STAFF).optional(); // Add all your roles
export const attendanceStatusSchema = z.enum(AttendanceStatus);
export const paymentMethodSchema = z.enum(PaymentMethod);

// ========================================
// Reusable Core Schemas
// ========================================
export const idSchema = z.uuid({ message: 'Invalid ID' });
export const emailSchema = z.email({ message: 'Invalid email address' });
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const firstNameSchema = z.string().min(2, 'First name is required');
export const lastNameSchema = z.string().min(2, 'Last name is required');
export const zodCoerceDate = z.preprocess((val) => {
    if (typeof val === 'string' || val instanceof Date) {
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return val;
}, z.date());
export const dateSchema = z.iso.date().transform((d) => new Date(d).toISOString());
export const dateTimeSchema = z.iso.datetime().transform((d) => new Date(d).toISOString());
