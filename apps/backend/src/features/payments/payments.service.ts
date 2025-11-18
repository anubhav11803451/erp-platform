import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.dto';
import { Payment } from '@erp/db/client';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreatePaymentDto): Promise<Payment> {
        // First, verify the student is actually in that batch
        const enrollment = await this.prisma.extendedPrismaClient().studentBatch.findFirst({
            where: {
                studentId: dto.studentId,
                batchId: dto.batchId,
            },
        });

        if (!enrollment) {
            throw new NotFoundException(
                'Enrollment not found. Cannot log payment for a student not in this batch.',
            );
        }

        // Create the new payment
        return this.prisma.extendedPrismaClient().payment.create({
            data: {
                studentId: dto.studentId,
                batchId: dto.batchId,
                amount: dto.amount,
                method: dto.method,
                notes: dto.notes,
            },
        });
    }

    async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
        return this.prisma.extendedPrismaClient().payment.findMany({
            where: { studentId },
            include: {
                batch: {
                    select: {
                        name: true, // Include the batch name with the payment
                    },
                },
            },
            // We don't sort here, we'll sort on the client
            // orderBy: {
            //   payment_date: 'desc',
            // },
        });
    }

    async findOne(id: string): Promise<Payment | null> {
        const payment = await this.prisma.extendedPrismaClient().payment.findUnique({
            where: { id },
            include: {
                student: {
                    select: { first_name: true, last_name: true },
                },
                batch: {
                    select: { name: true },
                },
            },
        });
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        return payment;
    }

    async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
        // Verify payment exists
        await this.findOne(id);
        return this.prisma.extendedPrismaClient().payment.update({
            where: { id },
            data: { ...dto },
        });
    }

    async remove(id: string): Promise<Payment> {
        // Verify payment exists
        await this.findOne(id);
        return this.prisma.extendedPrismaClient().payment.delete({
            where: { id },
        });
    }
}
