import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma.service';
import { PlatformOwnerJwtStrategy } from './platform-owner-jwt.strategy';

describe('PlatformOwnerJwtStrategy', () => {
    it('rejects an otherwise active session after its Owner grant is removed', async () => {
        const prisma = {
            session: {
                findUnique: jest.fn().mockResolvedValue({
                    id: 'session-id',
                    account_id: 'account-id',
                    revoked_at: null,
                    expires_at: new Date(Date.now() + 60_000),
                    account: {
                        id: 'account-id',
                        email: 'owner@example.test',
                        identity_kind: 'PLATFORM_OWNER',
                        owner_grant: null,
                    },
                }),
            },
        };
        const strategy = new PlatformOwnerJwtStrategy(
            { getOrThrow: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService,
            prisma as unknown as PrismaService,
        );

        await expect(strategy.validate({ sub: 'account-id', sid: 'session-id' })).rejects.toThrow(
            UnauthorizedException,
        );
        expect(prisma.session.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'session-id' } }),
        );
    });
});
