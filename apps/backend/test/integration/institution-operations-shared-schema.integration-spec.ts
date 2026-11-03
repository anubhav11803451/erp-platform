import { randomUUID } from 'node:crypto';
import { NotFoundException } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@erp/db/client';
import pg from 'pg';
import { InstitutionOperationsService } from '../../src/features/institution-operations/institution-operations.service';

const DISPOSABLE_DATABASE_ACK = 'I_HAVE_VERIFIED_THIS_IS_A_NEW_DISPOSABLE_DATABASE';
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDatabaseAcknowledgement = process.env.TEST_DATABASE_DISPOSABLE_ACK;

describe('Institution operations shared-schema PostgreSQL invariants', () => {
    let pool: pg.Pool | undefined;
    let prisma: PrismaClient | undefined;
    const institutionIds: string[] = [];
    const accountIds: string[] = [];
    let legalEntityId: string | undefined;

    beforeAll(async () => {
        const connectionString = requireDisposableDatabaseUrl();
        pool = new pg.Pool({ connectionString });
        prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
        await prisma.$connect();
    });

    afterAll(async () => {
        try {
            if (prisma && institutionIds.length > 0) {
                await prisma.institutionAttendanceMark.deleteMany({
                    where: { institution_id: { in: institutionIds } },
                });
                await prisma.institutionStudentGroupMembership.deleteMany({
                    where: { institution_id: { in: institutionIds } },
                });
                await prisma.institutionStaffGroupAssignment.deleteMany({
                    where: { institution_id: { in: institutionIds } },
                });
                await prisma.institutionStaffMembership.deleteMany({
                    where: { institution_id: { in: institutionIds } },
                });
                await prisma.institutionStudent.deleteMany({
                    where: { institution_id: { in: institutionIds } },
                });
                await prisma.institutionGroup.deleteMany({
                    where: { institution_id: { in: institutionIds } },
                });
                await prisma.institution.deleteMany({ where: { id: { in: institutionIds } } });
            }
            if (prisma && legalEntityId) {
                await prisma.legalEntity.deleteMany({ where: { id: legalEntityId } });
            }
            if (prisma && accountIds.length > 0) {
                await prisma.account.deleteMany({ where: { id: { in: accountIds } } });
            }
        } finally {
            try {
                await prisma?.$disconnect();
            } finally {
                await pool?.end();
            }
        }
    });

    it('enforces same-Institution relations and case-insensitive student ID uniqueness', async () => {
        const db = requireDatabase();
        const legalEntity = await db.legalEntity.create({
            data: { name: `Operations integration ${randomUUID()}` },
        });
        legalEntityId = legalEntity.id;

        const institutionA = await db.institution.create({
            data: {
                name: `Operations institution A ${randomUUID()}`,
                legal_entity_id: legalEntity.id,
            },
        });
        institutionIds.push(institutionA.id);
        const institutionB = await db.institution.create({
            data: {
                name: `Operations institution B ${randomUUID()}`,
                legal_entity_id: legalEntity.id,
            },
        });
        institutionIds.push(institutionB.id);

        const groupA = await db.institutionGroup.create({
            data: { institution_id: institutionA.id, name: 'Group A', type: 'SCHOOL_SECTION' },
        });
        const groupB = await db.institutionGroup.create({
            data: { institution_id: institutionB.id, name: 'Group B', type: 'COACHING_BATCH' },
        });
        const studentA = await db.institutionStudent.create({
            data: {
                institution_id: institutionA.id,
                display_name: 'Student A',
                local_id: 'student-001',
            },
        });
        const studentB = await db.institutionStudent.create({
            data: { institution_id: institutionB.id, display_name: 'Student B' },
        });
        const updater = await db.account.create({
            data: {
                email: `${randomUUID()}@operations.test`,
                password_hash: 'integration-only-hash',
            },
        });
        accountIds.push(updater.id);
        const staffAccount = await db.account.create({
            data: {
                email: `${randomUUID()}@operations.test`,
                password_hash: 'integration-only-hash',
                identity_kind: 'INSTITUTION_STAFF',
                institution_staff_membership: {
                    create: { institution_id: institutionA.id },
                },
            },
        });
        accountIds.push(staffAccount.id);

        await db.institutionStudentGroupMembership.create({
            data: {
                institution_id: institutionA.id,
                student_id: studentA.id,
                group_id: groupA.id,
            },
        });

        await expect(
            db.institutionStudentGroupMembership.create({
                data: {
                    institution_id: institutionA.id,
                    student_id: studentB.id,
                    group_id: groupA.id,
                },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });

        await expect(
            db.institutionStudentGroupMembership.create({
                data: {
                    institution_id: institutionA.id,
                    student_id: studentA.id,
                    group_id: groupB.id,
                },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });

        await db.institutionAttendanceMark.create({
            data: {
                institution_id: institutionA.id,
                student_id: studentA.id,
                group_id: groupA.id,
                attendance_date: new Date('2026-01-15T00:00:00.000Z'),
                status: 'PRESENT',
                updated_by_account_id: updater.id,
            },
        });

        await expect(
            db.institutionAttendanceMark.create({
                data: {
                    institution_id: institutionA.id,
                    student_id: studentB.id,
                    group_id: groupB.id,
                    attendance_date: new Date('2026-01-15T00:00:00.000Z'),
                    status: 'ABSENT',
                    updated_by_account_id: updater.id,
                },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });

        await db.institutionStaffGroupAssignment.create({
            data: {
                institution_id: institutionA.id,
                staff_account_id: staffAccount.id,
                group_id: groupA.id,
            },
        });

        const operationsService = new InstitutionOperationsService(db as never);
        let notifyLockAcquired!: () => void;
        const lockAcquired = new Promise<void>((resolve) => {
            notifyLockAcquired = resolve;
        });
        let releaseRevocation!: () => void;
        const revocationGate = new Promise<void>((resolve) => {
            releaseRevocation = resolve;
        });
        const revocation = db.$transaction(async (transaction) => {
            await transaction.$queryRaw`
                SELECT "id" FROM "Institution" WHERE "id" = ${institutionA.id} FOR UPDATE
            `;
            notifyLockAcquired();
            await revocationGate;
            const result = await transaction.institutionStaffGroupAssignment.updateMany({
                where: {
                    institution_id: institutionA.id,
                    staff_account_id: staffAccount.id,
                    group_id: groupA.id,
                    revoked_at: null,
                },
                data: { revoked_at: new Date() },
            });
            if (result.count !== 1) {
                throw new Error('Expected one active Staff group assignment to be revoked.');
            }
        });
        await lockAcquired;

        const staffUpdate = operationsService.updateStudent(
            { accountId: staffAccount.id, institutionId: institutionA.id, role: 'STAFF' },
            studentA.id,
            { display_name: 'Must not be applied after revocation' },
        );
        try {
            await waitForInstitutionLockWait(requirePool());
        } finally {
            releaseRevocation();
            await revocation;
        }

        await expect(staffUpdate).rejects.toThrow(NotFoundException);
        await expect(
            db.institutionStudent.findUniqueOrThrow({ where: { id: studentA.id } }),
        ).resolves.toMatchObject({ display_name: 'Student A' });

        await expect(
            db.institutionStaffGroupAssignment.create({
                data: {
                    institution_id: institutionA.id,
                    staff_account_id: staffAccount.id,
                    group_id: groupB.id,
                },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });

        await expect(
            db.institutionStudent.create({
                data: {
                    institution_id: institutionA.id,
                    display_name: 'Duplicate Student ID',
                    local_id: 'STUDENT-001',
                },
            }),
        ).rejects.toMatchObject({ code: 'P2002' });
    });

    function requireDatabase(): PrismaClient {
        if (!prisma) {
            throw new Error('Disposable PostgreSQL integration client was not initialized.');
        }
        return prisma;
    }

    function requirePool(): pg.Pool {
        if (!pool) {
            throw new Error('Disposable PostgreSQL integration pool was not initialized.');
        }
        return pool;
    }

    function requireDisposableDatabaseUrl(): string {
        if (!testDatabaseUrl) {
            throw new Error('Set TEST_DATABASE_URL to a dedicated disposable PostgreSQL database.');
        }
        if (testDatabaseAcknowledgement !== DISPOSABLE_DATABASE_ACK) {
            throw new Error(
                `Set TEST_DATABASE_DISPOSABLE_ACK=${DISPOSABLE_DATABASE_ACK} only after verifying the target.`,
            );
        }

        const parsedUrl = new URL(testDatabaseUrl);
        const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1));
        if (parsedUrl.protocol !== 'postgresql:' || !/(test|disposable)/i.test(databaseName)) {
            throw new Error(
                'Integration tests require a PostgreSQL database with a test/disposable name.',
            );
        }
        return testDatabaseUrl;
    }

    async function waitForInstitutionLockWait(databasePool: pg.Pool): Promise<void> {
        const deadline = Date.now() + 10_000;
        while (Date.now() < deadline) {
            const { rows } = await databasePool.query<{ waiting: boolean }>(`
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_stat_activity
                    WHERE datname = current_database()
                      AND pid <> pg_backend_pid()
                      AND wait_event_type = 'Lock'
                      AND query ILIKE '%"Institution"%FOR UPDATE%'
                ) AS waiting
            `);
            if (rows[0]?.waiting) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
        }
        throw new Error('Staff student update did not wait for the Institution row lock.');
    }
});
