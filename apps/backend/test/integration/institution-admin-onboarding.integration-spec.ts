import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@erp/db/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { OwnerService } from '../../src/owner/owner.service';
import { InstitutionAdminInvitationService } from '../../src/auth/institution-admin-invitation.service';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import type { Response } from 'express';

const DISPOSABLE_DATABASE_ACK = 'I_HAVE_VERIFIED_THIS_IS_A_NEW_DISPOSABLE_DATABASE';
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDatabaseAcknowledgement = process.env.TEST_DATABASE_DISPOSABLE_ACK;

describe('Institution Admin onboarding PostgreSQL invariants', () => {
    let pool: pg.Pool | undefined;
    let prisma: PrismaClient | undefined;
    const institutionIds: string[] = [];
    const accountIds: string[] = [];
    let legalEntityId: string | undefined;
    let ownerService: OwnerService;
    let invitationService: InstitutionAdminInvitationService;

    beforeAll(async () => {
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

        pool = new pg.Pool({ connectionString: testDatabaseUrl });
        prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
        await prisma.$connect();
        databaseClient = prisma;

        ownerService = new OwnerService(prisma as never);
        invitationService = new InstitutionAdminInvitationService(
            prisma as never,
            {
                get: (key: string) => (key === 'NODE_ENV' ? 'test' : undefined),
            } as unknown as ConfigService,
        );

        const legalEntity = await prisma.legalEntity.create({
            data: { name: `Slice 3 integration ${randomUUID()}` },
        });
        legalEntityId = legalEntity.id;
        for (let index = 0; index < 3; index += 1) {
            const institution = await prisma.institution.create({
                data: {
                    name: `Slice 3 institution ${index} ${randomUUID()}`,
                    legal_entity_id: legalEntity.id,
                },
            });
            institutionIds.push(institution.id);
        }
    });

    afterAll(async () => {
        if (!prisma) return;
        if (institutionIds.length > 0) {
            const invitations = await prisma.institutionAdminInvitation.findMany({
                where: { institution_id: { in: institutionIds } },
                select: { id: true },
            });
            const allInvitationIds = invitations.map(({ id }) => id);
            if (allInvitationIds.length > 0) {
                await prisma.institutionAdminInvitationContinuation.deleteMany({
                    where: { invitation_id: { in: allInvitationIds } },
                });
                await prisma.institutionAdminInvitation.deleteMany({
                    where: { id: { in: allInvitationIds } },
                });
            }
        }
        if (institutionIds.length > 0) {
            await prisma.session.deleteMany({ where: { account_id: { in: accountIds } } });
            await prisma.institutionAdminMembership.deleteMany({
                where: { institution_id: { in: institutionIds } },
            });
        }
        if (accountIds.length > 0) {
            await prisma.platformOwnerGrant.deleteMany({
                where: { account_id: { in: accountIds } },
            });
            await prisma.account.deleteMany({ where: { id: { in: accountIds } } });
        }
        if (institutionIds.length > 0) {
            await prisma.institution.deleteMany({ where: { id: { in: institutionIds } } });
        }
        if (legalEntityId) {
            await prisma.legalEntity.deleteMany({ where: { id: legalEntityId } });
        }
        await prisma.$disconnect();
        await pool?.end();
    });

    it('enforces Owner/member exclusivity and one membership per account while allowing multiple Admins', async () => {
        const db = requireDatabase();
        const owner = await db.account.create({
            data: {
                email: `${randomUUID()}@owner.test`,
                password_hash: 'integration-only-hash',
                identity_kind: 'PLATFORM_OWNER',
                owner_grant: { create: {} },
            },
        });
        accountIds.push(owner.id);

        await expect(
            db.institutionAdminMembership.create({
                data: { account_id: owner.id, institution_id: institutionIds[0] },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });

        const admins = await Promise.all(
            [0, 1].map(async () => {
                const account = await db.account.create({
                    data: {
                        email: `${randomUUID()}@admin.test`,
                        password_hash: 'integration-only-hash',
                        identity_kind: 'INSTITUTION_ADMIN',
                    },
                });
                accountIds.push(account.id);
                await db.institutionAdminMembership.create({
                    data: {
                        account_id: account.id,
                        institution_id: institutionIds[0],
                    },
                });
                return account;
            }),
        );

        await expect(
            db.institutionAdminMembership.create({
                data: {
                    account_id: admins[0].id,
                    institution_id: institutionIds[1],
                },
            }),
        ).rejects.toMatchObject({ code: 'P2002' });
        await expect(
            db.institutionAdminMembership.count({
                where: { institution_id: institutionIds[0] },
            }),
        ).resolves.toBe(2);
    });

    it('rolls back identity and membership together when the transaction fails', async () => {
        const db = requireDatabase();
        const account = await createUnassignedAccount(db);

        await expect(
            db.$transaction(async (transaction) => {
                await transaction.account.update({
                    where: { id: account.id },
                    data: { identity_kind: 'INSTITUTION_ADMIN' },
                });
                await transaction.institutionAdminMembership.create({
                    data: {
                        account_id: account.id,
                        institution_id: institutionIds[0],
                    },
                });
                throw new Error('force rollback for integration assertion');
            }),
        ).rejects.toThrow('force rollback');

        await expect(
            db.account.findUnique({
                where: { id: account.id },
                select: { identity_kind: true },
            }),
        ).resolves.toEqual({ identity_kind: 'UNASSIGNED' });
        await expect(
            db.institutionAdminMembership.findUnique({
                where: { account_id: account.id },
            }),
        ).resolves.toBeNull();
    });

    it('serializes claim and Owner revocation without granting claimant access', async () => {
        const db = requireDatabase();
        const account = await createUnassignedAccount(db);
        const owner = await createPlatformOwnerAccount(db);
        const { invitationId, continuationToken, csrfToken } = await createPendingFlow(
            db,
            institutionIds[0],
            account.id,
        );

        const outcomes = await Promise.allSettled([
            invitationService.claimExistingAccount(
                continuationToken,
                { claimant_provided_name: 'Unverified Claimant' },
                csrfToken,
                cookieResponse(),
            ),
            ownerService.revokeFirstAdminInvitation(institutionIds[0], invitationId, owner.id),
        ]);
        expect(outcomes.some(({ status }) => status === 'fulfilled')).toBe(true);

        const finalInvitation = await db.institutionAdminInvitation.findUniqueOrThrow({
            where: { id: invitationId },
        });
        expect(['PENDING_APPROVAL', 'REVOKED']).toContain(finalInvitation.status);
        const finalAccount = await db.account.findUniqueOrThrow({
            where: { id: account.id },
            select: { identity_kind: true },
        });
        const membership = await db.institutionAdminMembership.findUnique({
            where: { account_id: account.id },
        });
        expect(finalAccount.identity_kind).toBe('UNASSIGNED');
        expect(membership).toBeNull();
    });

    it('serializes a claim and replacement without leaving two outstanding flows', async () => {
        const db = requireDatabase();
        const account = await createUnassignedAccount(db);
        const owner = await createPlatformOwnerAccount(db);
        const { invitationId, continuationToken, csrfToken } = await createPendingFlow(
            db,
            institutionIds[1],
            account.id,
        );

        const outcomes = await Promise.allSettled([
            invitationService.claimExistingAccount(
                continuationToken,
                { claimant_provided_name: 'Unverified Claimant' },
                csrfToken,
                cookieResponse(),
            ),
            ownerService.replaceFirstAdminInvitation(
                institutionIds[1],
                invitationId,
                { invited_email: 'admin@example.test' },
                'http://localhost:5173',
                owner.id,
            ),
        ]);
        expect(outcomes.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
        await expect(
            db.institutionAdminInvitation.count({
                where: {
                    institution_id: institutionIds[1],
                    status: { in: ['PENDING', 'PENDING_APPROVAL'] },
                },
            }),
        ).resolves.toBeLessThanOrEqual(1);
    });

    it('serializes concurrent replacement and keeps one pending invitation', async () => {
        const db = requireDatabase();
        const claimant = await createUnassignedAccount(db);
        const owner = await createPlatformOwnerAccount(db);
        const { invitationId } = await createPendingFlow(db, institutionIds[2], claimant.id);
        const payload = { invited_email: 'admin@example.test' };

        const outcomes = await Promise.allSettled([
            ownerService.replaceFirstAdminInvitation(
                institutionIds[2],
                invitationId,
                payload,
                'http://localhost:5173',
                owner.id,
            ),
            ownerService.replaceFirstAdminInvitation(
                institutionIds[2],
                invitationId,
                payload,
                'http://localhost:5173',
                owner.id,
            ),
        ]);

        expect(outcomes.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
        await expect(
            requireDatabase().institutionAdminInvitation.count({
                where: { institution_id: institutionIds[2], status: 'PENDING' },
            }),
        ).resolves.toBe(1);
    });

    async function createUnassignedAccount(db: PrismaClient) {
        const account = await db.account.create({
            data: {
                email: `${randomUUID()}@unassigned.test`,
                password_hash: 'integration-only-hash',
                identity_kind: 'UNASSIGNED',
            },
        });
        accountIds.push(account.id);
        return account;
    }

    async function createPlatformOwnerAccount(db: PrismaClient) {
        const account = await db.account.create({
            data: {
                email: `${randomUUID()}@owner.test`,
                password_hash: 'integration-only-hash',
                identity_kind: 'PLATFORM_OWNER',
                owner_grant: { create: {} },
            },
        });
        accountIds.push(account.id);
        return account;
    }

    async function createPendingFlow(db: PrismaClient, institutionId: string, accountId: string) {
        const invitationBearer = randomBytes(32).toString('base64url');
        const continuationToken = randomBytes(64).toString('base64url');
        const csrfToken = randomBytes(64).toString('base64url');
        const invitation = await db.institutionAdminInvitation.create({
            data: {
                institution_id: institutionId,
                token_hash: hash(invitationBearer),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        await db.institutionAdminInvitationContinuation.create({
            data: {
                invitation_id: invitation.id,
                credential_hash: hash(continuationToken),
                account_id: accountId,
                csrf_token_hash: hash(csrfToken),
                expires_at: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        return { invitationId: invitation.id, continuationToken, csrfToken };
    }
});

function requireDatabase(): PrismaClient {
    if (!databaseClient) {
        throw new Error('Disposable integration database was not initialized.');
    }
    return databaseClient;
}

function cookieResponse(): Response {
    return {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response;
}

function hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

let databaseClient: PrismaClient | undefined;
