import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { CreateEnrollmentDto, RemoveEnrollmentDto } from './dto/enrollment.dto';
import { StudentBatch } from '@erp/db/client';

@Injectable()
export class EnrollmentService {
    constructor(private readonly prisma: PrismaService) {}

    //Helper function
    private addDisplayNameToBatch(batch: { name: string; subject: string | null }) {
        return batch.subject ? `${batch.name} (${batch.subject})` : batch.name;
    }

    async create(dto: CreateEnrollmentDto): Promise<StudentBatch> {
        // Check if the enrollment already exists
        const existing = await this.prisma.extendedPrismaClient().studentBatch.findFirst({
            where: {
                studentId: dto.studentId,
                batchId: dto.batchId,
            },
        });

        if (existing) {
            throw new ConflictException('Student is already enrolled in this batch.');
        }

        // Create the new enrollment
        return this.prisma.extendedPrismaClient().studentBatch.create({
            data: {
                studentId: dto.studentId,
                batchId: dto.batchId,
                total_fee_agreed: dto.total_fee_agreed,
            },
        });
    }

    // We can add a "getEnrollmentsForBatch" method here
    async getEnrollmentsByBatch(batchId: string) {
        return this.prisma.extendedPrismaClient().studentBatch.findMany({
            where: { batchId },
            include: {
                student: {
                    include: {
                        guardian: true, // Include guardian details with the student
                    },
                },
                batch: {
                    select: { name: true, subject: true },
                },
            },
        });
    }

    async getEnrollmentsByStudent(studentId: string) {
        const enrollments = await this.prisma.extendedPrismaClient().studentBatch.findMany({
            where: { studentId },
            include: {
                batch: {
                    select: {
                        id: true,
                        name: true,
                        subject: true, //Get subject
                    },
                },
            },
        });

        return enrollments.map((enrollment) => ({
            ...enrollment,
            batch: {
                ...enrollment.batch,
                displayName: this.addDisplayNameToBatch(enrollment.batch),
            },
        }));
    }

    async disenroll(dto: RemoveEnrollmentDto): Promise<{ count: number }> {
        const { batchId, studentIds } = dto;

        const result = await this.prisma.extendedPrismaClient().studentBatch.deleteMany({
            where: {
                batchId: batchId,
                studentId: {
                    in: studentIds,
                },
            },
        });

        return result;
    }
}
