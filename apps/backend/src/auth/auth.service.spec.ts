import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../core/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    const account = {
        id: 'owner-account-id',
        email: 'owner@example.test',
        password_hash: '',
        owner_grant: { account_id: 'owner-account-id' },
    };
    let service: AuthService;
    let prisma: {
        account: { findUnique: jest.Mock };
        platformOwnerGrant: { findUnique: jest.Mock };
        session: { create: jest.Mock; findUnique: jest.Mock; updateMany: jest.Mock };
        $transaction: jest.Mock;
    };
    let jwtService: { signAsync: jest.Mock };
    let response: {
        cookie: jest.Mock;
        clearCookie: jest.Mock;
    };

    beforeEach(async () => {
        account.password_hash = await bcrypt.hash('correct-password', 4);
        prisma = {
            account: { findUnique: jest.fn() },
            platformOwnerGrant: { findUnique: jest.fn() },
            session: {
                create: jest.fn(),
                findUnique: jest.fn(),
                updateMany: jest.fn(),
            },
            $transaction: jest.fn((callback: (transaction: typeof prisma) => unknown) =>
                callback(prisma),
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

    it('rejects correct credentials when the account has no active Owner grant', async () => {
        prisma.account.findUnique.mockResolvedValue({ ...account, owner_grant: null });

        await expect(
            service.signIn(
                { email: account.email, password: 'correct-password' },
                response as unknown as Response,
            ),
        ).rejects.toThrow('Invalid credentials');

        expect(prisma.$transaction).not.toHaveBeenCalled();
        expect(response.cookie).not.toHaveBeenCalled();
    });

    it('creates a session with only a refresh-token hash for an active Owner', async () => {
        prisma.account.findUnique.mockResolvedValue(account);
        prisma.platformOwnerGrant.findUnique.mockResolvedValue({
            account_id: account.id,
        });

        const result = await service.signIn(
            { email: account.email, password: 'correct-password' },
            response as unknown as Response,
        );

        expect(result).toEqual({
            access_token: 'signed-access-token',
            csrf_token: expect.any(String),
            account: { id: account.id, email: account.email },
        });
        expect(result).not.toHaveProperty('password_hash');

        const createdSession = prisma.session.create.mock.calls[0][0].data;
        const refreshCookie = response.cookie.mock.calls.find(
            ([name]) => name === 'erp360_rtk',
        )?.[1] as string;
        expect(createdSession.account_id).toBe(account.id);
        expect(createdSession.refresh_token_hash).toBe(
            createHash('sha256').update(refreshCookie).digest('hex'),
        );
        expect(createdSession.refresh_token_hash).not.toBe(refreshCookie);
        expect(response.cookie).toHaveBeenCalledWith(
            'erp360_rtk',
            refreshCookie,
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'lax',
                path: '/v1/api/auth',
            }),
        );
    });

    it('does not rotate a revoked session', async () => {
        prisma.session.findUnique.mockResolvedValue({
            id: 'old-session-id',
            account_id: account.id,
            refresh_token_hash: 'stored-hash',
            created_at: new Date(),
            expires_at: new Date(Date.now() + 60_000),
            revoked_at: new Date(),
            account: { ...account, owner_grant: account.owner_grant },
        });

        await expect(
            service.refresh('old-refresh-token', response as unknown as Response),
        ).rejects.toThrow('Invalid or expired session');

        expect(prisma.session.updateMany).not.toHaveBeenCalled();
        expect(prisma.session.create).not.toHaveBeenCalled();
        expect(response.clearCookie).toHaveBeenCalledTimes(2);
    });
});
