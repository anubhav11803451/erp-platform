import z from 'zod';
import { idSchema, attendanceStatusSchema, dateSchema, dateTimeSchema } from './common';
// ========================================
// Attendance Schemas
// ========================================

// Schema for the GET /attendance/batch/:batchId query
export const attendanceQuerySchema = z.object({
    date: dateSchema, // coerce transforms the string query param into a Date
});

export const recordSchema = z.object({
    studentId: idSchema,
    status: attendanceStatusSchema,
    notes: z.string().optional(),
});
// Schema for the POST /attendance/mark body
// For marking attendance for multiple students at once
export const markAttendanceSchema = z.object({
    batchId: idSchema, // or some other identifier
    date: dateTimeSchema,
    records: z.array(recordSchema),
});

// Inferred Types for Attendance
export type AttendanceQueryPayload = z.infer<typeof attendanceQuerySchema>;
export type AttendanceMarkPayload = z.infer<typeof markAttendanceSchema>;
export type AttendanceRecordPayload = z.infer<typeof recordSchema>;
