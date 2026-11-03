import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../core/prisma.service';
import { InstitutionStaffInvitationService } from './institution-staff-invitation.service';

const institutionId = '00000000-0000-4000-8000-000000000001';
const groupId = '00000000-0000-4000-8000-000000000002';
const invitationId = '00000000-0000-4000-8000-000000000003';
const token = 'one-time-staff-invitation-token';
const tokenHash = createHash('sha256').update(token).digest('hex');
const invitationEmail = 'staff@example.test';

describe('InstitutionStaffInvitationService', () => {
    let service: InstitutionStaffInvitationService;
    let prisma: Record<string, any>;
    let transaction: Record<string, any>;

    beforeEach(() => {
        transaction = {
            institutionStaffInvitation: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionStaffInvitationPendingGroup: {
                createMany: jest.fn(),
                findMany: jest.fn().mockResolvedValue([]),
            },
            institutionStaffMembership: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionStaffGroupAssignment: {
                findMany: jest.fn().mockResolvedValue([]),
                createMany: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionGroup: {
                findMany: jest.fn().mockResolvedValue([{ id: groupId }]),
            },
            account: {
                findUnique: jest.fn(),
                create: jest.fn().mockResolvedValue({ id: 'new-staff-account-id' }),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            session: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
            $queryRaw: jest.fn().mockResolvedValue([{ id: institutionId }]),
        };
        prisma = {
            institutionStaffInvitation: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
            },
            institutionStaffMembership: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
            },
            institutionStaffInvitationPendingGroup: { findMany: jest.fn() },
            account: { findUnique: jest.fn() },
            $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
                callback(transaction),
            ),
        };
        service = new InstitutionStaffInvitationService(
            prisma as unknown as PrismaService,
            {
                getOrThrow: jest.fn().mockReturnValue('https://erp.example.test'),
            } as unknown as ConfigService,
        );
    });

    it('stores only a token hash and returns the fragment URL only in the issue result', async () => {
        transaction.institutionStaffInvitation.create.mockImplementation(
            async ({ data, include }: Record<string, any>) => ({
                id: invitationId,
                status: 'PENDING',
                created_at: new Date('2026-11-02T00:00:00.000Z'),
                expires_at: data.expires_at,
                normalized_email: data.normalized_email,
                pending_group_selections: include
                    ? (data.pending_group_selections?.create?.map(
                          ({ group_id }: { group_id: string }) => ({
                              group_id,
                          }),
                      ) ?? [])
                    : [],
            }),
        );

        const result = await service.createInvitation(institutionId, {
            invited_email: ' STAFF@example.test ',
            group_ids: [groupId],
        });

        const create = transaction.institutionStaffInvitation.create.mock.calls[0][0];
        expect(create.data.token_hash).toMatch(/^[a-f0-9]{64}$/);
        expect(create.data.token_hash).not.toContain(token);
        expect(create.data.normalized_email).toBe(invitationEmail);
        expect(create.data.pending_group_selections.create).toEqual([{ group_id: groupId }]);
        const urlToken = decodeURIComponent(result.invitation_url.split('#token=')[1]);
        expect(create.data.token_hash).toBe(createHash('sha256').update(urlToken).digest('hex'));
        expect(result).toEqual(
            expect.objectContaining({
                id: invitationId,
                status: 'PENDING',
                invited_email: invitationEmail,
                group_ids: [groupId],
                invitation_url: expect.stringMatching(
                    /^https:\/\/erp\.example\.test\/invite\/staff#token=/,
                ),
            }),
        );
        expect(result.invitation_url).not.toContain('?token=');
    });

    it('never includes invitation bearer URLs in list responses', async () => {
        prisma.institutionStaffInvitation.findMany.mockResolvedValue([
            {
                id: invitationId,
                status: 'PENDING',
                created_at: new Date('2026-11-02T00:00:00.000Z'),
                expires_at: new Date(Date.now() + 60_000),
                normalized_email: invitationEmail,
                accepted_at: null,
                revoked_at: null,
                pending_group_selections: [{ group_id: groupId }],
            },
        ]);

        const result = await service.listInvitations(institutionId);

        expect(result.invitations[0]).toEqual(
            expect.objectContaining({ invited_email: invitationEmail, group_ids: [groupId] }),
        );
        expect(result.invitations[0]).not.toHaveProperty('invitation_url');
        expect(result.invitations[0]).not.toHaveProperty('token_hash');
    });

    it('returns context through Institution-scoped pending group selection queries', async () => {
        prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 60_000),
            institution: { id: institutionId, name: 'School' },
        });
        prisma.institutionStaffInvitationPendingGroup.findMany.mockResolvedValue([
            {
                group: {
                    id: groupId,
                    name: 'Grade 7',
                    type: 'SCHOOL_SECTION',
                },
            },
        ]);

        const result = await service.getInvitationContext(token);

        expect(result).toEqual(
            expect.objectContaining({
                institution_id: institutionId,
                invited_email: invitationEmail,
                groups: [{ id: groupId, name: 'Grade 7', type: 'SCHOOL_SECTION' }],
            }),
        );
        expect(prisma.institutionStaffInvitationPendingGroup.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    institution_id: institutionId,
                    invitation_id: invitationId,
                    group: { institution_id: institutionId, archived_at: null },
                },
            }),
        );
        expect(result).not.toHaveProperty('token');
    });

    it('reissues within the Institution and revokes the replaced bearer before returning its successor', async () => {
        transaction.institutionStaffInvitation.findFirst.mockResolvedValue({
            id: invitationId,
        });
        transaction.institutionStaffInvitation.create.mockResolvedValue({
            id: '00000000-0000-4000-8000-000000000006',
            status: 'PENDING',
            created_at: new Date('2026-11-02T00:00:00.000Z'),
            expires_at: new Date('2026-11-09T00:00:00.000Z'),
            normalized_email: invitationEmail,
            pending_group_selections: [],
        });

        const result = await service.replaceInvitation(institutionId, invitationId, {
            invited_email: invitationEmail,
            group_ids: [groupId],
        });

        expect(transaction.institutionStaffInvitation.updateMany).toHaveBeenCalledWith({
            where: {
                id: invitationId,
                institution_id: institutionId,
                status: 'PENDING',
            },
            data: { status: 'REVOKED', revoked_at: expect.any(Date) },
        });
        expect(result.id).toBe('00000000-0000-4000-8000-000000000006');
        expect(result.invitation_url).toMatch(/#token=/);
    });

    it.each(['issue', 'reissue'])(
        'requires at least one group in the %s service path',
        async (path) => {
            const request = { invited_email: invitationEmail, group_ids: [] };
            const result =
                path === 'issue'
                    ? service.createInvitation(institutionId, request)
                    : service.replaceInvitation(institutionId, invitationId, request);

            await expect(result).rejects.toThrow(BadRequestException);
            expect(prisma.$transaction).not.toHaveBeenCalled();
        },
    );

    it('atomically accepts a new-address invitation and creates membership and pending assignments without a session', async () => {
        prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
        });
        transaction.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 60_000),
            pending_group_selections: [{ group_id: groupId }],
        });
        transaction.account.findUnique.mockResolvedValue(null);
        transaction.institutionStaffInvitationPendingGroup.findMany.mockResolvedValue([
            { group_id: groupId, group: { archived_at: null } },
        ]);

        await expect(
            service.acceptInvitation({ token, password: 'valid-password' }),
        ).resolves.toEqual({ accepted: true });

        expect(transaction.account.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    email: invitationEmail,
                    identity_kind: 'INSTITUTION_STAFF',
                    password_hash: expect.any(String),
                }),
            }),
        );
        expect(transaction.institutionStaffMembership.create).toHaveBeenCalledWith({
            data: {
                account_id: 'new-staff-account-id',
                account_identity_kind: 'INSTITUTION_STAFF',
                institution_id: institutionId,
            },
        });
        expect(transaction.institutionStaffGroupAssignment.createMany).toHaveBeenCalledWith({
            data: [
                {
                    institution_id: institutionId,
                    staff_account_id: 'new-staff-account-id',
                    group_id: groupId,
                },
            ],
        });
        expect(transaction.institutionStaffInvitation.updateMany).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ token_hash: tokenHash, status: 'PENDING' }),
                data: expect.objectContaining({
                    status: 'ACCEPTED',
                    accepted_by_account_id: 'new-staff-account-id',
                }),
            }),
        );
        expect(transaction.session.updateMany).toHaveBeenCalled();
        expect(transaction.session.create).toBeUndefined();
    });

    it('keeps an invitation pending when a selected group was archived before acceptance', async () => {
        const account = {
            id: 'existing-account-id',
            email: invitationEmail,
            password_hash: await bcrypt.hash('valid-password', 4),
            identity_kind: 'UNASSIGNED',
            owner_grant: null,
            institution_admin_membership: null,
            institution_staff_membership: null,
        };
        prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
        });
        prisma.account.findUnique.mockResolvedValue(account);
        transaction.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 60_000),
        });
        transaction.institutionStaffInvitationPendingGroup.findMany.mockResolvedValue([
            { group_id: groupId, group: { archived_at: new Date() } },
        ]);

        await expect(
            service.acceptInvitation({ token, password: 'valid-password' }),
        ).rejects.toThrow(
            'One or more selected groups are archived. Ask the Institution Admin to reissue the invitation with active groups.',
        );

        expect(transaction.institutionStaffInvitationPendingGroup.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    institution_id: institutionId,
                    invitation_id: invitationId,
                    group: { institution_id: institutionId },
                },
                select: {
                    group_id: true,
                    group: { select: { archived_at: true } },
                },
            }),
        );
        expect(transaction.account.create).not.toHaveBeenCalled();
        expect(transaction.account.updateMany).not.toHaveBeenCalled();
        expect(transaction.institutionStaffMembership.create).not.toHaveBeenCalled();
        expect(transaction.institutionStaffGroupAssignment.createMany).not.toHaveBeenCalled();
        expect(
            transaction.institutionStaffInvitation.updateMany.mock.calls.some(
                ([{ data }]) => data.status === 'ACCEPTED',
            ),
        ).toBe(false);
    });

    it('rejects a replay after the invitation has been consumed', async () => {
        prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
        });
        transaction.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
            status: 'ACCEPTED',
            expires_at: new Date(Date.now() + 60_000),
            pending_group_selections: [],
        });
        prisma.account.findUnique.mockResolvedValue(null);

        await expect(
            service.acceptInvitation({ token, password: 'valid-password' }),
        ).rejects.toThrow('Invitation is invalid or unavailable');
        expect(transaction.account.create).not.toHaveBeenCalled();
        expect(transaction.institutionStaffMembership.create).not.toHaveBeenCalled();
        expect(transaction.institutionStaffGroupAssignment.createMany).not.toHaveBeenCalled();
    });

    it('authenticates an existing unassigned account before activating Staff identity', async () => {
        const account = {
            id: 'existing-account-id',
            email: invitationEmail,
            password_hash: await bcrypt.hash('current-password', 4),
            identity_kind: 'UNASSIGNED',
            owner_grant: null,
            institution_admin_membership: null,
            institution_staff_membership: null,
        };
        prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
        });
        prisma.account.findUnique.mockResolvedValue(account);
        transaction.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 60_000),
            pending_group_selections: [],
        });
        transaction.account.findUnique.mockResolvedValue(account);
        transaction.institutionStaffInvitationPendingGroup.findMany.mockResolvedValue([]);

        await expect(
            service.acceptInvitation({ token, password: 'current-password' }),
        ).resolves.toEqual({ accepted: true });

        expect(transaction.account.updateMany).toHaveBeenCalledWith({
            where: { id: account.id, identity_kind: 'UNASSIGNED' },
            data: { identity_kind: 'INSTITUTION_STAFF' },
        });
        expect(transaction.institutionStaffMembership.create).toHaveBeenCalledWith({
            data: {
                account_id: account.id,
                account_identity_kind: 'INSTITUTION_STAFF',
                institution_id: institutionId,
            },
        });
        expect(transaction.session.create).toBeUndefined();
    });

    it('requires a new invitation and current password to reactivate revoked Staff', async () => {
        const revokedMembership = {
            account_id: 'existing-staff-id',
            account_identity_kind: 'INSTITUTION_STAFF',
            institution_id: institutionId,
            revoked_at: new Date(Date.now() - 60_000),
        };
        const account = {
            id: revokedMembership.account_id,
            email: invitationEmail,
            password_hash: await bcrypt.hash('current-password', 4),
            identity_kind: 'INSTITUTION_STAFF',
            owner_grant: null,
            institution_admin_membership: null,
            institution_staff_membership: revokedMembership,
        };
        prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
        });
        prisma.account.findUnique.mockResolvedValue(account);
        transaction.institutionStaffInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            normalized_email: invitationEmail,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 60_000),
            pending_group_selections: [],
        });
        transaction.account.findUnique.mockResolvedValue(account);
        transaction.institutionStaffInvitationPendingGroup.findMany.mockResolvedValue([]);

        await expect(
            service.acceptInvitation({ token, password: 'current-password' }),
        ).resolves.toEqual({ accepted: true });

        expect(transaction.institutionStaffMembership.updateMany).toHaveBeenCalledWith({
            where: {
                account_id: account.id,
                institution_id: institutionId,
                revoked_at: { not: null },
            },
            data: { revoked_at: null },
        });
        expect(transaction.session.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { account_id: account.id, revoked_at: null },
                data: { revoked_at: expect.any(Date) },
            }),
        );
    });

    it('revokes the active membership, assignments, and all sessions atomically', async () => {
        await service.revokeStaff(institutionId, 'active-staff-id');

        expect(transaction.institutionStaffMembership.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    account_id: 'active-staff-id',
                    institution_id: institutionId,
                    revoked_at: null,
                },
                data: { revoked_at: expect.any(Date) },
            }),
        );
        expect(transaction.institutionStaffGroupAssignment.updateMany).toHaveBeenCalledWith({
            where: {
                institution_id: institutionId,
                staff_account_id: 'active-staff-id',
                revoked_at: null,
            },
            data: { revoked_at: expect.any(Date) },
        });
        expect(transaction.session.updateMany).toHaveBeenCalledWith({
            where: { account_id: 'active-staff-id', revoked_at: null },
            data: { revoked_at: expect.any(Date) },
        });
    });

    it.each(['PLATFORM_OWNER', 'INSTITUTION_ADMIN'])(
        'does not allow an existing %s account to accept Staff identity',
        async (identityKind) => {
            prisma.institutionStaffInvitation.findUnique.mockResolvedValue({
                id: invitationId,
                institution_id: institutionId,
                normalized_email: invitationEmail,
            });
            prisma.account.findUnique.mockResolvedValue({
                id: 'protected-account',
                email: invitationEmail,
                password_hash: await bcrypt.hash('valid-password', 4),
                identity_kind: identityKind,
                owner_grant: identityKind === 'PLATFORM_OWNER' ? {} : null,
                institution_admin_membership: identityKind === 'INSTITUTION_ADMIN' ? {} : null,
                institution_staff_membership: null,
            });

            await expect(
                service.acceptInvitation({ token, password: 'valid-password' }),
            ).rejects.toThrow('Invitation is invalid or unavailable');
            expect(transaction.account.create).not.toHaveBeenCalled();
            expect(transaction.institutionStaffMembership.create).not.toHaveBeenCalled();
        },
    );
});
