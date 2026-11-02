import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

const CONTINUATION_RETENTION_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class InstitutionAdminInvitationContinuationCleanupService
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(InstitutionAdminInvitationContinuationCleanupService.name);
    private cleanupInterval: ReturnType<typeof setInterval> | undefined;

    constructor(private readonly prisma: PrismaService) {}

    onModuleInit(): void {
        if (this.cleanupInterval) {
            return;
        }

        this.runCleanup();
        this.cleanupInterval = setInterval(() => this.runCleanup(), CLEANUP_INTERVAL_MS);
        this.cleanupInterval.unref?.();
    }

    onModuleDestroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }

    async cleanupExpiredOrRevokedContinuations(now = new Date()): Promise<number> {
        const cutoff = new Date(now.getTime() - CONTINUATION_RETENTION_MS);
        const result = await this.prisma.institutionAdminInvitationContinuation.deleteMany({
            where: {
                consumed_at: null,
                OR: [
                    { revoked_at: { lte: cutoff } },
                    { revoked_at: null, expires_at: { lte: cutoff } },
                ],
            },
        });
        return result.count;
    }

    private runCleanup(): void {
        void this.cleanupExpiredOrRevokedContinuations().catch(() => {
            this.logger.error(
                'Invitation continuation cleanup failed; it will retry on the next sweep.',
            );
        });
    }
}
