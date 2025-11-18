import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { AttendanceMarkDto } from './dto/attendance.dto';
import { Attendance, Prisma } from '@erp/db/client';
import type { AttendanceMarkResponse, BatchAttendanceResponse } from '@erp/shared';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Gets the list of enrolled students for a batch and merges in any
     * existing attendance data for the given date.
     */
    async getAttendanceForBatch(batchId: string, date: string): Promise<BatchAttendanceResponse[]> {
        // 1. Get all students enrolled in the batch
        const enrollments = await this.prisma.extendedPrismaClient().studentBatch.findMany({
            where: { batchId },
            select: {
                student: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });

        if (enrollments.length === 0) {
            // You can decide to return an empty array or error
            // throw new NotFoundException('No students found in this batch.');
            return [];
        }

        // 2. Get existing attendance records for these students on this date
        const studentIds = enrollments.map((e) => e.student.id);
        const existingAttendance = await this.prisma.extendedPrismaClient().attendance.findMany({
            where: {
                batchId,
                date,
                studentId: { in: studentIds },
            },
        });

        // 3. Create a map for easy lookup
        const attendanceMap = new Map(existingAttendance.map((att) => [att.studentId, att]));

        // 4. Merge the two lists
        const attendanceList: BatchAttendanceResponse[] = enrollments.map(({ student }) => {
            const existing: Attendance = attendanceMap.get(student.id)!;
            return {
                id: existing?.id || '', // Provide a default empty string if null
                student,
                status: existing?.status ?? 'None',
                notes: existing?.notes,
                date: existing?.date || date, // Use the queried date if no existing record date
                batchId: existing?.batchId || batchId, // Use the queried batchId if no existing record batchId
                studentId: existing?.studentId || student.id, // Use the student's ID if no existing record studentId
                created_at: existing?.created_at, // Provide a default date
                updated_at: existing?.updated_at, // Provide a default date
            };
        });

        return attendanceList;
    }

    /**
     * Creates or updates attendance records for a batch.
     */
    async markAttendance(dto: AttendanceMarkDto): Promise<AttendanceMarkResponse> {
        const { batchId, date, records } = dto;

        // Use a transaction to upsert all records at once
        const operations = records.map(({ studentId, status, notes }) =>
            this.prisma.extendedPrismaClient().attendance.upsert({
                where: {
                    studentId_batchId_date: {
                        studentId,
                        batchId,
                        date,
                    },
                },
                // Update if it exists
                update: {
                    status,
                    notes: notes || null,
                },
                // Create if it doesn't
                create: {
                    studentId,
                    batchId,
                    date,
                    status,
                    notes: notes || null,
                },
            }),
        );

        try {
            const result = await this.prisma.extendedPrismaClient().$transaction(operations);
            return {
                message: `Successfully marked attendance for ${result.length} students.`,
                count: result.length,
            };
        } catch (error) {
            // Handle potential errors, e.g., foreign key constraint
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new NotFoundException('One or more student or batch IDs are invalid.');
                }
            }
            throw error;
        }
    }
}
