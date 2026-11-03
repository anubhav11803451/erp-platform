import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../core/prisma.service';
import { AuthService } from './auth.service';

const ownerAccount = {
    id: 'owner-account-id',
    email: 'owner@example.test',
    password_hash: '',
    identity_kind: 'PLATFORM_OWNER',
    owner_grant: { account_id: 'owner-account-id' },
    institution_admin_membership: null,
};

const adminAccount = {
    id: 'admin-account-id',
    email: 'admin@example.test',
    password_hash: '',
    identity_kind: 'INSTITUTION_ADMIN',
    owner_grant: null,
    institution_admin_membership: {
        institution_id: '00000000-0000-4000-8000-000000000001',
        institution: {
            id: '00000000-0000-4000-8000-000000000001',
            name: 'School',
            code_suffix: 'MAIN',
            legal_entity: { code: 'SPEG' },
        },
    },
};
const staffAccount = {
    id: 'staff-account-id',
    email: 'staff@example.test',
    password_hash: '',
    identity_kind: 'INSTITUTION_STAFF',
    owner_grant: null,
    institution_admin_membership: null,
    institution_staff_membership: {
        account_id: 'staff-account-id',
        account_identity_kind: 'INSTITUTION_STAFF',
        institution_id: '00000000-0000-4000-8000-000000000001',
        revoked_at: null,
        institution: {
            id: '00000000-0000-4000-8000-000000000001',
            name: 'School',
            code_suffix: 'MAIN',
            legal_entity: { code: 'SPEG' },
        },
    },
};

describe('AuthService shared workspace session', () => {
    let service: AuthService;
    let transaction: Record<string, any>;
    let prisma: Record<string, any>;
    let jwtService: { signAsync: jest.Mock };
    let response: { cookie: jest.Mock; clearCookie: jest.Mock };

    beforeEach(async () => {
        ownerAccount.password_hash = await bcrypt.hash('correct-password', 4);
        adminAccount.password_hash = await bcrypt.hash('correct-password', 4);
        staffAccount.password_hash = await bcrypt.hash('correct-password', 4);
        transaction = {
            account: { findUnique: jest.fn(), updateMany: jest.fn() },
            session: {
                create: jest.fn().mockResolvedValue({}),
                findUnique: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            $queryRaw: jest.fn().mockResolvedValue([{ id: 'account-id' }]),
        };
        prisma = {
            ...transaction,
            account: { findUnique: jest.fn() },
            $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
                callback(transaction),
            ),
        };
        jwtService = { signAsync: jest.fn().mockResolvedValue('signed-access-token') };
        response = { cookie: jest.fn(), clearCookie: jest.fn() };
        service = new AuthService(
            prisma as unknown as PrismaService,
            jwtService as unknown as JwtService,
            { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService,
        );
    });

    it.each([
        ['Platform Owner', ownerAccount, { identity_kind: 'PLATFORM_OWNER' }],
        [
            'approved Institution Admin',
            adminAccount,
            {
                identity_kind: 'INSTITUTION_ADMIN',
                institution: {
                    id: '00000000-0000-4000-8000-000000000001',
                    name: 'School',
                    code: 'SPEG-MAIN',
                },
            },
        ],
        [
            'active Institution Staff',
            staffAccount,
            {
                identity_kind: 'INSTITUTION_STAFF',
                institution: {
                    id: '00000000-0000-4000-8000-000000000001',
                    name: 'School',
                    code: 'SPEG-MAIN',
                },
            },
        ],
    ])('creates the same bearer-backed SESSION for a %s', async (_label, account, identity) => {
        prisma.account.findUnique.mockResolvedValue(account);
        transaction.account.findUnique.mockResolvedValue(account);

        const result = await service.signInWorkspace(
            {
                intent: 'WORKSPACE',
                email: account.email,
                password: 'correct-password',
            },
            response as unknown as Response,
        );

        expect(result).toEqual({
            kind: 'SESSION',
            access_token: 'signed-access-token',
            csrf_token: expect.any(String),
            identity: {
                ...identity,
                account: { id: account.id, email: account.email },
            },
        });
        expect(transaction.session.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: expect.any(String),
                    account_id: account.id,
                    rotation_family_id: expect.any(String),
                    refresh_token_hash: expect.any(String),
                }),
            }),
        );
        const refreshCookie = response.cookie.mock.calls.find(
            ([name]) => name === 'erp360_rtk',
        )?.[1] as string;
        const createdSession = transaction.session.create.mock.calls[0][0].data;
        expect(createdSession.rotation_family_id).toBe(createdSession.id);
        expect(createdSession.refresh_token_hash).toBe(
            createHash('sha256').update(refreshCookie).digest('hex'),
        );
        expect(response.cookie).toHaveBeenCalledWith(
            'erp360_rtk',
            refreshCookie,
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/v1/api/auth',
            }),
        );
        expect(response.cookie).not.toHaveBeenCalledWith(
            'erp360_ia_at',
            expect.anything(),
            expect.anything(),
        );
    });

    it('rejects an UNASSIGNED account and invitation intent without creating a session', async () => {
        const unassigned = {
            ...ownerAccount,
            identity_kind: 'UNASSIGNED',
            owner_grant: null,
            institution_admin_membership: null,
        };
        prisma.account.findUnique.mockResolvedValue(unassigned);
        transaction.account.findUnique.mockResolvedValue(unassigned);

        await expect(
            service.signInWorkspace(
                {
                    intent: 'WORKSPACE',
                    email: unassigned.email,
                    password: 'correct-password',
                },
                response as unknown as Response,
            ),
        ).rejects.toThrow('Invalid credentials');
        expect(transaction.session.create).not.toHaveBeenCalled();
        expect(response.cookie).not.toHaveBeenCalled();

        const transactionCount = prisma.$transaction.mock.calls.length as number;
        await expect(
            service.signInWorkspace(
                {
                    intent: 'INVITATION',
                    email: unassigned.email,
                    password: 'correct-password',
                },
                response as unknown as Response,
            ),
        ).rejects.toThrow('Invalid credentials');
        expect(prisma.$transaction).toHaveBeenCalledTimes(transactionCount);
    });

    it('does not rotate a revoked session', async () => {
        prisma.$queryRaw.mockResolvedValue([
            { id: 'session-id', rotation_family_id: 'session-id' },
        ]);
        transaction.session.findUnique.mockResolvedValue({
            id: 'session-id',
            rotation_family_id: 'session-id',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: new Date(),
            account: ownerAccount,
        });

        await expect(
            service.refresh('old-refresh-token', response as unknown as Response),
        ).rejects.toThrow('Invalid or expired session');
        expect(transaction.session.updateMany).not.toHaveBeenCalled();
        expect(transaction.session.create).not.toHaveBeenCalled();
        expect(response.clearCookie).toHaveBeenCalled();
    });

    it('rejects revoked or malformed Staff identity on sign-in and /me', async () => {
        const revokedStaff = {
            ...staffAccount,
            institution_staff_membership: {
                ...staffAccount.institution_staff_membership,
                revoked_at: new Date(),
            },
        };
        prisma.account.findUnique.mockResolvedValue(revokedStaff);
        transaction.account.findUnique.mockResolvedValue(revokedStaff);

        await expect(
            service.signInWorkspace(
                {
                    intent: 'WORKSPACE',
                    email: revokedStaff.email,
                    password: 'correct-password',
                },
                response as unknown as Response,
            ),
        ).rejects.toThrow('Account identity is invalid');
        expect(transaction.session.create).not.toHaveBeenCalled();

        prisma.account.findUnique.mockResolvedValue({
            ...staffAccount,
            institution_staff_membership: null,
        });
        await expect(service.getAuthenticatedIdentity(staffAccount.id)).rejects.toThrow(
            'Account identity is invalid',
        );
    });

    it('rejects refresh when the Staff membership has been revoked', async () => {
        prisma.$queryRaw.mockResolvedValue([
            { id: 'staff-session-id', rotation_family_id: 'staff-session-id' },
        ]);
        transaction.session.findUnique.mockResolvedValue({
            id: 'staff-session-id',
            rotation_family_id: 'staff-session-id',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: null,
            account: {
                ...staffAccount,
                institution_staff_membership: {
                    ...staffAccount.institution_staff_membership,
                    revoked_at: new Date(),
                },
            },
        });

        await expect(
            service.refresh('staff-refresh-token', response as unknown as Response),
        ).rejects.toThrow('Account identity is invalid');
        expect(transaction.session.updateMany).not.toHaveBeenCalled();
        expect(transaction.session.create).not.toHaveBeenCalled();
        expect(response.clearCookie).toHaveBeenCalled();
    });

    it('preserves active Staff identity while rotating the shared session', async () => {
        prisma.$queryRaw.mockResolvedValue([
            { id: 'staff-session-family', rotation_family_id: 'staff-session-family' },
        ]);
        transaction.session.findUnique.mockResolvedValue({
            id: 'staff-session-id',
            rotation_family_id: 'staff-session-family',
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: null,
            account: staffAccount,
        });

        const result = await service.refresh(
            'staff-refresh-token',
            response as unknown as Response,
        );

        expect(result).toEqual(
            expect.objectContaining({
                identity: expect.objectContaining({
                    identity_kind: 'INSTITUTION_STAFF',
                    institution: {
                        id: '00000000-0000-4000-8000-000000000001',
                        name: 'School',
                        code: 'SPEG-MAIN',
                    },
                }),
            }),
        );
        expect(transaction.session.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    account_id: staffAccount.id,
                    rotation_family_id: 'staff-session-family',
                }),
            }),
        );
    });

    it('inherits the family on refresh and revokes only the submitted family on logout', async () => {
        const oldToken = 'old-owner-refresh-token';
        prisma.$queryRaw.mockResolvedValue([
            { id: 'owner-device-family', rotation_family_id: 'owner-device-family' },
        ]);
        transaction.session.findUnique.mockResolvedValue({
            id: 'old-session-id',
            rotation_family_id: 'owner-device-family',
            refresh_token_hash: createHash('sha256').update(oldToken).digest('hex'),
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: null,
            account: ownerAccount,
        });

        await service.refresh(oldToken, response as unknown as Response);

        const successor = transaction.session.create.mock.calls[0][0].data;
        expect(successor.id).not.toBe('owner-device-family');
        expect(successor.rotation_family_id).toBe('owner-device-family');
        expect(transaction.session.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: 'old-session-id',
                    revoked_at: null,
                    expires_at: { gt: expect.any(Date) },
                },
            }),
        );

        await service.logout(oldToken, response as unknown as Response);
        expect(transaction.session.updateMany).toHaveBeenLastCalledWith({
            where: {
                rotation_family_id: 'owner-device-family',
                revoked_at: null,
            },
            data: { revoked_at: expect.any(Date) },
        });
    });
});
