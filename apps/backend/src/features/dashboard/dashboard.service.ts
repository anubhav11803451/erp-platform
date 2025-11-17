import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request as ExpressRequest } from 'express';
import { PrismaService } from 'src/core/prisma.service';
import { UserRole } from '@erp/shared';

// Define the shape of our user payload from the JWT
interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

@Injectable({ scope: Scope.REQUEST })
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REQUEST) private readonly req: ExpressRequest,
    ) {}

    async getDashboardStats() {
        const user = this.req.user as JwtPayload;

        // --- Stats for ALL roles ---
        const studentCount = await this.prisma.student.count();
        const batchCount = await this.prisma.batch.count();

        const stats: any = {
            totalStudents: studentCount,
            activeBatches: batchCount,
        };

        // --- ADMIN-Only Stats ---
        if (user.role === UserRole.ADMIN) {
            const revenue = await this.prisma.payment.aggregate({
                _sum: {
                    amount: true,
                },
            });
            stats.totalRevenue = revenue._sum.amount || 0;
        }

        return stats;
    }

    async getRecentActivity() {
        // Get the 5 most recent payments
        const recentPayments = await this.prisma.payment.findMany({
            take: 5,
            orderBy: {
                payment_date: 'desc',
            },
            include: {
                student: {
                    select: { first_name: true, last_name: true },
                },
                batch: {
                    select: { name: true, subject: true },
                },
            },
        });

        // Get the 5 most recent enrollments
        const recentEnrollments = await this.prisma.studentBatch.findMany({
            take: 5,
            orderBy: {
                join_date: 'desc',
            },
            include: {
                student: {
                    select: { first_name: true, last_name: true },
                },
                batch: {
                    select: { name: true, subject: true },
                },
            },
        });

        return {
            recentPayments,
            recentEnrollments,
        };
    }
}
