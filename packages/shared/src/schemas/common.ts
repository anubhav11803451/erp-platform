import { z } from 'zod';
import { UserRole } from '../enums';

// --- Enums ---
// Based on Prisma schema
export const userRoleSchema = z.enum(UserRole).default(UserRole.STAFF).optional(); // Add all your roles
export const attendanceStatusSchema = z.enum(['Present', 'Absent', 'Late']);
export const paymentMethodSchema = z.enum(['Cash', 'UPI', 'Stripe', 'BankTransfer']);

// ========================================
// Reusable Core Schemas
// ========================================
export const idSchema = z.uuid({ message: 'Invalid UUID' });
export const emailSchema = z.email({ message: 'Invalid email address' });
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const firstNameSchema = z.string().min(2, 'First name is required');
export const lastNameSchema = z.string().min(2, 'Last name is required');
