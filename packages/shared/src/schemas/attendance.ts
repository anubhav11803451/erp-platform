import z from 'zod';
import { idSchema, attendanceStatusSchema } from './common';
// ========================================
// Attendance Schemas
// ========================================

export const attendanceCreateSchema = z.object({
    date: z.date(),
    status: attendanceStatusSchema,
    notes: z.string().optional().nullable(),
    studentId: idSchema,
});

// For marking attendance for multiple students at once
export const bulkAttendanceSchema = z.object({
    batchId: idSchema, // or some other identifier
    date: z.date(),
    records: z.array(
        z.object({
            studentId: idSchema,
            status: attendanceStatusSchema,
            notes: z.string().optional().nullable(),
        })
    ),
});

// Inferred Types for Attendance
export type AttendanceCreatedPayload = z.infer<typeof attendanceCreateSchema>;
export type BulkAttendancePayload = z.infer<typeof bulkAttendanceSchema>;
