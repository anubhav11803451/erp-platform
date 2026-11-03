import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaService } from '../../core/prisma.service';
import {
    AuthenticatedStaffRequest,
    InstitutionStaffJwtAuthGuard,
} from './institution-staff-jwt-auth.guard';

describe('InstitutionStaffJwtAuthGuard current scope', () => {
    const institutionId = '00000000-0000-4000-8000-000000000001';
    const groupId = '00000000-0000-4000-8000-000000000002';

    function createGuard(membership: unknown) {
        const prisma = {
            institutionStaffMembership: {
                findUnique: jest.fn().mockResolvedValue(membership),
            },
            institutionStaffGroupAssignment: {
                findMany: jest.fn().mockResolvedValue([{ group_id: groupId }]),
            },
        };
        const guard = new InstitutionStaffJwtAuthGuard(
            prisma as unknown as PrismaService,
            {
                get: jest.fn().mockReturnValue(undefined),
                getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            } as unknown as ConfigService,
        );
        return { guard, prisma };
    }

    it('re-reads active assignments and derives tenant scope rather than trusting request data', async () => {
        const { guard, prisma } = createGuard({
            institution_id: institutionId,
            revoked_at: null,
            account_identity_kind: 'INSTITUTION_STAFF',
            account: {
                identity_kind: 'INSTITUTION_STAFF',
                owner_grant: null,
                institution_admin_membership: null,
            },
            group_assignments: [{ group_id: groupId }],
        });
        const request = {
            method: 'GET',
            body: { institution_id: 'client-selected-institution', group_id: 'unassigned-group' },
            user: {
                id: 'staff-account-id',
                email: 'staff@example.test',
                identity_kind: 'INSTITUTION_STAFF',
            },
        } as unknown as AuthenticatedStaffRequest & {
            body: { institution_id: string; group_id: string };
        };

        await guard.attachInstitutionScope(request);

        expect(prisma.institutionStaffMembership.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { account_id: 'staff-account-id' } }),
        );
        expect(prisma.institutionStaffGroupAssignment.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    institution_id: institutionId,
                    staff_account_id: 'staff-account-id',
                    revoked_at: null,
                    group: { institution_id: institutionId, archived_at: null },
                }),
            }),
        );
        expect(request.user?.institution_id).toBe(institutionId);
        expect(request.user?.group_ids).toEqual([groupId]);
        expect(request.user?.institution_id).not.toBe(request.body.institution_id);
        expect(request.user?.group_ids).not.toContain(request.body.group_id);
    });

    it.each([
        ['missing membership', null],
        [
            'revoked membership',
            {
                institution_id: institutionId,
                revoked_at: new Date(),
                account_identity_kind: 'INSTITUTION_STAFF',
                account: {
                    identity_kind: 'INSTITUTION_STAFF',
                    owner_grant: null,
                    institution_admin_membership: null,
                },
                group_assignments: [],
            },
        ],
    ])('rejects a %s', async (_label, membership) => {
        const { guard } = createGuard(membership);
        const request = {
            method: 'GET',
            user: {
                id: 'staff-account-id',
                email: 'staff@example.test',
                identity_kind: 'INSTITUTION_STAFF',
            },
        } as AuthenticatedStaffRequest;

        await expect(guard.attachInstitutionScope(request)).rejects.toThrow(ForbiddenException);
    });

    it('rejects non-Staff identities before loading Staff scope', async () => {
        const { guard, prisma } = createGuard(null);
        const request = {
            method: 'GET',
            user: {
                id: 'admin-account-id',
                email: 'admin@example.test',
                identity_kind: 'INSTITUTION_ADMIN',
            },
        } as unknown as AuthenticatedStaffRequest;

        await expect(guard.attachInstitutionScope(request)).rejects.toThrow(ForbiddenException);
        expect(prisma.institutionStaffMembership.findUnique).not.toHaveBeenCalled();
    });

    it('requires exact Origin and double-submit CSRF for unsafe operations', async () => {
        const { guard } = createGuard({
            institution_id: institutionId,
            revoked_at: null,
            account_identity_kind: 'INSTITUTION_STAFF',
            account: {
                identity_kind: 'INSTITUTION_STAFF',
                owner_grant: null,
                institution_admin_membership: null,
            },
            group_assignments: [],
        });
        const request = {
            method: 'PATCH',
            headers: { origin: 'https://unexpected.example', 'x-csrf-token': 'csrf' },
            header(name: string) {
                return this.headers[name.toLowerCase() as keyof typeof this.headers];
            },
            cookies: { erp360_ctk: 'csrf' },
            user: {
                id: 'staff-account-id',
                email: 'staff@example.test',
                identity_kind: 'INSTITUTION_STAFF',
            },
        } as unknown as AuthenticatedStaffRequest;

        await guard.attachInstitutionScope(request);
        expect(() =>
            (
                guard as unknown as { assertOriginAndCsrf: (request: Request) => void }
            ).assertOriginAndCsrf(request),
        ).toThrow(ForbiddenException);
    });
});
