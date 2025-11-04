import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { CreateEnrollmentDto, DisenrollDto } from './dto/enrollment.dto';
import { StudentBatch } from '@erp/db/client';

@Injectable()
export class EnrollmentService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateEnrollmentDto): Promise<StudentBatch> {
        // Check if the enrollment already exists
        const existing = await this.prisma.studentBatch.findFirst({
            where: {
                studentId: dto.studentId,
                batchId: dto.batchId,
            },
        });

        if (existing) {
            throw new ConflictException('Student is already enrolled in this batch.');
        }

        // Create the new enrollment
        return this.prisma.studentBatch.create({
            data: {
                studentId: dto.studentId,
                batchId: dto.batchId,
                total_fee_agreed: dto.total_fee_agreed,
            },
        });
    }

    // We can add a "getEnrollmentsForBatch" method here
    async getEnrollmentsByBatch(batchId: string) {
        return this.prisma.studentBatch.findMany({
            where: { batchId },
            include: {
                student: {
                    include: {
                        guardian: true, // Include guardian details with the student
                    },
                },
            },
        });
    }

    async getEnrollmentsByStudent(studentId: string) {
        return this.prisma.studentBatch.findMany({
            where: { studentId },
            include: {
                batch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async disenroll(dto: DisenrollDto): Promise<{ count: number }> {
        const { batchId, studentIds } = dto;

        const result = await this.prisma.studentBatch.deleteMany({
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
