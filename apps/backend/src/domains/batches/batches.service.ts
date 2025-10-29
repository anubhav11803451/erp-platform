import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { CreateBatchDto, UpdateBatchDto } from './dto';
import { Batch } from '@erp/db';

@Injectable()
export class BatchesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateBatchDto): Promise<Batch> {
        // If tutorId is provided, Prisma will automatically check the foreign key constraint.
        return this.prisma.batch.create({
            data: {
                ...dto,
                // Ensure start_date defaults to current time if not provided in DTO
                start_date: dto.start_date ? new Date(dto.start_date) : new Date(),
            },
        });
    }

    async findAll(): Promise<Batch[]> {
        return this.prisma.batch.findMany({
            // Include the assigned tutor for context
            include: { tutor: true },
        });
    }

    async findOne(id: string): Promise<Batch> {
        const batch = await this.prisma.batch.findUnique({
            where: { id },
            include: { tutor: true },
        });

        if (!batch) {
            throw new NotFoundException(`Batch with ID "${id}" not found`);
        }

        return batch;
    }

    async update(id: string, dto: UpdateBatchDto): Promise<Batch> {
        const updatedBatch = await this.prisma.batch.update({
            where: { id },
            data: {
                ...dto,
                // Convert date strings to Date objects before update
                start_date: dto.start_date ? new Date(dto.start_date) : undefined,
                end_date: dto.end_date ? new Date(dto.end_date) : undefined,
            },
        });
        return updatedBatch;
    }

    async remove(id: string): Promise<Batch> {
        // Note: Deleting a batch will require handling cascade deletes for student_batches,
        // payments, and attendance depending on your Prisma configuration.
        return this.prisma.batch.delete({ where: { id } });
    }
}
