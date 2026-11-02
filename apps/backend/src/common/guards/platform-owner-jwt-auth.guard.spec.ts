import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma.service';
import {
    AuthenticatedOwnerRequest,
    PlatformOwnerJwtAuthGuard,
} from './platform-owner-jwt-auth.guard';

describe('PlatformOwnerJwtAuthGuard grant authorization', () => {
    it('requires an active server-side Owner grant for the authenticated account', async () => {
        const prisma = {
            platformOwnerGrant: {
                findUnique: jest.fn().mockResolvedValue({ account_id: 'owner-id' }),
            },
        };
        const guard = new PlatformOwnerJwtAuthGuard(
            prisma as unknown as PrismaService,
            {
                get: jest.fn().mockReturnValue(undefined),
                getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            } as unknown as ConfigService,
        );
        const request = {
            method: 'GET',
            body: { account_id: 'client-selected-account' },
            user: { id: 'owner-id', identity_kind: 'PLATFORM_OWNER' },
        } as unknown as AuthenticatedOwnerRequest & { body: { account_id: string } };

        await expect(guard.assertOwner(request)).resolves.toBeUndefined();
        expect(prisma.platformOwnerGrant.findUnique).toHaveBeenCalledWith({
            where: { account_id: 'owner-id' },
            select: { account_id: true },
        });
    });

    it('rejects Admin identities and Owner identities whose grant was revoked', async () => {
        const prisma = {
            platformOwnerGrant: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
        };
        const guard = new PlatformOwnerJwtAuthGuard(
            prisma as unknown as PrismaService,
            {
                get: jest.fn().mockReturnValue(undefined),
                getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            } as unknown as ConfigService,
        );

        await expect(
            guard.assertOwner({
                method: 'GET',
                user: { id: 'admin-id', identity_kind: 'INSTITUTION_ADMIN' },
            } as unknown as AuthenticatedOwnerRequest),
        ).rejects.toThrow(ForbiddenException);
        await expect(
            guard.assertOwner({
                method: 'GET',
                user: { id: 'former-owner-id', identity_kind: 'PLATFORM_OWNER' },
            } as unknown as AuthenticatedOwnerRequest),
        ).rejects.toThrow(ForbiddenException);
        expect(prisma.platformOwnerGrant.findUnique).toHaveBeenCalledTimes(1);
    });
});
