import { PrismaService } from '../core/prisma.service';
import { InstitutionAdminInvitationContinuationCleanupService } from './institution-admin-invitation-continuation-cleanup.service';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type ContinuationRow = {
    id: string;
    expires_at: Date;
    revoked_at: Date | null;
    consumed_at: Date | null;
};

type CleanupWhere = {
    consumed_at: null;
    OR: Array<{ revoked_at: { lte: Date } } | { revoked_at: null; expires_at: { lte: Date } }>;
};

describe('InstitutionAdminInvitationContinuationCleanupService', () => {
    it('deletes continuations stale for 24 hours and retains active, recent, and consumed rows', async () => {
        const now = new Date('2026-10-29T12:00:00.000Z');
        const cutoff = new Date(now.getTime() - DAY_MS);
        const rows: ContinuationRow[] = [
            {
                id: 'expired-over-24-hours',
                expires_at: new Date(cutoff.getTime() - 1),
                revoked_at: null,
                consumed_at: null,
            },
            {
                id: 'revoked-over-24-hours',
                expires_at: new Date(now.getTime() + HOUR_MS),
                revoked_at: new Date(cutoff.getTime() - 1),
                consumed_at: null,
            },
            {
                id: 'active',
                expires_at: new Date(now.getTime() + HOUR_MS),
                revoked_at: null,
                consumed_at: null,
            },
            {
                id: 'expired-under-24-hours',
                expires_at: new Date(cutoff.getTime() + 1),
                revoked_at: null,
                consumed_at: null,
            },
            {
                id: 'recently-revoked',
                expires_at: new Date(cutoff.getTime() - DAY_MS),
                revoked_at: new Date(cutoff.getTime() + 1),
                consumed_at: null,
            },
            {
                id: 'consumed',
                expires_at: new Date(cutoff.getTime() - DAY_MS),
                revoked_at: null,
                consumed_at: new Date(cutoff.getTime() - DAY_MS),
            },
        ];
        const deletedIds: string[] = [];
        const deleteMany = jest.fn(async ({ where }: { where: CleanupWhere }) => {
            const matches = rows.filter((row) => {
                if (row.consumed_at !== where.consumed_at) {
                    return false;
                }
                return where.OR.some((condition) => {
                    if ('expires_at' in condition) {
                        return (
                            row.revoked_at === null && row.expires_at <= condition.expires_at.lte
                        );
                    }
                    return row.revoked_at !== null && row.revoked_at <= condition.revoked_at.lte;
                });
            });
            deletedIds.push(...matches.map((row) => row.id));
            for (const match of matches) {
                rows.splice(
                    rows.findIndex((row) => row.id === match.id),
                    1,
                );
            }
            return { count: matches.length };
        });
        const service = new InstitutionAdminInvitationContinuationCleanupService({
            institutionAdminInvitationContinuation: { deleteMany },
        } as unknown as PrismaService);

        await expect(service.cleanupExpiredOrRevokedContinuations(now)).resolves.toBe(2);

        expect(deleteMany).toHaveBeenCalledWith({
            where: {
                consumed_at: null,
                OR: [
                    { revoked_at: { lte: cutoff } },
                    { revoked_at: null, expires_at: { lte: cutoff } },
                ],
            },
        });
        expect(deletedIds).toEqual(['expired-over-24-hours', 'revoked-over-24-hours']);
        expect(rows.map((row) => row.id)).toEqual([
            'active',
            'expired-under-24-hours',
            'recently-revoked',
            'consumed',
        ]);
    });

    it('sweeps at startup and hourly, and clears its timer at shutdown', () => {
        jest.useFakeTimers();
        try {
            const service = new InstitutionAdminInvitationContinuationCleanupService({
                institutionAdminInvitationContinuation: { deleteMany: jest.fn() },
            } as unknown as PrismaService);
            const cleanup = jest
                .spyOn(service, 'cleanupExpiredOrRevokedContinuations')
                .mockResolvedValue(0);

            service.onModuleInit();
            expect(cleanup).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(HOUR_MS);
            expect(cleanup).toHaveBeenCalledTimes(2);

            service.onModuleDestroy();
            jest.advanceTimersByTime(HOUR_MS);
            expect(cleanup).toHaveBeenCalledTimes(2);
        } finally {
            jest.useRealTimers();
        }
    });
});
