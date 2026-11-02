import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma.service';
import {
    AuthenticatedAccountRequest,
    InstitutionAdminJwtAuthGuard,
} from './institution-admin-jwt-auth.guard';

describe('InstitutionAdminJwtAuthGuard tenant scope', () => {
    const institutionId = '00000000-0000-4000-8000-000000000001';
    const membership = {
        institution_id: institutionId,
        institution: { id: institutionId, name: 'School' },
        account: { identity_kind: 'INSTITUTION_ADMIN', owner_grant: null },
    };

    it('reloads membership and derives Institution scope from the database', async () => {
        const prisma = {
            institutionAdminMembership: {
                findUnique: jest.fn().mockResolvedValue(membership),
            },
        };
        const guard = new InstitutionAdminJwtAuthGuard(
            prisma as unknown as PrismaService,
            {
                get: jest.fn().mockReturnValue(undefined),
                getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            } as unknown as ConfigService,
        );
        const request = {
            method: 'GET',
            body: { institution_id: 'client-selected-institution' },
            user: {
                id: 'account-id',
                email: 'admin@example.test',
                identity_kind: 'INSTITUTION_ADMIN',
            },
        } as unknown as AuthenticatedAccountRequest & {
            body: { institution_id: string };
        };

        await guard.attachInstitutionScope(request);

        expect(prisma.institutionAdminMembership.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { account_id: 'account-id' } }),
        );
        expect(request.user?.institution_id).toBe(institutionId);
        expect(request.user?.identity).toEqual({
            identity_kind: 'INSTITUTION_ADMIN',
            institution: { id: institutionId, name: 'School' },
        });
        expect(request.user?.institution_id).not.toBe(request.body.institution_id);
    });

    it('rejects Owner and inactive/missing membership identities', async () => {
        const prisma = {
            institutionAdminMembership: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
        };
        const guard = new InstitutionAdminJwtAuthGuard(
            prisma as unknown as PrismaService,
            {
                get: jest.fn().mockReturnValue(undefined),
                getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            } as unknown as ConfigService,
        );

        const ownerRequest = {
            method: 'GET',
            user: {
                id: 'owner-id',
                email: 'owner@example.test',
                identity_kind: 'PLATFORM_OWNER',
            },
        } as unknown as AuthenticatedAccountRequest;
        const inactiveAdminRequest = {
            method: 'GET',
            user: {
                id: 'former-admin-id',
                email: 'admin@example.test',
                identity_kind: 'INSTITUTION_ADMIN',
            },
        } as unknown as AuthenticatedAccountRequest;

        await expect(guard.attachInstitutionScope(ownerRequest)).rejects.toThrow(
            ForbiddenException,
        );
        await expect(guard.attachInstitutionScope(inactiveAdminRequest)).rejects.toThrow(
            ForbiddenException,
        );
    });
});
