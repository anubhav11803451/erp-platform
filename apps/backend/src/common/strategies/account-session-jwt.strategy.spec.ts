import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma.service';
import { AccountSessionJwtStrategy } from './account-session-jwt.strategy';

describe('AccountSessionJwtStrategy', () => {
    it('derives identity kind from the active database-backed session account', async () => {
        const prisma = {
            session: {
                findUnique: jest.fn().mockResolvedValue({
                    id: 'session-id',
                    account_id: 'account-id',
                    revoked_at: null,
                    expires_at: new Date(Date.now() + 60_000),
                    account: {
                        id: 'account-id',
                        email: 'admin@example.test',
                        identity_kind: 'INSTITUTION_ADMIN',
                    },
                }),
            },
        };
        const strategy = new AccountSessionJwtStrategy(
            {
                get: jest.fn().mockReturnValue('erp360_at'),
                getOrThrow: jest.fn().mockReturnValue('test-secret'),
            } as unknown as ConfigService,
            prisma as unknown as PrismaService,
        );

        await expect(strategy.validate({ sub: 'account-id', sid: 'session-id' })).resolves.toEqual({
            id: 'account-id',
            email: 'admin@example.test',
            identity_kind: 'INSTITUTION_ADMIN',
        });
    });

    it('rejects revoked or expired sessions before exposing identity', async () => {
        const prisma = {
            session: {
                findUnique: jest.fn().mockResolvedValue({
                    id: 'session-id',
                    account_id: 'account-id',
                    revoked_at: new Date(),
                    expires_at: new Date(Date.now() + 60_000),
                    account: {
                        id: 'account-id',
                        email: 'admin@example.test',
                        identity_kind: 'INSTITUTION_ADMIN',
                    },
                }),
            },
        };
        const strategy = new AccountSessionJwtStrategy(
            {
                get: jest.fn().mockReturnValue('erp360_at'),
                getOrThrow: jest.fn().mockReturnValue('test-secret'),
            } as unknown as ConfigService,
            prisma as unknown as PrismaService,
        );

        await expect(
            strategy.validate({ sub: 'account-id', sid: 'session-id' }),
        ).rejects.toThrow(UnauthorizedException);
    });
});
