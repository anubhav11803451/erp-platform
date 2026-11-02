import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../core/prisma.service';
import { InstitutionAdminInvitationService } from './institution-admin-invitation.service';

const institution = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'School',
    code: 'SPEG-MAIN',
};
const accountId = '00000000-0000-4000-8000-000000000002';
const invitationId = '00000000-0000-4000-8000-000000000003';
const now = new Date();
const reviewDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const continuationToken = 'continuation-secret';
const csrfToken = 'csrf-secret';

describe('InstitutionAdminInvitationService claim flow', () => {
    let service: InstitutionAdminInvitationService;
    let prisma: Record<string, any>;
    let transaction: Record<string, any>;
    let response: { cookie: jest.Mock; clearCookie: jest.Mock };

    beforeEach(() => {
        transaction = {
            institutionAdminInvitation: {
                findUnique: jest.fn(),
                findFirst: jest.fn().mockResolvedValue(null),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionAdminInvitationContinuation: {
                findUnique: jest.fn(),
                create: jest.fn().mockResolvedValue({}),
                deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            account: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            institutionAdminMembership: {
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn(),
            },
            session: {
                findUnique: jest.fn(),
                create: jest.fn(),
                updateMany: jest.fn(),
            },
            $queryRaw: jest.fn().mockResolvedValue([{ id: institution.id }]),
        };
        prisma = {
            ...transaction,
            institutionAdminInvitation: { findUnique: jest.fn() },
            institutionAdminInvitationContinuation: { findUnique: jest.fn() },
            account: { findUnique: jest.fn() },
            $transaction: jest.fn(async (callback: (tx: Record<string, any>) => unknown) =>
                callback(transaction),
            ),
        };
        response = { cookie: jest.fn(), clearCookie: jest.fn() };
        service = new InstitutionAdminInvitationService(
            prisma as unknown as PrismaService,
            {
                get: jest.fn((key: string) => (key === 'NODE_ENV' ? 'test' : undefined)),
                getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            } as unknown as ConfigService,
        );
    });

    it('exchanges the bearer for a bounded continuation and readable synchronizer-CSRF cookie', async () => {
        const bearer = 'high-entropy-invitation-bearer';
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institution.id,
        });
        transaction.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            status: 'PENDING',
            invited_email: 'admin@example.test',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            institution: {
                id: institution.id,
                name: institution.name,
                code_suffix: 'MAIN',
                legal_entity: { code: 'SPEG' },
            },
        });

        const result = await service.exchange(bearer, response as unknown as Response);
        const continuationCookie = response.cookie.mock.calls.find(
            ([name]) => name === 'erp360_iac',
        );
        const csrfCookie = response.cookie.mock.calls.find(([name]) => name === 'erp360_iac_ctk');
        const saved =
            transaction.institutionAdminInvitationContinuation.create.mock.calls[0][0].data;

        expect(result).toEqual({
            institution,
            invited_email: 'admin@example.test',
            invitation_expires_at: expect.any(String),
        });
        expect(saved.credential_hash).toBe(hash(continuationCookie?.[1] as string));
        expect(saved.csrf_token_hash).toBe(hash(csrfCookie?.[1] as string));
        expect(continuationCookie?.[2]).toEqual(
            expect.objectContaining({
                httpOnly: true,
                path: '/v1/api/auth',
            }),
        );
        expect(csrfCookie?.[2]).toEqual(
            expect.objectContaining({
                httpOnly: false,
                path: '/',
            }),
        );
        expect(result).not.toHaveProperty('continuation_token');
    });

    it('does not claim a legacy invitation without a bound recipient', async () => {
        prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
            id: 'continuation-row',
            csrf_token_hash: hash(csrfToken),
            invitation: { institution_id: institution.id, invited_email: null },
        });
        transaction.institutionAdminInvitationContinuation.findUnique.mockResolvedValue(
            makeContinuation(null, 'PENDING', null),
        );

        await expect(
            service.claimNewAccount(
                continuationToken,
                { password: 'secure-password', claimant_provided_name: 'Claimant' },
                csrfToken,
                response as unknown as Response,
            ),
        ).rejects.toThrow('Invitation is invalid or unavailable');
        expect(transaction.account.create).not.toHaveBeenCalled();
        expect(transaction.institutionAdminMembership.create).not.toHaveBeenCalled();
        expect(transaction.session.create).not.toHaveBeenCalled();
    });

    it('rejects a legacy unbound invitation during exchange', async () => {
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institution.id,
        });
        transaction.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            status: 'PENDING',
            invited_email: null,
            expires_at: new Date(Date.now() + 60_000),
            institution: {
                id: institution.id,
                name: institution.name,
                code_suffix: 'MAIN',
                legal_entity: { code: 'SPEG' },
            },
        });

        await expect(
            service.exchange('legacy-unbound-bearer', response as unknown as Response),
        ).rejects.toThrow('Invitation is invalid or unavailable');
        expect(transaction.institutionAdminInvitationContinuation.create).not.toHaveBeenCalled();
        expect(response.cookie).not.toHaveBeenCalled();
    });

    it('rotates a continuation for the addressed unassigned account without issuing a session', async () => {
        const account = {
            id: accountId,
            email: 'admin@example.test',
            password_hash: await bcrypt.hash('correct-password', 4),
            identity_kind: 'UNASSIGNED',
            owner_grant: null,
            institution_admin_membership: null,
        };
        prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
            id: 'continuation-row',
            csrf_token_hash: hash(csrfToken),
            invitation: {
                institution_id: institution.id,
                invited_email: 'admin@example.test',
            },
        });
        prisma.account.findUnique.mockResolvedValue(account);
        transaction.institutionAdminInvitationContinuation.findUnique.mockResolvedValue(
            makeContinuation(account.id),
        );
        transaction.account.findUnique.mockResolvedValue(account);

        const result = await service.signInExistingAccount(
            continuationToken,
            { email: 'ADMIN@example.test', password: 'correct-password' },
            csrfToken,
            response as unknown as Response,
        );

        expect(result).toEqual({
            institution,
            invited_email: 'admin@example.test',
            invitation_expires_at: expect.any(String),
        });
        const rotated =
            transaction.institutionAdminInvitationContinuation.updateMany.mock.calls[0][0];
        expect(rotated.data.account_id).toBe(accountId);
        expect(rotated.data.credential_hash).not.toBe(hash(continuationToken));
        expect(rotated.data.csrf_token_hash).toMatch(/^[a-f0-9]{64}$/);
        expect(transaction.session.create).not.toHaveBeenCalled();
        expect(result).not.toHaveProperty('access_token');
        expect(result).not.toHaveProperty('continuation_token');
    });

    it('fails closed for missing recipient and wrong submitted email', async () => {
        prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
            id: 'continuation-row',
            csrf_token_hash: hash(csrfToken),
            invitation: { institution_id: institution.id, invited_email: null },
        });
        await expect(
            service.signInExistingAccount(
                continuationToken,
                { email: 'admin@example.test', password: 'correct-password' },
                csrfToken,
                response as unknown as Response,
            ),
        ).rejects.toThrow('Unable to continue with this invitation');
        expect(prisma.account.findUnique).not.toHaveBeenCalled();

        prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
            id: 'continuation-row',
            csrf_token_hash: hash(csrfToken),
            invitation: {
                institution_id: institution.id,
                invited_email: 'different@example.test',
            },
        });
        await expect(
            service.signInExistingAccount(
                continuationToken,
                { email: 'admin@example.test', password: 'correct-password' },
                csrfToken,
                response as unknown as Response,
            ),
        ).rejects.toThrow('Unable to continue with this invitation');
        expect(prisma.account.findUnique).not.toHaveBeenCalled();
    });

    it('submits an existing unassigned account claim without granting membership or a session', async () => {
        const account = {
            id: accountId,
            email: 'admin@example.test',
            identity_kind: 'UNASSIGNED',
            owner_grant: null,
            institution_admin_membership: null,
        };
        installPendingContinuation(prisma, transaction, account);

        const result = await service.claimExistingAccount(
            continuationToken,
            { claimant_provided_name: 'Claimant Name' },
            csrfToken,
            response as unknown as Response,
        );

        const update = transaction.institutionAdminInvitation.updateMany.mock.calls[1][0];
        const statusCookie = response.cookie.mock.calls.find(([name]) => name === 'erp360_ias');
        expect(result).toEqual({
            id: invitationId,
            status: 'PENDING_APPROVAL',
            invited_email: 'admin@example.test',
            claimed_at: expect.any(String),
            review_expires_at: expect.any(String),
        });
        expect(update.where).toEqual({
            id: invitationId,
            status: 'PENDING',
            expires_at: { gt: expect.any(Date) },
        });
        expect(update.data).toEqual(
            expect.objectContaining({
                status: 'PENDING_APPROVAL',
                claimed_by_account_id: accountId,
                claimant_name: 'Claimant Name',
                status_credential_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
                status_credential_expires_at: expect.any(Date),
            }),
        );
        expect(update.data.status_credential_hash).not.toBe(statusCookie?.[1]);
        expect(statusCookie?.[2]).toEqual(
            expect.objectContaining({
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/v1/api/auth/invitations/status',
                expires: update.data.review_expires_at,
            }),
        );
        expect(response.clearCookie).toHaveBeenCalledWith(
            'erp360_iac',
            expect.objectContaining({ path: '/v1/api/auth' }),
        );
        expect(response.clearCookie).toHaveBeenCalledWith(
            'erp360_iac',
            expect.objectContaining({ path: '/v1/api/auth/invitations' }),
        );
        expect(transaction.account.create).not.toHaveBeenCalled();
        expect(transaction.account.updateMany).toBeUndefined();
        expect(transaction.institutionAdminMembership.create).not.toHaveBeenCalled();
        expect(transaction.session.create).not.toHaveBeenCalled();
        expect(transaction.institutionAdminInvitationContinuation.deleteMany).toHaveBeenCalledWith({
            where: { id: 'continuation-row' },
        });
    });

    it('creates a new account as UNASSIGNED and still defers membership and session creation', async () => {
        const continuation = makeContinuation(null);
        prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
            id: 'continuation-row',
            csrf_token_hash: hash(csrfToken),
            invitation: { institution_id: institution.id, invited_email: 'admin@example.test' },
        });
        transaction.institutionAdminInvitationContinuation.findUnique.mockResolvedValue(
            continuation,
        );
        transaction.account.findUnique.mockResolvedValue(null);
        transaction.account.create.mockResolvedValue({
            id: accountId,
        });

        await service.claimNewAccount(
            continuationToken,
            {
                password: 'secure-password',
                claimant_provided_name: 'New Claimant',
            },
            csrfToken,
            response as unknown as Response,
        );

        expect(transaction.account.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    email: 'admin@example.test',
                    identity_kind: 'UNASSIGNED',
                    password_hash: expect.any(String),
                }),
            }),
        );
        expect(transaction.institutionAdminMembership.create).not.toHaveBeenCalled();
        expect(transaction.session.create).not.toHaveBeenCalled();
    });

    it('commits lazy link expiry before returning an unavailable claim result', async () => {
        const expiredContinuation = makeContinuation(null, 'EXPIRED');
        prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
            id: 'continuation-row',
            csrf_token_hash: hash(csrfToken),
            invitation: { institution_id: institution.id },
        });
        transaction.institutionAdminInvitationContinuation.findUnique.mockResolvedValue(
            expiredContinuation,
        );

        await expect(
            service.claimExistingAccount(
                continuationToken,
                { claimant_provided_name: 'Claimant Name' },
                csrfToken,
                response as unknown as Response,
            ),
        ).rejects.toThrow('Invitation is invalid or unavailable');

        expect(transaction.institutionAdminInvitation.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    institution_id: institution.id,
                    OR: expect.arrayContaining([
                        expect.objectContaining({
                            status: 'PENDING',
                            expires_at: { lte: expect.any(Date) },
                        }),
                    ]),
                }),
                data: { status: 'EXPIRED' },
            }),
        );
        expect(response.cookie).not.toHaveBeenCalled();
        expect(transaction.institutionAdminMembership.create).not.toHaveBeenCalled();
    });

    it('returns claimant status only without exposing account or credential data', async () => {
        const statusCredential = 'status-only-secret';
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institution.id,
        });
        transaction.institutionAdminInvitation.findUnique.mockResolvedValue({
            status: 'PENDING_APPROVAL',
            invited_email: 'admin@example.test',
            claimed_at: now,
            review_expires_at: reviewDeadline,
            decided_at: null,
            status_credential_expires_at: reviewDeadline,
        });

        const result = await service.getClaimantStatus(statusCredential);

        expect(result).toEqual({
            status: 'PENDING_APPROVAL',
            invited_email: 'admin@example.test',
            claimed_at: now.toISOString(),
            review_expires_at: reviewDeadline.toISOString(),
            decided_at: null,
        });
        expect(prisma.institutionAdminInvitation.findUnique).toHaveBeenCalledWith({
            where: { status_credential_hash: hash(statusCredential) },
            select: { id: true, institution_id: true },
        });
        expect(result).not.toHaveProperty('claimed_by_account_id');
        expect(result).not.toHaveProperty('status_credential_hash');
    });

    it('persists review expiry before rejecting an expired status credential', async () => {
        const expiredAt = new Date(Date.now() - 1_000);
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institution.id,
        });
        transaction.institutionAdminInvitation.findUnique.mockResolvedValue({
            status: 'EXPIRED',
            invited_email: 'admin@example.test',
            claimed_at: now,
            review_expires_at: expiredAt,
            decided_at: null,
            status_credential_expires_at: expiredAt,
        });

        await expect(service.getClaimantStatus('expired-status-credential')).rejects.toThrow(
            'Invitation is invalid or unavailable',
        );
        expect(transaction.institutionAdminInvitation.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        {
                            status: 'PENDING_APPROVAL',
                            review_expires_at: { lte: expect.any(Date) },
                        },
                    ]),
                }),
                data: { status: 'EXPIRED' },
            }),
        );
    });

    it('rejects production cookie setup until the configured topology is reviewed', async () => {
        const productionService = new InstitutionAdminInvitationService(
            prisma as unknown as PrismaService,
            {
                get: jest.fn((key: string) => (key === 'NODE_ENV' ? 'production' : undefined)),
                getOrThrow: jest.fn().mockReturnValue('https://client.example.test'),
            } as unknown as ConfigService,
        );
        await expect(
            productionService.exchange('bearer-token', response as unknown as Response),
        ).rejects.toThrow('Invitation cookie settings require production topology review');
    });
});

function installPendingContinuation(
    prisma: Record<string, any>,
    transaction: Record<string, any>,
    account: { id: string; [key: string]: unknown },
): void {
    prisma.institutionAdminInvitationContinuation.findUnique.mockResolvedValue({
        id: 'continuation-row',
        csrf_token_hash: hash(csrfToken),
        invitation: { institution_id: institution.id, invited_email: 'admin@example.test' },
    });
    transaction.institutionAdminInvitationContinuation.findUnique.mockResolvedValue(
        makeContinuation(account.id),
    );
    transaction.account.findUnique.mockResolvedValue(account);
}

function makeContinuation(
    accountId: string | null,
    invitationStatus = 'PENDING',
    invitedEmail: string | null = 'admin@example.test',
) {
    return {
        id: 'continuation-row',
        account_id: accountId,
        credential_hash: hash(continuationToken),
        csrf_token_hash: hash(csrfToken),
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
        revoked_at: null,
        consumed_at: null,
        invitation: {
            id: invitationId,
            institution_id: institution.id,
            invited_email: invitedEmail,
            status: invitationStatus,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            institution: {
                id: institution.id,
                name: institution.name,
                code_suffix: 'MAIN',
                legal_entity: { code: 'SPEG' },
            },
        },
    };
}

function hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}
